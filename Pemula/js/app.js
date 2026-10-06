/* =========================================================================
   Nihonggo Gakkou - script.js (versi lengkap)
   Kana tersusun a-i-u-e-o, kuis berurutan/acak, flashcard kosakata mandiri
   ========================================================================= */

const STORAGE_SELECTED = "nihonggoGakkou_selected";
const STORAGE_HISTORY = "nihonggoGakkou_history";

const SET_ORDER = ["seion", "dakuon", "handakuon", "youon"];
const SET_LABELS = { seion: "Seion", dakuon: "Dakuon", handakuon: "Handakuon", youon: "Youon" };
const CATEGORY_LABELS = { hiragana: "Hiragana", katakana: "Katakana" };

const VOWEL_COLS = ["a", "i", "u", "e", "o"];
const YOON_COLS = ["a", "u", "o"];
const YOON_HEAD = ["ya", "yu", "yo"];

/* ===================== STATE ===================== */
let appData = null;
let allCharacters = [];
let allVocabularies = [];

let learnCategory = "hiragana";
let learnSet = "seion";

let setupCategory = "hiragana";
let selectedChars = new Set();

let sessionQueue = [];
let currentIndex = 0;
let score = 0;
let correctCount = 0;
let wrongCount = 0;
let currentMode = "h2r";
let currentItem = null;
let hasAnswered = false;

let vocabList = [];
let vocabIndex = 0;
let vocabFilter = "all";

/* ===================== LOAD DATA ===================== */
async function loadData() {
  try {
    const res = await fetch("data/japanese.json");
    if (!res.ok) throw new Error("HTTP error " + res.status);
    appData = await res.json();

    allCharacters = [];
    ["hiragana", "katakana"].forEach(cat => {
      if (!appData[cat]) return;
      SET_ORDER.forEach(set => {
        (appData[cat][set] || []).forEach(item => {
          allCharacters.push({ ...item, category: cat, set });
        });
      });
    });

    allVocabularies = appData.vocabulary || [];
    return true;
  } catch (err) {
    console.error("Gagal memuat data:", err);
    return false;
  }
}

/* ===================== AUDIO TTS ===================== */
function speak(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const ut = new SpeechSynthesisUtterance(text);
  ut.lang = "ja-JP";
  ut.rate = 0.85;
  window.speechSynthesis.speak(ut);
}

/* ===================== DOM REFS ===================== */
const sidebar = document.getElementById("appSidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
const sidebarBackdrop = document.getElementById("sidebarBackdrop");

const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

const learnTitle = document.getElementById("learnTitle");
const learnSub = document.getElementById("learnSub");
const learnScriptToggle = document.getElementById("learnScriptToggle");
const subsetTabs = document.getElementById("subsetTabs");
const learnGrid = document.getElementById("learnGrid");

const setupScriptToggle = document.getElementById("setupScriptToggle");
const setupCharGroups = document.getElementById("setupCharGroups");
const selectedCount = document.getElementById("selectedCount");
const selectAllBtn = document.getElementById("selectAllBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const startQuizBtn = document.getElementById("startQuizBtn");

const quizCounter = document.getElementById("quizCounter");
const quizScore = document.getElementById("quizScore");
const quizProgressFill = document.getElementById("quizProgressFill");
const quizInstruction = document.getElementById("quizInstruction");
const quizKana = document.getElementById("quizKana");
const answerInputWrap = document.getElementById("answerInputWrap");
const answerInput = document.getElementById("answerInput");
const submitAnswerBtn = document.getElementById("submitAnswerBtn");
const answerOptions = document.getElementById("answerOptions");
const quizFeedback = document.getElementById("quizFeedback");
const quizFeedbackText = document.getElementById("quizFeedbackText");
const quizNextBtn = document.getElementById("quizNextBtn");

const vocabCategoryFilter = document.getElementById("vocabCategoryFilter");
const vocabCounterText = document.getElementById("vocabCounterText");
const vocabAudioBtn = document.getElementById("vocabAudioBtn");
const vocabWordText = document.getElementById("vocabWordText");
const vocabAnswerBox = document.getElementById("vocabAnswerBox");
const vocabRomajiText = document.getElementById("vocabRomajiText");
const vocabMeaningText = document.getElementById("vocabMeaningText");
const vocabRevealBtn = document.getElementById("vocabRevealBtn");
const vocabNextCardBtn = document.getElementById("vocabNextCardBtn");

const finalScore = document.getElementById("finalScore");
const finalAccuracy = document.getElementById("finalAccuracy");
const retrySameBtn = document.getElementById("retrySameBtn");
const backToSelectBtn = document.getElementById("backToSelectBtn");
const totalSessions = document.getElementById("totalSessions");
const avgAccuracy = document.getElementById("avgAccuracy");
const bestAccuracy = document.getElementById("bestAccuracy");
const historyList = document.getElementById("historyList");

/* ===================== ROUTING ===================== */
function showView(viewId, opts = {}) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  const target = document.getElementById("view-" + viewId);
  if (target) target.classList.add("active");

  document.querySelectorAll(".sidebar-link").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.view === viewId);
  });

  if (viewId === "learn") {
    if (opts.category) learnCategory = opts.category;
    if (opts.set) learnSet = opts.set;
    renderLearn();
  }
  if (viewId === "quiz-setup") renderSetup();
  if (viewId === "vocab-read") initVocabReading();
  if (viewId === "progress") renderProgress();

  closeSidebar();
  window.scrollTo(0, 0);
}

document.querySelectorAll("[data-view]").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    showView(btn.dataset.view, { category: btn.dataset.category, set: btn.dataset.set });
  });
});

/* ===================== SIDEBAR ===================== */
function toggleSidebar() {
  sidebar.classList.toggle("open");
  sidebarBackdrop.classList.toggle("open");
}
function closeSidebar() {
  sidebar.classList.remove("open");
  sidebarBackdrop.classList.remove("open");
}
sidebarToggle.addEventListener("click", toggleSidebar);
sidebarBackdrop.addEventListener("click", closeSidebar);

/* ===================== TABEL GOJUON (HELPER) ===================== */
function colsFor(set) { return set === "youon" ? YOON_COLS : VOWEL_COLS; }
function headFor(set) { return set === "youon" ? YOON_HEAD : VOWEL_COLS; }

// Kelompokkan karakter per baris (a, ka, sa, ...) dengan kolom a-i-u-e-o
function buildChartRows(items, set) {
  const cols = colsFor(set);
  const rows = [];
  const map = {};
  items.forEach(it => {
    if (!map[it.group]) {
      map[it.group] = { label: it.group, cells: new Array(cols.length).fill(null) };
      rows.push(map[it.group]);
    }
    const v = it.romaji === "n" ? "a" : it.romaji.slice(-1);
    const ci = cols.indexOf(v);
    if (ci >= 0) map[it.group].cells[ci] = it;
  });
  return rows;
}

function chartHeader(set) {
  const cols = headFor(set);
  const head = document.createElement("div");
  head.className = "chart-row chart-head";
  head.style.setProperty("--cols", cols.length);
  head.innerHTML = `<span class="chart-corner"></span>` + cols.map(c => `<span>${c}</span>`).join("");
  return head;
}

/* ===================== LEARN ===================== */
function renderLearn() {
  learnTitle.textContent = CATEGORY_LABELS[learnCategory];
  learnSub.textContent = `${SET_LABELS[learnSet]} - klik karakter untuk mendengar suaranya`;

  learnScriptToggle.querySelectorAll(".tab-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.category === learnCategory);
  });
  subsetTabs.querySelectorAll(".sub-tab").forEach(b => {
    b.classList.toggle("active", b.dataset.set === learnSet);
  });

  const items = allCharacters.filter(i => i.category === learnCategory && i.set === learnSet);
  const rows = buildChartRows(items, learnSet);

  learnGrid.className = "chart";
  learnGrid.innerHTML = "";
  learnGrid.appendChild(chartHeader(learnSet));

  rows.forEach(r => {
    const row = document.createElement("div");
    row.className = "chart-row";
    row.style.setProperty("--cols", r.cells.length);
    row.innerHTML = `<span class="chart-label">${r.label}</span>`;
    r.cells.forEach(c => {
      if (!c) {
        row.insertAdjacentHTML("beforeend", `<span class="kana-box kana-empty"></span>`);
        return;
      }
      const box = document.createElement("div");
      box.className = "kana-box";
      box.innerHTML = `<span class="kana-char">${c.character}</span><span class="kana-romaji">${c.romaji}</span>`;
      box.addEventListener("click", () => speak(c.character));
      row.appendChild(box);
    });
    learnGrid.appendChild(row);
  });
}

learnScriptToggle.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    learnCategory = btn.dataset.category;
    renderLearn();
  });
});
subsetTabs.querySelectorAll(".sub-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    learnSet = btn.dataset.set;
    renderLearn();
  });
});

/* ===================== QUIZ SETUP ===================== */
function renderSetup() {
  setupScriptToggle.querySelectorAll(".tab-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.category === setupCategory);
  });
  setupCharGroups.innerHTML = "";

  SET_ORDER.forEach(set => {
    const items = allCharacters.filter(i => i.category === setupCategory && i.set === set);
    if (!items.length) return;

    const block = document.createElement("div");
    block.className = "chart-block";
    block.innerHTML = `<div class="char-row-title">${SET_LABELS[set]}</div>`;

    const chart = document.createElement("div");
    chart.className = "chart chart-compact";
    chart.appendChild(chartHeader(set));

    buildChartRows(items, set).forEach(r => {
      const row = document.createElement("div");
      row.className = "chart-row";
      row.style.setProperty("--cols", r.cells.length);

      const real = r.cells.filter(Boolean);
      const keyOf = c => `${c.category}|${c.character}`;

      const rowBtn = document.createElement("button");
      rowBtn.type = "button";
      rowBtn.className = "chart-label chart-label-btn";
      rowBtn.title = "Pilih / batal satu baris";
      rowBtn.textContent = r.label;
      const sync = () => rowBtn.classList.toggle("on", real.every(c => selectedChars.has(keyOf(c))));
      row.appendChild(rowBtn);

      r.cells.forEach(c => {
        if (!c) {
          row.insertAdjacentHTML("beforeend", `<span class="char-cell char-empty"></span>`);
          return;
        }
        const label = document.createElement("label");
        label.className = "char-cell";
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = selectedChars.has(keyOf(c));
        cb.addEventListener("change", () => {
          if (cb.checked) selectedChars.add(keyOf(c));
          else selectedChars.delete(keyOf(c));
          sync();
          updateSelectedCount();
        });
        label.appendChild(cb);
        label.insertAdjacentHTML("beforeend", `<span class="cc-char">${c.character}</span><small>${c.romaji}</small>`);
        row.appendChild(label);
      });

      rowBtn.addEventListener("click", () => {
        const all = real.every(c => selectedChars.has(keyOf(c)));
        real.forEach(c => (all ? selectedChars.delete(keyOf(c)) : selectedChars.add(keyOf(c))));
        row.querySelectorAll("input").forEach(i => { i.checked = !all; });
        sync();
        updateSelectedCount();
      });

      sync();
      chart.appendChild(row);
    });

    block.appendChild(chart);
    setupCharGroups.appendChild(block);
  });
  updateSelectedCount();
}

function updateSelectedCount() {
  const count = [...selectedChars].filter(k => k.startsWith(setupCategory + "|")).length;
  selectedCount.textContent = `${count} dipilih`;
  startQuizBtn.disabled = count === 0;
}

setupScriptToggle.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    setupCategory = btn.dataset.category;
    renderSetup();
  });
});

selectAllBtn.addEventListener("click", () => {
  allCharacters.filter(i => i.category === setupCategory).forEach(i => selectedChars.add(`${i.category}|${i.character}`));
  renderSetup();
});
clearAllBtn.addEventListener("click", () => {
  [...selectedChars].filter(k => k.startsWith(setupCategory + "|")).forEach(k => selectedChars.delete(k));
  renderSetup();
});

startQuizBtn.addEventListener("click", () => {
  const chosen = allCharacters.filter(i => selectedChars.has(`${i.category}|${i.character}`) && i.category === setupCategory);
  if (!chosen.length) return;
  const modeVal = document.querySelector('input[name="quizMode"]:checked').value;
  startQuiz(chosen, modeVal);
});

/* ===================== QUIZ PLAY ===================== */
function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// Urutan soal: berurutan a-i-u-e-o (sesuai urutan data) atau acak
function startQuiz(pool, mode) {
  currentMode = mode;
  const order = (document.querySelector('input[name="quizOrder"]:checked') || {}).value || "seq";
  sessionQueue = order === "rand"
    ? shuffle(pool)
    : [...pool].sort((a, b) => allCharacters.indexOf(a) - allCharacters.indexOf(b));
  currentIndex = 0;
  score = 0;
  correctCount = 0;
  wrongCount = 0;
  showView("quiz");
  generateQuizItem();
}

function generateQuizItem() {
  hasAnswered = false;
  quizFeedback.classList.add("hidden");
  quizFeedback.className = "feedback-msg hidden";
  quizNextBtn.disabled = true;

  currentItem = sessionQueue[currentIndex];
  quizCounter.textContent = `${currentIndex + 1} / ${sessionQueue.length}`;
  quizScore.textContent = `Skor: ${score}`;
  quizProgressFill.style.width = `${Math.round(((currentIndex + 1) / sessionQueue.length) * 100)}%`;

  if (currentMode === "type") {
    quizInstruction.textContent = "Ketik cara baca huruf berikut:";
    quizKana.textContent = currentItem.character;
    answerInputWrap.classList.remove("hidden");
    answerOptions.classList.add("hidden");
    answerInput.value = "";
    answerInput.disabled = false;
    submitAnswerBtn.disabled = false;
    answerInput.focus();
  } else if (currentMode === "r2h") {
    quizInstruction.textContent = "Pilih karakter yang sesuai:";
    quizKana.textContent = currentItem.romaji;
    answerInputWrap.classList.add("hidden");
    answerOptions.classList.remove("hidden");
    buildChoices("character");
  } else {
    quizInstruction.textContent = "Pilih romaji yang sesuai:";
    quizKana.textContent = currentItem.character;
    answerInputWrap.classList.add("hidden");
    answerOptions.classList.remove("hidden");
    buildChoices("romaji");
  }
}

// Pilihan jawaban juga diurutkan mengikuti urutan kana
function buildChoices(field) {
  const seen = new Map();
  allCharacters.forEach(c => {
    if (c.category === currentItem.category && c[field] !== currentItem[field] && !seen.has(c[field])) {
      seen.set(c[field], c);
    }
  });
  const picked = shuffle([...seen.values()]).slice(0, 3);
  const opts = [currentItem, ...picked].sort((a, b) => allCharacters.indexOf(a) - allCharacters.indexOf(b));

  answerOptions.innerHTML = "";
  opts.forEach(o => {
    const b = document.createElement("button");
    b.className = "opt-btn";
    b.textContent = o[field];
    b.addEventListener("click", () => handleChoice(b, o[field] === currentItem[field]));
    answerOptions.appendChild(b);
  });
}

function handleChoice(btn, isCorrect) {
  if (hasAnswered) return;
  hasAnswered = true;

  answerOptions.querySelectorAll(".opt-btn").forEach(b => {
    b.disabled = true;
    if (b.textContent === (currentMode === "r2h" ? currentItem.character : currentItem.romaji)) {
      b.classList.add("correct");
    }
  });

  if (isCorrect) {
    score += 10;
    correctCount++;
    quizFeedback.textContent = "Benar!";
    quizFeedback.classList.add("correct");
  } else {
    wrongCount++;
    btn.classList.add("wrong");
    quizFeedback.textContent = `Salah. Jawaban: ${currentItem.character} = ${currentItem.romaji}`;
    quizFeedback.classList.add("wrong");
  }

  quizFeedback.classList.remove("hidden");
  quizScore.textContent = `Skor: ${score}`;
  quizNextBtn.disabled = false;
}

function checkTypedAnswer() {
  if (hasAnswered) return;
  const val = answerInput.value.trim().toLowerCase();
  if (!val) return;
  hasAnswered = true;
  answerInput.disabled = true;
  submitAnswerBtn.disabled = true;

  if (val === currentItem.romaji.toLowerCase()) {
    score += 10;
    correctCount++;
    quizFeedback.textContent = "Benar!";
    quizFeedback.classList.add("correct");
  } else {
    wrongCount++;
    quizFeedback.textContent = `Salah. Jawaban: ${currentItem.romaji}`;
    quizFeedback.classList.add("wrong");
  }

  quizFeedback.classList.remove("hidden");
  quizScore.textContent = `Skor: ${score}`;
  quizNextBtn.disabled = false;
}

submitAnswerBtn.addEventListener("click", checkTypedAnswer);
answerInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") checkTypedAnswer();
});

quizNextBtn.addEventListener("click", () => {
  currentIndex++;
  if (currentIndex >= sessionQueue.length) finishQuiz();
  else generateQuizItem();
});

function finishQuiz() {
  const total = sessionQueue.length;
  const acc = Math.round((correctCount / total) * 100);
  finalScore.textContent = `${correctCount} / ${total}`;
  finalAccuracy.textContent = `Akurasi: ${acc}%`;

  const hist = JSON.parse(localStorage.getItem(STORAGE_HISTORY) || "[]");
  hist.unshift({ date: Date.now(), total, correct: correctCount, accuracy: acc, mode: currentMode });
  localStorage.setItem(STORAGE_HISTORY, JSON.stringify(hist.slice(0, 20)));

  showView("result");
}

retrySameBtn.addEventListener("click", () => startQuiz(sessionQueue, currentMode));
backToSelectBtn.addEventListener("click", () => showView("quiz-setup"));

/* ===================== KOSAKATA (FLASHCARD / BACA MANDIRI) ===================== */
if (vocabCategoryFilter) {
  vocabCategoryFilter.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      vocabCategoryFilter.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      vocabFilter = btn.dataset.type;
      initVocabReading();
    });
  });
}

function initVocabReading() {
  let list = allVocabularies;
  if (vocabFilter !== "all") {
    list = list.filter(v => v.type === vocabFilter);
  }
  vocabList = shuffle(list);
  vocabIndex = 0;
  renderVocabCard();
}

function renderVocabCard() {
  if (!vocabList.length) return;
  const cur = vocabList[vocabIndex];

  vocabCounterText.textContent = `Kata ${vocabIndex + 1} / ${vocabList.length}`;
  vocabWordText.textContent = cur.word;
  vocabRomajiText.textContent = cur.romaji;
  vocabMeaningText.textContent = `Arti: ${cur.meaning}`;

  vocabAnswerBox.classList.remove("revealed");
  vocabRevealBtn.classList.remove("hidden");
  vocabNextCardBtn.classList.add("hidden");
}

vocabRevealBtn.addEventListener("click", () => {
  vocabAnswerBox.classList.add("revealed");
  vocabRevealBtn.classList.add("hidden");
  vocabNextCardBtn.classList.remove("hidden");
  speak(vocabList[vocabIndex].word);
});

vocabNextCardBtn.addEventListener("click", () => {
  vocabIndex = (vocabIndex + 1) % vocabList.length;
  renderVocabCard();
});

vocabAudioBtn.addEventListener("click", () => {
  if (vocabList[vocabIndex]) speak(vocabList[vocabIndex].word);
});

/* ===================== PROGRESS ===================== */
function renderProgress() {
  const hist = JSON.parse(localStorage.getItem(STORAGE_HISTORY) || "[]");
  totalSessions.textContent = hist.length;
  if (!hist.length) {
    avgAccuracy.textContent = "0%";
    bestAccuracy.textContent = "0%";
    historyList.innerHTML = '<li style="color:var(--text-muted)">Belum ada riwayat kuis.</li>';
    return;
  }
  const avg = Math.round(hist.reduce((s, h) => s + h.accuracy, 0) / hist.length);
  const best = Math.max(...hist.map(h => h.accuracy));
  avgAccuracy.textContent = `${avg}%`;
  bestAccuracy.textContent = `${best}%`;

  historyList.innerHTML = "";
  hist.slice(0, 10).forEach(h => {
    const li = document.createElement("li");
    const d = new Date(h.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    li.innerHTML = `<span>${d}</span> <strong>${h.correct}/${h.total} (${h.accuracy}%)</strong>`;
    historyList.appendChild(li);
  });
}

/* ===================== SEARCH ===================== */
searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) {
    searchResults.classList.add("hidden");
    return;
  }
  const matches = allCharacters.filter(c => c.romaji.includes(q) || c.character === q).slice(0, 8);
  searchResults.innerHTML = "";
  if (!matches.length) {
    searchResults.innerHTML = '<div style="padding:8px;font-size:0.85rem;color:var(--text-muted)">Tidak ditemukan</div>';
  } else {
    matches.forEach(item => {
      const d = document.createElement("div");
      d.className = "search-item";
      d.innerHTML = `<span><strong>${item.character}</strong> (${item.romaji})</span> <small style="color:var(--text-muted)">${CATEGORY_LABELS[item.category]}</small>`;
      d.addEventListener("click", () => {
        searchResults.classList.add("hidden");
        searchInput.value = "";
        showView("learn", { category: item.category, set: item.set });
        speak(item.character);
      });
      searchResults.appendChild(d);
    });
  }
  searchResults.classList.remove("hidden");
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-box")) searchResults.classList.add("hidden");
});

/* ===================== TAMBAHAN UI (disuntik ke DOM) ===================== */
function injectExtras() {
  const modeBox = document.querySelector(".mode-box");
  if (modeBox && !document.querySelector('input[name="quizOrder"]')) {
    modeBox.insertAdjacentHTML("afterend",
      `<div class="mode-box mode-order">
         <span class="mode-label">Urutan soal</span>
         <label class="mode-item"><input type="radio" name="quizOrder" value="seq" checked><span>Berurutan (a, i, u, e, o)</span></label>
         <label class="mode-item"><input type="radio" name="quizOrder" value="rand"><span>Acak</span></label>
       </div>`);
  }
  const grid = document.querySelector("#view-home .cards-grid");
  if (grid && !document.querySelector(".path-card")) {
    grid.insertAdjacentHTML("afterend",
      `<div class="path-card">
         <h3>Jalur belajar untuk pemula</h3>
         <ol class="path-steps">
           <li><b>Hafalkan per baris.</b><span>Mulai dari baris a, lalu ka, sa. Cukup 5 karakter per sesi sambil diucapkan.</span></li>
           <li><b>Uji baris itu.</b><span>Di Kuis Karakter, pilih baris yang baru dipelajari, soal tampil berurutan a-i-u-e-o.</span></li>
           <li><b>Lanjut ke katakana dan kata.</b><span>Setelah hiragana mantap, pelajari katakana, lalu latihan baca kosakata.</span></li>
         </ol>
       </div>`);
  }
}

/* ===================== INIT ===================== */
async function init() {
  injectExtras();
  const ok = await loadData();
  if (ok) showView("home");
}

init();