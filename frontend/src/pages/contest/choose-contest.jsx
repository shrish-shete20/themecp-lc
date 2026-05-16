import { useState, useEffect } from "react"
import "./choose-contest.css"
import { getRatings } from "./utility";

export function ChooseContest({ setIsSubmitted, setSelectedLevel, leetcodeProfileName }) {
  let current_level = 23; // default
  const [level, setLevel] = useState(current_level);

  const [problems, setProblems] = useState([
    "problem 1",
    "problem 2",
    "problem 3",
    "problem 4",
  ]);

  useEffect(() => {
    setProblems(getRatings(level));
  }, [level]);

  return (
    <div className="choose-contest-outer">
      <div className="choose-contest">
        <div>
          <label><b>Enter Contest Level :</b></label>
          <input
            type="number"
            value={level ?? ""}
            placeholder="ex: .."
            onChange={(e) => {
              const val = e.target.value;
              setLevel(val === "" ? null : Number(val));
            }}
          />
        </div>

        <div className="suggested-level">
          Suggested Level by ThemeCP : {current_level}
        </div>

        <div className="center-container">
          <div className="note">
            If suggested level is too easy/hard, you can choose an appropriate level from
            <a href="/level-sheet"> level sheet</a>
          </div>

          <div className="theme-box">Theme : mixed</div>

          <b>Problem Rating :</b>
          <div className="problems-container">
            {problems.map((p, i) => (
              <div key={i} className="problem-cell">{p}</div>
            ))}
          </div>

          <div className="duration">Contest Duration : 120 min</div>

          <button
            className="create-btn"
            onClick={() => {
              setSelectedLevel(level); // send data up

              if (leetcodeProfileName != "") setIsSubmitted(true);
              else {
                alert("go to profile info and add leetcode profile first")
              }
            }}
          >
            Create ThemeCP
          </button>
        </div>
      </div>
    </div>

  );
}
