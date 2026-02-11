// ── 設定 ──
const API_URL = "https://multiplayer-1mz2.onrender.com";
const TIME_PER_QUESTION = 15; // 每題秒數

// ── 範例題庫（可自行替換） ──
const questions = [
  {
    q: "【演算法的寵兒】 \n打開你的社群媒體或 YouTube，首頁推薦的內容是不是讓你覺得「演算法真是我的知音」，完全沒有任何一個會讓你看了想翻白眼的觀點？",
    options: ["是", "否"],
    answer: 1,
  },
  {
    q: "【多巴胺中毒】 \n看到對手陣營出糗的新聞時，你產生的快感是否大於吃到美食或中發票？（且完全不打算點開看這新聞是不是假消息）",
    options: ["是", "否"],
    answer: 1,
  },
  {
    q: "【標籤便利貼】 \n你是否能在 3 秒內用一個貶義詞（如：1450、小粉紅、覺青、精日）精準定義任何一個跟你吵架的網友，並覺得自己看透了靈魂？",
    options: ["是", "否"],
    answer: 1,
  },
  {
    q: "【奧斯卡演技挑戰】 \n如果要你扮演對手陣營去參加辯論，你會在 3 分鐘內因為太過噁心而想吐，還是能冷靜地幫他們把話說得頭頭是道？（如果你想吐，那是「否」）",
    options: ["是", "否"],
    answer: 1,
  },
  {
    q: "【頸動脈警報】 \n當你在家吃年夜飯或聚餐，聽到親戚長輩說出你最討厭的政見時，你的血壓上升速度是否快過 5G 網路？",
    options: ["是", "否"],
    answer: 1,
  },
    {
    q: "【比爛大賽冠軍】 \n當你支持的政黨或立場被抓到明顯錯誤時，你的第一反應是不是大喊：「那誰誰誰更爛，你怎麼不說？！」",
    options: ["是", "否"],
    answer: 1,
  },
    {
    q: "【時空旅人的偏見】 \n你是否堅信關於兩岸的歷史事實「只有一個版本」，且認為所有不同意那個版本的人，不是書讀太少就是被洗腦了？",
    options: ["是", "否"],
    answer: 1,
  },
    {
    q: "【社交大清洗】 \n你的好友名單裡，是否已經完全消失了「意見不同但還能一起喝咖啡」的朋友？（或者你的封鎖名單比好友名單還長？）",
    options: ["是", "否"],
    answer: 1,
  },
    {
    q: "【喪屍末日感】 \n你是否覺得如果不按照你的政治主張走，台灣/中國在 5 年內就會徹底毀滅，變成一片廢墟或奴隸營？",
    options: ["是", "否"],
    answer: 1,
  },
    {
    q: "【真相過敏症】 \n如果有一天你的偶像或最信賴的媒體被證實說了謊，你會覺得「那是為了大局著想」，而不是覺得被欺騙？",
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
