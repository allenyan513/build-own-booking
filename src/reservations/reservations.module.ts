import { Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { HotelsService } from '../hotels/hotels.service';
import { HotelsModule } from '../hotels/hotels.module';
import { DataSyncService } from './reservations.datasync';

@Module({
  imports: [PrismaModule, HotelsModule],
  controllers: [ReservationsController],
  providers: [
    ReservationsService,
    PrismaService,
    HotelsService,
    DataSyncService,
  ],
})
export class ReservationsModule {}
