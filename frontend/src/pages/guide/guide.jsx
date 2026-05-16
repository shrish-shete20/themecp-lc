import "./guide.css";

function ThemeCP_Leetcode() {
    return <>
        Theme<span className="theme-highlight-cp">CP</span><span className="theme-highlight-leetcode">-LeetCode</span>
    </>
}
export default function Guide() {
    return (
        <main className="guide">

            <section className="guide-card">
                <h1>General</h1>

                <p>
                    The best way to get started with{" "} <ThemeCP_Leetcode/> is to give a
                    contest. Please head to the Contest Guide section to understand how
                    contests work. But before that first login and add your leetcode profile.
                </p>

                <p>
                    Under <a href="profile/profile_info"> profile/profile_info</a>, you can see your
                   {" "} <ThemeCP_Leetcode/> track record, including:
                </p>

                <p>
                    • Current Rating <br />
                    • Max Rating <br />
                    • Total Contest Attempts <br />
                    • Rating chart showing your progress over time
                </p>

                <p>
                    Under <a href="profile/contest_history"> profile/contest_history</a>, you can see all the
                    contests you have given so far.
                </p>

                <p>
                    The <strong>R1</strong> column denotes the rating of the first
                    problem, while <strong>T1</strong> denotes its status.
                </p>

                <p>
                    • Green → solved during contest <br />
                    • Orange → solved after contest <br />
                    • Null → unsolved
                </p>
            </section>

            <section className="guide-card">
                <h1>Level Guide</h1>

                <p>
                    The level system helps you practice problems near your current skill
                    level instead of randomly solving problems.
                </p>

                <p>
                    Head over to the <a href="level-sheet"> level sheet</a> page to see all the
                    available levels.
                </p>

                <p>
                    I would recommend starting around <strong>Level 23</strong>.
                If the 4 contest problems feel easy, you can increase the level
                    gradually.
                </p>
            </section>

            <section className="guide-card">
                <h1>Contest Guide</h1>

                <p>
                    Each contest is <strong>120 minutes</strong> long.
                </p>

                <p>
                    Once the contest starts, there is no way to pause or stop it.
                    Refreshing the page, logging out, or reopening the site will not stop
                    the timer.
                </p>

                <p>
                    So make sure you are completely free before starting a contest.
                </p>

                <p>
                    You only get points for problems solved during the contest time.
                </p>

                <p>
                    However, you can always upsolve problems later by going to
                    <strong> Contest History </strong>
                    and opening the problem links.
                </p>

                <p>
                    To solve a problem:
                </p>

                <p>
                    • Click the problem link from the running contest <br />
                    • Solve and submit it on LeetCode <br />
                    • Return back and click
                    <strong> "Refresh to Verify Submission"</strong>
                </p>
            </section>

            <section className="guide-card">
                <h1>Current Limitations</h1>

                <p>
                    Sometimes, a problem given during the contest may already have been
                    solved earlier on your LeetCode account.
                </p>

                <p>
                    Unlike Codeforces, LeetCode is not fully open-source and does not
                    provide complete submission history access through its public APIs.
                </p>

                <p>
                   {" "} <ThemeCP_Leetcode/> can only access the last
                    <strong> 20 recent submissions </strong>
                    from your LeetCode profile.
                    <br />
                    Because of this limitation, previously solved problems may sometimes
                    appear in contests.
                </p>

                <p>
                    However, problems solved during{" "} <ThemeCP_Leetcode/> contests themselves
                    will never repeat again for your account.
                </p>

                <p>
                    When you click
                    <strong> "Refresh to Verify Submission"</strong>, the backend checks
                    your recent LeetCode submissions.
                    <br />
                    If a contest problem appears as solved within those recent
                    submissions, it is considered solved during the contest.
                </p>
            </section>

        </main>
    );
}