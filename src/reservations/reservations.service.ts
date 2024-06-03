import { Inject, Injectable } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { HotelsService } from '../hotels/hotels.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hotelsService: HotelsService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async create(createReservationDto: CreateReservationDto) {
    return new Promise((resolve, reject) => {
      //事务开始
      this.prismaService
        .$transaction(async (prisma) => {
          //检查库存
          const roomInventories = await prisma.roomInventory.findMany({
            where: {
              AND: [
                {
                  hotelId: createReservationDto.hotelId,
                },
                {
                  roomId: createReservationDto.roomId,
                },
                {
                  date: {
                    lte: createReservationDto.endDate,
                  },
                },
                {
                  date: {
                    gte: createReservationDto.startDate,
                  },
                },
              ],
            },
          });
          //检查库存
          for (const item of roomInventories) {
            if (
              item.totalReserved + createReservationDto.numberOfRooms >
              item.totalInventory
            ) {
              throw new Error('Room is not available');
            }
            const update = await prisma.roomInventory.update({
              where: {
                id: item.id,
                version: item.version,
              },
              data: {
                totalReserved: {
                  increment: createReservationDto.numberOfRooms,
                },
                version: {
                  increment: 1,
                },
              },
            });
            if (update === null) {
              throw new Error('Room is not available');
            }
          }
          //创建预定
          await prisma.reservation.create({
            data: {
              id: createReservationDto.id,
              hotelId: createReservationDto.hotelId,
              roomId: createReservationDto.roomId,
              guestId: createReservationDto.guestId,
              startDate: createReservationDto.startDate,
              endDate: createReservationDto.endDate,
              status: 'PENDING',
            },
          });
        })
        .then(() => {
          console.log('Transaction complete.');
          resolve('Transaction complete.');
        })
        .catch((e) => {
          console.error(e);
          reject(e);
        });
    });
  }

  findAll() {
    return `This action returns all reservations`;
  }

  findOne(id: number) {
    return `This action returns a #${id} reservation`;
  }

  update(id: number, updateReservationDto: UpdateReservationDto) {
    return `This action updates a #${id} reservation`;
  }

  remove(id: number) {
    return `This action removes a #${id} reservation`;
  }

  async review(hotelId: number, roomId: number) {
    const result = await this.hotelsService.findOneRoom(roomId);
    return {
      reservationId: uuidv4(),
      ...result,
    };
  }

  /**
   * @param city
   * @param startDate
   * @param endDate
   */
  async search(city: string, startDate: string, endDate: string) {
    const hotels = await this.hotelsService.findAllByCity(city);
    const dates = this.getDates(startDate, endDate);

    const result = [];
    for (const hotel of hotels) {
      const availableRooms = [];

      const rooms = await this.hotelsService.findAllRooms(hotel.id);
      for (const room of rooms) {
        // const key = `room_inventory_${hotel.id}_${room.id}_${roomInventory.date.toISOString()}`;
        const keys = dates.map((date) => {
          return `room_inventory_${hotel.id}_${room.id}_${date}`;
        });
        const values = await this.cacheManager.store.mget(...keys);
        const available = values.filter((value) => Number(value) > 0).length;
        if (available === dates.length) {
          availableRooms.push(room);
        }
      }
      if (availableRooms.length > 0) {
        result.push({
          hotel: hotel,
          rooms: availableRooms,
        });
      }
    }
    return result;
  }

  /**
   * return all dates between start and end date ,format 2024-01-01
   * @param startDate
   * @param endDate
   */
  getDates(startDate: string, endDate: string) {
    const dates = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }

  async initRoomInventory() {
    const cities = ['halifax'];
    for (const city of cities) {
      const hotels = await this.hotelsService.findAllByCity(city);
      for (const hotel of hotels) {
        const rooms = await this.hotelsService.findAllRooms(hotel.id);
        for (const room of rooms) {
          await this.prismaService.roomInventory.create({
            data: {
              hotelId: hotel.id,
              roomId: room.id,
              date: new Date(2024, 5, 1),
              totalInventory: 1,
              totalReserved: 0,
              version: 1,
            },
          });
        }
      }
      console.log(`city ${city} done`);
    }
  }
}
