// ── 設定 ──
const API_URL = "https://multiplayer-1mz2.onrender.com";
const TIME_PER_QUESTION = 15; // 每題秒數

// ── 範例題庫（可自行替換） ──
const questions = [
  {
    q: "資訊來源單一化： 我過去一週收看的兩岸新聞，是否全都來自立場相近的媒體或社群帳號（例如：只看親綠、只看親藍，或只看特定官媒）？",
    options: ["是", "否"],
    answer: 1,
  },
  {
    q: "情感優先於事實： 當我看到一則嘲諷「對方陣營」的負面新聞時，我是否會立刻感到愉悅並順手轉發，而完全沒有想過要查證其真實性？",
    options: ["是", "否"],
    answer: 1,
  },
  {
    q: "標籤化思考： 我是否傾向用「覺青」、「小粉紅」、「中共同路人」、「綠蛆」等標籤來概括所有與我立場不同的人？",
    options: ["是", "否"],
    answer: 1,
  },
  {
    q: "無法陳述對手論點： 如果要我理性地、不帶嘲諷地寫出「對方陣營」最重要的三個論點，我是否完全寫不出來？",
    options: ["是", "否"],
    answer: 1,
  },
  {
    q: "對質疑的生理反應： 當有人對我的兩岸政治觀點提出挑戰時，我是否會立刻感到憤怒、血壓升高，而不是感到好奇或想要釐清對方的邏輯？",
    options: ["是", "否"],
    answer: 1,
  },
    {
    q: "避重就輕： 面對「我方陣營」顯而易見的錯誤或醜聞時，我是否會用「對方更壞」或「這只是局部問題」來防衛，而不願承認錯誤？",
    options: ["是", "否"],
    answer: 1,
  },
    {
    q: "歷史與法律觀的絕對化： 我是否認為關於兩岸的歷史（如 2758 號決議、1945 年後的領土變更等）只有一種解釋，而其他解釋都是「謊言」或「洗腦」？",
    options: ["是", "否"],
    answer: 1,
  },
    {
    q: "封閉的社交圈： 我的社群媒體或現實生活中，是否已經幾乎沒有立場與我迥異的朋友？（或者我已經封鎖了所有不同意見的人？）",
    options: ["是", "否"],
    answer: 1,
  },
    {
    q: "恐懼驅動： 我支持某種立場，主要是因為「如果不這樣，台灣/中國就完蛋了」這種強烈的恐懼感嗎？",
    options: ["是", "否"],
    answer: 1,
  },
    {
    q: "拒絕更新資訊： 如果今天出現了一份權威且客觀的證據，證明我過去相信的某個觀點是錯的，我是否會拒絕相信這份證據？",
    options: ["是", "否"],
    answer: 1,
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
let quizStartTime = 0; // 整場測驗開始時間

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
  quizStartTime = Date.now();
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

// ── 分析結果 ──
function getAnalysis(yesCount) {
  if (yesCount <= 2) {
    return {
      level: "思考界的孤勇者",
      text: "你太清醒了，演算法可能恨死你了。你大概是那種會在同溫層裡潑冷水的人，雖然朋友可能不多，但大腦很健康。",
    };
  } else if (yesCount <= 6) {
    return {
      level: "亞健康同溫層民",
      text: "你已經有一半的靈魂被演算法綁架了。你開始對某些詞彙有反射動作，建議偶爾去看看對方的媒體，雖然會很不舒服，但那是「大腦復健」。",
    };
  } else {
    return {
      level: "全自動思考機器",
      text: "恭喜！你已經成功把自己活成了一個「立場產生器」。你的大腦已經內建了防火牆，任何不符合你設定的資訊都會被自動彈回。這狀態很安全、很有歸屬感，但……你確定那是你在思考嗎？",
    };
  }
}

// ── 結束測驗 ──
async function finishQuiz() {
  showScreen($resultScreen);

  // 計算答「是」的次數（選了 index 0 = "是"，或超時 -1 也算「是」）
  const yesCount = answers.filter((a) => a !== 1).length;
  const analysis = getAnalysis(yesCount);

  $resultScore.textContent = `你回答了 ${yesCount} / ${questions.length} 個「是」`;

  const $analysis = document.getElementById("result-analysis");
  $analysis.innerHTML =
    `<h3>${analysis.level}</h3>` +
    `<p>${analysis.text}</p>`;

  // 計算總耗時（秒）
  const timeUsed = parseFloat(((Date.now() - quizStartTime) / 1000).toFixed(1));

  // 送成績到後端
  try {
    await fetch(`${API_URL}/api/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: $playerName.value.trim() || "匿名",
        score: yesCount,
        time_used: timeUsed,
        quiz_id: "app88",
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
    const res = await fetch(`${API_URL}/api/leaderboard?quiz_id=app88`);
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
