const mysql = require("mysql2/promise");

let pool;

async function connectDB() {
    console.log("DB_HOST:", process.env.DB_HOST);
    console.log("DB_PORT:", process.env.DB_PORT);
    console.log("DB_USER:", process.env.DB_USER);
    console.log("DB_NAME:", process.env.DB_NAME);
    pool = await mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: Number(process.env.DB_PORT)   // important for cloud
    });

    console.log("mysql connected");
}

function getDB() {
    if (!pool) {
        throw new Error("Database not connected yet");
    }
    return pool;
}

module.exports = { connectDB, getDB };