import { createBrowserRouter } from "react-router-dom";
import RootLayout from "../layouts/root-layout";
import ProtectedRoute from "./protectedRoute";
import MoviesPage from "../pages/movies/movies";
import MovieShowtimesPage from "../pages/movies/movieshowtimes";
import SeatSelectionPage from "../pages/movies/seatselection";
import MyReservationsPage from "../pages/reservation/myreservations";
import LoginPage from "../pages/auth/login";
import RegisterPage from "../pages/auth/register";
import NotFoundPage from "../pages/notfound";

export const ROUTES = {
  movies: "/",
  movieDetail: (movieId: string) => `/movies/detail/${movieId}`,
  seats: (showtimeId: string) => `/showtimes/${showtimeId}/seats`,
  myReservations: "/reservations/me",
  login: "/login",
  register: "/register",
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <MoviesPage /> },
      { path: "movies/detail/:movieId", element: <MovieShowtimesPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "showtimes/:showtimeId/seats", element: <SeatSelectionPage /> },
          { path: "reservations/me", element: <MyReservationsPage /> },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
