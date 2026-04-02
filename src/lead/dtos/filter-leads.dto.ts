import { IsEnum, IsOptional, IsString } from 'class-validator';
import { LeadStatus, Source } from '@prisma/client';

export class FilterLeadsDto {
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
}
