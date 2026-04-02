import { Controller, Post, Param, ParseIntPipe } from '@nestjs/common';
import { ClassificationService } from './classification.service';

@Controller('leads/:id/classification')
export class ClassificationController {
  constructor(private readonly classificationService: ClassificationService) {}

  @Post()
  requestClassification(@Param('id', ParseIntPipe) id: number) {
    return this.classificationService.requestClassification(id);
  }
}
