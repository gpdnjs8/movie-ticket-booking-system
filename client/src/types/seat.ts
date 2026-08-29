export interface Seat {
  id: string;
  row: string;
  number: number;
  isBooked: boolean;
}

export interface ShowtimeSeatsResponse {
  showtimeId: string;
  seats: Seat[];
}
