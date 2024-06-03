import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
} from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('hotels')
@UseInterceptors(CacheInterceptor)
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Post()
  create(@Body() createHotelDto: CreateHotelDto) {
    return this.hotelsService.createHotel(createHotelDto);
  }

  @Get()
  findAll() {
    return this.hotelsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hotelsService.findOneHotel(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHotelDto: UpdateHotelDto) {
    return this.hotelsService.update(+id, updateHotelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hotelsService.remove(+id);
  }

  @Get(':id/rooms')
  getRooms(@Param('id') id: string) {
    return this.hotelsService.findAllByHotelId(+id);
  }
  @Get(':id/rooms/:roomId')
  getRoom(@Param('id') id: string, @Param('roomId') roomId: string) {
    return this.hotelsService.findOneRoom(+roomId);
  }
}
