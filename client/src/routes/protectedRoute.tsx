import { Navigate, Outlet, useLocation } from "react-router-dom";
import LoadingSpinner from "../components/spinner";
import { useAuth } from "../context/auth";

function ProtectedRoute() {
  const { isLoggedIn, isRestoring } = useAuth();
  const location = useLocation();

  if (isRestoring) {
    return (
      <div className="px-[100px] py-1">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
