"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const pg_1 = require("pg");
exports.pool = new pg_1.Pool({
    user: process.env.DATABASE_USERNAME,
    host: process.env.DATABASE_HOSTNAME,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: 5432,
});
exports.pool
    .connect()
    .then((client) => {
    console.log("Connected to PostgreSQL!");
    client.release();
})
    .catch((err) => console.log("Connection error", err));
