import { useEffect, useState } from "react";
import "./contest_history.css"
import { useAuth0 } from "@auth0/auth0-react"
import { getContestHistory, getRatings } from "./utils"
import {updateSubmission} from "../../contest/utility"

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

function Cell_Rating({ rating, url_title }) {
  const title = `https://leetcode.com/problems/${url_title}`;
  const className = `table-row-cell ${getRatingClass(rating)}`;

  return (
    <div className={className}>
      <a 
        href={title} 
        target="_blank" 
        rel="noopener noreferrer"
      >
        {rating}
      </a>
    </div>
  );
}

function getStatusClass(status) {
  if (status === "solved_during_contest") return "solved-during";
  if (status === "solved_after_contest") return "solved-after";
  return "not-solved";
}

function Cell_Question_status({ status }) {
  let t = "";
  const className = `table-row-cell ${getStatusClass(status)}`;
  if (status == "solved_after_contest") t = "*"
  if (status == "unsolved") t = "null"

  return <div className={className}>{t}</div>;
}

function TableRow({
  ID, Date, Level,
  url_title1,  url_title2, url_title3, url_title4,
  status1, status2, status3, status4,
  perf, rating, delta }) {
  const ratings = getRatings(Level);
  return (
    <div className="table-row">
      <div className="table-row-cell">{ID}</div>
      <div className="table-row-cell date-cell">{Date}</div>
      <div className="table-row-cell">{Level}</div>

      <Cell_Rating rating={ratings[0]} url_title ={url_title1} />
      <Cell_Rating rating={ratings[1]} url_title ={url_title2} />
      <Cell_Rating rating={ratings[2]} url_title ={url_title3} />
      <Cell_Rating rating={ratings[3]} url_title ={url_title4} />

      <Cell_Question_status status={status1} />
      <Cell_Question_status status={status2} />
      <Cell_Question_status status={status3} />
      <Cell_Question_status status={status4} />

      {/* <div className="table-row-cell">{perf}</div> */}
      <div className="table-row-cell">{rating}</div>
      <div className="table-row-cell">{Number(delta)}</div>

    </div>
  );
}

function TableHeading() {
  return (
    <div className="table-row">
      <div className="table-row-cell">ID</div>
      <div className="table-row-cell">Date</div>
      <div className="table-row-cell">Level</div>
      <div className="table-row-cell">R1</div>
      <div className="table-row-cell">R2</div>
      <div className="table-row-cell">R3</div>
      <div className="table-row-cell">R4</div>
      <div className="table-row-cell">T1</div>
      <div className="table-row-cell">T2</div>
      <div className="table-row-cell">T3</div>
      <div className="table-row-cell">T4</div>
      {/* <div className="table-row-cell">Perf</div> */}
      <div className="table-row-cell">Rating</div>
      <div className="table-row-cell">Delta</div>
    </div>
  );
}

export default function ContestHistory({ leetcodeProfileName, contestHistory }) {
  const { user } = useAuth0();

  useEffect(() => {
    console.log("*****contest history ",contestHistory)
    if (!user?.email || !leetcodeProfileName) return;

    async function run() {
      await updateSubmission(user.email, leetcodeProfileName);
    }

    run();
  }, [user, leetcodeProfileName, contestHistory]);

  return (
    <div className="contest-history">
      <h1>contest history</h1>
      <TableHeading />

      <div className="table">
        {contestHistory?.map((contest) => (
          <TableRow
            key={contest.id}
            ID={contest.id}
            Date={new Date(contest.start_time).toLocaleDateString("en-GB")}
            Level={contest.selected_level}
            url_title1={contest.url_title1}
            url_title2={contest.url_title2}
            url_title3={contest.url_title3}
            url_title4={contest.url_title4}
            status1={contest.problem1_status}
            status2={contest.problem2_status}
            status3={contest.problem3_status}
            status4={contest.problem4_status}
            perf={contest.perf}
            rating={contest.rating_after}
            delta={contest.total_score}
          />
        ))}
      </div>
    </div>
  );
}