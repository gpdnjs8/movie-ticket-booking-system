import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../../components/spinner";
import { fetchSeatsByShowtime } from "../../apis/movies/seat";
import { createReservation } from "../../apis/reservation/reservation";
import { Seat } from "../../types/seat";
import { getErrorMessage } from "../../utils/errorMessage";

const MAX_SEATS = 6;

function SeatSelectionPage() {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const navigate = useNavigate();

  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  const {
    data,
    error: loadError,
    isLoading,
  } = useQuery({
    queryKey: ["seats", showtimeId],
    queryFn: () => fetchSeatsByShowtime(showtimeId!),
    enabled: !!showtimeId,
  });

  const seats = data?.seats ?? [];
  const pricePerSeat = data?.price ?? 0;
  const myReservedCount = data?.myReservedCount ?? 0;
  const remainingLimit = Math.max(0, MAX_SEATS - myReservedCount);

  const rows = useMemo(() => {
    const grouped = new Map<string, Seat[]>();
    seats.forEach((seat) => {
      if (!grouped.has(seat.row)) grouped.set(seat.row, []);
      grouped.get(seat.row)!.push(seat);
    });
    return Array.from(grouped.entries());
  }, [seats]);

  useEffect(() => {
    return () => clearTimeout(toastTimer.current);
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMessage(""), 2500);
  };

  const toggleSeat = (seat: Seat) => {
    if (seat.isBooked) {
      showToast("이미 예약된 좌석입니다.");
      return;
    }
    setSelectedSeatIds((prev) => {
      if (prev.includes(seat.id)) return prev.filter((id) => id !== seat.id);
      if (prev.length >= remainingLimit) {
        showToast(
          remainingLimit === 0
            ? `이 상영은 이미 최대 좌석 수(${MAX_SEATS}석)만큼 예매하셔서 더 선택할 수 없어요.`
            : myReservedCount > 0
              ? `기존에 ${myReservedCount}석 예매하셔서, 최대 ${remainingLimit}석까지만 더 선택할 수 있어요.`
              : `최대 ${MAX_SEATS}석까지 선택할 수 있어요.`
        );
        return prev;
      }
      return [...prev, seat.id];
    });
  };

  const reservationMutation = useMutation({
    mutationFn: () => createReservation(showtimeId!, selectedSeatIds),
    onSuccess: () => navigate("/reservations/me"),
    onError: (error) => showToast(getErrorMessage(error, "예매에 실패했습니다.")),
  });

  const handleSubmit = () => {
    if (!showtimeId || selectedSeatIds.length === 0) return;
    reservationMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="px-[100px] py-7">
        <LoadingSpinner label="좌석 정보를 불러오는 중이에요" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="px-[100px] py-7">
        <p className="py-16 text-center text-sm text-primary">
          {getErrorMessage(loadError, "좌석 정보를 불러오지 못했습니다.")}
        </p>
      </div>
    );
  }

  return (
    <div className="px-[100px] py-7 pb-16">
      <h2 className="text-xl font-bold">좌석 선택</h2>
      <p className="mt-1 text-[13px] text-muted">
        {remainingLimit === 0
          ? `이 상영은 이미 최대 좌석 수(${MAX_SEATS}석)만큼 예매하셨어요. 더 선택할 수 없어요.`
          : myReservedCount > 0
            ? `이 상영에 이미 ${myReservedCount}석 예매하셨어요. 최대 ${remainingLimit}석까지 더 선택할 수 있어요.`
            : `최대 ${MAX_SEATS}석까지 선택할 수 있어요.`}
      </p>

      <div className="mb-6 mt-6 border-b-2 border-border pb-3.5 text-center text-xs tracking-[4px] text-muted">
        SCREEN
      </div>

      <div className="relative mb-5 flex flex-col items-center gap-2">
        {toastMessage && (
          <div className="absolute left-1/2 top-0 z-30 -translate-x-1/2 -translate-y-[calc(100%+12px)] rounded-lg border border-primary bg-surface px-5 py-3 text-sm font-medium shadow-lg">
            {toastMessage}
          </div>
        )}
        {rows.map(([row, rowSeats]) => (
          <div key={row} className="flex items-center gap-1.5">
            <span className="w-[18px] text-center text-xs text-muted">{row}</span>
            {rowSeats.map((seat) => {
              const isSelected = selectedSeatIds.includes(seat.id);
              return (
                <button
                  key={seat.id}
                  type="button"
                  onClick={() => toggleSeat(seat)}
                  className={`h-[30px] w-[30px] rounded-md border text-[11px] ${
                    seat.isBooked
                      ? "border-border bg-[#2a2d33] text-[#55585f]"
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

      <div className="sticky bottom-0 flex items-center justify-between rounded-xl border border-border bg-surface px-5 py-4">
        <div>
          <p className="m-0 text-[13px] text-muted">선택 좌석: {selectedSeatIds.length}석</p>
          <p className="m-0 text-lg font-bold">
            {(selectedSeatIds.length * pricePerSeat).toLocaleString()}원
          </p>
        </div>
        <button
          type="button"
          disabled={selectedSeatIds.length === 0 || reservationMutation.isPending}
          onClick={handleSubmit}
          className="rounded-lg bg-primary px-[18px] py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {reservationMutation.isPending ? "예매 처리 중..." : "예매하기"}
        </button>
      </div>
    </div>
  );
}

export default SeatSelectionPage;
