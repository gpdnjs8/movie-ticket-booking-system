export interface ReservationSeatItem {
  seatId: string;
  row: string;
  number: number;
}

export interface CreateReservationResponse {
  id: string;
  showtimeId: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  seats: ReservationSeatItem[];
}

export interface MyReservationItem {
  id: string;
  showtimeId: string;
  movieTitle: string;
  theaterName: string;
  screenName: string;
  startAt: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  seats: ReservationSeatItem[];
}
