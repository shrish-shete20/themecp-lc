import axios from "axios";

// Intercept all requests
// axios.interceptors.request.use(request => {
//     console.log("Full Axios Request:", request);
//     return request;
// });

function getRatings(level) {
    if (level == null || isNaN(level)) {
        return [1000, 1200, 1400, 1600];
    }

    let r1 = 1000;
    let r2 = 1200;
    let r3 = 1400;
    let r4 = 1600;

    for (let i = 0; i <= level; i++) {
        if (i % 4 === 1) r1 += 100;
        else if (i % 4 === 2) r2 += 100;
        else if (i % 4 === 3) r3 += 100;
        else if (i !== 0) r4 += 100;
    }
    return [r1, r2, r3, r4]; // return numbers, not strings
}

async function getQuestions(ratings, email) {
    // let allQuestions = ["a", "b", "c", "d"];
    let allQuestions = [];

    for (let rating of ratings) {
        try {
            const result = await axios.get(`${import.meta.env.VITE_API_URL}/problems/get_problem`, {
                params: {
                    rating: rating,
                    email: email
                }
            });

            allQuestions.push([result.data[0]["id"], result.data[0]["url_title"]]);

        } catch (err) {
            console.log(err);
        }
    }
    console.log(allQuestions);
    return allQuestions;
}

async function registerContest(email, level, questions) {

    const data = {
        "email": email,
        "selected_level": level,
        "problem_id1": questions[0][0],
        "problem_id2": questions[1][0],
        "problem_id3": questions[2][0],
        "problem_id4": questions[3][0]
    }
    console.log(data)

    try {
        const result = await axios.post(`${import.meta.env.VITE_API_URL}/contest/add_contest`, data);
        return result.data.contest_id;
    }
    catch (err) {
        console.log(err)
    }
}

async function isContestRunning(email) {
    try {
        const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/contest/is_contest_running`,
            {
                params: { email },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error while checking contest status:", error);

        return {
            success: false,
            data: null,
            message: "Request failed",
        };
    }
}

function getSecondsAgo(timestamp) {
    const past = new Date(timestamp).getTime(); // ms
    const now = Date.now(); // ms

    const diffMs = now - past; // difference in ms
    return Math.floor(diffMs / 1000); // convert to seconds
}

async function getSubmissionStatus(contestId) {
    try {
        const result = await axios.get(`${import.meta.env.VITE_API_URL}/contest/get_contest`, {
            params: {
                contestId: contestId
            }
        })
        console.log("(*)", result)
        let ans = [false, false, false, false];
        if(result.data.data.problem1_status === "solved_during_contest") ans[0] = true;
        if(result.data.data.problem2_status === "solved_during_contest") ans[1] = true;
        if(result.data.data.problem3_status === "solved_during_contest") ans[2] = true;
        if(result.data.data.problem4_status === "solved_during_contest") ans[3] = true;
        return ans;
    }
    catch(err){
        console.log("error getting the problem status inside  getSubmissionStatus");
        console.log(err);
    }
}

// -----------------------------------------------
// -----------------------------------------------
// -----------------------------------------------
async function getRecentSubmissions(username) {
    console.log(username)
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/leetcode/recent-submissions`, {
        params: {
            username: username
        }
    });
    console.log("here", res)

    return res.data;
}

async function updateSubmission(userEmail, leetCodeProfileName) {
    console.log("inside update submission", leetCodeProfileName)

    const submission = await getRecentSubmissions(leetCodeProfileName);

    let data = { email: userEmail };
    let newAccepted = [];

    for (const sub of submission) {   // ✅ use "of"
        if (sub.statusDisplay === "Accepted") {   // ✅ correct key
            if (!newAccepted.includes(sub.titleSlug)) {  // ✅ check existence
                newAccepted.push(sub.titleSlug);           // ✅ push
            }
        }
    }
    console.log("recent submissions", newAccepted)


    data.newAccepted = newAccepted;
    if (newAccepted.length === 0) return;

    try {
        const result = await axios.post(
            `${import.meta.env.VITE_API_URL}/contest/update_submission`,
            data
        );
        console.log(result.data);
    } catch (err) {
        console.log(err);
    }
}

async function getQuestionFromProblemId(id) {
    try {
        const result = await axios.get(
            `${import.meta.env.VITE_API_URL}/problems/get_question_from_problem_id`,
            {
                params: { id: id }
            }
        );
        return result.data.url_title;
    }
    catch (err) {
        console.log("error while getting question from id while retrieving the running contest");
        console.log(err);
    }
}
async function getRatingFromProblemId(id) {
    try {
        const result = await axios.get(
            `${import.meta.env.VITE_API_URL}/problems/get_rating_from_problem_id`,
            {
                params: { id: id }
            }
        );
        return result.data.rating;
    }
    catch (err) {
        console.log("error while getting rating from id while retrieving the running contest");
        console.log(err);
    }
}

export {
    getSecondsAgo,
    isContestRunning,
    registerContest,
    getQuestions,
    getRatings,
    getSubmissionStatus,
    updateSubmission,
    getQuestionFromProblemId,
    getRatingFromProblemId
};