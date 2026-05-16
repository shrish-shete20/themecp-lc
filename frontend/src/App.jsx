import { Route, Routes, Link } from "react-router-dom"
import { useAuth0 } from "@auth0/auth0-react"
import { useEffect, useState } from "react"

import Navbar from "./pages/navbar/navbar"
import Contest from "./pages/contest/contest"
import Profile from "./pages/profile/profile"
import Home from "./pages/home/home"
import Level_sheet from "./pages/level-sheet/level-sheet"
import Guide from "./pages/guide/guide"
import Login from "./pages/login/login"

import { makeEntry, getProfileName, getContestHistory } from "./utils"

import ProfileInfo from "./pages/profile/sub/profile_info"
import ContestHistory from "./pages/profile/sub/contest_history"
import "./style.css"


export default function App() {

  const [leetcodeProfileName, setProfile] = useState("");
  const [contestHistory, setContestHistory] = useState(null);
  // login page disappears after authorization, and login can be done in two
  // ways first from the login page and second from the login button
  // so here in the main page we are checking if the isAuth get
  // true then make the entry
  const { user, loginWithRedirect, logout, isAuthenticated } = useAuth0();
  useEffect(() => {
    const run = async () => {
      if (isAuthenticated && user) {
        console.log("inside app and authenticated");
        await makeEntry(user);
        const profileName = await getProfileName(user.email);
        const result = await getContestHistory(user.email);
        if (profileName) setProfile(profileName);
        if(result) setContestHistory(result);
      }
    };
    run();
  }, [isAuthenticated, user, leetcodeProfileName]);

  return <>
    <div className="body-container">
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contest" element={<Contest leetcodeProfileName={leetcodeProfileName} />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/level-sheet" element={<Level_sheet />} />
        <Route path="/login" element={<Login />} />

        <Route path="/profile" element={<Profile />}>
          {/* default route */}
          <Route
            index
            element={<ProfileInfo  leetcodeProfileName={leetcodeProfileName} contestHistory={contestHistory} setProfile={setProfile}/>}
          />
          <Route path="profile_info" element={<ProfileInfo leetcodeProfileName={leetcodeProfileName} contestHistory={contestHistory} setProfile={setProfile} />} />
          <Route path="contest_history" element={<ContestHistory leetcodeProfileName={leetcodeProfileName} contestHistory={contestHistory}/>} />
        </Route>

      </Routes>
    </div>
  </>
}