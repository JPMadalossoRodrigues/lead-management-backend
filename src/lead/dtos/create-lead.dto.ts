import { Source } from '@prisma/client';
import {
  IsString,
  Length,
  IsEmail,
  Matches,
  IsOptional,
  IsUrl,
  IsNumber,
  IsPositive,
  IsEnum,
} from 'class-validator';

export class CreateLeadDto {
  @IsString()
  @Length(3, 100)
  fullName: string;

  @IsEmail()
  email: string;

  @Matches(/^\+\d{10,15}$/)
  phone: string;

  @IsString()
  @Length(2, 150)
  companyName: string;

  @Matches(/^\d{14}$/)
  companyCnpj: string;

  @IsOptional()
  @IsUrl()
  companyWebsite?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  estimatedValue?: number;

  @IsEnum(Source)
  source: Source;

  @IsOptional()
  @Length(0, 500)
  notes?: string;
}
