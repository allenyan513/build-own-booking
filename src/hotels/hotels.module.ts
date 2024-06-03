import { Module } from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { HotelsController } from './hotels.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { DataSyncService } from './hotels.datasync';

@Module({
  imports: [PrismaModule],
  controllers: [HotelsController],
  providers: [HotelsService, PrismaService, DataSyncService],
})
export class HotelsModule {}
