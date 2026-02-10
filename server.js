require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }
});

// 存測驗
app.post("/api/submit", async (req, res) => {
    const { name, score, answers } = req.body;

    try {
        const result = await pool.query(
            `insert into quiz_results (name, score, answers)
       values ($1,$2,$3)
       returning id`,
            [name || "匿名", score, answers]
        );

        res.json({ success: true, id: result.rows[0].id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "DB error" });
    }
});

// 查所有紀錄
app.get("/api/results", async (req, res) => {
    const result = await pool.query(
        `select id,name,score,created_at
     from quiz_results
     order by created_at desc`
    );

    res.json(result.rows);
});

app.listen(process.env.PORT || 3000);
