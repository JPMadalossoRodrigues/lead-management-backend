import { Injectable } from '@nestjs/common';
import { ExecutionStatus, Prisma, LeadStatus } from '@prisma/client/edge';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EnrichmentProcessorService {
  constructor(private readonly prisma: PrismaService) {}

  async process({
    enrichmentId,
    leadId,
  }: {
    enrichmentId: number;
    leadId: number;
  }) {
    const enrichment = await this.prisma.enrichment.findUnique({
      where: { id: enrichmentId },
      include: { lead: true },
    });

    if (!enrichment) {
      return;
    }

    await this.prisma.enrichment.update({
      where: { id: enrichmentId },
      data: {
        status: ExecutionStatus.PROCESSING,
      },
    });

    try {
      const response = await fetch(
        `http://localhost:3001/enrichment/${enrichment.lead.companyCnpj}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data: unknown = await response.json();

      await this.prisma.enrichment.update({
        where: { id: enrichmentId },
        data: {
          status: ExecutionStatus.SUCCESS,
          data: data as Prisma.InputJsonValue,
          completedAt: new Date(),
        },
      });

      await this.prisma.lead.update({
        where: { id: leadId },
        data: {
          status: LeadStatus.ENRICHED,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro desconhecido no enrichment';

      console.error('Erro no enrichment:', error);

      await this.prisma.enrichment.update({
        where: { id: enrichmentId },
        data: {
          status: ExecutionStatus.FAILED,
          errorMessage: message.slice(0, 255),
          completedAt: new Date(),
        },
      });
      await this.prisma.lead.update({
        where: { id: leadId },
        data: {
          status: LeadStatus.ENRICHMENT_FAILED,
        },
      });
    }
  }
}
