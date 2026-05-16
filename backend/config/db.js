const { Pool } = require("pg");

let pool;

async function connectDB() {
    if (pool) return pool;

    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is required");
    }

    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.PGSSLMODE === "disable" ? false : { rejectUnauthorized: false },
    });

    await pool.query("SELECT 1");
    console.log("postgres connected");
    return pool;
}

function convertPlaceholders(sql) {
    let index = 0;
    return sql.replace(/\?/g, () => `$${++index}`);
}

function getDB() {
    if (!pool) {
        throw new Error("Database not connected yet");
    }
    return {
        async query(sql, params = []) {
            const result = await pool.query(convertPlaceholders(sql), params);
            return [
                result.rows,
                {
                    affectedRows: result.rowCount,
                    insertId: result.rows[0]?.id,
                },
            ];
        },
        async getConnection() {
            const client = await pool.connect();
            return {
                async beginTransaction() {
                    await client.query("BEGIN");
                },
                async commit() {
                    await client.query("COMMIT");
                },
                async rollback() {
                    await client.query("ROLLBACK");
                },
                release() {
                    client.release();
                },
                async query(sql, params = []) {
                    const result = await client.query(convertPlaceholders(sql), params);
                    return [
                        result.rows,
                        {
                            affectedRows: result.rowCount,
                            insertId: result.rows[0]?.id,
                        },
                    ];
                },
            };
        },
    };
}

module.exports = { connectDB, getDB };