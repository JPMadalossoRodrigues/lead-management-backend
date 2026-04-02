import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { cnpj } from 'cpf-cnpj-validator';

import { Prisma } from '@prisma/client';
import { LeadStatus } from '@prisma/client/edge';
import { PrismaService } from 'prisma/prisma.service';
import { CreateLeadDto } from './dtos/create-lead.dto';
import { UpdateLeadDto } from './dtos/update-lead.dto';
import { FilterLeadsDto } from './dtos/filter-leads.dto';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLeadDto) {
    const normalizedData = {
      ...dto,
      email: this.normalizeEmail(dto.email),
      companyCnpj: this.normalizeCnpj(dto.companyCnpj),
      status: LeadStatus.PENDING,
    };

    if (!cnpj.isValid(normalizedData.companyCnpj)) {
      throw new BadRequestException('CNPJ inválido');
    }

    try {
      return await this.prisma.lead.create({ data: normalizedData });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll(filters: FilterLeadsDto) {
    return this.prisma.lead.findMany({
      where: {
        ...(filters.status && { status: filters.status }),
        ...(filters.source && { source: filters.source }),

        ...(filters.companyCnpj && {
          companyCnpj: this.normalizeCnpj(filters.companyCnpj),
        }),

        ...(filters.companyName && {
          companyName: {
            contains: filters.companyName.trim(),
            mode: 'insensitive',
          },
        }),

        ...(filters.fullName && {
          fullName: {
            contains: filters.fullName.trim(),
            mode: 'insensitive',
          },
        }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      throw new NotFoundException('Lead não encontrado');
    }

    return lead;
  }

  async update(id: number, dto: UpdateLeadDto) {
    await this.findOne(id);

    const UpdateData = {} as Prisma.LeadUpdateInput;
    if (dto.fullName !== undefined || dto.fullName === '') {
      UpdateData.fullName = dto.fullName.trim();
    }
    if (dto.phone !== undefined || dto.phone === '') {
      UpdateData.phone = dto.phone.trim();
    }
    if (dto.companyName !== undefined || dto.companyName === '') {
      UpdateData.companyName = dto.companyName.trim();
    }
    if (dto.companyWebsite !== undefined || dto.companyWebsite === '') {
      UpdateData.companyWebsite = dto.companyWebsite.trim();
    }
    if (dto.estimatedValue !== undefined || dto.estimatedValue === null) {
      UpdateData.estimatedValue = dto.estimatedValue;
    }
    if (dto.source !== undefined || dto.source === '') {
      UpdateData.source = dto.source;
    }
    if (dto.notes !== undefined || dto.notes === '') {
      UpdateData.notes = dto.notes.trim();
    }

    const data: Prisma.LeadUpdateInput = UpdateData;

    try {
      return await this.prisma.lead.update({
        where: { id },
        data,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.lead.delete({
        where: { id },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private normalizeCnpj(cnpj: string): string {
    return cnpj.replace(/\D/g, '');
  }

  private handlePrismaError(error: any): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('email ou CNPJ já cadastrados');
      }
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException('Lead não encontrado');
    }
    throw error;
  }
}
