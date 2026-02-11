import os
import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生產環境改為你的網域
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Supabase PostgreSQL 連線 ──
DATABASE_URL = os.environ.get("DATABASE_URL")

def get_conn():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

class QuizResult(BaseModel):
    name: str
    score: int
    time_used: float
    quiz_id: str = "default"

@app.post("/api/submit")
def submit_result(result: QuizResult):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO quiz_results (name, score, time_used, quiz_id) VALUES (%s, %s, %s, %s)",
        (result.name, result.score, result.time_used, result.quiz_id),
    )
    conn.commit()
    cur.close()
    conn.close()
    return {"status": "ok", "message": "已儲存"}

@app.get("/api/leaderboard")
def get_leaderboard(quiz_id: str = "default"):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "SELECT name, score, time_used, created_at FROM quiz_results WHERE quiz_id = %s ORDER BY score DESC, time_used ASC LIMIT 20",
        (quiz_id,),
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return rows
