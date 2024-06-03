export class CreateReservationDto {
  id: string;
  hotelId: number;
  roomId: number;
  guestId: number;
  startDate: Date;
  endDate: Date;
  numberOfRooms: number;
}
