import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { LeadStatus, Source } from '@prisma/client';

export class ExportLeadsDto {
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @IsOptional()
  @IsEnum(Source)
  source?: Source;

  @IsOptional()
  @IsBoolean()
  includeHistory?: boolean = false;
}
