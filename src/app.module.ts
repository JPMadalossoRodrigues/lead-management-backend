import { Module } from '@nestjs/common';

import { PrismaModule } from 'prisma/prisma.module';
import { LeadsModule } from './lead/lead.module';
import { ExportModule } from './export/export.module';
import { EnrichmentModule } from './enrichment/enrichment.module';
import { ClassificationModule } from './classification/classification.module';

@Module({
  imports: [
    PrismaModule,
    LeadsModule,
    ExportModule,
    EnrichmentModule,
    ClassificationModule,
  ],
})
export class AppModule {}
