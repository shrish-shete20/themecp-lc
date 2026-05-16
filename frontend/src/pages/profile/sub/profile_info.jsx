import "./profile_info.css"
import { saveProfileName, getThemeDetail, getLeetcodeStats, getPracticeStats, getRatings } from "./utils"
import { useEffect, useState } from "react";
import { useAuth } from "../../../auth.jsx"
import RatingChart from "./graph.jsx"

const STARTING_LEVEL = 23;

function formatNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number.toLocaleString("en-IN") : "0";
}

function formatRating(value) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? Math.round(number).toLocaleString("en-IN") : "Unrated";
}

function getCount(rows, difficulty) {
    return Number(rows?.find((row) => row.difficulty === difficulty)?.count || 0);
}

function getPercentage(part, total) {
    if (!total) return 0;
    return Math.min(Math.round((part / total) * 100), 100);
}

function getLatestLevel(contestHistory) {
    if (!Array.isArray(contestHistory) || contestHistory.length === 0) return STARTING_LEVEL;

    const latestContest = [...contestHistory].sort(
        (a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
    )[0];

    return Number(latestContest?.selected_level ?? STARTING_LEVEL);
}

function getContestSolveStats(contestHistory) {
    const contests = Array.isArray(contestHistory) ? contestHistory : [];
    const statuses = contests.flatMap((contest) => [
        contest.problem1_status,
        contest.problem2_status,
        contest.problem3_status,
        contest.problem4_status,
    ]);

    const solvedDuring = statuses.filter((status) => status === "solved_during_contest").length;
    const solvedAfter = statuses.filter((status) => status === "solved_after_contest").length;
    const unsolved = statuses.filter((status) => status === "unsolved").length;

    return {
        contests: contests.length,
        totalProblems: statuses.length,
        solvedDuring,
        solvedAfter,
        unsolved,
    };
}

function getRatingBandRows(practiceStats) {
    const solvedByBand = new Map(
        (practiceStats?.solvedByRating || []).map((row) => [Number(row.ratingBand), Number(row.count)])
    );

    return (practiceStats?.totalByRating || [])
        .map((row) => {
            const ratingBand = Number(row.ratingBand);
            const total = Number(row.count || 0);
            const solved = solvedByBand.get(ratingBand) || 0;

            return {
                ratingBand,
                total,
                solved,
                percent: getPercentage(solved, total),
            };
        })
        .filter((row) => row.total > 0);
}

function MetricCard({ label, value, hint }) {
    return (
        <div className="metric-card">
            <span>{label}</span>
            <strong>{value}</strong>
            {hint ? <small>{hint}</small> : null}
        </div>
    );
}

function ProgressRing({ solved, total }) {
    const percent = getPercentage(solved, total);

    return (
        <div className="progress-ring" style={{ "--progress": `${percent}%` }}>
            <div>
                <strong>{percent}%</strong>
                <span>complete</span>
            </div>
        </div>
    );
}

function DifficultyRow({ label, solved, total, beat }) {
    const percent = getPercentage(solved, total);

    return (
        <div className="difficulty-row">
            <div className="difficulty-label">
                <strong>{label}</strong>
                <span>{formatNumber(solved)} / {formatNumber(total)}</span>
            </div>
            <div className="difficulty-track">
                <div className="difficulty-fill" style={{ width: `${percent}%` }} />
            </div>
            <small>{beat ? `Beats ${Number(beat).toFixed(1)}%` : `${percent}% solved`}</small>
        </div>
    );
}

function RatingBandRow({ row }) {
    return (
        <div className="rating-band-row">
            <span>{row.ratingBand}-{row.ratingBand + 99}</span>
            <div className="rating-band-track">
                <div style={{ width: `${row.percent}%` }} />
            </div>
            <strong>{row.solved}/{row.total}</strong>
        </div>
    );
}

export default function ProfileInfo({ leetcodeProfileName, setProfile, contestHistory }) {

    const { user, loginWithRedirect, isAuthenticated } = useAuth();
    const [themeDetail, setThemeDetail] = useState(null);
    const [leetcodeStats, setLeetcodeStats] = useState(null);
    const [practiceStats, setPracticeStats] = useState(null);
    const [statsStatus, setStatsStatus] = useState("idle");
    const [profileMessage, setProfileMessage] = useState("");

    useEffect(() => {
        async function fetchThemeDetail() {
            if (!isAuthenticated || !user?.email) return;

            const [result, practiceResult] = await Promise.all([
                getThemeDetail(user.email),
                getPracticeStats(user.email),
            ]);

            setThemeDetail(result);
            setPracticeStats(practiceResult);
        }

        fetchThemeDetail();
    }, [isAuthenticated, user]);

    const [value, setValue] = useState(leetcodeProfileName);

    useEffect(() => {
        let cancelled = false;

        async function fetchLeetcodeStats() {
            const username = leetcodeProfileName?.trim();
            if (!username) {
                setLeetcodeStats(null);
                return;
            }

            setStatsStatus("loading");
            const result = await getLeetcodeStats(username);

            if (cancelled) return;

            setLeetcodeStats(result);
            setStatsStatus(result?.matchedUser ? "ready" : "error");
        }

        fetchLeetcodeStats();

        return () => {
            cancelled = true;
        };
    }, [leetcodeProfileName]);

    const contestSolveStats = getContestSolveStats(contestHistory);
    const latestLevel = getLatestLevel(contestHistory);
    const nextRatings = getRatings(latestLevel);
    const ratingBandRows = getRatingBandRows(practiceStats);

    const matchedUser = leetcodeStats?.matchedUser;
    const acStats = matchedUser?.submitStats?.acSubmissionNum || [];
    const allQuestionStats = leetcodeStats?.allQuestionsCount || [];
    const beatStats = matchedUser?.problemsSolvedBeatsStats || [];
    const contestRanking = leetcodeStats?.userContestRanking;

    const officialSolved = getCount(acStats, "All");
    const officialTotal = getCount(allQuestionStats, "All");
    const officialRemaining = Math.max(officialTotal - officialSolved, 0);
    const officialDifficultyRows = ["Easy", "Medium", "Hard"].map((difficulty) => ({
        difficulty,
        solved: getCount(acStats, difficulty),
        total: getCount(allQuestionStats, difficulty),
        beat: beatStats.find((row) => row.difficulty === difficulty)?.percentage,
    }));

    const displayName = matchedUser?.profile?.realName || leetcodeProfileName || user?.name || "Coder";

    return <>
        <main className="profile-info">
            <section className="profile-hero">
                <div>
                    <p className="eyebrow">Practice cockpit</p>
                    <h1>{displayName}</h1>
                    <p>
                        Track your official LeetCode progress beside ThemeCP-LeetCode's rated
                        practice path. The two systems are intentionally shown separately so the
                        numbers stay honest.
                    </p>
                </div>

                <div className="hero-summary">
                    <MetricCard
                        label="ThemeCP rating"
                        value={formatRating(themeDetail?.contest_rating)}
                        hint={`Max ${formatRating(themeDetail?.max_rating)}`}
                    />
                    <MetricCard
                        label="LeetCode contest rating"
                        value={formatRating(contestRanking?.rating)}
                        hint={contestRanking?.topPercentage ? `Top ${contestRanking.topPercentage}%` : "From LeetCode"}
                    />
                </div>
            </section>

            {
                !leetcodeProfileName ? <section className="connect-card">
                    <div>
                        <p className="eyebrow">Connect profile</p>
                        <h2>Add your LeetCode username</h2>
                        <p>
                            This lets the dashboard pull public LeetCode stats and helps the
                            practice engine avoid repeating problems solved through this site.
                        </p>
                    </div>

                    <div className="add-profile">
                        <label htmlFor="leetcode-profile-name">LeetCode username</label>
                        <div>
                            <input
                                id="leetcode-profile-name"
                                type="text"
                                placeholder="ex: your-username"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                            />

                            <button
                                onClick={async () => {
                                    setProfileMessage("");
                                    if (!isAuthenticated || !user?.email) {
                                        await loginWithRedirect();
                                        return;
                                    }

                                    const done = await saveProfileName(value.trim(), user.email);
                                    if (done) {
                                        setProfile(value.trim())
                                    }
                                    else {
                                        setProfileMessage("Unable to save that LeetCode profile name. Check the spelling and try again.");
                                        setValue("");
                                    }

                                }}
                            >
                                Save profile
                            </button>
                        </div>
                        {profileMessage ? <p className="form-message">{profileMessage}</p> : null}
                    </div>
                </section> : null
            }

            <section className="stats-grid">
                <div className="panel official-progress">
                    <div className="panel-heading">
                        <div>
                            <p className="eyebrow">Official LeetCode</p>
                            <h2>Solved progress</h2>
                        </div>
                        <ProgressRing solved={officialSolved} total={officialTotal} />
                    </div>

                    <div className="metric-row">
                        <MetricCard label="Solved" value={formatNumber(officialSolved)} hint="Accepted problems" />
                        <MetricCard label="Total" value={formatNumber(officialTotal)} hint="LeetCode catalog" />
                        <MetricCard label="Remaining" value={formatNumber(officialRemaining)} hint="Official count" />
                    </div>

                    <div className="difficulty-list">
                        {officialDifficultyRows.map((row) => (
                            <DifficultyRow
                                key={row.difficulty}
                                label={row.difficulty}
                                solved={row.solved}
                                total={row.total}
                                beat={row.beat}
                            />
                        ))}
                    </div>

                    {statsStatus === "loading" ? <p className="muted">Loading public LeetCode stats...</p> : null}
                    {statsStatus === "error" ? <p className="muted">LeetCode stats are unavailable for this username right now.</p> : null}
                </div>

                <div className="panel theme-progress">
                    <p className="eyebrow">ThemeCP-LeetCode</p>
                    <h2>Rated practice</h2>

                    <div className="metric-row">
                        <MetricCard label="Practice contests" value={formatNumber(themeDetail?.contest_attempt || contestSolveStats.contests)} hint="Completed here" />
                        <MetricCard label="Solved in timer" value={formatNumber(contestSolveStats.solvedDuring)} hint="Contest credit" />
                        <MetricCard label="Upsolved" value={formatNumber(contestSolveStats.solvedAfter)} hint="After contest" />
                    </div>

                    <div className="level-card">
                        <span>Recommended next level</span>
                        <strong>{latestLevel}</strong>
                        <p>Next set targets {nextRatings.join(", ")} rated problems for a 120-minute mixed practice session.</p>
                    </div>

                    <div className="metric-row compact">
                        <MetricCard label="Rated bank solved" value={formatNumber(practiceStats?.solvedProblems)} hint="Tracked by this site" />
                        <MetricCard label="Rated bank total" value={formatNumber(practiceStats?.totalProblems)} hint="From ratings.txt" />
                        <MetricCard label="Rated bank left" value={formatNumber(practiceStats?.remainingProblems)} hint="Not solved here" />
                    </div>
                </div>
            </section>

            <section className="profile-lower-grid">
                <div className="panel rating-chart">
                    <div className="panel-heading">
                        <div>
                            <p className="eyebrow">Momentum</p>
                            <h2>Practice rating graph</h2>
                        </div>
                    </div>
                    <RatingChart contestHistory={contestHistory} />
                </div>

                <div className="panel rating-bands">
                    <p className="eyebrow">External ratings</p>
                    <h2>Rating-band coverage</h2>
                    <p className="panel-copy">
                        These bands come from the ZeroTrac-style ratings dataset, not from
                        LeetCode's Easy/Medium/Hard labels.
                    </p>
                    <div className="rating-band-list">
                        {ratingBandRows.length > 0 ? ratingBandRows.map((row) => (
                            <RatingBandRow key={row.ratingBand} row={row} />
                        )) : <p className="muted">Solve a rated practice problem here to start filling this in.</p>}
                    </div>
                </div>
            </section>

            <section className="panel explanation-panel">
                <p className="eyebrow">Difficulty systems</p>
                <h2>Why the ratings differ from LeetCode difficulty</h2>
                <p>
                    LeetCode officially classifies problems as Easy, Medium, or Hard. ThemeCP-LeetCode
                    keeps those official stats visible, but its practice recommendations use the external
                    rating dataset in <code>frontend/data/ratings.txt</code>. That dataset assigns finer-grained
                    numeric ratings, which makes it easier to build balanced 120-minute practice sets and
                    increase difficulty gradually.
                </p>
            </section>
        </main>
    </>
}