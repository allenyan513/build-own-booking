import { Inject, Injectable } from '@nestjs/common';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { CreateRoomDto } from './dto/create-room.dto';

@Injectable()
export class HotelsService {
  constructor(
    private prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async createHotel(createHotelDto: CreateHotelDto) {
    return await this.prismaService.hotel.create({
      data: createHotelDto,
    });
  }
  async createHotelRoom(createRoomDto: CreateRoomDto) {
    return await this.prismaService.room.create({
      data: createRoomDto,
    });
  }

  async findAll() {
    return await this.prismaService.hotel.findMany();
  }

  async findOneHotel(hotelId: number) {
    return await this.prismaService.hotel.findUnique({
      where: {
        id: hotelId,
      },
    });
  }

  update(id: number, updateHotelDto: UpdateHotelDto) {
    return `This action updates a #${id} hotel`;
  }

  remove(id: number) {
    return `This action removes a #${id} hotel`;
  }

  async findAllByCity(city: string) {
    return await this.prismaService.hotel.findMany({
      where: {
        location: city,
      },
    });
  }

  async findAllRooms(hotelId: number) {
    return await this.prismaService.room.findMany({
      where: {
        hotelId: hotelId,
      },
    });
  }

  async findAllByHotelId(hotelId: number) {
    return await this.prismaService.room.findMany({
      where: {
        hotelId: hotelId,
      },
      include: {
        hotel: true,
      },
    });
  }

  async findOneRoom(roomId: number) {
    return await this.prismaService.room.findUnique({
      where: {
        id: roomId,
      },
      include: {
        hotel: true,
      },
    });
  }
}
