import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

import { EnrichmentProducer } from './enrichment.producer';
import { ExecutionStatus, LeadStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EnrichmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly producer: EnrichmentProducer,
  ) {}

  async requestEnrichment(leadId: number) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new NotFoundException('Lead não encontrado');
    }

    const enrichment = await this.prisma.enrichment.create({
      data: {
        leadId,
        status: ExecutionStatus.PENDING,
        requestedAt: new Date(),
      },
    });

    try {
      await this.producer.sendToQueue({
        enrichmentId: enrichment.id,
        leadId,
      });

      await this.prisma.lead.update({
        where: { id: leadId },
        data: {
          status: LeadStatus.ENRICHING,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro desconhecido ao enviar para fila';

      await this.prisma.enrichment.update({
        where: { id: enrichment.id },
        data: {
          status: ExecutionStatus.FAILED,
          errorMessage: message.slice(0, 255),
          completedAt: new Date(),
        },
      });

      throw new InternalServerErrorException(
        'Erro ao solicitar enriquecimento',
      );
    }

    return {
      message: 'Enrichment solicitado com sucesso',
      enrichmentId: enrichment.id,
    };
  }
}
