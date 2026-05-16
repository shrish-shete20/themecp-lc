import { Link } from "react-router-dom";

import "./navbar.css";

export default function ProfileNavbar() {
  return (
    <nav className="navbar-profile">
      <ul className="nav-list">
        <li><Link to="profile_info">Profile Info</Link></li>
        <li><Link to="contest_history">Contest History</Link></li>
      </ul>
    </nav>
  );
}