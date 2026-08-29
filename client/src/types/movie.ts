export interface MovieListItem {
  id: string;
  title: string;
  genre: string;
  runtimeMin: number;
  score: string;
  releaseDate: string | null;
  posterUrl: string | null;
}
