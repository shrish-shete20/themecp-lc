import { Link, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

import "./navbar.css";

export default function Navbar() {
  const { isAuthenticated, logout, loginWithRedirect } = useAuth0();

  const login_logout = isAuthenticated ? "Logout" : "Login";

  return (
    <nav className="navbar">
      <Link to="/" className="left-logo">
        <img src="/images/logo-no-background.png" alt="Home" className="nav-icon" />
      </Link>

      <div className="right">
        
        <ul className="nav-list">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/guide">Guide</Link></li>
          <li><Link to="/level-sheet">Level Sheet</Link></li>

          <li>
            <Link to={isAuthenticated ? "/contest" : "/login"}>
              Contest
            </Link>
          </li>

          {isAuthenticated && (
            <li><Link to="/profile">Profile</Link></li>
          )}
        </ul>

        <button
          onClick={async () => {
            if (isAuthenticated) {
              if (confirm("Do you really want to logout?")) {
                // try {
                //   await removeEntry(user.name)
                // }
                // catch {
                //   alert("unable to logout")
                // }
                logout({
                  logoutParams: {
                    returnTo: window.location.origin,
                  },
                });
              }
            } else {
              await loginWithRedirect();
            }
          }}
        >
          {login_logout}
        </button>

      </div>
    </nav>
  );
}