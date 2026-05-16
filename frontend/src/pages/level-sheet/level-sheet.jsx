import "./level-sheet.css"
import ratingsText from "../../../data/ratings.txt?raw"

const STARTING_LEVEL = 23;

function parseRatingsSummary(contents) {
  const ratings = contents
    .split(/\r?\n/)
    .slice(1)
    .map((line) => Number(line.split(/\s+/)[0]))
    .filter((rating) => Number.isFinite(rating));

  return {
    count: ratings.length,
    min: Math.floor(Math.min(...ratings)),
    max: Math.ceil(Math.max(...ratings)),
  };
}

const ratingsSummary = parseRatingsSummary(ratingsText);

// rating → css class mapping
const ratingRanges = [
  [1000, 1299, "cell-1000-to-1299"],
  [1300, 1599, "cell-1300-to-1599"],
  [1600, 1899, "cell-1600-to-1899"],
  [1900, 2199, "cell-1900-to-2199"],
  [2200, 2499, "cell-2200-to-2499"],
  [2500, 2799, "cell-2500-to-2799"],
  [2800, 3099, "cell-2800-to-3099"],
  [3100, 3399, "cell-3100-to-3399"],
  [3400, 3699, "cell-3400-to-3699"]
];

function getRatingClass(rating) {
  const range = ratingRanges.find(
    ([min, max]) => rating >= min && rating <= max
  );
  return range ? range[2] : "";
}

function Cell({ rating }) {
  const className = `table-row-cell ${getRatingClass(rating)}`;
  return <div className={className}>{rating}</div>;
}

function getLevelTargets(level) {
  let r1 = 1000;
  let r2 = 1200;
  let r3 = 1400;
  let r4 = 1500;
  let performance = 1525;

  for (let i = 0; i <= level; i++) {
    if (i % 4 === 1) r1 += 100;
    if (i % 4 === 2) r2 += 100;
    if (i % 4 === 3) r3 += 100;
    if (i % 4 === 0) r4 += 100;
    if (i !== level) performance += 25;
  }

  return { performance, ratings: [r1, r2, r3, r4] };
}

function TableRow({ level, duration, performance, ratings, recommended }) {
  return (
    <div className={`table-row ${recommended ? "recommended-row" : ""}`}>
      <div className="table-row-cell">{level}</div>
      <div className="table-row-cell">{duration}</div>

      <Cell rating={performance} />
      {ratings.map((rating, index) => (
        <Cell key={index} rating={rating} />
      ))}
    </div>
  );
}

function TableHeading() {
  return (
    <div className="table-row">
      <div className="table-row-cell">Level</div>
      <div className="table-row-cell">Duration</div>
      <div className="table-row-cell">Target Perf.</div>
      <div className="table-row-cell">Problem 1</div>
      <div className="table-row-cell">Problem 2</div>
      <div className="table-row-cell">Problem 3</div>
      <div className="table-row-cell">Problem 4</div>
    </div>
  );
}

export default function LevelSheet() {
  const rows = Array.from({ length: 100 }, (_, i) => {
    const { performance, ratings } = getLevelTargets(i);

    return (
        <TableRow
          key={i}
          level={i}
          duration="120 min"
          performance={performance}
          ratings={ratings}
          recommended={i === STARTING_LEVEL}
        />
      );
  });

  return (
    <div className="level-sheet">
      <section className="level-hero">
        <p className="level-eyebrow">Practice map</p>
        <h1>Level Sheet</h1>
        <p>
          Levels turn a large rated problem bank into predictable 120-minute practice
          sets. Start near Level {STARTING_LEVEL}, then move up or down based on how the
          set feels.
        </p>
      </section>

      <section className="level-explainer-grid">
        <div className="level-summary-card">
          <span>Rated problem bank</span>
          <strong>{ratingsSummary.count.toLocaleString("en-IN")}</strong>
          <p>Problems loaded from <code>frontend/data/ratings.txt</code>.</p>
        </div>

        <div className="level-summary-card">
          <span>Rating span</span>
          <strong>{ratingsSummary.min}-{ratingsSummary.max}</strong>
          <p>External ZeroTrac-style numeric ratings, not official LeetCode difficulty.</p>
        </div>

        <div className="level-summary-card">
          <span>Official LeetCode labels</span>
          <strong>Easy / Medium / Hard</strong>
          <p>Those labels remain LeetCode's own categories and are separate from this sheet.</p>
        </div>
      </section>

      <section className="level-note">
        <h2>How to read this sheet</h2>
        <p>
          Each level generates four target ratings for a mixed practice contest. The
          backend picks unsolved problems near those ratings from the seeded ratings
          dataset. If a level feels too easy, move up a few rows; if it feels too hard,
          move down and rebuild consistency.
        </p>
      </section>

      <div className="level-table-shell">
        <TableHeading />

        <div className="table">
          {rows}
        </div>
      </div>
    </div>
  );
}

