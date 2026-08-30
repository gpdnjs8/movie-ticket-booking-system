import { useInfiniteQuery } from "@tanstack/react-query";
import LoadingSpinner from "../../components/spinner";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { fetchMyReservations } from "../../apis/reservation/reservation";
import { getErrorMessage } from "../../utils/errorMessage";
import { formatDateTime } from "../../utils/formatDate";

function MyReservationsPage() {
  const { data, error, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["myReservations"],
      queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
        fetchMyReservations({ cursor: pageParam }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    });

  const reservations = data?.pages.flatMap((page) => page.items) ?? [];

  const sentinelRef = useInfiniteScroll({
    hasMore: hasNextPage ?? false,
    loading: isLoading || isFetchingNextPage,
    onLoadMore: () => fetchNextPage(),
  });

  if (isLoading) {
    return (
      <div className="px-[100px] py-7">
        <LoadingSpinner label="예매 내역을 불러오는 중이에요" />
      </div>
    );
  }

  return (
    <div className="px-[100px] py-7 pb-16">
      <h2 className="mb-5 text-xl font-bold">내 예매 내역</h2>

      {error && (
        <p className="py-16 text-center text-sm text-primary">
          {getErrorMessage(error, "예매 내역을 불러오지 못했습니다.")}
        </p>
      )}

      {!error && reservations.length === 0 && (
        <p className="py-16 text-center text-muted">예매 내역이 없습니다.</p>
      )}

      <ul className="flex flex-col gap-3">
        {reservations.map((reservation) => (
          <li
            key={reservation.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface px-5 py-4"
          >
            <div>
              <h3 className="mb-1.5 text-[15px] font-semibold">{reservation.movieTitle}</h3>
              <p className="my-0.5 text-[13px] text-muted">
                {reservation.theaterName} · {reservation.screenName} ·{" "}
                {formatDateTime(reservation.startAt)}
              </p>
              <p className="my-0.5 text-[13px] text-muted">
                좌석: {reservation.seats.map((s) => `${s.row}${s.number}`).join(", ")}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <strong>{reservation.totalPrice.toLocaleString()}원</strong>
            </div>
          </li>
        ))}
      </ul>

      <div ref={sentinelRef} className="flex min-h-[40px] items-center justify-center">
        {isFetchingNextPage && <LoadingSpinner size={24} />}
      </div>
    </div>
  );
}

export default MyReservationsPage;
