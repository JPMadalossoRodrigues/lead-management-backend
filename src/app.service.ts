import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async test() {
    const leads = await this.prisma.lead.findMany();
    console.log(leads);
  }
}
