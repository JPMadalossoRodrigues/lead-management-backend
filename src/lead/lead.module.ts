import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { LeadsController } from './lead.controller';
import { LeadsService } from './lead.service';

@Module({
  controllers: [LeadsController],
  providers: [LeadsService],
  imports: [PrismaModule],
})
export class LeadsModule {}
