require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const inputPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(__dirname, "../../frontend/data/ratings.txt");
const dryRun = process.argv.includes("--dry-run");

function parseRatingsFile(contents) {
  return contents
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/\s+/);
      const rating = Number(parts[0]);
      const id = Number(parts[1]);
      const urlTitle = parts[parts.length - 3];

      if (!Number.isFinite(rating) || !Number.isInteger(id) || !urlTitle) {
        throw new Error(`Unable to parse ratings row: ${line}`);
      }

      return [id, urlTitle, rating];
    });
}

async function main() {
  const rows = parseRatingsFile(fs.readFileSync(inputPath, "utf8"));
  if (dryRun) {
    console.log(`Parsed ${rows.length} problems from ${inputPath}`);
    return;
  }

  const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.PGSSLMODE === "disable" ? false : { rejectUnauthorized: false },
  });

  const chunkSize = 500;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const values = chunk.flat();
    const placeholders = chunk
      .map((_, index) => {
        const offset = index * 3;
        return `($${offset + 1}, $${offset + 2}, $${offset + 3})`;
      })
      .join(", ");

    await db.query(
      `
        INSERT INTO problems (id, url_title, rating)
        VALUES ${placeholders}
        ON CONFLICT (id) DO UPDATE SET
          url_title = EXCLUDED.url_title,
          rating = EXCLUDED.rating
      `,
      values
    );
  }

  await db.end();
  console.log(`Seeded ${rows.length} problems from ${inputPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
