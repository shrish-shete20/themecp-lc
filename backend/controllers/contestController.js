const { getDB } = require("../config/db");

async function getUserIdFromEmail(req, res, next) {
    console.log("inside getUserIdFromEmail")
    const db = getDB();
    // to handle both get and put routes
    const email = req.body?.email || req.query?.email;
    console.log("inside getUserIdFromEmail", email)

    if (!email) {
        return res.status(400).json({
            message: "Email is required",
        });
    }

    try {
        const [rows] = await db.query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        req.userId = rows[0].id; // store for next handler
        console.log("user id found successfully", rows[0].id)
        next();
    } catch (err) {
        console.error("Error finding user id:", err);
        return res.status(500).json({
            message: "Database error",
        });
    }

}

async function getProblemIds(req, res, next) {
    const db = getDB();
    const problems = req.body.newAccepted;
    console.log("Problems_new_accepted", problems)


    if (!Array.isArray(problems)) {
        return res.status(400).json({
            message: "newAccepted must be an array",
        });
    }

    if (problems.length === 0) {
        req.problemIds = [];
        return next();
    }

    try {
        const placeholders = problems.map(() => "?").join(",");

        const sql = `
            SELECT id, url_title
            FROM problems
            WHERE url_title IN (${placeholders})
        `;

        const [rows] = await db.query(sql, problems);

        if (rows.length === 0) {

            return res.status(200).json({
                message: "No accepted problems are from the problems table",
                missingProblems,
            });
        }

        req.problemIds = rows.map(row => row.id);
        console.log(req.problem_id1)
        next();
    } catch (err) {
        console.error("Error finding problem ids:", err);
        return res.status(500).json({
            message: "Problem fetching ids of questions",
        });
    }
}

async function addContest(req, res) {
    const db = getDB();
    const { selected_level, problem_id1, problem_id2, problem_id3, problem_id4 } = req.body;
    const user_id = req.userId;

    try {
        const sql1 = `
            INSERT INTO contests
            (user_id, selected_level, problem_id1, problem_id2, problem_id3, problem_id4)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const [contestResult] = await db.query(sql1, [
            user_id,
            selected_level,
            problem_id1,
            problem_id2,
            problem_id3,
            problem_id4
        ]);

        if (contestResult.affectedRows === 0) {
            return res.status(500).json({
                message: "unable to start the contest"
            });
        }
        return res.status(200).json({
            message: "all right, contest added",
            contest_id: contestResult.insertId
        });
    } catch (err) {
        console.log("something bad happened from the db side", err);
        return res.status(500).json({
            message: "Server error"
        });
    }
}

async function isContestRunning(req, res) {
    const db = getDB();
    const userId = req.userId;

    try {
        const [contestRows] = await db.query(
            `
      SELECT *
      FROM contests
      WHERE user_id = ?
      ORDER BY start_time DESC
      LIMIT 1
      `,
            [userId]
        );

        if (contestRows.length === 0) {
            return res.status(200).json({
                success: true,
                data: null,
                message: "No contest found",
            });
        }

        return res.status(200).json({
            success: true,
            data: contestRows[0],
            message: "Contest fetched successfully",
        });
    } catch (error) {
        console.error("Error in isContestRunning:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}


async function insertSolvedProblems(req, res) {
    console.log("inside insert solved problem")
    const db = getDB();
    const userId = req.userId;
    const problemIds = req.problemIds;
    console.log("=>", userId, problemIds)

    if (!problemIds || problemIds.length === 0) {
        return res.status(200).json({
            message: "No new accepted problems to process",
            insertedCount: 0,
        });
    }

    try {
        const values = problemIds.map(problem => [
            userId,
            problem,
            "solved"
        ]);

        const sql = `
            REPLACE INTO user_problems (
                user_id,
                problem_id,
                status
            )
            VALUES ?;
        `
        // const sql = `
        //     INSERT IGNORE INTO user_problems (user_id, problem_id, status)
        //     VALUES ?
        // `;

        const [result] = await db.query(sql, [values]);

        return res.status(200).json({
            message: "Submission update completed",
            userId,
            problemsProcessed: problemIds.length,
            insertedCount: result.affectedRows,
            problemIds,
        });
    } catch (err) {
        console.error("Error inserting solved problems:", err);
        return res.status(500).json({
            message: "Error inserting solved problems",
        });
    }
}

async function getContest(req, res) {
    console.log("***** inside getContest");
    const contestId = req.query.contestId;
    const db = getDB();
    console.log(contestId);


    if (!contestId) {
        return res.status(400).json({
            message: "contestId is required"
        });
    }

    try {
        const sql = `
            SELECT *
            FROM contests
            WHERE id = ?
        `;

        const [result] = await db.query(sql, [contestId]);

        if (result.length === 0) {
            return res.status(404).json({
                message: `No contest found for id ${contestId}`
            });
        }

        return res.status(200).json({
            data: result[0]
        });

    } catch (err) {
        console.log("problem while getting contest problem status");
        console.log(err);

        return res.status(500).json({
            message: "Error in backend server while getting contest"
        });
    }
}

async function getContestHistory(req, res) {
    const db = getDB();
    const userId = req.userId;

    try {
        const [contestRows] = await db.query(
        `
           SELECT contests.*, 
           p1.url_title as url_title1, 
           p2.url_title as url_title2, 
           p3.url_title as url_title3, 
           p4.url_title as url_title4
            FROM contests
            left join problems as p1 on p1.id = contests.problem_id1
            left join problems as p2 on p2.id = contests.problem_id2
            left join problems as p3 on p3.id = contests.problem_id3
            left join problems as p4 on p4.id = contests.problem_id4
            WHERE contests.user_id = ?;
        `,
            [userId]
        );

        if (contestRows.length === 0) {
            return res.status(200).json({
                success: true,
                data: null,
                message: "No contest found",
            });
        }

        return res.status(200).json({
            success: true,
            data: contestRows,
            message: "Contest fetched successfully",
        });
    } catch (error) {
        console.error("Error in isContestRunning:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}



module.exports = {
    getUserIdFromEmail,
    getProblemIds,
    addContest,
    isContestRunning,
    insertSolvedProblems,
    getContest,
    getContestHistory
};

