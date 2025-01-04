import { Pool } from "pg";

export const pool = new Pool({
  user: "",
  host: "",
  database: "",
  password: "",
  port: 5432,
});

pool
  .connect()
  .then((client) => {
    console.log("Connected to PostgreSQL!");
    client.release();
  })
  .catch((err) => console.log("Connection error", err));
