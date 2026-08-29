import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `border-b-2 py-1.5 text-base font-medium leading-none ${
    isActive ? "border-primary text-white" : "border-transparent text-headerMuted"
  }`;

function Header() {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-10 border-b border-headerBorder bg-header text-white">
      <div className="flex items-center gap-8 px-[100px] py-5">
        <NavLink to="/" className="whitespace-nowrap text-xl font-bold">
          영화 티켓 예매 시스템
        </NavLink>
        <nav className="flex flex-1 gap-5">
          <NavLink to="/" end className={navLinkClass}>
            영화 목록
          </NavLink>
          <NavLink to="/reservations/me" className={navLinkClass}>
            내 예매 내역
          </NavLink>
        </nav>
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <span className="text-[13px] text-headerMuted">{user?.name}님</span>
              <button
                type="button"
                className="rounded-lg border border-headerBorder bg-headerSurface2 px-4 py-2 text-sm font-semibold hover:bg-headerBorder"
                onClick={handleLogout}
              >
                로그아웃
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              className="rounded-lg border border-headerBorder bg-headerSurface2 px-4 py-2 text-sm font-semibold hover:bg-headerBorder"
            >
              로그인
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
