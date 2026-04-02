import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ExportMode, FilterExportDto } from './dtos/filter-export.dto';

@Injectable()
export class ExportService {
  constructor(private readonly prisma: PrismaService) {}

  async exportLeads(query: FilterExportDto) {
    const isFull = query.mode === ExportMode.FULL;

    const leads = await this.prisma.lead.findMany({
      where: {
        ...(query.status && { status: query.status }),
        ...(query.source && { source: query.source }),
        ...(query.companyCnpj && {
          companyCnpj: query.companyCnpj,
        }),
        ...(query.companyName && {
          companyName: {
            contains: query.companyName,
            mode: 'insensitive',
          },
        }),
        ...(query.fullName && {
          fullName: {
            contains: query.fullName,
            mode: 'insensitive',
          },
        }),
      },
      include: {
        enrichments: isFull
          ? {
              orderBy: { createdAt: 'desc' },
            }
          : {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
        classifications: isFull
          ? {
              orderBy: { createdAt: 'desc' },
            }
          : {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return leads.map((lead) => ({
      id: lead.id,
      fullName: lead.fullName,
      email: lead.email,
      phone: lead.phone,
      companyName: lead.companyName,
      companyCnpj: lead.companyCnpj,
      source: lead.source,
      status: lead.status,
      estimatedValue: lead.estimatedValue,

      enrichments: lead.enrichments,
      classifications: lead.classifications,
    }));
  }
}
