import "./profile_info.css"
import { getUserData, saveProfileName, getThemeDetail } from "./utils"
import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react"
import ProfileNavbar from "./navbar"
import RatingChart from "./graph.jsx"


// const data = [
//   {
//     date: "2026-05-01 10:30",
//     rating: 1400
//   },
//   {
//     date: "2026-05-03 18:20",
//     rating: 1450
//   },
//   {
//     date: "2026-05-06 22:10",
//     rating: 1510
//   }
// ];

export default function ProfileInfo({ leetcodeProfileName, setProfile, contestHistory }) {

    const { user, loginWithRedirect, logout, isAuthenticated } = useAuth0();
    const [themeDetail, setThemeDetail] = useState(null);

    useEffect(() => {
        async function fetchThemeDetail() {
            if (!isAuthenticated || !user?.email) return;

            const result = await getThemeDetail(user.email);
            setThemeDetail(result);
        }

        fetchThemeDetail();
    }, [isAuthenticated, user]);

    const contest_rating = themeDetail?.contest_rating;
    const max_rating = themeDetail?.max_rating;
    const contest_attempt = themeDetail?.contest_attempt;
    const email = themeDetail?.email;

    const [value, setValue] = useState(leetcodeProfileName);
    useEffect(() => {
        setValue(leetcodeProfileName);
    }, [leetcodeProfileName]);

    return <>
        <div className="profile-info">


            <div className="left">
                <div className="profile-data">
                    {
                        leetcodeProfileName === "" ? <div className="add-profile">
                            <b>Add Leetcode profile :</b>
                            <input
                                type="text"
                                placeholder="ex: your-username"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                            />

                            <button
                                onClick={async () => {
                                    if (!isAuthenticated || !user?.email) {
                                        await loginWithRedirect();
                                        return;
                                    }

                                    const done = await saveProfileName(value.trim(), user.email);
                                    if (done) {
                                        setProfile(value.trim())
                                    }
                                    else {
                                        alert("Unable to save leetcode profile name")
                                        setValue("");
                                    }

                                }}
                            >
                                submit
                            </button>
                        </div> : null
                    }

                    <div className="details">
                        <h1>Pupil</h1>
                        <h3>{value}</h3>
                        <p>&#128200; Contest Rating: {contest_rating} </p>
                        <p>&#127775; Max Rating: {max_rating}</p>
                        <p>&#127775; Contest Attempt: {contest_attempt}</p>
                        <p>&#128231; Email: {email}</p>
                    </div>
                </div>

                <div className="rating-chart">
                    <h2>Rating Chart</h2>
                    <RatingChart contestHistory={contestHistory}/>
                </div>
            </div>

            <div className="right">

                <div className="donation">
                    <div className="support">
                        Support Us
                    </div>
                    <div className="support-detail">
                        <p>
                            Theme<span className="theme-highlight-cp">CP</span><span className="theme-highlight-leetcode">-LeetCode</span> is a free platform built to help students practice through structured problem-solving.<br />
                            I’m currently hosting and maintaining it as a student, and keeping it running comes with real costs like servers and databases.<br />
                            If you’ve found value in using ThemeCP, even a small contribution can help keep the platform alive and improving for everyone. Donations are completely optional, but deeply appreciated.<br />
                            Thank you for being a part of this journey.
                        </p>
                    </div>

                </div>
                <div className="UPI">
                    <img src="/images/paytm-qr.png" className="qr-images" />
                    {/* <img src="/images/paypal-qr.png" className="qr-images" /> */}
                    <a
                        href="https://discord.gg/GqDJEWZP"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Contact Me
                    </a>                </div>
                <div className="contributor">
                    <div className="contributor-heading">
                        <h3>Contributors</h3>
                    </div>

                    <div className="contributor-name">
                        <ul>
                            <li>Kumar Utkarsh</li>
                            <li>Friends</li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>

    </>
}