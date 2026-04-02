import { IsOptional, IsEnum, IsString } from 'class-validator';
import { LeadStatus, Source } from '@prisma/client';

export enum ExportMode {
  CONSOLIDATED = 'consolidated',
  FULL = 'full',
}

export class FilterExportDto {
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @IsOptional()
  @IsEnum(Source)
  source?: Source;

  @IsOptional()
  @IsString()
  companyCnpj?: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsEnum(ExportMode)
  mode?: ExportMode = ExportMode.CONSOLIDATED;
}
