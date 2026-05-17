const { getDB } = require("../config/db");
const { syncAcceptedLeetcodeProblems } = require("./leetcodeService");

function parseRatingsParam(ratingsParam) {
    const ratings = Array.isArray(ratingsParam)
        ? ratingsParam
        : String(ratingsParam || "").split(",");

    return ratings
        .map((rating) => Number(rating))
        .filter((rating) => Number.isFinite(rating));
}

async function getSavedLeetcodeProfileName(db, userId) {
    const [rows] = await db.query(
        `
            SELECT leetcode_profile_name
            FROM users
            WHERE id = ?
        `,
        [userId]
    );

    return rows[0]?.leetcode_profile_name || null;
}

async function selectProblemForRating(db, userId, rating, excludedProblemIds = []) {
    const excludedProblemClause = excludedProblemIds.length > 0
        ? "AND p.id <> ALL(?::int[])"
        : "";
    const params = [rating, rating + 100, userId];

    if (excludedProblemIds.length > 0) {
        params.push(excludedProblemIds);
    }

    const sql = `
        SELECT p.url_title, p.id
        FROM problems p
        WHERE p.rating >= ? AND p.rating < ?
          AND NOT EXISTS (
              SELECT 1
              FROM user_problems up
              WHERE up.problem_id = p.id
                AND up.user_id = ?
                AND up.status = 'solved'
          )
          ${excludedProblemClause}
        ORDER BY p.rating ASC
        LIMIT 1;
    `;

    const [rows] = await db.query(sql, params);
    return rows[0] || null;
}

async function getProblem(req, res) {
    const db = getDB();
    const rating = Number(req.query.rating);
    const user_id = (req.userId);
    console.log("******", rating, user_id);

    const sql = `
        SELECT p.url_title, p.id
        FROM problems p
        WHERE p.rating >= ? AND p.rating < ?
          AND NOT EXISTS (
              SELECT 1
              FROM user_problems up
              WHERE up.problem_id = p.id
                AND up.user_id = ?
                AND up.status = 'solved'
          )
        ORDER BY p.rating ASC
        LIMIT 1;
    `;

    try {
        const [rows] = await db.query(sql, [rating, rating + 100, user_id]); console.log(rows)
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database query failed" });
    }
}

async function getContestProblems(req, res) {
    const db = getDB();
    const userId = req.userId;
    const ratings = parseRatingsParam(req.query.ratings);

    if (ratings.length !== 4) {
        return res.status(400).json({
            message: "Exactly four ratings are required"
        });
    }

    try {
        const requestedProfileName = req.query.leetcodeProfileName || req.query.leetcodeUsername;
        const leetcodeProfileName = requestedProfileName || await getSavedLeetcodeProfileName(db, userId);

        if (!leetcodeProfileName) {
            return res.status(400).json({
                message: "LeetCode profile name is required before creating a contest"
            });
        }

        const leetcodeSync = await syncAcceptedLeetcodeProblems(db, userId, leetcodeProfileName);

        if (leetcodeSync.profileFound === false) {
            return res.status(400).json({
                message: "Saved LeetCode profile was not found"
            });
        }

        const selectedProblems = [];
        const selectedProblemIds = [];

        for (const rating of ratings) {
            const problem = await selectProblemForRating(db, userId, rating, selectedProblemIds);

            if (!problem) {
                return res.status(409).json({
                    message: `No unsolved problem found for rating ${rating}`,
                    selectedCount: selectedProblems.length,
                });
            }

            selectedProblems.push(problem);
            selectedProblemIds.push(problem.id);
        }

        const { slugs, ...safeLeetcodeSync } = leetcodeSync;

        return res.status(200).json({
            questions: selectedProblems.map((problem) => [problem.id, problem.url_title]),
            leetcodeSync: safeLeetcodeSync,
        });
    } catch (err) {
        console.error("Error getting contest problems:", err);
        return res.status(502).json({
            message: "Unable to sync accepted LeetCode problems before selecting contest questions"
        });
    }
}

async function getQuestionFromProblemId(req, res) {
    const db = getDB();
    const id = req.query.id;

    if (!id) {
        return res.status(400).json({
            message: "Problem ID is required"
        });
    }

    try {
        const sql = `  
            SELECT url_title
            FROM problems
            WHERE id = ?
        `;

        const [result] = await db.query(sql, [id]);

        if (result.length === 0) {
            return res.status(404).json({
                message: `No problem found for id ${id}`
            });
        }

        return res.status(200).json({
            url_title: result[0].url_title
        });

    } catch (err) {
        console.log(`Problem getting url_title for id ${id}`);
        console.log(err);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

async function getRatingFromProblemId(req, res) {
    const db = getDB();
    const id = req.query.id;

    if (!id) {
        return res.status(400).json({
            message: "Problem ID is required"
        });
    }

    try {
        const sql = `  
            SELECT rating
            FROM problems
            WHERE id = ?
        `;

        const [result] = await db.query(sql, [id]);

        if (result.length === 0) {
            return res.status(404).json({
                message: `No problem found for id ${id}`
            });
        }

        return res.status(200).json({
            rating: Math.floor(result[0].rating / 100) * 100
        });

    } catch (err) {
        console.log(`Problem getting rating for id ${id}`);
        console.log(err);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

async function getUserProblemStats(req, res) {
    const db = getDB();
    const userId = req.userId;

    try {
        const [totalRows] = await db.query(`
            SELECT COUNT(*)::int AS total
            FROM problems
        `);

        const [solvedRows] = await db.query(`
            SELECT COUNT(DISTINCT problem_id)::int AS solved
            FROM user_problems
            WHERE user_id = ? AND status = 'solved'
        `, [userId]);

        const [totalByRatingRows] = await db.query(`
            SELECT (FLOOR(rating / 100) * 100)::int AS rating_band, COUNT(*)::int AS count
            FROM problems
            GROUP BY rating_band
            ORDER BY rating_band
        `);

        const [solvedByRatingRows] = await db.query(`
            SELECT (FLOOR(p.rating / 100) * 100)::int AS rating_band, COUNT(DISTINCT up.problem_id)::int AS count
            FROM user_problems up
            JOIN problems p ON p.id = up.problem_id
            WHERE up.user_id = ? AND up.status = 'solved'
            GROUP BY rating_band
            ORDER BY rating_band
        `, [userId]);

        const totalProblems = Number(totalRows[0]?.total || 0);
        const solvedProblems = Number(solvedRows[0]?.solved || 0);

        return res.status(200).json({
            totalProblems,
            solvedProblems,
            remainingProblems: Math.max(totalProblems - solvedProblems, 0),
            totalByRating: totalByRatingRows.map((row) => ({
                ratingBand: Number(row.rating_band),
                count: Number(row.count),
            })),
            solvedByRating: solvedByRatingRows.map((row) => ({
                ratingBand: Number(row.rating_band),
                count: Number(row.count),
            })),
        });
    } catch (err) {
        console.error("Error getting user problem stats:", err);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

module.exports = {
    getProblem,
    getContestProblems,
    getQuestionFromProblemId,
    getRatingFromProblemId,
    getUserProblemStats
};