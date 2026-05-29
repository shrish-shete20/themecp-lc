import { useState, useEffect, useMemo } from "react";
import "./created-contest.css";
import { getRatings, getQuestions, registerContest, replaceContestQuestion } from "./utility";
import { useAuth } from "../../auth.jsx";

export function CreatedContest({
    level,
    running,
    setContestId,
    copyQuestions,
    copyRatings,
    leetcodeProfileName,
}) {
    const { user } = useAuth();

    const ratings = useMemo(() => getRatings(level), [level]);
    const [questions, setQuestions] = useState(null);
    const [leetcodeSync, setLeetcodeSync] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [rerollingIndex, setRerollingIndex] = useState(null);
    const [rerollMessage, setRerollMessage] = useState("");

    useEffect(() => {
        async function fetchData() {
            if (!user?.email) return;

            setQuestions(null);
            setLeetcodeSync(null);
            setErrorMessage("");

            try {
                const result = await getQuestions(ratings, user.email, leetcodeProfileName);
                setQuestions(result.questions);
                setLeetcodeSync(result.leetcodeSync);
            } catch (err) {
                console.log(err);
                setErrorMessage(err.response?.data?.message || "Unable to load contest questions");
            }
        }

        fetchData();
    }, [user?.email, ratings, leetcodeProfileName]);

    useEffect(() => {
        copyRatings(ratings);

        if (questions) {
            copyQuestions(questions);
        }
    }, [questions, ratings, copyQuestions, copyRatings]);

    async function handleReplaceQuestion(index) {
        if (!questions || !user?.email || rerollingIndex !== null) return;

        setRerollingIndex(index);
        setRerollMessage("");

        try {
            const result = await replaceContestQuestion({
                email: user.email,
                rating: ratings[index],
                questions,
                currentProblemId: questions[index][0],
                leetcodeProfileName,
            });

            setQuestions((currentQuestions) => {
                if (!currentQuestions) return currentQuestions;
                const nextQuestions = [...currentQuestions];
                nextQuestions[index] = result.question;
                return nextQuestions;
            });
            if (result.leetcodeSync) setLeetcodeSync(result.leetcodeSync);
            setRerollMessage(`Q${index + 1} replaced and saved as solved locally.`);
        } catch (err) {
            console.log(err);
            setRerollMessage(err.response?.data?.message || "Unable to replace this question");
        } finally {
            setRerollingIndex(null);
        }
    }

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
                                        <div className="question-cell-content">
                                            <a
                                                href={`https://leetcode.com/problems/${questions[i - 1][1]}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Q{i}
                                            </a>
                                            <button
                                                type="button"
                                                className="replace-question-btn"
                                                disabled={rerollingIndex !== null}
                                                onClick={() => handleReplaceQuestion(i - 1)}
                                            >
                                                {rerollingIndex === i - 1 ? "Replacing..." : "Already solved? Replace"}
                                            </button>
                                        </div>
                                    ) : (
                                        <span>Loading...</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="contest-duration">Contest Duration : 120 min</div>

                {errorMessage ? (
                    <div className="contest-countdown">
                        {errorMessage}
                    </div>
                ) : questions ? (
                    <div className="contest-countdown">
                        Contest will start once you press the Start button. Be ready...
                    </div>
                ) : (
                    <div className="contest-countdown">
                        Syncing your LeetCode accepted problems and loading questions...
                    </div>
                )}

                {leetcodeSync ? (
                    <div className="contest-countdown">
                        Excluded {leetcodeSync.matchedProblemCount} accepted LeetCode problem
                        {leetcodeSync.matchedProblemCount === 1 ? "" : "s"} found in ThemeCP ratings.
                        {leetcodeSync.isPartial
                            ? " LeetCode's public API only exposes recent accepted submissions, so older solves may not be detected."
                            : ""}
                    </div>
                ) : null}

                {rerollMessage ? (
                    <div className="contest-countdown">
                        {rerollMessage}
                    </div>
                ) : null}

                <button
                    className="start-btn"
                    disabled={!questions || questions.length !== 4 || rerollingIndex !== null}
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