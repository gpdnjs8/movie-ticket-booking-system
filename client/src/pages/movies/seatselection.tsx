import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../../components/loadingspinner";
import { fetchSeatsByShowtime } from "../../apis/movies/seat";
import { createReservation } from "../../apis/reservation/reservation";
import { Seat } from "../../types/seat";
import { getErrorMessage } from "../../utils/errorMessage";

const MAX_SEATS = 6;

function SeatSelectionPage() {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const navigate = useNavigate();

  const [seats, setSeats] = useState<Seat[]>([]);
  const [pricePerSeat, setPricePerSeat] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!showtimeId) return;
    setLoading(true);
    fetchSeatsByShowtime(showtimeId).then((res) => {
      setSeats(res.seats);
      setPricePerSeat(res.price);
      setLoading(false);
    });
  }, [showtimeId]);

  const rows = useMemo(() => {
    const grouped = new Map<string, Seat[]>();
    seats.forEach((seat) => {
      if (!grouped.has(seat.row)) grouped.set(seat.row, []);
      grouped.get(seat.row)!.push(seat);
    });
    return Array.from(grouped.entries());
  }, [seats]);

  const toggleSeat = (seat: Seat) => {
    if (seat.isBooked) return;
    setSelectedSeatIds((prev) => {
      if (prev.includes(seat.id)) return prev.filter((id) => id !== seat.id);
      if (prev.length >= MAX_SEATS) return prev;
      return [...prev, seat.id];
    });
  };

  const handleSubmit = async () => {
    if (!showtimeId || selectedSeatIds.length === 0) return;
    setSubmitError("");
    setSubmitting(true);
    try {
      await createReservation(showtimeId, selectedSeatIds);
      navigate("/reservations/me");
    } catch (error) {
      setSubmitError(getErrorMessage(error, "예매에 실패했습니다."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="px-[100px] py-7">
        <LoadingSpinner label="좌석 정보를 불러오는 중이에요" />
      </div>
    );
  }

  return (
    <div className="px-[100px] py-7 pb-16">
      <h2 className="text-xl font-bold">좌석 선택</h2>
      <p className="mt-1 text-[13px] text-muted">최대 {MAX_SEATS}석까지 선택할 수 있어요.</p>

      <div className="mb-6 mt-6 border-b-2 border-border pb-3.5 text-center text-xs tracking-[4px] text-muted">
        SCREEN
      </div>

      <div className="mb-5 flex flex-col items-center gap-2">
        {rows.map(([row, rowSeats]) => (
          <div key={row} className="flex items-center gap-1.5">
            <span className="w-[18px] text-center text-xs text-muted">{row}</span>
            {rowSeats.map((seat) => {
              const isSelected = selectedSeatIds.includes(seat.id);
              return (
                <button
                  key={seat.id}
                  type="button"
                  disabled={seat.isBooked}
                  onClick={() => toggleSeat(seat)}
                  className={`h-[30px] w-[30px] rounded-md border text-[11px] ${
                    seat.isBooked
                      ? "cursor-not-allowed border-border bg-[#2a2d33] text-[#55585f]"
                      : isSelected
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-surface2 text-muted"
                  }`}
                >
                  {seat.number}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mb-6 flex justify-center gap-5 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <i className="inline-block h-2.5 w-2.5 rounded border border-border bg-surface2" /> 선택
          가능
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="inline-block h-2.5 w-2.5 rounded border border-primary bg-primary" /> 선택됨
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="inline-block h-2.5 w-2.5 rounded border border-border bg-[#2a2d33]" />{" "}
          예약됨
        </span>
      </div>

      {submitError && <p className="mb-3 text-center text-sm text-primary">{submitError}</p>}

      <div className="sticky bottom-0 flex items-center justify-between rounded-xl border border-border bg-surface px-5 py-4">
        <div>
          <p className="m-0 text-[13px] text-muted">선택 좌석: {selectedSeatIds.length}석</p>
          <p className="m-0 text-lg font-bold">
            {(selectedSeatIds.length * pricePerSeat).toLocaleString()}원
          </p>
        </div>
        <button
          type="button"
          disabled={selectedSeatIds.length === 0 || submitting}
          onClick={handleSubmit}
          className="rounded-lg bg-primary px-[18px] py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "예매 처리 중..." : "예매하기"}
        </button>
      </div>
    </div>
  );
}

export default SeatSelectionPage;
