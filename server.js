require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// 除錯用（部署成功後可刪除）
app.get("/api/debug", (req, res) => {
    const url = process.env.DATABASE_URL || "(未設定)";
    // 只顯示格式，隱藏密碼
    const masked = url.replace(/\/\/([^:]+):([^@]+)@/, "//[$1]:***@");
    res.json({ DATABASE_URL_format: masked });
});

// 存測驗結果
app.post("/api/submit", async (req, res) => {
    const { name, score, time_used, quiz_id } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO quiz_results (name, score, time_used, quiz_id)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            [name || "匿名", score, time_used || 0, quiz_id || "default"]
        );
        res.json({ status: "ok", message: "已儲存", id: result.rows[0].id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 排行榜
app.get("/api/leaderboard", async (req, res) => {
    const quiz_id = req.query.quiz_id || "default";

    try {
        const result = await pool.query(
            `SELECT name, score, time_used, created_at
             FROM quiz_results
             WHERE quiz_id = $1
             ORDER BY score DESC, time_used ASC
             LIMIT 20`,
            [quiz_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(process.env.PORT || 3000);
