import { useState, useEffect } from "react";
import "./created-contest.css";
import { getRatings, getQuestions, registerContest } from "./utility";
import { useAuth } from "../../auth.jsx";

export function CreatedContest({
    level,
    running,
    setContestId,
    copyQuestions,
    copyRatings,
}) {
    const { user } = useAuth();

    const ratings = getRatings(level);
    const [questions, setQuestions] = useState(null);

    useEffect(() => {
        async function fetchData() {
            if (!user?.email) return;

            const q = await getQuestions(ratings, user.email);
            setQuestions(q);
        }

        fetchData();
    }, [user?.email, level]);

    useEffect(() => {
        copyRatings(ratings);

        if (questions) {
            copyQuestions(questions);
        }
    }, [questions, level]);

    return (
        <div className="created-contest-outer">
            <div className="created-contest">
                <div className="row">
                    <label>
                        <b>Enter Contest Level :</b>
                    </label>
                    <input type="number" value={level ?? ""} readOnly />
                </div>

                <div className="theme">Theme : mixed</div>

                <div className="middle-table">
                    <div className="row">
                        <div className="col-left">Problem Rating</div>

                        <div className="col-right">
                            {ratings.map((r, i) => (
                                <div key={i} className={`cell b${i + 1}`}>
                                    {r}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-left">Problems Link:</div>

                        <div className="col-right">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className={`cell b${i} link`}>
                                    {questions ? (
                                        <a
                                            href={`https://leetcode.com/problems/${questions[i - 1][1]}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Q{i}
                                        </a>
                                    ) : (
                                        <span>Loading...</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="contest-duration">Contest Duration : 120 min</div>

                {questions ? (
                    <div className="contest-countdown">
                        Contest will start once you press the Start button. Be ready...          </div>
                ) : (
                    <div className="contest-countdown">
                        Wait, questions are loading...
                    </div>
                )}

                <button
                    className="start-btn"
                    disabled={!questions}
                    onClick={async () => {
                        if (!questions || !user?.email) return;

                        console.log("just about to register the contest");

                        const contest_id = await registerContest(
                            user.email,
                            level,
                            questions
                        );

                        running(true);
                        setContestId(contest_id);

                        console.log("contest_id", contest_id);
                    }}
                >
                    Start
                </button>
            </div>
        </div>
    );
}