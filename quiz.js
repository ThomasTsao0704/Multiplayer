// ── 設定 ──
const API_URL = "https://multiplayer-aj6e.onrender.com"; // TODO: 換成你的 Render 網址
const TIME_PER_QUESTION = 15; // 每題秒數

// ── 範例題庫（可自行替換） ──
const questions = [
  {
    q: "JavaScript 中，typeof null 的結果是？",
    options: ["null", "undefined", "object", "number"],
    answer: 2,
  },
  {
    q: "HTTP 狀態碼 404 代表什麼？",
    options: ["伺服器錯誤", "未授權", "找不到資源", "請求逾時"],
    answer: 2,
  },
  {
    q: "CSS 中 position: absolute 是相對於哪個元素定位？",
    options: [
      "瀏覽器視窗",
      "最近的 positioned 祖先",
      "父元素",
      "body",
    ],
    answer: 1,
  },
  {
    q: "Git 指令中，哪個用來建立新分支？",
    options: ["git branch", "git merge", "git clone", "git push"],
    answer: 0,
  },
  {
    q: "SQL 中用來篩選分組後資料的關鍵字是？",
    options: ["WHERE", "GROUP BY", "HAVING", "ORDER BY"],
    answer: 2,
  },
];

// ── DOM ──
const $startScreen = document.getElementById("start-screen");
const $quizScreen = document.getElementById("quiz-screen");
const $resultScreen = document.getElementById("result-screen");
const $leaderboardScreen = document.getElementById("leaderboard-screen");

const $playerName = document.getElementById("player-name");
const $btnStart = document.getElementById("btn-start");
const $progress = document.getElementById("quiz-progress");
const $timer = document.getElementById("quiz-timer");
const $question = document.getElementById("quiz-question");
const $options = document.getElementById("quiz-options");
const $resultScore = document.getElementById("result-score");
const $btnLeaderboard = document.getElementById("btn-leaderboard");
const $btnRetry = document.getElementById("btn-retry");
const $leaderboardBody = document.querySelector("#leaderboard-table tbody");
const $btnBack = document.getElementById("btn-back");

// ── State ──
let currentIndex = 0;
let score = 0;
let answers = []; // 記錄每題選的 index
let timerId = null;
let timeLeft = 0;

// ── 畫面切換 ──
function showScreen(screen) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  screen.classList.add("active");
}

// ── 開始測驗 ──
$btnStart.addEventListener("click", () => {
  currentIndex = 0;
  score = 0;
  answers = [];
  showScreen($quizScreen);
  renderQuestion();
});

// 按 Enter 也可以開始
$playerName.addEventListener("keydown", (e) => {
  if (e.key === "Enter") $btnStart.click();
});

// ── 渲染題目 ──
function renderQuestion() {
  const item = questions[currentIndex];
  $progress.textContent = `第 ${currentIndex + 1} / ${questions.length} 題`;
  $question.textContent = item.q;
  $options.innerHTML = "";

  item.options.forEach((text, i) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = text;
    btn.addEventListener("click", () => handleAnswer(i, btn));
    $options.appendChild(btn);
  });

  startTimer();
}

// ── 倒數計時 ──
function startTimer() {
  clearInterval(timerId);
  timeLeft = TIME_PER_QUESTION;
  $timer.textContent = `⏱ ${timeLeft}`;

  timerId = setInterval(() => {
    timeLeft--;
    $timer.textContent = `⏱ ${timeLeft}`;
    if (timeLeft <= 0) {
      clearInterval(timerId);
      handleAnswer(-1, null); // 超時 = 沒作答
    }
  }, 1000);
}

// ── 選擇答案 ──
function handleAnswer(selectedIndex, clickedBtn) {
  clearInterval(timerId);

  const correct = questions[currentIndex].answer;
  const allBtns = $options.querySelectorAll(".option-btn");

  // 鎖定所有按鈕
  allBtns.forEach((b) => (b.disabled = true));

  // 標記正確答案
  allBtns[correct].classList.add("correct");

  // 標記錯誤
  if (selectedIndex >= 0 && selectedIndex !== correct && clickedBtn) {
    clickedBtn.classList.add("wrong");
  }

  // 計分
  if (selectedIndex === correct) score++;
  answers.push(selectedIndex);

  // 延遲後進入下一題
  setTimeout(() => {
    currentIndex++;
    if (currentIndex < questions.length) {
      renderQuestion();
    } else {
      finishQuiz();
    }
  }, 800);
}

// ── 結束測驗 ──
async function finishQuiz() {
  showScreen($resultScreen);
  $resultScore.textContent = `你得了 ${score} / ${questions.length} 分`;

  // 送成績到後端
  try {
    await fetch(`${API_URL}/api/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: $playerName.value.trim() || "匿名",
        score,
        answers: JSON.stringify(answers),
      }),
    });
  } catch (err) {
    console.error("提交成績失敗：", err);
  }
}

// ── 排行榜 ──
$btnLeaderboard.addEventListener("click", async () => {
  showScreen($leaderboardScreen);
  $leaderboardBody.innerHTML = "<tr><td colspan='4'>載入中…</td></tr>";

  try {
    const res = await fetch(`${API_URL}/api/results`);
    const rows = await res.json();

    if (rows.length === 0) {
      $leaderboardBody.innerHTML = "<tr><td colspan='4'>尚無紀錄</td></tr>";
      return;
    }

    $leaderboardBody.innerHTML = rows
      .map((r, i) => {
        const time = new Date(r.created_at).toLocaleString("zh-TW");
        return `<tr>
          <td>${i + 1}</td>
          <td>${escapeHtml(r.name)}</td>
          <td>${r.score}</td>
          <td>${time}</td>
        </tr>`;
      })
      .join("");
  } catch (err) {
    console.error("載入排行榜失敗：", err);
    $leaderboardBody.innerHTML = "<tr><td colspan='4'>載入失敗</td></tr>";
  }
});

// ── 再玩一次 ──
$btnRetry.addEventListener("click", () => showScreen($startScreen));

// ── 回首頁 ──
$btnBack.addEventListener("click", () => showScreen($startScreen));

// ── 工具：防 XSS ──
function escapeHtml(str) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}
