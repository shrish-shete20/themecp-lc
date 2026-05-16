import { Outlet } from "react-router-dom"

import ProfileNavbar from "./sub/navbar"
import "./profile.css"


export default function Profile() {
  return <>
    <div className="profile-container">
      <ProfileNavbar />
      <Outlet />
    </div>
  </>
}