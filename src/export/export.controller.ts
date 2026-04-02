import { Controller, Get, Query } from '@nestjs/common';
import { ExportService } from './export.service';
import { FilterExportDto } from './dtos/filter-export.dto';

@Controller('leads/export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get()
  async export(@Query() query: FilterExportDto) {
    return this.exportService.exportLeads(query);
  }
}
