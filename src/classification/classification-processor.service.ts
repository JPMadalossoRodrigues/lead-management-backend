import { Injectable } from '@nestjs/common';
import {
  ExecutionStatus,
  ClassificationType,
  CommercialPotential,
  LeadStatus,
} from '@prisma/client/edge';
import { PrismaService } from 'prisma/prisma.service';

type ClassificationResult = {
  score: number;
  classification: 'HOT' | 'WARM' | 'COLD';
  justification: string;
  commercialPotential: 'HIGH' | 'MEDIUM' | 'LOW';
};

type EnrichmentData = {
  industry?: string;
  employeeCount?: number;
  annualRevenue?: number;
  foundedAt?: string;
  cnaes?: {
    code: string;
    description: string;
    isPrimary: boolean;
  }[];
};

@Injectable()
export class ClassificationProcessorService {
  constructor(private readonly prisma: PrismaService) {}

  async process({
    classificationId,
    leadId,
  }: {
    classificationId: number;
    leadId: number;
  }) {
    const classification = await this.prisma.classification.findUnique({
      where: { id: classificationId },
      include: { lead: true },
    });

    if (!classification) {
      throw new Error(`Classification ${classificationId} não encontrada`);
    }

    const enrichment = await this.prisma.enrichment.findFirst({
      where: {
        leadId,
        status: ExecutionStatus.SUCCESS,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!enrichment || !enrichment.data) {
      throw new Error('Lead não possui enrichment válido');
    }

    const enrichmentData = enrichment.data as EnrichmentData;

    await this.prisma.classification.update({
      where: { id: classificationId },
      data: { status: ExecutionStatus.PROCESSING },
    });

    try {
      const input = {
        lead: {
          estimatedValue: classification.lead.estimatedValue,
          source: classification.lead.source,
        },
        enrichment: {
          industry: enrichmentData.industry,
          employeeCount: enrichmentData.employeeCount,
          annualRevenue: enrichmentData.annualRevenue,
          foundedAt: enrichmentData.foundedAt,
          mainCnae: enrichmentData.cnaes?.find((c) => c.isPrimary)?.description,
        },
      };

      let prompt = this.buildPrompt(input);

      let parsed: ClassificationResult | null = null;
      let lastError: unknown;

      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const rawText = await this.callOllama(prompt);

          console.log(`Tentativa ${attempt + 1} - bruto:`, rawText);

          const json = this.extractJsonSafe(rawText);

          const normalized = this.normalize(json);

          if (!this.isValidClassification(normalized)) {
            throw new Error('Estrutura inválida após normalização');
          }

          parsed = normalized;
          break;
        } catch (err) {
          lastError = err;
          prompt = `Sua resposta anterior foi inválida. Corrija para JSON válido:\n${prompt}`;
        }
      }

      if (!parsed) {
        throw lastError instanceof Error
          ? lastError
          : new Error('Falha após retries');
      }

      await this.prisma.classification.update({
        where: { id: classificationId },
        data: {
          score: parsed.score,
          classification: parsed.classification as ClassificationType,
          justification: parsed.justification,
          commercialPotential:
            parsed.commercialPotential as CommercialPotential,
          modelUsed: 'tinyllama',
          status: ExecutionStatus.SUCCESS,
          completedAt: new Date(),
        },
      });

      await this.prisma.lead.update({
        where: { id: leadId },
        data: { status: LeadStatus.CLASSIFIED },
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro desconhecido na classificação';

      await this.prisma.classification.update({
        where: { id: classificationId },
        data: {
          modelUsed: 'tinyllama',
          status: ExecutionStatus.FAILED,
          errorMessage: message.slice(0, 255),
          completedAt: new Date(),
        },
      });

      await this.prisma.lead.update({
        where: { id: leadId },
        data: { status: LeadStatus.CLASSIFICATION_FAILED },
      });
    }
  }

  private buildPrompt(input: unknown): string {
    return `
Você é um sistema que responde SOMENTE JSON válido.

Regras obrigatórias:
- NÃO escreva explicações
- NÃO escreva texto fora do JSON
- NÃO use markdown
- classification: HOT, WARM ou COLD
- commercialPotential: HIGH, MEDIUM ou LOW
- score: inteiro de 0 a 100

Formato:
{
  "score": number,
  "classification": "HOT" | "WARM" | "COLD",
  "justification": string,
  "commercialPotential": "HIGH" | "MEDIUM" | "LOW"
}

Dados:
${JSON.stringify(input)}
`;
  }

  private async callOllama(prompt: string): Promise<string> {
    const response = await fetch('http://127.0.0.1:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'tinyllama',
        format: 'json',
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro no Ollama: ${response.status}`);
    }

    const result: unknown = await response.json();

    if (typeof result === 'object' && result !== null && 'response' in result) {
      return String(result.response);
    }

    throw new Error('Resposta inesperada do Ollama');
  }

  private extractJsonSafe(text: string): unknown {
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');

    if (first === -1 || last === -1) {
      throw new Error('JSON não encontrado');
    }

    const jsonString = text.slice(first, last + 1);

    try {
      return JSON.parse(jsonString);
    } catch {
      throw new Error('JSON inválido');
    }
  }

  private normalize(data: unknown): ClassificationResult {
    const obj = data as Record<string, unknown>;
    return {
      score: this.normalizeScore(obj?.score),
      classification: this.normalizeClassification(
        obj?.classification as string,
      ),
      justification: String(obj?.justification),
      commercialPotential: this.normalizePotential(
        obj?.commercialPotential as string,
      ),
    };
  }

  private normalizeScore(value: any): number {
    const n = Number(value);
    if (isNaN(n)) return 0;
    return Math.max(0, Math.min(100, Math.round(n)));
  }

  private normalizeClassification(value: string): 'HOT' | 'WARM' | 'COLD' {
    const v = String(value || '').toUpperCase();

    if (v.startsWith('HO')) return 'HOT';
    if (v.startsWith('WA')) return 'WARM';
    if (v.startsWith('CO')) return 'COLD';

    return 'COLD';
  }

  private normalizePotential(value: string): 'HIGH' | 'MEDIUM' | 'LOW' {
    const v = String(value || '').toUpperCase();

    if (v.startsWith('HI')) return 'HIGH';
    if (v.startsWith('ME')) return 'MEDIUM';
    if (v.startsWith('LO')) return 'LOW';

    return 'LOW';
  }

  private isValidClassification(data: unknown): data is ClassificationResult {
    if (typeof data !== 'object' || data === null) return false;

    const d = data as ClassificationResult;

    return (
      typeof d.score === 'number' &&
      ['HOT', 'WARM', 'COLD'].includes(d.classification) &&
      typeof d.justification === 'string' &&
      ['HIGH', 'MEDIUM', 'LOW'].includes(d.commercialPotential)
    );
  }
}
