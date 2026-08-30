export interface Seat {
  id: string;
  row: string;
  number: number;
  isBooked: boolean;
}

export interface ShowtimeSeatsResponse {
  showtimeId: string;
  price: number;
  myReservedCount: number;
  seats: Seat[];
}
