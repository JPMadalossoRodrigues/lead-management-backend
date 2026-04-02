import { Module } from '@nestjs/common';
import { ClassificationService } from './classification.service';
import { ClassificationController } from './classification.controller';
import { ClassificationProducer } from './classification.producer';
import { PrismaModule } from 'prisma/prisma.module';
import { ClassificationProcessorService } from './classification-processor.service';
import { ClassificationWorker } from './classification.worker';

@Module({
  imports: [PrismaModule],
  controllers: [ClassificationController],
  providers: [
    ClassificationService,
    ClassificationProducer,
    ClassificationWorker,
    ClassificationProcessorService,
  ],
})
export class ClassificationModule {}
