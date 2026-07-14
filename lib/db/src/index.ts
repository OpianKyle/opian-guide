import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const required = ["DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD"] as const;
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`${key} must be set. Check your environment secrets.`);
  }
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  // The remote MySQL host (xneelo) and/or intermediate network drop idle
  // connections, which surfaces as sporadic ECONNRESET on pooled queries.
  // Keep the TCP connection alive so idle pool members don't get silently
  // dropped between requests.
  enableKeepAlive: true,
  keepAliveInitialDelay: 10_000,
});

// If a pooled connection is dropped by the server/network while idle, log it
// instead of letting it crash the process — mysql2 will discard the bad
// connection and hand out a fresh one on the next query.
pool.on("connection", (connection) => {
  connection.on("error", (err) => {
    console.error("[db] pooled connection error", err);
  });
});

export const db = drizzle(pool, { schema, mode: "default" });

export * from "./schema";
