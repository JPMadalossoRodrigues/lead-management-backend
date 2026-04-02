import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { EnrichmentService } from './enrichment.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('EnrichmentService', () => {
  let service: EnrichmentService;

  let prisma: {
    lead: {
      findUnique: Mock;
      update: Mock;
    };
    enrichment: {
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
      enrichment: {
        create: vi.fn(),
        update: vi.fn(),
      },
    };

    producer = {
      sendToQueue: vi.fn(),
    };

    service = new EnrichmentService(
      prisma as unknown as PrismaService,
      producer as never,
    );
  });

  it('should send to queue', async () => {
    prisma.lead.findUnique.mockResolvedValue({ id: 1, status: 'PENDING' });
    prisma.enrichment.create.mockResolvedValue({ id: 10 });

    const result = await service.requestEnrichment(1);

    expect(producer.sendToQueue).toHaveBeenCalled();
    expect(result.enrichmentId).toBe(10);
  });

  it('should fail if lead not found', async () => {
    prisma.lead.findUnique.mockResolvedValue(null);

    await expect(service.requestEnrichment(1)).rejects.toThrow();
  });
});
