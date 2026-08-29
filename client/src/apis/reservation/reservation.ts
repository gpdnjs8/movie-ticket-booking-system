import { axiosInstance } from "../axiosInstance";
import { CreateReservationResponse, MyReservationItem } from "../../types/reservation";
import { CursorPage } from "../../types/pagination";

export async function createReservation(
  showtimeId: string,
  seatIds: string[]
): Promise<CreateReservationResponse> {
  const res = await axiosInstance.post<{ data: CreateReservationResponse }>("/api/reservations", {
    showtimeId,
    seatIds,
  });
  return res.data.data;
}

export async function fetchMyReservations(params: {
  cursor?: string;
  take?: number;
}): Promise<CursorPage<MyReservationItem>> {
  const res = await axiosInstance.get<{ data: CursorPage<MyReservationItem> }>(
    "/api/reservations/me",
    { params }
  );
  return res.data.data;
}
