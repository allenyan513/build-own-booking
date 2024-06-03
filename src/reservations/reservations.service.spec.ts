import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from './reservations.service';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';
import { HotelsModule } from '../hotels/hotels.module';
import { HotelsService } from '../hotels/hotels.service';
import { CacheModule } from '@nestjs/cache-manager';
import { DataSyncService } from './reservations.datasync';
import { RedisOptions } from '../common/RedisOptions';

describe('ReservationsService', () => {
  let service: ReservationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PrismaModule,
        HotelsModule,
        CacheModule.registerAsync(RedisOptions),
      ],
      providers: [
        ReservationsService,
        PrismaService,
        HotelsService,
        DataSyncService,
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
  });

  it('should be defined', async () => {
    const hotelId = 1;
    const roomId = 1;
    const startDate = new Date(2024, 4, 31, 0, 0, 0);
    const endDate = new Date(2024, 5, 3, 0, 0, 0);
    const numberOfRooms = 1;

    for (let i = 0; i < 5; i++) {
      const guestId = i + 1;
      const review = await service.review(hotelId, roomId);
      const r = await service.create({
        id: review.reservationId,
        hotelId: review.hotelId,
        roomId: review.id,
        guestId: guestId,
        startDate: startDate,
        endDate: endDate,
        numberOfRooms: numberOfRooms,
      });
      console.log(r);
    }
  });

  it('reservation', async () => {
    const hotelId = 1;
    const roomId = 1;
    const startDate = new Date(2024, 4, 31, 0, 0, 0);
    const endDate = new Date(2024, 5, 3, 0, 0, 0);
    const numberOfRooms = 1;
    for (let i = 0; i < 5; i++) {
      const guestId = i + 1;
      service.review(hotelId, roomId).then(async (review) => {
        service
          .create({
            id: review.reservationId,
            hotelId: review.hotelId,
            roomId: review.id,
            guestId: guestId,
            startDate: startDate,
            endDate: endDate,
            numberOfRooms: numberOfRooms,
          })
          .then((result) => {
            console.log(result);
          });
      });
    }
  });

  it('search', async () => {
    const city = 'halifax';
    const startDate = '2024-05-31';
    const endDate = '2024-06-03';
    const result = await service.search(city, startDate, endDate);
    console.log(result);
  });

  it('init room inventory', async () => {
    await service.initRoomInventory();
  }, 10000);
});
