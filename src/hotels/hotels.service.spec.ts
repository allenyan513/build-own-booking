import { Test, TestingModule } from '@nestjs/testing';
import { HotelsService } from './hotels.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisOptions } from '../common/RedisOptions';

describe('HotelsService', () => {
  let service: HotelsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, CacheModule.registerAsync(RedisOptions)],
      providers: [HotelsService, PrismaService],
    }).compile();

    service = module.get<HotelsService>(HotelsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('seed data', async () => {
    //随机创建10个城市 每个城市创建100个hotel， 每个hotel创建100个room
    const cities = [
      'halifax',
      'montreal',
      'toronto',
      'vancouver',
      'quebec',
      'calgary',
      'ottawa',
      'winnipeg',
      'edmonton',
      'saskatoon',
      'regina',
      'st. johns',
      'charlottetown',
      'fredericton',
      'whitehorse',
      'yellowknife',
      'iqaluit',
    ];
    // const cities = ['halifax'];
    for (const city of cities) {
      for (let i = 0; i < 100; i++) {
        const hotel = await service.createHotel({
          name: `hotel-${i}`,
          location: city,
          address: `address-${i}`,
        });
        for (let j = 0; j < 100; j++) {
          await service.createHotelRoom({
            hotelId: hotel.id,
            roomNumber: j,
            price: 100,
          });
        }
      }
      console.log(`city ${city} done`);
    }
  }, 1000000);

});
