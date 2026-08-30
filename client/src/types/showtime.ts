export interface ShowtimeItem {
  id: string;
  screenName: string;
  startAt: string;
  endAt: string;
  price: number;
}

export interface TheaterShowtimes {
  theaterId: string;
  theaterName: string;
  showtimes: ShowtimeItem[];
}

export interface MovieShowtimesResponse {
  theaters: TheaterShowtimes[];
}
