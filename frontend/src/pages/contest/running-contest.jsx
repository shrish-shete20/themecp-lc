import { useState, useEffect } from "react";
import { getSubmissionStatus, replaceContestQuestion, updateSubmission } from "./utility";
import { useAuth } from "../../auth.jsx"

import "./running-contest.css"

function Timer({ start_time }) {
  const contestTime = Number(import.meta.env.VITE_CONTEST_TIME);

  const [count, setCount] = useState(start_time);

  useEffect(() => {
    const contestStartedAt = Date.now() - start_time * 1000;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - contestStartedAt) / 1000);

      setCount(elapsed);

      if (elapsed >= contestTime) {
        clearInterval(interval);
        window.location.reload();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [start_time, contestTime]);

  const minutes = Math.floor(count / 60);
  const seconds = count % 60;

  return (
    <h1>
      Running time = {minutes}:{String(seconds).padStart(2, "0")}
    </h1>
  );
}

export function Running({
  questions,
  ratings,
  contestId,
  start_time,
  leetcodeProfileName
}) {
  console.log(questions)
  console.log(contestId);
  const [submissionStatus, setSubmissionStatus] = useState([false, false, false, false]);
  const [localQuestions, setLocalQuestions] = useState(questions);
  const [rerollingIndex, setRerollingIndex] = useState(null);
  const [rerollMessage, setRerollMessage] = useState("");
  const { user } = useAuth();
  console.log(questions)

  async function handleReplaceQuestion(index) {
    if (!localQuestions || !user?.email || rerollingIndex !== null) return;

    setRerollingIndex(index);
    setRerollMessage("");

    try {
      const result = await replaceContestQuestion({
        email: user.email,
        rating: ratings[index],
        questions: localQuestions,
        currentProblemId: localQuestions[index][0],
        leetcodeProfileName,
        contestId,
        problemIndex: index + 1,
      });

      setLocalQuestions((currentQuestions) => {
        if (!currentQuestions) return currentQuestions;
        const nextQuestions = [...currentQuestions];
        nextQuestions[index] = result.question;
        return nextQuestions;
      });
      setSubmissionStatus((currentStatus) => {
        const nextStatus = [...currentStatus];
        nextStatus[index] = false;
        return nextStatus;
      });
      setRerollMessage(`Problem ${String.fromCharCode(65 + index)} replaced and saved as solved locally.`);
    } catch (err) {
      console.log(err);
      setRerollMessage(err.response?.data?.message || "Unable to replace this question");
    } finally {
      setRerollingIndex(null);
    }
  }

  return (
    <div className="running-contest-outer">
      <div className="running-container">

        <Timer start_time={start_time} />
        <button onClick={async () => {

          try {
            await updateSubmission(user.email, leetcodeProfileName)
            const status = await getSubmissionStatus(contestId);
            setSubmissionStatus(status);

            // if all problems are solved then finish the contest
            let count = 0;
            for(const el of status){
              if(el) count+=1;
            }
            if(count == 4){
              alert("contest finished");
              window.location.reload();
            }
          }
          catch (err) {
            console.log("some error occured while getting the submissio status")
            console.log(err)
          }
        }}>Refresh to verify submission</button>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Action</th>
              </tr>

            </thead>
            <tbody>
              {localQuestions.map((question, index) => (
                <tr key={question[0]}>
                  <td>{index + 1}</td>
                  <td> <a href={`https://leetcode.com/problems/${question[1]} `}
                    target="_blank"
                    rel="noopener noreferrer">Problem {String.fromCharCode(65 + index)}</a> </td>
                  <td>{ratings[index]}</td>
                  <td>{submissionStatus[index] ? "Accepted" : "not yet done"}</td>
                  <td>
                    <button
                      type="button"
                      className="replace-running-question-btn"
                      disabled={submissionStatus[index] || rerollingIndex !== null}
                      onClick={() => handleReplaceQuestion(index)}
                    >
                      {rerollingIndex === index ? "Replacing..." : "Already solved? Replace"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {rerollMessage ? (
            <p className="running-contest-message">{rerollMessage}</p>
          ) : null}

        </div>

      </div>
    </div>
  );
}