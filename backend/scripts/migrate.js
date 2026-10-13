const fs = require("node:fs");
const path = require("node:path");
const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

if (!process.env.DATABASE_URL) {
    throw new Error("Falta DATABASE_URL en backend/.env");
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.PG_SSL === "true" ? { rejectUnauthorized: false } : undefined,
});

async function migrate() {
    const client = await pool.connect();
    try {
        await client.query(`
      create table if not exists schema_migrations (
        filename text primary key,
        applied_at timestamptz not null default now()
      )
    `);

        const directory = path.resolve(__dirname, "../db/migrations");
        const files = fs
            .readdirSync(directory)
            .filter((file) => file.endsWith(".sql"))
            .sort();

        for (const filename of files) {
            const applied = await client.query(
                "select 1 from schema_migrations where filename = $1",
                [filename],
            );
            if (applied.rowCount) continue;

            const sql = fs.readFileSync(path.join(directory, filename), "utf8");
            await client.query("begin");
            try {
                await client.query(sql);
                await client.query(
                    "insert into schema_migrations (filename) values ($1)",
                    [filename],
                );
                await client.query("commit");
                console.log(`Aplicada migracion: ${filename}`);
            } catch (error) {
                await client.query("rollback");
                throw error;
            }
        }

        console.log("Migraciones al dia");
    } finally {
        client.release();
        await pool.end();
    }
}

migrate().catch((error) => {
    console.error("No se pudieron aplicar las migraciones:", error);
    process.exitCode = 1;
});