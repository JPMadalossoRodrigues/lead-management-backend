import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { ExportService } from './export.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ExportMode } from './dtos/filter-export.dto';

describe('ExportService', () => {
  let service: ExportService;

  let prisma: {
    lead: {
      findMany: Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      lead: {
        findMany: vi.fn(),
      },
    };

    service = new ExportService(prisma as unknown as PrismaService);
  });

  it('should return consolidated data', async () => {
    prisma.lead.findMany.mockResolvedValue([
      {
        enrichments: [{}],
        classifications: [{}],
      },
    ]);

    const result = await service.exportLeads({
      mode: ExportMode.CONSOLIDATED,
    });

    expect(result[0].enrichments).toHaveLength(1);
  });
});
