import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { ClassificationService } from './classification.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ClassificationService', () => {
  let service: ClassificationService;

  let prisma: {
    lead: {
      findUnique: Mock;
      update: Mock;
    };
    classification: {
      findFirst: Mock;
      create: Mock;
      update: Mock;
    };
  };

  let producer: {
    sendToQueue: Mock;
  };

  beforeEach(() => {
    prisma = {
      lead: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      classification: {
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    };

    producer = {
      sendToQueue: vi.fn(),
    };

    service = new ClassificationService(
      prisma as unknown as PrismaService,
      producer as never,
    );
  });

  it('should enqueue classification', async () => {
    prisma.lead.findUnique.mockResolvedValue({
      id: 1,
      status: 'ENRICHED',
    });

    prisma.classification.create.mockResolvedValue({ id: 1 });
    prisma.classification.findFirst.mockResolvedValue(null);
    await service.requestClassification(1);

    expect(producer.sendToQueue).toHaveBeenCalled();
  });
});
