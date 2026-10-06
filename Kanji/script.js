/* =========================================================================
   Nihonggo Gakkou — app.js
   Dengan Modal Tampilan Besar untuk Hiragana & Katakana
   ========================================================================= */

const STORAGE_SELECTED = "nihonggoGakkou_selected";
const STORAGE_HISTORY = "nihonggoGakkou_history";

const SET_ORDER = ["seion", "dakuon", "handakuon", "youon"];
const SET_LABELS = { seion: "Seion", dakuon: "Dakuon", handakuon: "Handakuon", youon: "Youon" };
const CATEGORY_LABELS = { hiragana: "Hiragana", katakana: "Katakana" };

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

// State Latihan Kosakata
let vocabList = [];
let vocabIndex = 0;
let vocabFilter = "all";

// Active Modal Character
let activeModalChar = null;

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
  const clean = text.trim().normalize("NFC");
  const ut = new SpeechSynthesisUtterance(clean.length === 1 ? `${clean}。` : clean);
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

// Learn
const learnTitle = document.getElementById("learnTitle");
const learnSub = document.getElementById("learnSub");
const learnScriptToggle = document.getElementById("learnScriptToggle");
const subsetTabs = document.getElementById("subsetTabs");
const learnGrid = document.getElementById("learnGrid");

// Modal
const charModalOverlay = document.getElementById("charModalOverlay");
const modalCloseBtn = document.getElementById("modalCloseBtn");
const modalCategoryBadge = document.getElementById("modalCategoryBadge");
const modalSetBadge = document.getElementById("modalSetBadge");
const modalGiantChar = document.getElementById("modalGiantChar");
const modalRomaji = document.getElementById("modalRomaji");
const modalSoundBtn = document.getElementById("modalSoundBtn");
const modalExampleContent = document.getElementById("modalExampleContent");

// Quiz Setup
const setupScriptToggle = document.getElementById("setupScriptToggle");
const setupCharGroups = document.getElementById("setupCharGroups");
const selectedCount = document.getElementById("selectedCount");
const selectAllBtn = document.getElementById("selectAllBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const startQuizBtn = document.getElementById("startQuizBtn");

// Quiz Play
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

// Vocab Flashcard
const vocabCategoryFilter = document.getElementById("vocabCategoryFilter");
const vocabCounterText = document.getElementById("vocabCounterText");
const vocabAudioBtn = document.getElementById("vocabAudioBtn");
const vocabWordText = document.getElementById("vocabWordText");
const vocabAnswerBox = document.getElementById("vocabAnswerBox");
const vocabRomajiText = document.getElementById("vocabRomajiText");
const vocabMeaningText = document.getElementById("vocabMeaningText");
const vocabRevealBtn = document.getElementById("vocabRevealBtn");
const vocabNextCardBtn = document.getElementById("vocabNextCardBtn");

// Result & Progress
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

/* ===================== MODAL DETAIL BESAR ===================== */
function openCharModal(item) {
  activeModalChar = item;
  modalCategoryBadge.textContent = CATEGORY_LABELS[item.category];
  modalSetBadge.textContent = SET_LABELS[item.set];
  modalGiantChar.textContent = item.character;
  modalRomaji.textContent = item.romaji;

  // Temukan contoh kata yang memakai karakter ini
  const matchingVocabs = allVocabularies.filter(v => v.word.includes(item.character));
  if (matchingVocabs.length > 0) {
    modalExampleContent.innerHTML = matchingVocabs.slice(0, 2).map(v => 
      `<div><strong>${v.word}</strong> (${v.romaji}) — ${v.meaning}</div>`
    ).join("");
  } else {
    modalExampleContent.innerHTML = `<div>Karakter dasar untuk pembentukan suku kata [ ${item.romaji} ].</div>`;
  }

  charModalOverlay.classList.remove("hidden");
  speak(item.character);
}

function closeCharModal() {
  charModalOverlay.classList.add("hidden");
  activeModalChar = null;
}

modalCloseBtn.addEventListener("click", closeCharModal);
charModalOverlay.addEventListener("click", (e) => {
  if (e.target === charModalOverlay) closeCharModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !charModalOverlay.classList.contains("hidden")) {
    closeCharModal();
  }
});

modalSoundBtn.addEventListener("click", () => {
  if (activeModalChar) speak(activeModalChar.character);
});

/* ===================== LEARN ===================== */
function renderLearn() {
  learnTitle.textContent = CATEGORY_LABELS[learnCategory];
  learnSub.textContent = `Daftar huruf ${CATEGORY_LABELS[learnCategory]} (${SET_LABELS[learnSet]}). Klik untuk detail besar.`;

  learnScriptToggle.querySelectorAll(".tab-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.category === learnCategory);
  });
  subsetTabs.querySelectorAll(".sub-tab").forEach(b => {
    b.classList.toggle("active", b.dataset.set === learnSet);
  });

  const list = allCharacters.filter(i => i.category === learnCategory && i.set === learnSet);
  learnGrid.innerHTML = "";
  list.forEach(item => {
    const card = document.createElement("div");
    card.className = "kana-box";
    card.innerHTML = `<span class="kana-char">${item.character}</span><span class="kana-romaji">${item.romaji}</span>`;
    card.addEventListener("click", () => openCharModal(item));
    learnGrid.appendChild(card);
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

    const row = document.createElement("div");
    row.innerHTML = `<div class="char-row-title">${SET_LABELS[set]}</div>`;
    const wrap = document.createElement("div");
    wrap.className = "char-check-grid";

    items.forEach(item => {
      const key = `${item.category}|${item.character}`;
      const label = document.createElement("label");
      label.className = "char-label";

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = selectedChars.has(key);
      cb.addEventListener("change", () => {
        if (cb.checked) selectedChars.add(key);
        else selectedChars.delete(key);
        updateSelectedCount();
      });

      label.appendChild(cb);
      label.insertAdjacentHTML("beforeend", `<span>${item.character}</span> <small style="color:var(--text-muted)">${item.romaji}</small>`);
      wrap.appendChild(label);
    });

    row.appendChild(wrap);
    setupCharGroups.appendChild(row);
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

function startQuiz(pool, mode) {
  currentMode = mode;
  sessionQueue = shuffle(pool);
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

function buildChoices(field) {
  const others = allCharacters.filter(c => c.category === currentItem.category && c[field] !== currentItem[field]);
  const wrong = shuffle(others).slice(0, 3).map(c => c[field]);
  const opts = shuffle([currentItem[field], ...wrong]);

  answerOptions.innerHTML = "";
  opts.forEach(val => {
    const b = document.createElement("button");
    b.className = "opt-btn";
    b.textContent = val;
    b.addEventListener("click", () => handleChoice(b, val === currentItem[field]));
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
    quizFeedback.textContent = "Jawaban Benar";
    quizFeedback.classList.add("correct");
  } else {
    wrongCount++;
    btn.classList.add("wrong");
    quizFeedback.textContent = `Kurang tepat. Jawaban: ${currentItem.character} = ${currentItem.romaji}`;
    quizFeedback.classList.add("wrong");
  }

  quizFeedback.classList.remove("hidden");
  quizScore.textContent = `Skor: ${score}`;
  quizNextBtn.disabled = false;
}

submitAnswerBtn.addEventListener("click", () => {
  if (hasAnswered) return;
  const val = answerInput.value.trim().toLowerCase();
  if (!val) return;
  hasAnswered = true;
  answerInput.disabled = true;
  submitAnswerBtn.disabled = true;

  if (val === currentItem.romaji.toLowerCase()) {
    score += 10;
    correctCount++;
    quizFeedback.textContent = "Jawaban Benar";
    quizFeedback.classList.add("correct");
  } else {
    wrongCount++;
    quizFeedback.textContent = `Kurang tepat. Jawaban: ${currentItem.romaji}`;
    quizFeedback.classList.add("wrong");
  }

  quizFeedback.classList.remove("hidden");
  quizScore.textContent = `Skor: ${score}`;
  quizNextBtn.disabled = false;
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

/* ===================== VOCABULARY (BACA MANDIRI) ===================== */
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
        openCharModal(item);
      });
      searchResults.appendChild(d);
    });
  }
  searchResults.classList.remove("hidden");
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-box")) searchResults.classList.add("hidden");
});

/* ===================== INIT ===================== */
async function init() {
  const ok = await loadData();
  if (ok) showView("home");
}

init();