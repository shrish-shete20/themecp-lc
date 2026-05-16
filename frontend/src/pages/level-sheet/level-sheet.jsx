import "./level-sheet.css"

// rating → css class mapping
export const ratingRanges = [
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

function TableRow({ level, duration, performance, r1, r2, r3, r4 }) {
  return (
    <div className="table-row">
      <div className="table-row-cell">{level}</div>
      <div className="table-row-cell">{duration}</div>

      <Cell rating={performance} />
      <Cell rating={r1} />
      <Cell rating={r2} />
      <Cell rating={r3} />
      <Cell rating={r4} />
    </div>
  );
}

function TableHeading() {
  return (
    <div className="table-row">
      <div className="table-row-cell">Level</div>
      <div className="table-row-cell">Duration</div>
      <div className="table-row-cell">Performance</div>
      <div className="table-row-cell">Q1</div>
      <div className="table-row-cell">Q2</div>
      <div className="table-row-cell">Q3</div>
      <div className="table-row-cell">Q4</div>
    </div>
  );
}

export default function LevelSheet() {
  let r1 = 1000;
  let r2 = 1200;
  let r3 = 1400;
  let r4 = 1500;
  let performance = 1525;

  const rows = Array.from({ length: 100 }, (_, i) => {
    if (i % 4 === 1) r1 += 100;
    if (i % 4 === 2) r2 += 100;
    if (i % 4 === 3) r3 += 100;
    if (i % 4 === 0) r4 += 100;

    const row = (
      <TableRow
        key={i}
        level={i}
        duration="120 min"
        performance={performance}
        r1={r1}
        r2={r2}
        r3={r3}
        r4={r4}
      />
    );

    performance += 25;
    return row;
  });

  return (
    <div className="level-sheet">
      <h1>LEVEL-SHEET</h1>

      <TableHeading />

      <div className="table">
        {rows}
      </div>
    </div>
  );
}

