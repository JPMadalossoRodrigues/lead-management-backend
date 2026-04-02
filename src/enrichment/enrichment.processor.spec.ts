import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';

import { PrismaService } from '../../prisma/prisma.service';
import { EnrichmentProcessorService } from './enrichment-processor.service';

describe('EnrichmentProcessorService', () => {
  let processor: EnrichmentProcessorService;

  let prisma: {
    enrichment: {
      findUnique: Mock;
      update: Mock;
    };
    lead: {
      update: Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      enrichment: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      lead: {
        update: vi.fn(),
      },
    };

    processor = new EnrichmentProcessorService(
      prisma as unknown as PrismaService,
    );
  });

  it('should process success', async () => {
    prisma.enrichment.findUnique.mockResolvedValue({
      id: 1,
      lead: { companyCnpj: '123' },
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => ({}),
    }) as unknown as typeof fetch;

    await processor.process({ enrichmentId: 1, leadId: 1 });

    expect(prisma.enrichment.update).toHaveBeenCalled();
    expect(prisma.lead.update).toHaveBeenCalled();
  });

  it('should handle failure', async () => {
    prisma.enrichment.findUnique.mockResolvedValue({
      id: 1,
      lead: { companyCnpj: '123' },
    });

    global.fetch = vi
      .fn()
      .mockRejectedValue(new Error()) as unknown as typeof fetch;

    await processor.process({ enrichmentId: 1, leadId: 1 });

    type EnrichmentUpdateArgs = {
      where: { id: number };
      data: {
        status: string;
        errorMessage?: string;
        completedAt?: Date;
      };
    };

    const call = prisma.enrichment.update.mock
      .calls[0][0] as EnrichmentUpdateArgs;

    expect(call.data.status).toBe('FAILED');
  });
});
