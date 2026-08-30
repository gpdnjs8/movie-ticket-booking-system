import { axiosInstance } from "../axiosInstance";
import { MovieListItem } from "../../types/movie";
import { CursorPage } from "../../types/pagination";

export async function fetchMovies(params: {
  cursor?: string;
  take?: number;
}): Promise<CursorPage<MovieListItem>> {
  const res = await axiosInstance.get<{ data: CursorPage<MovieListItem> }>("/api/movies", {
    params,
  });
  return res.data.data;
}
