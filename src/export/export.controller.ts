import { Controller, Get, Query } from '@nestjs/common';
import { ExportService } from './export.service';
import { FilterExportDto } from './dtos/filter-export.dto';

@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('leads')
  async export(@Query() query: FilterExportDto) {
    return this.exportService.exportLeads(query);
  }
}
