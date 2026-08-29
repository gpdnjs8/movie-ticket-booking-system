import { useCallback, useEffect, useState } from "react";
import MovieCard from "../../components/movies/moviecard";
import MovieCardSkeleton from "../../components/movies/moviecardskeleton";
import LoadingSpinner from "../../components/loadingspinner";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { fetchMovies } from "../../apis/movies/movie";
import { MovieListItem } from "../../types/movie";

function MoviesPage() {
  const [movies, setMovies] = useState<MovieListItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [moreLoading, setMoreLoading] = useState(false);

  const loadFirstPage = useCallback(async () => {
    setInitialLoading(true);
    const page = await fetchMovies({});
    setMovies(page.items);
    setCursor(page.nextCursor);
    setHasMore(page.nextCursor !== null);
    setInitialLoading(false);
  }, []);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  const loadMore = useCallback(async () => {
    if (!cursor) return;
    setMoreLoading(true);
    const page = await fetchMovies({ cursor });
    setMovies((prev) => [...prev, ...page.items]);
    setCursor(page.nextCursor);
    setHasMore(page.nextCursor !== null);
    setMoreLoading(false);
  }, [cursor]);

  const sentinelRef = useInfiniteScroll({ hasMore, loading: initialLoading || moreLoading, onLoadMore: loadMore });

  return (
    <div className="px-[100px] py-7 pb-16">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold">영화 목록</h2>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
        {initialLoading
          ? Array.from({ length: 12 }, (_, i) => <MovieCardSkeleton key={i} />)
          : movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
      </div>

      {!initialLoading && movies.length === 0 && (
        <p className="py-16 text-center text-muted">등록된 영화가 없습니다.</p>
      )}

      <div ref={sentinelRef} className="flex min-h-[40px] items-center justify-center">
        {moreLoading && <LoadingSpinner size={24} />}
      </div>
    </div>
  );
}

export default MoviesPage;
