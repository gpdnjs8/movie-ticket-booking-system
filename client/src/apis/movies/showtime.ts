import { axiosInstance } from "../axiosInstance";
import { MovieShowtimesResponse } from "../../types/showtime";

export async function fetchShowtimesByMovie(
  movieId: string,
  params: { date?: string; theaterId?: string } = {}
): Promise<MovieShowtimesResponse> {
  const res = await axiosInstance.get<{ data: MovieShowtimesResponse }>(
    `/api/movies/${movieId}/showtimes`,
    { params }
  );
  return res.data.data;
}
