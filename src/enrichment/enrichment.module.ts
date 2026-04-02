import { Module } from '@nestjs/common';
import { EnrichmentService } from './enrichment.service';
import { EnrichmentController } from './enrichment.controller';
import { EnrichmentProducer } from './enrichment.producer';
import { PrismaModule } from 'prisma/prisma.module';
import { EnrichmentWorker } from './enrichment.worker';
import { EnrichmentProcessorService } from './enrichment-processor.service';

@Module({
  imports: [PrismaModule],
  controllers: [EnrichmentController],
  providers: [
    EnrichmentService,
    EnrichmentProducer,
    EnrichmentWorker,
    EnrichmentProcessorService,
  ],
})
export class EnrichmentModule {}
