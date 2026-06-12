// Minimal migration runner for Supabase Postgres.
// Reads SUPABASE_DB_URL from .env.local, applies any .sql files in
// supabase/migrations that haven't been recorded in the _migrations table.
// Usage: node scripts/migrate.mjs
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pkg from "pg";

const { Client } = pkg;
const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  const raw = readFileSync(join(root, ".env.local"), "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

async function main() {
  loadEnv();
  const connectionString = process.env.SUPABASE_DB_URL;
  if (!connectionString) {
    console.error("Missing SUPABASE_DB_URL in .env.local");
    process.exit(1);
  }

  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  await client.query(`
    create table if not exists public._migrations (
      filename text primary key,
      applied_at timestamptz not null default now()
    );
  `);

  const dir = join(root, "supabase", "migrations");
  const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();

  const { rows } = await client.query("select filename from public._migrations");
  const applied = new Set(rows.map((r) => r.filename));

  let count = 0;
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`= skip ${file} (already applied)`);
      continue;
    }
    const sql = readFileSync(join(dir, file), "utf8");
    process.stdout.write(`+ applying ${file} ... `);
    try {
      await client.query("begin");
      await client.query(sql);
      await client.query("insert into public._migrations(filename) values($1)", [file]);
      await client.query("commit");
      console.log("done");
      count++;
    } catch (err) {
      await client.query("rollback");
      console.error(`\nFAILED on ${file}:\n`, err.message);
      await client.end();
      process.exit(1);
    }
  }

  console.log(`\n${count} migration(s) applied.`);
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
