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

module.exports = { getProblem, getQuestionFromProblemId, getRatingFromProblemId };