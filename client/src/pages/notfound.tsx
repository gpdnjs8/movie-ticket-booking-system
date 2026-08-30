import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-[420px] flex-col items-center gap-4 px-2 py-24 text-center text-muted">
      <h2 className="text-xl font-bold text-ink">페이지 오류</h2>
    </div>
  );
}

export default NotFoundPage;
