import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../../components/loadingspinner";
import { fetchShowtimesByMovie } from "../../apis/movies/showtime";
import { MovieShowtimesResponse } from "../../types/showtime";
import { ROUTES } from "../../routes/router";

function MovieShowtimesPage() {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<MovieShowtimesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTheaterId, setSelectedTheaterId] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("all");

  useEffect(() => {
    if (!movieId) return;
    setLoading(true);
    fetchShowtimesByMovie(movieId).then((res) => {
      setData(res);
      setLoading(false);
    });
  }, [movieId]);

  const dateOptions = useMemo(() => {
    if (!data) return [];
    const dates = new Set<string>();
    data.theaters.forEach((theater) =>
      theater.showtimes.forEach((s) => dates.add(s.startAt.slice(0, 10)))
    );
    return Array.from(dates).sort();
  }, [data]);

  const visibleTheaters = useMemo(() => {
    if (!data) return [];
    return data.theaters
      .filter((theater) => selectedTheaterId === "all" || theater.theaterId === selectedTheaterId)
      .map((theater) => ({
        ...theater,
        showtimes: theater.showtimes.filter(
          (s) => selectedDate === "all" || s.startAt.startsWith(selectedDate)
        ),
      }))
      .filter((theater) => theater.showtimes.length > 0);
  }, [data, selectedTheaterId, selectedDate]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-7">
        <LoadingSpinner label="상영시간을 불러오는 중이에요" />
      </div>
    );
  }

  const selectClass =
    "rounded-lg border border-border bg-surface2 px-3 py-2 text-[13px] outline-none focus:border-primary";

  return (
    <div className="mx-auto max-w-5xl px-5 py-7 pb-16">
      <h2 className="mb-6 text-xl font-bold">상영 시간표</h2>

      <div className="mb-6 flex gap-2.5">
        <select
          value={selectedTheaterId}
          onChange={(e) => setSelectedTheaterId(e.target.value)}
          className={selectClass}
        >
          <option value="all">전체 영화관</option>
          {data?.theaters.map((theater) => (
            <option key={theater.theaterId} value={theater.theaterId}>
              {theater.theaterName}
            </option>
          ))}
        </select>
        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className={selectClass}
        >
          <option value="all">전체 날짜</option>
          {dateOptions.map((date) => (
            <option key={date} value={date}>
              {date}
            </option>
          ))}
        </select>
      </div>

      {visibleTheaters.length === 0 && (
        <p className="py-16 text-center text-muted">해당 조건의 상영시간이 없습니다.</p>
      )}

      <div className="flex flex-col gap-5">
        {visibleTheaters.map((theater) => (
          <div key={theater.theaterId}>
            <h3 className="mb-2.5 text-[15px] font-semibold">{theater.theaterName}</h3>
            <div className="flex flex-wrap gap-2.5">
              {theater.showtimes.map((showtime) => (
                <button
                  key={showtime.id}
                  type="button"
                  onClick={() => navigate(ROUTES.seats(showtime.id))}
                  className="flex flex-col items-center gap-0.5 rounded-lg border border-border bg-surface px-3.5 py-2 hover:border-primary"
                >
                  <span className="text-sm">{showtime.startAt.slice(11, 16)}</span>
                  <small className="text-[11px] text-muted">{showtime.screenName}</small>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MovieShowtimesPage;
