import { Route, Routes, Link, Outlet } from "react-router-dom"
import { useAuth0 } from "@auth0/auth0-react"

import ProfileNavbar from "./sub/navbar"
import ContestHistory from "./sub/contest_history"
import ProfileInfo from "./sub/profile_info"
import "./profile.css"


export default function Profile() {
  const { user, loginWithRedirect, logout, isAuthenticated } = useAuth0();

  return <>
    <div className="profile-container">
      <ProfileNavbar />
      <Outlet />
    </div>
  </>
}