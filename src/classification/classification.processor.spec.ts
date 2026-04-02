import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';

import { PrismaService } from 'prisma/prisma.service';
import { ClassificationProcessorService } from './classification-processor.service';

describe('ClassificationProcessorService', () => {
  let processor: ClassificationProcessorService;

  let prisma: {
    classification: {
      findUnique: Mock;
      update: Mock;
    };
    lead: {
      update: Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      classification: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      lead: {
        update: vi.fn(),
      },
    };

    processor = new ClassificationProcessorService(
      prisma as unknown as PrismaService,
    );
  });

  it('should process classification', async () => {
    prisma.classification.findUnique.mockResolvedValue({
      id: 1,
      enrichment: { data: {} },
      lead: {},
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => ({
        response: JSON.stringify({
          score: 80,
          classification: 'HOT',
          justification: 'good',
          commercialPotential: 'HIGH',
        }),
      }),
    }) as unknown as typeof fetch;

    await processor.process({ classificationId: 1, leadId: 1 });

    expect(prisma.classification.update).toHaveBeenCalled();
  });
});
