import { useInfiniteQuery } from "@tanstack/react-query";
import MovieCard from "../../components/movies/moviecard";
import MovieCardSkeleton from "../../components/movies/moviecardskeleton";
import LoadingSpinner from "../../components/spinner";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { fetchMovies } from "../../apis/movies/movie";
import { getErrorMessage } from "../../utils/errorMessage";

function MoviesPage() {
  const { data, error, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["movies"],
      queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
        fetchMovies({ cursor: pageParam }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    });

  const movies = data?.pages.flatMap((page) => page.items) ?? [];

  const sentinelRef = useInfiniteScroll({
    hasMore: hasNextPage ?? false,
    loading: isLoading || isFetchingNextPage,
    onLoadMore: () => fetchNextPage(),
  });

  return (
    <div className="px-[100px] py-7 pb-16">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold">영화 목록</h2>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
        {isLoading
          ? Array.from({ length: 12 }, (_, i) => <MovieCardSkeleton key={i} />)
          : movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
      </div>

      {error && (
        <p className="py-16 text-center text-sm text-primary">
          {getErrorMessage(error, "영화 목록을 불러오지 못했습니다.")}
        </p>
      )}

      {!isLoading && !error && movies.length === 0 && (
        <p className="py-16 text-center text-muted">등록된 영화가 없습니다.</p>
      )}

      <div ref={sentinelRef} className="flex min-h-[40px] items-center justify-center">
        {isFetchingNextPage && <LoadingSpinner size={24} />}
      </div>
    </div>
  );
}

export default MoviesPage;
