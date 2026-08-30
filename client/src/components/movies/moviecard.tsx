import { Link } from "react-router-dom";
import { MovieListItem } from "../../types/movie";

function MovieCard({ movie }: { movie: MovieListItem }) {
  return (
    <Link
      to={`/movies/detail/${movie.id}`}
      className="block overflow-hidden rounded-xl border border-border bg-surface transition-transform hover:-translate-y-1 hover:border-primary"
    >
      <div className="relative flex aspect-[2/3] items-end p-2">
        <img
          src={movie.posterUrl ?? undefined}
          alt={movie.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <span className="relative rounded-full bg-black/55 px-2 py-0.5 text-xs font-bold text-amber-300">
          ★ {movie.score}
        </span>
      </div>
      <div className="px-3 py-3">
        <h3 className="truncate text-sm font-medium">{movie.title}</h3>
        <p className="mt-1 text-xs text-muted">
          {movie.genre} · {movie.runtimeMin}분
        </p>
      </div>
    </Link>
  );
}

export default MovieCard;
