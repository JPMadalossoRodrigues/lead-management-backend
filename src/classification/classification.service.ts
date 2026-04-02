import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

import { ClassificationProducer } from './classification.producer';
import { ExecutionStatus, LeadStatus } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ClassificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly producer: ClassificationProducer,
  ) {}

  async requestClassification(leadId: number) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new NotFoundException('Lead não encontrado');
    }

    if (lead.status === LeadStatus.CLASSIFYING) {
      throw new InternalServerErrorException(
        'Lead já está em processo de classificação',
      );
    }

    if (
      lead.status !== LeadStatus.ENRICHED &&
      lead.status !== LeadStatus.CLASSIFIED &&
      lead.status !== LeadStatus.CLASSIFICATION_FAILED
    ) {
      throw new InternalServerErrorException(
        'Lead precisa estar enriquecido antes de classificar',
      );
    }

    const existing = await this.prisma.classification.findFirst({
      where: {
        leadId,
        status: {
          in: [ExecutionStatus.PENDING, ExecutionStatus.PROCESSING],
        },
      },
    });

    if (existing) {
      throw new InternalServerErrorException(
        'Já existe uma classificação em andamento para este lead',
      );
    }

    const classification = await this.prisma.classification.create({
      data: {
        leadId,
        status: ExecutionStatus.PENDING,
        requestedAt: new Date(),
      },
    });

    try {
      await this.producer.sendToQueue({
        classificationId: classification.id,
        leadId,
      });

      await this.prisma.lead.update({
        where: { id: leadId },
        data: {
          status: LeadStatus.CLASSIFYING,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro desconhecido ao enviar para fila';

      await this.prisma.classification.update({
        where: { id: classification.id },
        data: {
          status: ExecutionStatus.FAILED,
          errorMessage: message.slice(0, 255),
          completedAt: new Date(),
        },
      });

      throw new InternalServerErrorException('Erro ao solicitar classificação');
    }

    return {
      message: 'Classification solicitada com sucesso',
      classificationId: classification.id,
    };
  }
}
