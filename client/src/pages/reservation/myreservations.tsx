import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/loadingspinner";
import { fetchMyReservations } from "../../apis/reservation/reservation";
import { MyReservationItem } from "../../types/reservation";
import { getErrorMessage } from "../../utils/errorMessage";
import { formatDateTime } from "../../utils/formatDate";

function MyReservationsPage() {
  const [reservations, setReservations] = useState<MyReservationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    fetchMyReservations({})
      .then((page) => {
        setReservations(page.items);
      })
      .catch((error) => {
        setLoadError(getErrorMessage(error, "예매 내역을 불러오지 못했습니다."));
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="px-[100px] py-7">
        <LoadingSpinner label="예매 내역을 불러오는 중이에요" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="px-[100px] py-7">
        <p className="py-16 text-center text-sm text-primary">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="px-[100px] py-7 pb-16">
      <h2 className="mb-5 text-xl font-bold">내 예매 내역</h2>

      {reservations.length === 0 && (
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
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
                {reservation.status}
              </span>
              <strong>{reservation.totalPrice.toLocaleString()}원</strong>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MyReservationsPage;
