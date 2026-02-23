import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { nonprofit, logout } = useAuth();
  const isLoggedIn = Boolean(nonprofit);

  const pillClass = ({ isActive }) => `pill${isActive ? " active" : ""}`;


  return (
    <header className="nav">
      <div className="nav-inner">
        {/* Logo ALWAYS goes home */}
        <Link to="/" className="brand">
          <span className="logo">A</span>
          <span>Alms</span>
        </Link>

        <nav className="nav-links">
          <NavLink className={pillClass} to="/">Home</NavLink>
          <NavLink className={pillClass} to="/campaigns">Campaigns</NavLink>

          {isLoggedIn && (
            <NavLink className={pillClass} to="/dashboard">Dashboard</NavLink>
          )}

          {isLoggedIn ? (
            <button className="pill" type="button" onClick={logout}>
              Logout
            </button>
          ) : (
            <NavLink className="pill cta" to="/nonprofit/login">
              Nonprofit Login
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}