import { Link } from "react-router-dom";
import { ROUTES } from "../routes/router";

function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-[420px] flex-col items-center gap-4 px-5 py-24 text-center text-muted">
      <h2 className="text-xl font-bold text-ink">페이지를 찾을 수 없어요</h2>
      <Link
        to={ROUTES.movies}
        className="rounded-lg bg-primary px-[18px] py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
      >
        영화 목록으로 이동
      </Link>
    </div>
  );
}

export default NotFoundPage;
