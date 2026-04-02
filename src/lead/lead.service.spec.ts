import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { LeadsService } from './lead.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('LeadsService', () => {
  let service: LeadsService;

  let prisma: {
    lead: {
      create: Mock;
      findUnique: Mock;
      update: Mock;
      delete: Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      lead: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    service = new LeadsService(prisma as unknown as PrismaService);
  });

  it('should create a lead', async () => {
    prisma.lead.create.mockResolvedValue({ id: 1 });

    const result = await service.create({} as never);

    expect(result.id).toBe(1);
  });

  it('should throw if not found', async () => {
    prisma.lead.findUnique.mockResolvedValue(null);

    await expect(service.findOne(1)).rejects.toThrow();
  });

  it('should update lead', async () => {
    prisma.lead.findUnique.mockResolvedValue({ id: 1 });
    prisma.lead.update.mockResolvedValue({ id: 1 });

    const result = await service.update(1, {} as never);

    expect(result.id).toBe(1);
  });

  it('should delete lead', async () => {
    prisma.lead.findUnique.mockResolvedValue({ id: 1 });
    prisma.lead.delete.mockResolvedValue({ id: 1 });

    const result = await service.remove(1);

    expect(result.id).toBe(1);
  });
});
