import { Outlet } from "react-router-dom";
import Header from "../components/header";

function RootLayout() {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default RootLayout;
