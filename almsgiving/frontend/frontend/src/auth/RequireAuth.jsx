import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

// Makes /dashboard, /my-campaigns, /campaigns/new all protected at once
export default function RequireAuth() {
  const { isAuthed } = useAuth();
  const location = useLocation();

  if (!isAuthed) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }} // remembers where user tried to go
      />
    );
  }

  return <Outlet />; // renders any protected child route
}

