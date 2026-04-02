import { Controller, Post, Param, ParseIntPipe } from '@nestjs/common';
import { EnrichmentService } from './enrichment.service';

@Controller('leads/:id/enrichment')
export class EnrichmentController {
  constructor(private readonly enrichmentService: EnrichmentService) {}

  @Post()
  requestEnrichment(@Param('id', ParseIntPipe) id: number) {
    return this.enrichmentService.requestEnrichment(id);
  }
}
