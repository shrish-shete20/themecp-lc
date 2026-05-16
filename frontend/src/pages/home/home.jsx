import "./home.css";

function ThemeCP_Leetcode() {
    return <>
        Theme<span className="theme-highlight-cp">CP</span><span className="theme-highlight-leetcode">-LeetCode</span>
    </>
}

export default function Home() {
  return (
    <main className="home">
      <section className="home-card">

        <h1>About {" "} <ThemeCP_Leetcode/></h1>

        <p>
          {" "} <ThemeCP_Leetcode/> borrows the idea of rating-guided practice from{" "}
          <a
            href="https://themecp.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
          >
            ThemeCP for Codeforces
          </a>
          , then adapts it into its own LeetCode-focused experience.
        </p>

        <p>
          The goal is a polished, free practice cockpit: clear stats, balanced
          120-minute sets, and an honest split between LeetCode's official labels
          and external numeric problem ratings.
        </p>
      </section>

      <section className="home-card">

        <h1>Why {" "} <ThemeCP_Leetcode/>?</h1>

        <div className="feature">
          <h3>Rating-Based Practice</h3>

          <p>
            LeetCode only marks problems as Easy, Medium, or Hard, but the real
            difficulty often varies a lot. Sometimes a Medium problem feels
            harder than a Hard problem.
          </p>

          <p>
            {" "} <ThemeCP_Leetcode/> uses{" "}
            <a
              href="https://zerotrac.github.io/leetcode_problem_rating/"
              target="_blank"
              rel="noopener noreferrer"
            >
              ZeroTrac ratings
            </a>{" "}
            to give problems a more accurate difficulty level, similar to
            rating-based practice on Codeforces.
          </p>
        </div>

        <div className="feature">
          <h3>Structured Improvement</h3>

          <p>
            After completing DSA sheets, many users start solving random
            problems. But jumping into very hard problems too early is often
            inefficient.
          </p>

          <p>
            {" "} <ThemeCP_Leetcode/> helps users practice around their current level and
            improve step by step.
          </p>
        </div>
      </section>
    </main>
  );
}