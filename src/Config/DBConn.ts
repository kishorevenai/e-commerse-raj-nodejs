import { Pool } from "pg";

export const pool = new Pool({
  user: process.env.DATABASE_USERNAME,
  host: process.env.DATABASE_HOSTNAME,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: 5432,
});

pool
  .connect()
  .then((client) => {
    console.log("Connected to PostgreSQL!");
    client.release();
  })
  .catch((err) => console.log("Connection error", err));
