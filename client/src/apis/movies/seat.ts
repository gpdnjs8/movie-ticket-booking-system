import { axiosInstance } from "../axiosInstance";
import { ShowtimeSeatsResponse } from "../../types/seat";

export async function fetchSeatsByShowtime(showtimeId: string): Promise<ShowtimeSeatsResponse> {
  const res = await axiosInstance.get<{ data: ShowtimeSeatsResponse }>(
    `/api/showtimes/${showtimeId}/seats`
  );
  return res.data.data;
}
