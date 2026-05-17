import { useState, useEffect } from "react"
import { ChooseContest } from "./choose-contest"
import { CreatedContest } from "./created-contest"
import { Running } from "./running-contest"
import { useAuth } from "../../auth.jsx"
import { getSecondsAgo, isContestRunning, getQuestionFromProblemId, getRatingFromProblemId } from "./utility";

export default function Contest({ leetcodeProfileName }) {
  const [checkingContest, setCheckingContest] = useState(true);

  const [themeCreated, setIsSubmitted] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [questions, getQuestions] = useState([1, 1, 1, 1]);
  const [ratings, getRatings] = useState([1, 1, 1, 1]);
  const [startTime, getStartTime] = useState(0);
  const [contestId, setContestId] = useState(-1);

  const [running, setRunning] = useState(false);
  const { user } = useAuth();

  useEffect(() => {

    if (!user) return;
    async function checkContest() {

      try {
        const result = await isContestRunning(user.email);

        if (!result.success) {
          // message can be
          console.log("Request failed:", result.message);
          return;
        }

        if (!result.data) {
          console.log("No contest found");
          return;
        }

        // we found the last con
        let sec = getSecondsAgo(result.data.start_time);
        setContestId(result.data.id);
        if (sec < Number(import.meta.env.VITE_CONTEST_TIME)) { // contest running
          console.log("last contest is still running");
          // if all the problem of the last contest is solved
          // then the contest is already finished
          if (result.data.problem1_status == "solved_during_contest" &&
            result.data.problem2_status == "solved_during_contest" &&
            result.data.problem3_status == "solved_during_contest" &&
            result.data.problem4_status == "solved_during_contest"
          ) {
            console.log("all the problems of last contest is solved, good");
            return;
          }

          console.log("yes contest running")
          setIsSubmitted(true)
          setSelectedLevel(result.data.selected_level)
          setRunning(true)
          getQuestions([
            [result.data.problem_id1, await getQuestionFromProblemId(result.data.problem_id1)],
            [result.data.problem_id2, await getQuestionFromProblemId(result.data.problem_id2)],
            [result.data.problem_id3, await getQuestionFromProblemId(result.data.problem_id3)],
            [result.data.problem_id4, await getQuestionFromProblemId(result.data.problem_id4)]
          ])
          getRatings([
            await getRatingFromProblemId(result.data.problem_id1),
            await getRatingFromProblemId(result.data.problem_id2),
            await getRatingFromProblemId(result.data.problem_id3),
            await getRatingFromProblemId(result.data.problem_id4)
          ])
          getStartTime(sec)
        }
      } finally {
        setCheckingContest(false);
      }
    }

    checkContest();
  }, [user]);

  if (checkingContest) {
    return <h1>Checking Contest ...</h1>
  }

  return (
    <>
      {!themeCreated ? (
        <ChooseContest
          setIsSubmitted={setIsSubmitted}
          setSelectedLevel={setSelectedLevel}
          leetcodeProfileName={leetcodeProfileName}
        />
      ) : (

        !running ? (
          <CreatedContest
            level={selectedLevel}
            running={setRunning}
            setContestId={setContestId}
            copyQuestions={getQuestions}
            copyRatings={getRatings}
            leetcodeProfileName={leetcodeProfileName}
          />
        ) : <Running
          questions={questions}
          ratings={ratings}
          contestId={contestId}
          start_time={startTime}
          leetcodeProfileName={leetcodeProfileName}
        />
      )}
    </>
  );
}