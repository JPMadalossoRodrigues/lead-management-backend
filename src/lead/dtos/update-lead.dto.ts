import { Source } from '@prisma/client';
import {
  IsString,
  Length,
  Matches,
  IsOptional,
  IsUrl,
  IsNumber,
  IsPositive,
  IsEnum,
} from 'class-validator';

export class UpdateLeadDto {
  @IsOptional()
  @IsString()
  @Length(3, 100)
  fullName?: string;

  @IsOptional()
  @Matches(/^\+\d{10,15}$/)
  phone?: string;

  @IsOptional()
  @IsString()
  @Length(2, 150)
  companyName?: string;

  @IsOptional()
  @IsUrl()
  companyWebsite?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  estimatedValue?: number;

  @IsOptional()
  @IsEnum(Source)
  source?: Source;

  @IsOptional()
  @Length(0, 500)
  notes?: string;
}
