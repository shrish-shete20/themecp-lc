import { useState } from "react";
import "./choose-contest.css";
import { getRatings } from "./utility";

export function ChooseContest({ setIsSubmitted, setSelectedLevel, leetcodeProfileName }) {
  const current_level = 23; // default
  const [level, setLevel] = useState(current_level);

  const problems = getRatings(level);
  const levelDisplay = level ?? "Auto";

  return (
    <div className="choose-contest-outer">
      <section className="choose-contest" aria-labelledby="contest-setup-title">
        <div className="contest-hero">
          <div>
            <p className="contest-eyebrow">ThemeCP Contest Builder</p>
            <h1 id="contest-setup-title">Create a focused LeetCode sprint</h1>
            <p>
              Tune the level, review the four target ratings, and let ThemeCP
              prepare a fresh mixed contest from your saved profile.
            </p>
          </div>

          <div className="duration-card" aria-label="Contest duration">
            <span>Duration</span>
            <strong>120 min</strong>
            <small>4 target questions</small>
          </div>
        </div>

        <div className="contest-builder-grid">
          <div className="setup-panel level-panel">
            <div className="section-heading">
              <span>Step 1</span>
              <h2>Choose your level</h2>
            </div>

            <div className="level-card-row">
              <div className="suggested-level">
                <span>Suggested Level</span>
                <strong>{current_level}</strong>
                <p>Recommended by ThemeCP from your current setup.</p>
              </div>

              <label className="level-input-card" htmlFor="contest-level">
                <span>Editable Level</span>
                <input
                  id="contest-level"
                  type="number"
                  min="0"
                  step="1"
                  value={level ?? ""}
                  placeholder="Enter level"
                  onChange={(e) => {
                    const val = e.target.value;
                    setLevel(val === "" ? null : Number(val));
                  }}
                />
                <small>Current pick: Level {levelDisplay}</small>
              </label>
            </div>

            <a className="level-sheet-link" href="/level-sheet">
              Browse the level sheet
            </a>
          </div>

          <div className="setup-panel ratings-panel">
            <div className="section-heading">
              <span>Step 2</span>
              <h2>Review target ratings</h2>
            </div>

            <div className="theme-box">
              <span>Theme</span>
              <strong>mixed</strong>
            </div>

            <div className="problems-container" aria-label="Target problem ratings">
              {problems.map((p, i) => (
                <div key={i} className="problem-cell">
                  <span>Problem {i + 1}</span>
                  <strong>{p}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="contest-note">
          <strong>How ThemeCP chooses questions</strong>
          <p>
            Numeric ratings come from external rating data, not LeetCode's
            Easy/Medium/Hard labels. Before selecting contest questions,
            ThemeCP syncs accepted problems visible from your saved LeetCode
            profile and filters those solved questions out.
          </p>
        </div>

        <div className="contest-actions">
          <button
            className="create-btn"
            onClick={() => {
              setSelectedLevel(level); // send data up

              if (leetcodeProfileName != "") setIsSubmitted(true);
              else {
                alert("go to profile info and add leetcode profile first");
              }
            }}
          >
            <span>Create ThemeCP</span>
            <small>Sync solved questions and generate contest</small>
          </button>
        </div>
      </section>
    </div>

  );
}
