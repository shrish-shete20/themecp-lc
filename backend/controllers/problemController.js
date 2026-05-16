const { getDB } = require("../config/db");

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
    getQuestionFromProblemId,
    getRatingFromProblemId,
    getUserProblemStats
};