/* =========================================================================
   NakamaGakkou - Alur Belajar Bertahap, Slow Elongated Japanese Audio & Engine
   ========================================================================= */

const SET_ORDER = ["seion", "dakuon", "handakuon", "youon"];
const SET_LABELS = { seion: "Seion", dakuon: "Dakuon", handakuon: "Handakuon", youon: "Yōon" };
const CATEGORY_LABELS = { hiragana: "Hiragana", katakana: "Katakana" };

const VOWEL_COLS = ["a", "i", "u", "e", "o"];
const YOON_COLS = ["a", "u", "o"];
const YOON_HEAD = ["ya", "yu", "yo"];

const STROKE_COLORS = [
  "#2563EB", // Goresan 1
  "#DC2626", // Goresan 2
  "#059669", // Goresan 3
  "#D97706", // Goresan 4
  "#7C3AED", // Goresan 5
  "#0891B2", // Goresan 6
  "#DB2777"  // Goresan 7+
];

function getStrokeColor(index) {
  return STROKE_COLORS[index % STROKE_COLORS.length];
}

/* ===================== DATASET DEFAULT ===================== */
const BUILTIN_CHARACTERS = [
  // Hiragana Seion
  { character: "あ", romaji: "a", group: "a", category: "hiragana", set: "seion" },
  { character: "い", romaji: "i", group: "a", category: "hiragana", set: "seion" },
  { character: "う", romaji: "u", group: "a", category: "hiragana", set: "seion" },
  { character: "え", romaji: "e", group: "a", category: "hiragana", set: "seion" },
  { character: "お", romaji: "o", group: "a", category: "hiragana", set: "seion" },

  { character: "か", romaji: "ka", group: "ka", category: "hiragana", set: "seion" },
  { character: "き", romaji: "ki", group: "ka", category: "hiragana", set: "seion" },
  { character: "く", romaji: "ku", group: "ka", category: "hiragana", set: "seion" },
  { character: "け", romaji: "ke", group: "ka", category: "hiragana", set: "seion" },
  { character: "こ", romaji: "ko", group: "ka", category: "hiragana", set: "seion" },

  { character: "さ", romaji: "sa", group: "sa", category: "hiragana", set: "seion" },
  { character: "し", romaji: "shi", group: "sa", category: "hiragana", set: "seion" },
  { character: "す", romaji: "su", group: "sa", category: "hiragana", set: "seion" },
  { character: "せ", romaji: "se", group: "sa", category: "hiragana", set: "seion" },
  { character: "そ", romaji: "so", group: "sa", category: "hiragana", set: "seion" },

  { character: "た", romaji: "ta", group: "ta", category: "hiragana", set: "seion" },
  { character: "ち", romaji: "chi", group: "ta", category: "hiragana", set: "seion" },
  { character: "つ", romaji: "tsu", group: "ta", category: "hiragana", set: "seion" },
  { character: "て", romaji: "te", group: "ta", category: "hiragana", set: "seion" },
  { character: "と", romaji: "to", group: "ta", category: "hiragana", set: "seion" },

  { character: "な", romaji: "na", group: "na", category: "hiragana", set: "seion" },
  { character: "に", romaji: "ni", group: "na", category: "hiragana", set: "seion" },
  { character: "ぬ", romaji: "nu", group: "na", category: "hiragana", set: "seion" },
  { character: "ね", romaji: "ne", group: "na", category: "hiragana", set: "seion" },
  { character: "no", romaji: "no", group: "na", category: "hiragana", set: "seion" }.character === "no" ? { character: "の", romaji: "no", group: "na", category: "hiragana", set: "seion" } : null,

  { character: "は", romaji: "ha", group: "ha", category: "hiragana", set: "seion" },
  { character: "ひ", romaji: "hi", group: "ha", category: "hiragana", set: "seion" },
  { character: "ふ", romaji: "fu", group: "ha", category: "hiragana", set: "seion" },
  { character: "へ", romaji: "he", group: "ha", category: "hiragana", set: "seion" },
  { character: "ほ", romaji: "ho", group: "ha", category: "hiragana", set: "seion" },

  { character: "ま", romaji: "ma", group: "ma", category: "hiragana", set: "seion" },
  { character: "み", romaji: "mi", group: "ma", category: "hiragana", set: "seion" },
  { character: "む", romaji: "mu", group: "ma", category: "hiragana", set: "seion" },
  { character: "め", romaji: "me", group: "ma", category: "hiragana", set: "seion" },
  { character: "も", romaji: "mo", group: "ma", category: "hiragana", set: "seion" },

  { character: "や", romaji: "ya", group: "ya", category: "hiragana", set: "seion" },
  { character: "ゆ", romaji: "yu", group: "ya", category: "hiragana", set: "seion" },
  { character: "よ", romaji: "yo", group: "ya", category: "hiragana", set: "seion" },

  { character: "ら", romaji: "ra", group: "ra", category: "hiragana", set: "seion" },
  { character: "り", romaji: "ri", group: "ra", category: "hiragana", set: "seion" },
  { character: "る", romaji: "ru", group: "ra", category: "hiragana", set: "seion" },
  { character: "れ", romaji: "re", group: "ra", category: "hiragana", set: "seion" },
  { character: "ろ", romaji: "ro", group: "ra", category: "hiragana", set: "seion" },

  { character: "わ", romaji: "wa", group: "wa", category: "hiragana", set: "seion" },
  { character: "を", romaji: "wo", group: "wa", category: "hiragana", set: "seion" },
  { character: "ん", romaji: "n", group: "wa", category: "hiragana", set: "seion" },

  // Hiragana Yoon
  { character: "きゃ", romaji: "kya", group: "kya", category: "hiragana", set: "youon" },
  { character: "きゅ", romaji: "kyu", group: "kya", category: "hiragana", set: "youon" },
  { character: "きょ", romaji: "kyo", group: "kya", category: "hiragana", set: "youon" },
  { character: "しゃ", romaji: "sha", group: "sha", category: "hiragana", set: "youon" },
  { character: "しゅ", romaji: "shu", group: "sha", category: "hiragana", set: "youon" },
  { character: "しょ", romaji: "sho", group: "sha", category: "hiragana", set: "youon" },

  // Katakana Seion
  { character: "ア", romaji: "a", group: "a", category: "katakana", set: "seion" },
  { character: "イ", romaji: "i", group: "a", category: "katakana", set: "seion" },
  { character: "ウ", romaji: "u", group: "a", category: "katakana", set: "seion" },
  { character: "エ", romaji: "e", group: "a", category: "katakana", set: "seion" },
  { character: "オ", romaji: "o", group: "a", category: "katakana", set: "seion" },
  { character: "カ", romaji: "ka", group: "ka", category: "katakana", set: "seion" },
  { character: "キ", romaji: "ki", group: "ka", category: "katakana", set: "seion" },
  { character: "ク", romaji: "ku", group: "ka", category: "katakana", set: "seion" },
  { character: "ケ", romaji: "ke", group: "ka", category: "katakana", set: "seion" },
  { character: "コ", romaji: "ko", group: "ka", category: "katakana", set: "seion" },
  { character: "サ", romaji: "sa", group: "sa", category: "katakana", set: "seion" },
  { character: "シ", romaji: "shi", group: "sa", category: "katakana", set: "seion" },
  { character: "ス", romaji: "su", group: "sa", category: "katakana", set: "seion" },
  { character: "セ", romaji: "se", group: "sa", category: "katakana", set: "seion" },
  { character: "ソ", romaji: "so", group: "sa", category: "katakana", set: "seion" },
  { character: "タ", romaji: "ta", group: "ta", category: "katakana", set: "seion" },
  { character: "チ", romaji: "chi", group: "ta", category: "katakana", set: "seion" },
  { character: "ツ", romaji: "tsu", group: "ta", category: "katakana", set: "seion" },
  { character: "テ", romaji: "te", group: "ta", category: "katakana", set: "seion" },
  { character: "ト", romaji: "to", group: "ta", category: "katakana", set: "seion" },
  { character: "ナ", romaji: "na", group: "na", category: "katakana", set: "seion" },
  { character: "ニ", romaji: "ni", group: "na", category: "katakana", set: "seion" },
  { character: "ヌ", romaji: "nu", group: "na", category: "katakana", set: "seion" },
  { character: "ネ", romaji: "ne", group: "na", category: "katakana", set: "seion" },
  { character: "ノ", romaji: "no", group: "na", category: "katakana", set: "seion" },

  // Katakana Yoon
  { character: "キャ", romaji: "kya", group: "kya", category: "katakana", set: "youon" },
  { character: "キュ", romaji: "kyu", group: "kya", category: "katakana", set: "youon" },
  { character: "キョ", romaji: "kyo", group: "kya", category: "katakana", set: "youon" }
].filter(Boolean);

const BUILTIN_VOCAB = [
  { word: "あめ", romaji: "ame", meaning: "Hujan / Permen", type: "hiragana" },
  { word: "あさ", romaji: "asa", meaning: "Pagi", type: "hiragana" },
  { word: "いぬ", romaji: "inu", meaning: "Anjing", type: "hiragana" },
  { word: "ねこ", romaji: "neko", meaning: "Kucing", type: "hiragana" },
  { word: "さくら", romaji: "sakura", meaning: "Bunga Sakura", type: "hiragana" },
  { word: "やま", romaji: "yama", meaning: "Gunung", type: "hiragana" },
  { word: "うみ", romaji: "umi", meaning: "Laut", type: "hiragana" },
  { word: "ほし", romaji: "hoshi", meaning: "Bintang", type: "hiragana" },
  { word: "くるま", romaji: "kuruma", meaning: "Mobil", type: "hiragana" },
  { word: "パン", romaji: "pan", meaning: "Roti", type: "katakana" },
  { word: "アイス", romaji: "aisu", meaning: "Es Krim", type: "katakana" },
  { word: "カメラ", romaji: "kamera", meaning: "Kamera", type: "katakana" },
  { word: "テレビ", romaji: "terebi", meaning: "Televisi", type: "katakana" },
  { word: "ノート", romaji: "nooto", meaning: "Buku Catatan", type: "katakana" },
  { word: "コップ", romaji: "koppu", meaning: "Gelas", type: "katakana" }
];

/* ===================== STATE ===================== */
let allCharacters = [];
let allVocabularies = [];

let learnCategory = "hiragana";
let learnSet = "seion";

let setupCategory = "hiragana";
let selectedChars = new Set();

let activeQuizPool = [];
let sessionQueue = [];
let currentIndex = 0;
let score = 0;
let correctCount = 0;
let currentMode = "h2r";
let currentItem = null;
let hasAnswered = false;

let vocabList = [];
let vocabIndex = 0;
let vocabFilter = "all";

let currentCharModal = null;
let currentStepStrokeIdx = 0;

let canvasEl = null;
let canvasCtx = null;
let isDrawing = false;

/* ===================== LOAD DATA ===================== */
async function loadData() {
  try {
    const res = await fetch("data/japanese.json");
    if (!res.ok) throw new Error("Gagal load data/japanese.json");
    const appData = await res.json();

    allCharacters = [];
    ["hiragana", "katakana"].forEach(cat => {
      if (!appData[cat]) return;
      SET_ORDER.forEach(set => {
        (appData[cat][set] || []).forEach(item => {
          allCharacters.push({ ...item, category: cat, set });
        });
      });
    });

    allVocabularies = (appData.vocabulary && appData.vocabulary.length)
      ? appData.vocabulary
      : [...BUILTIN_VOCAB];
  } catch (err) {
    allCharacters = [...BUILTIN_CHARACTERS];
    allVocabularies = [...BUILTIN_VOCAB];
  }

  // Centang default baris 'a' Hiragana seion
  allCharacters
    .filter(c => c.category === "hiragana" && c.set === "seion" && c.group === "a")
    .forEach(c => selectedChars.add(`${c.category}|${c.character}`));
}

/* =========================================================================
   NATURAL & ELONGATED JAPANESE AUDIO ENGINE (SUARA LAMBAT & PANJANG "AAA~")
   ========================================================================= */
let bestJapaneseVoice = null;
let currentAudioObj = null;
const audioBufferCache = new Map();

function selectBestJapaneseVoice() {
  if (!("speechSynthesis" in window)) return;
  const voices = window.speechSynthesis.getVoices();
  const jaVoices = voices.filter(v => v.lang && (v.lang.includes("ja") || v.lang.includes("JP")));
  if (!jaVoices.length) return;

  const rankVoice = (v) => {
    const name = v.name.toLowerCase();
    let score = 0;
    if (name.includes("natural") || name.includes("neural") || name.includes("online")) score += 100;
    if (name.includes("nanami") || name.includes("keita") || name.includes("aoi") || name.includes("mayu")) score += 85;
    if (name.includes("google") && name.includes("日本語")) score += 75;
    if (name.includes("siri") || name.includes("kyoko") || name.includes("otoya")) score += 65;
    if (name.includes("haruka") || name.includes("ayumi") || name.includes("ichiro")) score += 45;
    if (!v.localService) score += 20;
    return score;
  };

  jaVoices.sort((a, b) => rankVoice(b) - rankVoice(a));
  bestJapaneseVoice = jaVoices[0];

  const badge = document.getElementById("voiceStatusBadge");
  if (badge && bestJapaneseVoice) {
    badge.innerHTML = `<span>🔊 JP Natural</span>`;
    badge.title = `Suara aktif: ${bestJapaneseVoice.name}`;
  }
}

if ("speechSynthesis" in window) {
  selectBestJapaneseVoice();
  window.speechSynthesis.onvoiceschanged = selectBestJapaneseVoice;
}

function findRomajiForKana(text) {
  const found = allCharacters.find(c => c.character === text);
  if (!found) return null;
  const mapRomaji = {
    "shi": "shi", "chi": "chi", "tsu": "tsu", "fu": "fu", "wo": "o"
  };
  return mapRomaji[found.romaji] || found.romaji;
}

function makeElongatedKana(text) {
  const clean = text === "を" ? "お" : text.trim();
  const isSingleKanaOrYoon = allCharacters.some(c => c.character === text);
  if (!isSingleKanaOrYoon) return clean;
  if (clean === "ん" || clean === "ン") return "んー";
  return `${clean}ー。`;
}

function tryPlayHumanKanaAudio(romaji) {
  return new Promise((resolve) => {
    if (!romaji) return resolve(false);

    const sources = [
      `audio/${romaji}.mp3`,
      `data/audio/${romaji}.mp3`,
      `https://cdn.jsdelivr.net/gh/imos/japanese-kana-audio@master/mp3/${romaji}.mp3`
    ];

    const MP3_SLOW_RATE = 0.78;

    let idx = 0;
    const tryNext = () => {
      if (idx >= sources.length) return resolve(false);
      const url = sources[idx++];

      if (audioBufferCache.has(url)) {
        const cachedAudio = audioBufferCache.get(url);
        cachedAudio.currentTime = 0;
        cachedAudio.preservesPitch = true;
        cachedAudio.playbackRate = MP3_SLOW_RATE;
        currentAudioObj = cachedAudio;
        cachedAudio.play().then(() => resolve(true)).catch(() => tryNext());
        return;
      }

      const audio = new Audio(url);
      audio.preload = "auto";
      audio.oncanplaythrough = () => {
        audio.preservesPitch = true;
        audio.playbackRate = MP3_SLOW_RATE;
        audioBufferCache.set(url, audio);
        currentAudioObj = audio;
        audio.play().then(() => resolve(true)).catch(() => tryNext());
      };
      audio.onerror = () => tryNext();
    };

    tryNext();
  });
}

async function speak(text, triggerBtn = null) {
  if (!text) return;

  if (triggerBtn) {
    triggerBtn.classList.add("is-speaking");
    setTimeout(() => triggerBtn.classList.remove("is-speaking"), 900);
  }

  if (currentAudioObj) {
    currentAudioObj.pause();
    currentAudioObj.currentTime = 0;
  }
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }

  if (!("speechSynthesis" in window)) return;
  if (!bestJapaneseVoice) selectBestJapaneseVoice();

  const spokenText = makeElongatedKana(text);
  const ut = new SpeechSynthesisUtterance(spokenText);
  ut.lang = "ja-JP";
  if (bestJapaneseVoice) ut.voice = bestJapaneseVoice;

  const isSingleChar = allCharacters.some(c => c.character === text);
  ut.rate = isSingleChar ? 0.68 : 0.80;
  ut.pitch = 1.05;
  ut.volume = 1.0;

  window.speechSynthesis.speak(ut);
}

/* ===================== ROUTING ===================== */
function showView(viewId, opts = {}) {
  // Pastikan timer GAME dihentikan ketika pengguna meninggalkan halaman game
  if (typeof stopNkGameTimer === "function" && viewId !== "game") {
    stopNkGameTimer();
  }

  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  const target = document.getElementById("view-" + viewId);
  if (target) target.classList.add("active");

  const navTarget = (viewId === "quiz" || viewId === "result") ? "quiz-setup" : viewId;
  document.querySelectorAll(".side-nav-btn, .mob-nav-item").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.view === navTarget);
  });

  if (viewId === "learn") {
    if (opts.category) learnCategory = opts.category;
    if (opts.set) learnSet = opts.set;
    renderLearn();
  }
  if (viewId === "quiz-setup") renderSetup();
  if (viewId === "vocab-read") initVocabReading();
  if (viewId === "game") openNkGameLobby();

  window.scrollTo(0, 0);
}

document.querySelectorAll("[data-view]").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    showView(btn.dataset.view, { category: btn.dataset.category, set: btn.dataset.set });
  });
});

/* ===================== TABEL GOJUON ===================== */
function colsFor(set) { return set === "youon" ? YOON_COLS : VOWEL_COLS; }
function headFor(set) { return set === "youon" ? YOON_HEAD : VOWEL_COLS; }

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
  head.innerHTML = `<span></span>` + cols.map(c => `<span>${c}</span>`).join("");
  return head;
}

function renderLearn() {
  document.getElementById("learnTitle").textContent = CATEGORY_LABELS[learnCategory];
  document.getElementById("learnSub").textContent = `${SET_LABELS[learnSet]} — Klik huruf untuk mendengar pelafalan & membuka panduan goresan`;

  document.querySelectorAll("#learnScriptToggle .tab-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.category === learnCategory);
  });
  document.querySelectorAll("#subsetTabs .sub-tab").forEach(b => {
    b.classList.toggle("active", b.dataset.set === learnSet);
  });

  const learnGrid = document.getElementById("learnGrid");
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
      const isYouon = c.set === "youon" || c.character.length > 1;
      box.className = `kana-box ${isYouon ? 'is-youon' : ''}`;
      box.innerHTML = `<span class="kana-char ${isYouon ? 'is-youon' : ''}">${c.character}</span><span class="kana-romaji">${c.romaji}</span>`;
      box.addEventListener("click", () => openKanaFlow(c));
      row.appendChild(box);
    });
    learnGrid.appendChild(row);
  });
}

document.querySelectorAll("#learnScriptToggle .tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    learnCategory = btn.dataset.category;
    renderLearn();
  });
});
document.querySelectorAll("#subsetTabs .sub-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    learnSet = btn.dataset.set;
    renderLearn();
  });
});

/* ===================== MODAL BERTAHAP ===================== */
const modalOverlay = document.getElementById("charModalOverlay");
const modalStep1 = document.getElementById("modalStep1");
const modalStep2 = document.getElementById("modalStep2");

function openKanaFlow(c) {
  currentCharModal = c;
  document.body.classList.add("modal-open");
  modalOverlay.classList.remove("hidden");
  showStep1(c);
}

function showStep1(c) {
  modalStep1.classList.remove("hidden");
  modalStep2.classList.add("hidden");

  const step1Char = document.getElementById("step1Char");
  step1Char.textContent = c.character;
  step1Char.classList.toggle("is-youon", c.character.length > 1);

  document.getElementById("step1Romaji").textContent = c.romaji;
  speak(c.character, document.getElementById("step1SoundBtn"));
}

function showStep2(c) {
  modalStep1.classList.add("hidden");
  modalStep2.classList.remove("hidden");

  document.getElementById("modalMainChar").textContent = c.character;
  document.getElementById("modalMainRomaji").textContent = c.romaji;

  updateLeftColumnStripAndRow(c);
  loadAndInjectSvg(c);

  setTimeout(initCanvasDrawing, 50);
}

function closeAllKanaModals() {
  document.body.classList.remove("modal-open");
  modalOverlay.classList.add("hidden");
  modalStep1.classList.add("hidden");
  modalStep2.classList.add("hidden");
  clearUserCanvas();
}

document.getElementById("step1SoundBtn").addEventListener("click", (e) => {
  if (currentCharModal) speak(currentCharModal.character, e.currentTarget);
});
document.getElementById("step1NextBtn").addEventListener("click", () => {
  if (currentCharModal) showStep2(currentCharModal);
});
document.getElementById("step1BackBtn").addEventListener("click", closeAllKanaModals);
document.getElementById("modalCloseBtnStep1").addEventListener("click", closeAllKanaModals);
document.getElementById("modalBackToStep1Btn").addEventListener("click", () => {
  if (currentCharModal) showStep1(currentCharModal);
});
document.getElementById("modalCloseBtnStep2").addEventListener("click", closeAllKanaModals);

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeAllKanaModals();
});

/* ===================== CANVAS & ANIMASI GORESAN ===================== */
const SVG_NS = "http://www.w3.org/2000/svg";
const strokeSvgWrapper = document.getElementById("strokeSvgWrapper");
const noAnimationNotice = document.getElementById("noAnimationNotice");
const modalPlayStrokeBtn = document.getElementById("modalPlayStrokeBtn");
const modalNextStrokeBtn = document.getElementById("modalNextStrokeBtn");
const modalSpeedBtn = document.getElementById("modalSpeedBtn");
const clearCanvasBtn = document.getElementById("clearCanvasBtn");

let animToken = 0;
let strokeItems = [];
let penDot = null;
const SPEEDS = [1, 0.6, 1.6];
const SPEED_LABELS = ["1x", "Lambat", "Cepat"];
let speedIdx = 0;
let isAnimatingStroke = false;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function initCanvasDrawing() {
  canvasEl = document.getElementById("writingCanvas");
  if (!canvasEl) return;
  canvasCtx = canvasEl.getContext("2d");

  const rect = canvasEl.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvasEl.width = (rect.width || 310) * dpr;
  canvasEl.height = (rect.height || 310) * dpr;
  canvasCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

  clearUserCanvas();

  canvasEl.onmousedown = (e) => startDrawing(getPos(e));
  canvasEl.onmousemove = (e) => draw(getPos(e));
  window.onmouseup = () => stopDrawing();

  canvasEl.ontouchstart = (e) => {
    e.preventDefault();
    if (e.touches.length === 1) startDrawing(getTouchPos(e.touches[0]));
  };
  canvasEl.ontouchmove = (e) => {
    e.preventDefault();
    if (e.touches.length === 1) draw(getTouchPos(e.touches[0]));
  };
  window.ontouchend = () => stopDrawing();
}

function getPos(e) {
  const rect = canvasEl.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}
function getTouchPos(touch) {
  const rect = canvasEl.getBoundingClientRect();
  return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
}
function startDrawing(pos) {
  isDrawing = true;
  canvasCtx.beginPath();
  canvasCtx.moveTo(pos.x, pos.y);
  canvasCtx.lineCap = "round";
  canvasCtx.lineJoin = "round";
  canvasCtx.lineWidth = 14;
  canvasCtx.strokeStyle = "rgba(21, 128, 61, 0.85)";
}
function draw(pos) {
  if (!isDrawing) return;
  canvasCtx.lineTo(pos.x, pos.y);
  canvasCtx.stroke();
}
function stopDrawing() {
  if (!isDrawing) return;
  isDrawing = false;
  canvasCtx.closePath();
}
function clearUserCanvas() {
  if (!canvasCtx || !canvasEl) return;
  canvasCtx.save();
  canvasCtx.setTransform(1, 0, 0, 1, 0, 0);
  canvasCtx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  canvasCtx.restore();
}
if (clearCanvasBtn) clearCanvasBtn.addEventListener("click", clearUserCanvas);

function cleanKanjiVgSvg(svgText) {
  return svgText
    .replace(/<\?xml[\s\S]*?\?>/gi, "")
    .replace(/<!DOCTYPE[\s\S]*?\]>/gi, "")
    .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
    .trim();
}

async function fetchCleanSvg(singleChar, category) {
  const code = singleChar.charCodeAt(0).toString(16).padStart(5, "0");
  const localPaths = [
    `data/svg/${code}.svg`,
    `svg/${code}.svg`,
    `${category}/${singleChar}.svg`,
    `data/${category}/${singleChar}.svg`
  ];

  for (const path of localPaths) {
    try {
      const res = await fetch(path);
      if (res.ok) return cleanKanjiVgSvg(await res.text());
    } catch (_) {}
  }

  const res = await fetch(`https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg/kanji/${code}.svg`);
  if (!res.ok) throw new Error("Gagal load SVG: " + code);
  return cleanKanjiVgSvg(await res.text());
}

function parseStrokePaths(svgText) {
  const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
  const ds = Array.from(doc.querySelectorAll("path")).map(p => p.getAttribute("d")).filter(Boolean);
  if (!ds.length) throw new Error("Goresan kosong");
  return ds;
}

function mk(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

function buildStrokeSvg(partsPaths) {
  strokeSvgWrapper.innerHTML = "";
  strokeItems = [];

  const layouts = partsPaths.length === 1
    ? [{ s: 1, tx: 0, ty: 0 }]
    : [{ s: 0.66, tx: -3, ty: 18 }, { s: 0.48, tx: 57, ty: 36 }];

  const svg = mk("svg", { viewBox: "0 0 109 109" });
  const gAnim = mk("g");
  const gBadge = mk("g");
  svg.append(gAnim, gBadge);

  let n = 0;
  partsPaths.forEach((ds, pi) => {
    const L = layouts[pi];
    const tf = `translate(${L.tx} ${L.ty}) scale(${L.s})`;
    const animG = mk("g", { transform: tf });
    gAnim.appendChild(animG);

    ds.forEach(d => {
      const sw = (5 / L.s).toFixed(2);
      const path = mk("path", { d, class: "stroke-anim" });
      path.style.setProperty("--sw", sw);
      path.style.stroke = getStrokeColor(n);
      animG.appendChild(path);

      strokeItems.push({ path, L, color: getStrokeColor(n), number: n + 1 });
      n++;
    });
  });

  strokeSvgWrapper.appendChild(svg);

  strokeItems.forEach(it => {
    it.len = it.path.getTotalLength();
    it.path.style.strokeDasharray = it.len;
    it.path.style.strokeDashoffset = it.len;
    it.path.style.opacity = 0;

    const p0 = it.path.getPointAtLength(0);
    const x = p0.x * it.L.s + it.L.tx;
    const y = p0.y * it.L.s + it.L.ty;

    const badge = mk("g", { class: "stroke-badge" });
    badge.appendChild(mk("circle", { cx: x, cy: y, r: 4.8, fill: it.color }));
    const t = mk("text", { x, y: y + 0.4, class: "badge-num", "text-anchor": "middle", "dominant-baseline": "central" });
    t.textContent = it.number;
    badge.appendChild(t);
    badge.style.opacity = 0;
    gBadge.appendChild(badge);
    it.badge = badge;
  });

  penDot = mk("circle", { r: 3.4, class: "pen-dot" });
  penDot.style.opacity = 0;
  svg.appendChild(penDot);
}

function renderStrokeLegend(count) {
  const container = document.getElementById("modalLegendPills");
  if (!container) return;
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = "stroke-legend-pill";
    pill.title = `Putar goresan ${i + 1}`;
    pill.innerHTML = `<span class="dot" style="background-color:${getStrokeColor(i)}"></span> Goresan ${i + 1}`;
    pill.addEventListener("click", () => playSingleAt(i));
    container.appendChild(pill);
  }
}

function showUpTo(k) {
  strokeItems.forEach((it, i) => {
    const done = i < k;
    it.path.style.opacity = done ? 1 : 0;
    it.path.style.strokeDashoffset = done ? 0 : it.len;
    it.badge.style.opacity = done ? 1 : 0;
  });
  if (penDot) penDot.style.opacity = 0;
}

function drawStroke(i, token) {
  return new Promise(resolve => {
    const it = strokeItems[i];
    if (!it) return resolve(false);
    it.badge.style.opacity = 1;
    it.path.style.opacity = 1;
    penDot.style.opacity = 1;

    const dur = (420 + it.len * 9) / SPEEDS[speedIdx];
    const t0 = performance.now();

    function frame(now) {
      if (token !== animToken || modalStep2.classList.contains("hidden")) return resolve(false);
      const p = Math.min(1, (now - t0) / dur);
      const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      it.path.style.strokeDashoffset = it.len * (1 - e);

      const pt = it.path.getPointAtLength(it.len * e);
      penDot.setAttribute("cx", pt.x * it.L.s + it.L.tx);
      penDot.setAttribute("cy", pt.y * it.L.s + it.L.ty);

      if (p < 1) requestAnimationFrame(frame);
      else resolve(true);
    }
    requestAnimationFrame(frame);
  });
}

async function animateStrokeOrder() {
  if (!strokeItems.length) return;
  const token = ++animToken;
  showUpTo(0);
  isAnimatingStroke = true;
  currentStepStrokeIdx = 0;
  await sleep(250);

  for (let i = 0; i < strokeItems.length; i++) {
    const ok = await drawStroke(i, token);
    if (!ok) return;
    currentStepStrokeIdx = i + 1;
    await sleep(240 / SPEEDS[speedIdx]);
  }
  if (token === animToken) {
    penDot.style.opacity = 0;
    isAnimatingStroke = false;
  }
}

async function playNextSingleStroke() {
  if (!strokeItems.length || isAnimatingStroke) return;
  if (currentStepStrokeIdx >= strokeItems.length) {
    showUpTo(0);
    currentStepStrokeIdx = 0;
  }
  const token = ++animToken;
  isAnimatingStroke = true;
  const ok = await drawStroke(currentStepStrokeIdx, token);
  if (ok) currentStepStrokeIdx++;
  if (token === animToken) {
    penDot.style.opacity = 0;
    isAnimatingStroke = false;
  }
}

async function playSingleAt(i) {
  if (!strokeItems.length) return;
  const token = ++animToken;
  showUpTo(i);
  isAnimatingStroke = true;
  const ok = await drawStroke(i, token);
  if (ok) currentStepStrokeIdx = i + 1;
  if (token === animToken) {
    penDot.style.opacity = 0;
    isAnimatingStroke = false;
  }
}

async function loadAndInjectSvg(c) {
  const myToken = ++animToken;
  strokeSvgWrapper.innerHTML = "";
  strokeItems = [];
  currentStepStrokeIdx = 0;
  isAnimatingStroke = false;
  renderStrokeLegend(0);
  clearUserCanvas();
  noAnimationNotice.classList.add("hidden");
  strokeSvgWrapper.classList.remove("hidden");

  const chars = Array.from(c.character);
  const isYouon = c.set === "youon" || chars.length > 1;

  const modalMainChar = document.getElementById("modalMainChar");
  if (modalMainChar) modalMainChar.classList.toggle("is-youon", isYouon);

  modalPlayStrokeBtn.disabled = true;
  modalNextStrokeBtn.disabled = true;
  strokeSvgWrapper.innerHTML = `<span class="stroke-loading">Memuat goresan...</span>`;

  try {
    const svgTexts = await Promise.all(chars.map(ch => fetchCleanSvg(ch, c.category)));
    if (myToken !== animToken) return;

    const parts = svgTexts.map(parseStrokePaths);
    buildStrokeSvg(parts);
    renderStrokeLegend(strokeItems.length);

    modalPlayStrokeBtn.disabled = false;
    modalNextStrokeBtn.disabled = false;
    animateStrokeOrder();
  } catch (err) {
    strokeSvgWrapper.innerHTML = `<span class="stroke-loading">Data goresan huruf ini belum tersedia</span>`;
  }
}

modalPlayStrokeBtn.addEventListener("click", () => animateStrokeOrder());
modalNextStrokeBtn.addEventListener("click", () => playNextSingleStroke());
if (modalSpeedBtn) {
  modalSpeedBtn.addEventListener("click", () => {
    speedIdx = (speedIdx + 1) % SPEEDS.length;
    modalSpeedBtn.querySelector("span").textContent = `Kecepatan: ${SPEED_LABELS[speedIdx]}`;
  });
}

function updateLeftColumnStripAndRow(c) {
  document.getElementById("stripTrace1").textContent = c.character;
  document.getElementById("stripTrace2").textContent = c.character;
  document.getElementById("stripTrace3").textContent = c.character;

  const groupContainer = document.getElementById("groupRowSelector");
  groupContainer.innerHTML = "";

  const sameGroupList = allCharacters.filter(it => it.category === c.category && it.set === c.set && it.group === c.group);

  sameGroupList.forEach(item => {
    const itemBtn = document.createElement("div");
    itemBtn.className = `group-kana-item ${item.character === c.character ? 'active' : ''}`;
    itemBtn.textContent = item.character;
    itemBtn.addEventListener("click", () => {
      currentCharModal = item;
      showStep1(item);
    });
    groupContainer.appendChild(itemBtn);
  });
}

document.getElementById("modalSoundBtn").addEventListener("click", (e) => {
  if (currentCharModal) speak(currentCharModal.character, e.currentTarget);
});

/* ===================== CHECKLIST LATIHAN KUIS ===================== */
function renderSetup() {
  document.querySelectorAll("#setupScriptToggle .tab-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.category === setupCategory);
  });
  const container = document.getElementById("setupCharGroups");
  container.innerHTML = "";

  SET_ORDER.forEach(set => {
    const items = allCharacters.filter(i => i.category === setupCategory && i.set === set);
    if (!items.length) return;

    const block = document.createElement("div");
    block.innerHTML = `<div style="font-size:0.9rem;font-weight:900;color:var(--ink);margin-bottom:8px;">${SET_LABELS[set]}</div>`;

    const chart = document.createElement("div");
    chart.className = "chart";
    chart.appendChild(chartHeader(set));

    buildChartRows(items, set).forEach(r => {
      const row = document.createElement("div");
      row.className = "chart-row";
      row.style.setProperty("--cols", r.cells.length);

      const real = r.cells.filter(Boolean);
      const keyOf = c => `${c.category}|${c.character}`;

      const rowBtn = document.createElement("button");
      rowBtn.type = "button";
      rowBtn.className = "chart-label";
      rowBtn.style.cursor = "pointer";
      rowBtn.textContent = r.label;
      row.appendChild(rowBtn);

      r.cells.forEach(c => {
        if (!c) {
          row.insertAdjacentHTML("beforeend", `<span class="kana-box kana-empty"></span>`);
          return;
        }
        const box = document.createElement("div");
        const isYouon = c.set === "youon" || c.character.length > 1;
        box.className = `kana-box ${isYouon ? 'is-youon' : ''}`;
        const isSelected = selectedChars.has(keyOf(c));
        box.style.border = "2px solid #000000";
        box.style.background = isSelected ? "var(--pastel-matcha)" : "var(--surface)";
        box.innerHTML = `<span class="kana-char ${isYouon ? 'is-youon' : ''}">${c.character}</span><span class="kana-romaji">${c.romaji}</span>`;
        box.addEventListener("click", () => {
          if (selectedChars.has(keyOf(c))) selectedChars.delete(keyOf(c));
          else selectedChars.add(keyOf(c));
          renderSetup();
        });
        row.appendChild(box);
      });

      rowBtn.addEventListener("click", () => {
        const all = real.every(c => selectedChars.has(keyOf(c)));
        real.forEach(c => (all ? selectedChars.delete(keyOf(c)) : selectedChars.add(keyOf(c))));
        renderSetup();
      });

      chart.appendChild(row);
    });

    block.appendChild(chart);
    container.appendChild(block);
  });

  const count = [...selectedChars].filter(k => k.startsWith(setupCategory + "|")).length;
  document.getElementById("selectedCount").textContent = `${count} dipilih`;
  document.getElementById("startQuizBtn").disabled = count === 0;

  const studyBtn = document.getElementById("startStudyBtn");
  if (studyBtn) studyBtn.disabled = count === 0;
}

document.querySelectorAll("#setupScriptToggle .tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    setupCategory = btn.dataset.category;
    renderSetup();
  });
});

document.getElementById("selectAllBtn").addEventListener("click", () => {
  allCharacters.filter(i => i.category === setupCategory).forEach(i => selectedChars.add(`${i.category}|${i.character}`));
  renderSetup();
});
document.getElementById("clearAllBtn").addEventListener("click", () => {
  [...selectedChars].filter(k => k.startsWith(setupCategory + "|")).forEach(k => selectedChars.delete(k));
  renderSetup();
});

const startStudyBtn = document.getElementById("startStudyBtn");
if (startStudyBtn) {
  startStudyBtn.addEventListener("click", () => {
    const chosen = allCharacters.filter(i => selectedChars.has(`${i.category}|${i.character}`) && i.category === setupCategory);
    if (!chosen.length) return;
    openKanaFlow(chosen[0]);
  });
}

function shuffle(arr) {
  const res = [...arr];
  for (let i = res.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [res[i], res[j]] = [res[j], res[i]];
  }
  return res;
}

/* =========================================================================
   KUIS LOGIC (GRID 2x2, OTOMATIS GANTI SOAL)
   ========================================================================= */
document.getElementById("startQuizBtn").addEventListener("click", () => {
  const chosen = allCharacters.filter(i => 
    selectedChars.has(`${i.category}|${i.character}`) && 
    i.category === setupCategory
  );

  if (!chosen.length) {
    alert("Silakan pilih minimal satu karakter terlebih dahulu.");
    return;
  }

  const modeVal = document.querySelector('input[name="quizMode"]:checked').value;

  if ((modeVal === "h2r" || modeVal === "r2h") && chosen.length < 2) {
    alert("Mode Pilihan Ganda membutuhkan minimal 2 karakter berbeda yang dicentang. Untuk 1 karakter, gunakan mode 'Mengetik Jawaban' atau centang karakter tambahan.");
    return;
  }

  startQuiz(chosen, modeVal);
});

function startQuiz(pool, mode) {
  currentMode = mode;
  activeQuizPool = [...pool];
  sessionQueue = shuffle(pool);
  currentIndex = 0;
  score = 0;
  correctCount = 0;
  showView("quiz");
  generateQuizItem();
}

function generateQuizItem() {
  hasAnswered = false;

  currentItem = sessionQueue[currentIndex];
  document.getElementById("quizCounter").textContent = `${currentIndex + 1} / ${sessionQueue.length}`;
  document.getElementById("quizScore").textContent = `Skor: ${score}`;
  document.getElementById("quizProgressFill").style.width = `${Math.round(((currentIndex + 1) / sessionQueue.length) * 100)}%`;

  const inputWrap = document.getElementById("answerInputWrap");
  const optionsWrap = document.getElementById("answerOptions");
  const quizKanaEl = document.getElementById("quizKana");
  const modeBadge = document.getElementById("quizModeBadge");

  if (currentMode === "type") {
    modeBadge.textContent = "Mengetik Jawaban";
    quizKanaEl.textContent = currentItem.character;
    quizKanaEl.classList.toggle("is-youon", currentItem.character.length > 1);

    inputWrap.classList.remove("hidden");
    optionsWrap.classList.add("hidden");
    const input = document.getElementById("answerInput");
    input.value = "";
    input.disabled = false;
    input.focus();
  } else if (currentMode === "r2h") {
    modeBadge.textContent = "Romaji \u2192 Kana";
    quizKanaEl.textContent = currentItem.romaji;
    quizKanaEl.classList.remove("is-youon");

    inputWrap.classList.add("hidden");
    optionsWrap.classList.remove("hidden");
    buildChoicesStrict("character");
  } else {
    modeBadge.textContent = "Kana \u2192 Romaji";
    quizKanaEl.textContent = currentItem.character;
    quizKanaEl.classList.toggle("is-youon", currentItem.character.length > 1);

    inputWrap.classList.add("hidden");
    optionsWrap.classList.remove("hidden");
    buildChoicesStrict("romaji");
  }
}

function buildChoicesStrict(field) {
  const wrap = document.getElementById("answerOptions");
  wrap.innerHTML = "";

  const distractorsPool = activeQuizPool.filter(item => item[field] !== currentItem[field]);

  const uniqueDistractors = [];
  const seenValues = new Set([currentItem[field]]);

  shuffle(distractorsPool).forEach(d => {
    if (!seenValues.has(d[field])) {
      seenValues.add(d[field]);
      uniqueDistractors.push(d);
    }
  });

  const chosenDistractors = uniqueDistractors.slice(0, 3);
  const finalOptions = shuffle([currentItem, ...chosenDistractors]);

  finalOptions.forEach(opt => {
    const box = document.createElement("div");
    box.className = "quiz-radio-option";
    box.dataset.val = opt[field];
    box.textContent = opt[field];

    box.addEventListener("click", () => handleChoice(box, opt[field] === currentItem[field]));
    wrap.appendChild(box);
  });
}

function handleChoice(selectedEl, isCorrect) {
  if (hasAnswered) return;
  hasAnswered = true;

  const target = currentMode === "r2h" ? currentItem.character : currentItem.romaji;

  document.querySelectorAll("#answerOptions .quiz-radio-option").forEach(el => {
    el.classList.add("disabled");
    if (el.dataset.val === target) {
      el.classList.add("correct");
    }
  });

  if (isCorrect) {
    score += 10;
    correctCount++;
    selectedEl.classList.add("correct");
    speak(currentItem.character);
  } else {
    selectedEl.classList.add("wrong");
  }

  document.getElementById("quizScore").textContent = `Skor: ${score}`;

  setTimeout(() => {
    currentIndex++;
    if (currentIndex >= sessionQueue.length) finishQuiz();
    else generateQuizItem();
  }, 850);
}

function checkTyped() {
  if (hasAnswered) return;
  const input = document.getElementById("answerInput");
  const val = input.value.trim().toLowerCase();
  if (!val) return;
  hasAnswered = true;
  input.disabled = true;

  if (val === currentItem.romaji.toLowerCase()) {
    score += 10;
    correctCount++;
    input.style.backgroundColor = "var(--c-correct-bg)";
    speak(currentItem.character);
  } else {
    input.style.backgroundColor = "var(--c-wrong-bg)";
  }

  document.getElementById("quizScore").textContent = `Skor: ${score}`;

  setTimeout(() => {
    input.style.backgroundColor = "";
    currentIndex++;
    if (currentIndex >= sessionQueue.length) finishQuiz();
    else generateQuizItem();
  }, 850);
}

document.getElementById("submitAnswerBtn").addEventListener("click", checkTyped);
document.getElementById("answerInput").addEventListener("keydown", e => { if (e.key === "Enter") checkTyped(); });

function finishQuiz() {
  const total = sessionQueue.length;
  const acc = Math.round((correctCount / total) * 100);
  document.getElementById("finalScore").textContent = `${correctCount} / ${total}`;
  document.getElementById("finalAccuracy").textContent = `Akurasi: ${acc}%`;
  showView("result");
}

document.getElementById("retrySameBtn").addEventListener("click", () => startQuiz(activeQuizPool, currentMode));
document.getElementById("backToSelectBtn").addEventListener("click", () => showView("quiz-setup"));

/* ===================== FLASHCARD KOSAKATA ===================== */
function initVocabReading() {
  let list = allVocabularies;
  if (vocabFilter !== "all") list = list.filter(v => v.type === vocabFilter);
  vocabList = shuffle(list);
  vocabIndex = 0;
  renderVocabCard();
}

function renderVocabCard() {
  if (!vocabList.length) return;
  const cur = vocabList[vocabIndex];
  document.getElementById("vocabCounterText").textContent = `Kata ${vocabIndex + 1} / ${vocabList.length}`;
  document.getElementById("vocabWordText").textContent = cur.word;
  document.getElementById("vocabRomajiText").textContent = cur.romaji;
  document.getElementById("vocabMeaningText").textContent = `Arti: ${cur.meaning}`;

  document.getElementById("vocabAnswerBox").classList.remove("revealed");
  document.getElementById("vocabRevealBtn").classList.remove("hidden");
  document.getElementById("vocabNextCardBtn").classList.add("hidden");
}

document.getElementById("vocabRevealBtn").addEventListener("click", () => {
  document.getElementById("vocabAnswerBox").classList.add("revealed");
  document.getElementById("vocabRevealBtn").classList.add("hidden");
  document.getElementById("vocabNextCardBtn").classList.remove("hidden");
  speak(vocabList[vocabIndex].word, document.getElementById("vocabAudioBtn"));
});
document.getElementById("vocabNextCardBtn").addEventListener("click", () => {
  vocabIndex = (vocabIndex + 1) % vocabList.length;
  renderVocabCard();
});
document.getElementById("vocabAudioBtn").addEventListener("click", (e) => {
  if (vocabList[vocabIndex]) speak(vocabList[vocabIndex].word, e.currentTarget);
});

document.querySelectorAll("#vocabCategoryFilter .tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#vocabCategoryFilter .tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    vocabFilter = btn.dataset.type;
    initVocabReading();
  });
});

/* ===================== PENCARIAN ===================== */
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) { searchResults.classList.add("hidden"); return; }
  const matches = allCharacters.filter(c => c.romaji.includes(q) || c.character === q).slice(0, 6);
  searchResults.innerHTML = "";
  if (!matches.length) {
    searchResults.innerHTML = `<div style="padding:8px;font-size:0.85rem;font-weight:700;color:var(--dim)">Tidak ada hasil</div>`;
  } else {
    matches.forEach(item => {
      const d = document.createElement("div");
      d.className = "search-item";
      d.innerHTML = `<span><strong>${item.character}</strong> (${item.romaji})</span> <small>${CATEGORY_LABELS[item.category]}</small>`;
      d.addEventListener("click", () => {
        searchResults.classList.add("hidden");
        searchInput.value = "";
        openKanaFlow(item);
      });
      searchResults.appendChild(d);
    });
  }
  searchResults.classList.remove("hidden");
});

document.addEventListener("click", e => {
  if (!e.target.closest(".search-box")) searchResults.classList.add("hidden");
});

/* =========================================================================
   FITUR BARU: GAME ENGINE (6 PERMAINAN INTERAKTIF KANA)
   ========================================================================= */
const NK_GAME_TITLES = {
  guess: "Tebak Huruf",
  memory: "Memory Match",
  speed: "Kana Speed Challenge",
  scramble: "Susun Huruf",
  find: "Cari Huruf",
  sound: "Tebak Suara"
};

let nkGameScript = "hiragana"; // hiragana | katakana | mixed
let nkGameDiff = "easy";       // easy | normal | hard
let nkActiveGameType = null;
let nkGameTimerId = null;
let nkGameTimeLeft = 0;

let nkGameScore = 0;
let nkGameStep = 0;
let nkGameTotalSteps = 10;
let nkGameCorrectCount = 0;
let nkGameLocked = false;
let nkGamePool = [];
let nkGameQuestions = [];

function stopNkGameTimer() {
  if (nkGameTimerId) {
    clearInterval(nkGameTimerId);
    nkGameTimerId = null;
  }
}

function getNkBestScores() {
  try {
    return JSON.parse(localStorage.getItem("nk_kana_game_best") || "{}");
  } catch (_) {
    return {};
  }
}

function saveNkBestScore(gameType, newScore) {
  const bests = getNkBestScores();
  if (!bests[gameType] || newScore > bests[gameType]) {
    bests[gameType] = newScore;
    try {
      localStorage.setItem("nk_kana_game_best", JSON.stringify(bests));
    } catch (_) {}
  }
  updateNkLobbyBestBadges();
}

function updateNkLobbyBestBadges() {
  const bests = getNkBestScores();
  let totalBest = 0;
  Object.keys(NK_GAME_TITLES).forEach(key => {
    const val = bests[key] || 0;
    if (val > totalBest) totalBest = val;
    const el = document.getElementById(`nkBest-${key}`);
    if (el) el.textContent = `Skor Terbaik: ${val}`;
  });
  const topBadge = document.getElementById("nkBestScoreBadge");
  if (topBadge) topBadge.textContent = `🏆 Skor Terbaik: ${totalBest}`;
}

function openNkGameLobby() {
  stopNkGameTimer();
  updateNkLobbyBestBadges();
  document.getElementById("nkGameLobby").classList.remove("hidden");
  document.getElementById("nkGameStage").classList.add("hidden");
  document.getElementById("nkGameResult").classList.add("hidden");
}

function buildNkFilteredCharPool() {
  let pool = allCharacters.filter(c => {
    if (nkGameScript === "mixed") return true;
    return c.category === nkGameScript;
  });

  if (nkGameDiff === "easy") {
    const easyGroups = ["a", "ka", "sa", "ta", "na"];
    const filtered = pool.filter(c => c.set === "seion" && easyGroups.includes(c.group));
    if (filtered.length >= 6) pool = filtered;
  } else if (nkGameDiff === "normal") {
    const filtered = pool.filter(c => c.set === "seion");
    if (filtered.length >= 6) pool = filtered;
  }
  return pool.length >= 4 ? pool : [...allCharacters];
}

function buildNkFilteredVocabPool() {
  let vPool = [...allVocabularies, ...BUILTIN_VOCAB];
  // Hilangkan duplikat kata
  const seen = new Set();
  vPool = vPool.filter(v => {
    if (!v || !v.word || seen.has(v.word)) return false;
    seen.add(v.word);
    return true;
  });

  if (nkGameScript !== "mixed") {
    const byType = vPool.filter(v => v.type === nkGameScript);
    if (byType.length >= 4) vPool = byType;
  }
  return vPool;
}

function showNkFeedback(message, isCorrect) {
  const banner = document.getElementById("nkGameFeedbackBanner");
  banner.textContent = message;
  banner.className = `nk-game-feedback ${isCorrect ? "is-correct" : "is-wrong"}`;
  banner.classList.remove("hidden");
}

function hideNkFeedback() {
  const banner = document.getElementById("nkGameFeedbackBanner");
  if (banner) banner.classList.add("hidden");
}

function updateNkTopHUD(progressLabel, progressPercent) {
  document.getElementById("nkGameActiveTitle").textContent = NK_GAME_TITLES[nkActiveGameType] || "Game";
  document.getElementById("nkGameProgressText").textContent = progressLabel;
  document.getElementById("nkGameProgressBar").style.width = `${Math.max(0, Math.min(100, progressPercent))}%`;
  document.getElementById("nkGameScoreBadge").textContent = `Skor: ${nkGameScore}`;
}

function startNkGame(gameType) {
  stopNkGameTimer();
  nkActiveGameType = gameType;
  nkGameScore = 0;
  nkGameStep = 0;
  nkGameCorrectCount = 0;
  nkGameLocked = false;
  nkGamePool = buildNkFilteredCharPool();

  document.getElementById("nkGameLobby").classList.add("hidden");
  document.getElementById("nkGameResult").classList.add("hidden");
  document.getElementById("nkGameStage").classList.remove("hidden");
  document.getElementById("nkGameTimerBadge").classList.add("hidden");
  document.getElementById("nkGameNextStepBtn").classList.add("hidden");
  hideNkFeedback();

  if (gameType === "guess") initNkGuessGame();
  else if (gameType === "memory") initNkMemoryGame();
  else if (gameType === "speed") initNkSpeedGame();
  else if (gameType === "scramble") initNkScrambleGame();
  else if (gameType === "find") initNkFindGame();
  else if (gameType === "sound") initNkSoundGame();
}

function finishNkGame(detailSummaryText) {
  stopNkGameTimer();
  saveNkBestScore(nkActiveGameType, nkGameScore);

  document.getElementById("nkGameStage").classList.add("hidden");
  document.getElementById("nkGameResult").classList.remove("hidden");

  document.getElementById("nkResultTitle").textContent = `Hasil ${NK_GAME_TITLES[nkActiveGameType]}`;
  document.getElementById("nkResultScore").textContent = `Skor: ${nkGameScore}`;
  document.getElementById("nkResultDetail").textContent = detailSummaryText;
}

/* --- GAME 1: TEBAK HURUF --- */
function initNkGuessGame() {
  nkGameTotalSteps = nkGameDiff === "easy" ? 8 : (nkGameDiff === "normal" ? 12 : 16);
  nkGameQuestions = [];
  for (let i = 0; i < nkGameTotalSteps; i++) {
    const shuffled = shuffle(nkGamePool);
    nkGameQuestions.push(shuffled[0]);
  }
  renderNkGuessStep();
}

function renderNkGuessStep() {
  nkGameLocked = false;
  hideNkFeedback();
  document.getElementById("nkGameNextStepBtn").classList.add("hidden");

  const target = nkGameQuestions[nkGameStep];
  const pct = Math.round(((nkGameStep + 1) / nkGameTotalSteps) * 100);
  updateNkTopHUD(`Soal ${nkGameStep + 1} / ${nkGameTotalSteps}`, pct);

  const distractors = shuffle(nkGamePool.filter(c => c.romaji !== target.romaji))
    .filter((v, idx, arr) => arr.findIndex(x => x.romaji === v.romaji) === idx)
    .slice(0, 3);
  const options = shuffle([target, ...distractors]);

  const board = document.getElementById("nkGameBoard");
  board.innerHTML = `
    <div class="quiz-split-layout">
      <div class="quiz-left-panel">
        <div class="quiz-mode-pill">Pilih Bacaan Romaji yang Tepat</div>
        <div class="quiz-options-grid-2x2" id="nkGuessOptions"></div>
      </div>
      <div class="quiz-right-panel">
        <div class="char-display-canvas-box ${target.character.length > 1 ? "is-youon" : ""}">${target.character}</div>
      </div>
    </div>
  `;

  const optWrap = document.getElementById("nkGuessOptions");
  options.forEach(opt => {
    const btn = document.createElement("div");
    btn.className = "quiz-radio-option";
    btn.textContent = opt.romaji;
    btn.addEventListener("click", () => {
      if (nkGameLocked) return;
      nkGameLocked = true;

      const isOk = opt.romaji === target.romaji;
      optWrap.querySelectorAll(".quiz-radio-option").forEach(el => {
        el.classList.add("disabled");
        if (el.textContent === target.romaji) el.classList.add("correct");
      });

      if (isOk) {
        nkGameScore += 10;
        nkGameCorrectCount++;
        btn.classList.add("correct");
        speak(target.character);
        showNkFeedback(`Benar! ${target.character} dibaca "${target.romaji}". (+10 Poin)`, true);
      } else {
        btn.classList.add("wrong");
        showNkFeedback(`Kurang tepat! ${target.character} dibaca "${target.romaji}".`, false);
      }

      updateNkTopHUD(`Soal ${nkGameStep + 1} / ${nkGameTotalSteps}`, pct);

      setTimeout(() => {
        nkGameStep++;
        if (nkGameStep >= nkGameTotalSteps) {
          const acc = Math.round((nkGameCorrectCount / nkGameTotalSteps) * 100);
          finishNkGame(`Jawaban Benar: ${nkGameCorrectCount} dari ${nkGameTotalSteps} (${acc}%)`);
        } else {
          renderNkGuessStep();
        }
      }, 950);
    });
    optWrap.appendChild(btn);
  });
}

/* --- GAME 2: MEMORY MATCH --- */
let nkMemoryFlipped = [];
let nkMemoryMatchedPairs = 0;
let nkMemoryTotalPairs = 6;
let nkMemoryMoves = 0;

function initNkMemoryGame() {
  nkMemoryTotalPairs = nkGameDiff === "easy" ? 4 : (nkGameDiff === "normal" ? 6 : 8);
  nkMemoryMatchedPairs = 0;
  nkMemoryMoves = 0;
  nkMemoryFlipped = [];
  nkGameLocked = false;

  const uniqueChars = [];
  const usedRomaji = new Set();
  shuffle(nkGamePool).forEach(c => {
    if (!usedRomaji.has(c.romaji) && uniqueChars.length < nkMemoryTotalPairs) {
      usedRomaji.add(c.romaji);
      uniqueChars.push(c);
    }
  });

  const deck = [];
  uniqueChars.forEach((c, idx) => {
    deck.push({ pairId: idx, label: c.character, kind: "Kana", audioChar: c.character });
    deck.push({ pairId: idx, label: c.romaji, kind: "Romaji", audioChar: c.character });
  });

  const shuffledDeck = shuffle(deck);
  updateNkTopHUD(`Pasangan: 0 / ${nkMemoryTotalPairs} (Langkah: 0)`, 0);

  const board = document.getElementById("nkGameBoard");
  board.innerHTML = `<div class="nk-memory-grid" id="nkMemoryGrid"></div>`;
  const grid = document.getElementById("nkMemoryGrid");

  shuffledDeck.forEach((cardData) => {
    const cardEl = document.createElement("button");
    cardEl.type = "button";
    cardEl.className = "nk-memory-card";
    cardEl.innerHTML = `<span>?</span><span class="nk-memory-sub">BUKA</span>`;

    cardEl.addEventListener("click", () => {
      if (nkGameLocked || cardEl.classList.contains("is-flipped") || cardEl.classList.contains("is-matched")) return;

      cardEl.classList.add("is-flipped");
      cardEl.innerHTML = `<span>${cardData.label}</span><span class="nk-memory-sub">${cardData.kind}</span>`;
      nkMemoryFlipped.push({ el: cardEl, data: cardData });

      if (nkMemoryFlipped.length === 2) {
        nkGameLocked = true;
        nkMemoryMoves++;
        const [first, second] = nkMemoryFlipped;

        if (first.data.pairId === second.data.pairId && first.data.kind !== second.data.kind) {
          first.el.classList.add("is-matched");
          second.el.classList.add("is-matched");
          nkMemoryMatchedPairs++;
          nkGameScore += 20;
          speak(first.data.audioChar);
          showNkFeedback(`Pasangan cocok! ${first.data.audioChar} = ${second.data.kind === "Romaji" ? second.data.label : first.data.label} (+20 Poin)`, true);
          nkMemoryFlipped = [];
          nkGameLocked = false;

          const pct = Math.round((nkMemoryMatchedPairs / nkMemoryTotalPairs) * 100);
          updateNkTopHUD(`Pasangan: ${nkMemoryMatchedPairs} / ${nkMemoryTotalPairs} (Langkah: ${nkMemoryMoves})`, pct);

          if (nkMemoryMatchedPairs >= nkMemoryTotalPairs) {
            setTimeout(() => {
              finishNkGame(`Semua ${nkMemoryTotalPairs} pasangan ditemukan dalam ${nkMemoryMoves} langkah!`);
            }, 700);
          }
        } else {
          first.el.classList.add("is-mismatch");
          second.el.classList.add("is-mismatch");
          const pct = Math.round((nkMemoryMatchedPairs / nkMemoryTotalPairs) * 100);
          updateNkTopHUD(`Pasangan: ${nkMemoryMatchedPairs} / ${nkMemoryTotalPairs} (Langkah: ${nkMemoryMoves})`, pct);

          setTimeout(() => {
            [first.el, second.el].forEach(el => {
              el.classList.remove("is-flipped", "is-mismatch");
              el.innerHTML = `<span>?</span><span class="nk-memory-sub">BUKA</span>`;
            });
            nkMemoryFlipped = [];
            nkGameLocked = false;
          }, 700);
        }
      }
    });

    grid.appendChild(cardEl);
  });
}

/* --- GAME 3: KANA SPEED CHALLENGE --- */
let nkSpeedAnswered = 0;

function initNkSpeedGame() {
  nkGameTimeLeft = nkGameDiff === "easy" ? 45 : (nkGameDiff === "normal" ? 35 : 25);
  const totalTime = nkGameTimeLeft;
  nkSpeedAnswered = 0;
  nkGameCorrectCount = 0;

  const timerBadge = document.getElementById("nkGameTimerBadge");
  timerBadge.classList.remove("hidden");
  timerBadge.textContent = `⏱️ ${nkGameTimeLeft}d`;

  updateNkTopHUD(`Terjawab: 0 Soal`, 100);
  renderNkSpeedQuestion();

  nkGameTimerId = setInterval(() => {
    nkGameTimeLeft--;
    timerBadge.textContent = `⏱️ ${nkGameTimeLeft}d`;
    const pct = Math.round((nkGameTimeLeft / totalTime) * 100);
    document.getElementById("nkGameProgressBar").style.width = `${Math.max(0, pct)}%`;

    if (nkGameTimeLeft <= 0) {
      stopNkGameTimer();
      finishNkGame(`Waktu Habis! Kamu menjawab benar ${nkGameCorrectCount} dari ${nkSpeedAnswered} soal.`);
    }
  }, 1000);
}

function renderNkSpeedQuestion() {
  nkGameLocked = false;
  const target = shuffle(nkGamePool)[0];
  const distractors = shuffle(nkGamePool.filter(c => c.romaji !== target.romaji))
    .filter((v, idx, arr) => arr.findIndex(x => x.romaji === v.romaji) === idx)
    .slice(0, 3);
  const options = shuffle([target, ...distractors]);

  const board = document.getElementById("nkGameBoard");
  board.innerHTML = `
    <div class="quiz-split-layout">
      <div class="quiz-left-panel">
        <div class="quiz-mode-pill">⚡ Jawab Secepat Mungkin!</div>
        <div class="quiz-options-grid-2x2" id="nkSpeedOptions"></div>
      </div>
      <div class="quiz-right-panel">
        <div class="char-display-canvas-box ${target.character.length > 1 ? "is-youon" : ""}">${target.character}</div>
      </div>
    </div>
  `;

  const optWrap = document.getElementById("nkSpeedOptions");
  options.forEach(opt => {
    const btn = document.createElement("div");
    btn.className = "quiz-radio-option";
    btn.textContent = opt.romaji;
    btn.addEventListener("click", () => {
      if (nkGameLocked || nkGameTimeLeft <= 0) return;
      nkGameLocked = true;
      nkSpeedAnswered++;

      if (opt.romaji === target.romaji) {
        nkGameScore += 15;
        nkGameCorrectCount++;
        btn.classList.add("correct");
        showNkFeedback(` Cepat & Tepat! ${target.character} = ${target.romaji} (+15 Poin)`, true);
      } else {
        nkGameScore = Math.max(0, nkGameScore - 5);
        btn.classList.add("wrong");
        showNkFeedback(`Melenceng! ${target.character} = ${target.romaji} (-5 Poin)`, false);
      }

      document.getElementById("nkGameScoreBadge").textContent = `Skor: ${nkGameScore}`;
      document.getElementById("nkGameProgressText").textContent = `Benar: ${nkGameCorrectCount} / ${nkSpeedAnswered}`;

      setTimeout(() => {
        if (nkGameTimeLeft > 0) renderNkSpeedQuestion();
      }, 260);
    });
    optWrap.appendChild(btn);
  });
}

/* --- GAME 4: SUSUN HURUF (WORD SCRAMBLE) --- */
let nkScrambleTarget = null;
let nkScramblePickedIndices = [];
let nkScrambleTiles = [];

function initNkScrambleGame() {
  const vPool = buildNkFilteredVocabPool();
  nkGameTotalSteps = Math.min(vPool.length, nkGameDiff === "easy" ? 5 : (nkGameDiff === "normal" ? 8 : 10));
  nkGameQuestions = shuffle(vPool).slice(0, nkGameTotalSteps);
  renderNkScrambleStep();
}

function renderNkScrambleStep() {
  nkGameLocked = false;
  hideNkFeedback();
  document.getElementById("nkGameNextStepBtn").classList.add("hidden");

  nkScrambleTarget = nkGameQuestions[nkGameStep];
  nkScramblePickedIndices = [];

  const pct = Math.round(((nkGameStep + 1) / nkGameTotalSteps) * 100);
  updateNkTopHUD(`Kata ${nkGameStep + 1} / ${nkGameTotalSteps}`, pct);

  const realChars = Array.from(nkScrambleTarget.word);
  const extraCount = nkGameDiff === "easy" ? 1 : (nkGameDiff === "normal" ? 2 : 3);
  const distractorChars = shuffle(nkGamePool)
    .map(c => c.character)
    .filter(ch => ch.length === 1 && !realChars.includes(ch))
    .slice(0, extraCount);

  nkScrambleTiles = shuffle([...realChars, ...distractorChars]);

  const board = document.getElementById("nkGameBoard");
  board.innerHTML = `
    <div class="nk-scramble-wrap">
      <div class="nk-scramble-clue-card">
        <div class="nk-scramble-meaning">Arti: "${nkScrambleTarget.meaning}"</div>
        <div class="nk-scramble-hint">Petunjuk Romaji: <strong>${nkScrambleTarget.romaji}</strong> (${realChars.length} huruf)</div>
      </div>

      <div class="nk-scramble-slots" id="nkScrambleSlots"></div>
      <div class="nk-scramble-pool" id="nkScramblePool"></div>

      <div style="display:flex;gap:10px;">
        <button type="button" class="btn btn-sm btn-secondary" id="nkScrambleClearBtn">Kosongkan Susunan</button>
        <button type="button" class="btn btn-sm btn-study" id="nkScrambleAudioBtn">🔊 Dengarkan Kata</button>
      </div>
    </div>
  `;

  document.getElementById("nkScrambleClearBtn").addEventListener("click", () => {
    if (nkGameLocked) return;
    nkScramblePickedIndices = [];
    updateNkScrambleUI();
  });

  document.getElementById("nkScrambleAudioBtn").addEventListener("click", (e) => {
    speak(nkScrambleTarget.word, e.currentTarget);
  });

  updateNkScrambleUI();
}

function updateNkScrambleUI() {
  const slotsEl = document.getElementById("nkScrambleSlots");
  const poolEl = document.getElementById("nkScramblePool");
  const targetLen = Array.from(nkScrambleTarget.word).length;

  slotsEl.innerHTML = "";
  nkScramblePickedIndices.forEach((tileIdx, pos) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "nk-tile-btn in-slot";
    b.textContent = nkScrambleTiles[tileIdx];
    b.addEventListener("click", () => {
      if (nkGameLocked) return;
      nkScramblePickedIndices.splice(pos, 1);
      updateNkScrambleUI();
    });
    slotsEl.appendChild(b);
  });

  poolEl.innerHTML = "";
  nkScrambleTiles.forEach((ch, idx) => {
    const isUsed = nkScramblePickedIndices.includes(idx);
    const b = document.createElement("button");
    b.type = "button";
    b.className = `nk-tile-btn ${isUsed ? "used-tile" : ""}`;
    b.textContent = ch;
    b.addEventListener("click", () => {
      if (nkGameLocked || isUsed || nkScramblePickedIndices.length >= targetLen) return;
      nkScramblePickedIndices.push(idx);
      updateNkScrambleUI();

      if (nkScramblePickedIndices.length === targetLen) {
        checkNkScrambleAnswer();
      }
    });
    poolEl.appendChild(b);
  });
}

function checkNkScrambleAnswer() {
  nkGameLocked = true;
  const formed = nkScramblePickedIndices.map(i => nkScrambleTiles[i]).join("");
  const isCorrect = formed === nkScrambleTarget.word;

  if (isCorrect) {
    nkGameScore += 20;
    nkGameCorrectCount++;
    speak(nkScrambleTarget.word);
    showNkFeedback(`Hebat! "${nkScrambleTarget.word}" (${nkScrambleTarget.romaji}) artinya ${nkScrambleTarget.meaning}. (+20 Poin)`, true);
  } else {
    showNkFeedback(`Susunan belum tepat. Jawaban yang benar: ${nkScrambleTarget.word} (${nkScrambleTarget.romaji}).`, false);
  }

  const pct = Math.round(((nkGameStep + 1) / nkGameTotalSteps) * 100);
  updateNkTopHUD(`Kata ${nkGameStep + 1} / ${nkGameTotalSteps}`, pct);

  setTimeout(() => {
    nkGameStep++;
    if (nkGameStep >= nkGameTotalSteps) {
      finishNkGame(`Kamu berhasil menyusun ${nkGameCorrectCount} dari ${nkGameTotalSteps} kosakata dengan benar!`);
    } else {
      renderNkScrambleStep();
    }
  }, 1250);
}

/* --- GAME 5: CARI HURUF (FIND KANA) --- */
let nkFindRemaining = 0;

function initNkFindGame() {
  nkGameTotalSteps = nkGameDiff === "easy" ? 5 : (nkGameDiff === "normal" ? 7 : 10);
  nkGameQuestions = [];
  for (let i = 0; i < nkGameTotalSteps; i++) {
    nkGameQuestions.push(shuffle(nkGamePool)[0]);
  }
  renderNkFindRound();
}

function renderNkFindRound() {
  nkGameLocked = false;
  hideNkFeedback();

  const target = nkGameQuestions[nkGameStep];
  const totalCells = nkGameDiff === "easy" ? 12 : (nkGameDiff === "normal" ? 16 : 20);
  const targetCount = nkGameDiff === "easy" ? 3 : 4;
  nkFindRemaining = targetCount;

  const pct = Math.round(((nkGameStep + 1) / nkGameTotalSteps) * 100);
  updateNkTopHUD(`Ronde ${nkGameStep + 1} / ${nkGameTotalSteps}`, pct);

  const others = nkGamePool.filter(c => c.character !== target.character);
  const cellsData = [];
  for (let i = 0; i < targetCount; i++) cellsData.push(target);
  for (let i = targetCount; i < totalCells; i++) {
    cellsData.push(shuffle(others)[0]);
  }

  const shuffledCells = shuffle(cellsData);

  const board = document.getElementById("nkGameBoard");
  board.innerHTML = `
    <div class="nk-find-header-box">
      <div class="nk-find-target-Prompt">
        <span>Cari semua huruf berbunyi:</span>
        <strong class="nk-find-big-romaji">${target.romaji}</strong>
      </div>
      <span class="neo-badge bg-surface" id="nkFindCounterBadge">Tersisa: ${nkFindRemaining}</span>
    </div>
    <div class="nk-find-grid" id="nkFindGrid"></div>
  `;

  const grid = document.getElementById("nkFindGrid");
  shuffledCells.forEach(item => {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "nk-find-cell";
    cell.textContent = item.character;

    cell.addEventListener("click", () => {
      if (nkGameLocked || cell.disabled) return;

      if (item.character === target.character) {
        cell.disabled = true;
        cell.classList.add("found-ok");
        nkFindRemaining--;
        nkGameScore += 10;
        speak(target.character);

        document.getElementById("nkFindCounterBadge").textContent = `Tersisa: ${nkFindRemaining}`;
        document.getElementById("nkGameScoreBadge").textContent = `Skor: ${nkGameScore}`;

        if (nkFindRemaining <= 0) {
          nkGameLocked = true;
          nkGameCorrectCount++;
          showNkFeedback(`Mantap! Semua huruf "${target.character}" (${target.romaji}) sudah ditemukan!`, true);
          setTimeout(() => {
            nkGameStep++;
            if (nkGameStep >= nkGameTotalSteps) {
              finishNkGame(`Kamu menyelesaikan seluruh ${nkGameTotalSteps} ronde pencarian huruf!`);
            } else {
              renderNkFindRound();
            }
          }, 900);
        }
      } else {
        cell.disabled = true;
        cell.classList.add("found-err");
        nkGameScore = Math.max(0, nkGameScore - 5);
        document.getElementById("nkGameScoreBadge").textContent = `Skor: ${nkGameScore}`;
        showNkFeedback(`Itu huruf ${item.character} (${item.romaji}). Cari huruf yang dibaca "${target.romaji}"! (-5 Poin)`, false);
      }
    });

    grid.appendChild(cell);
  });
}

/* --- GAME 6: TEBAK SUARA (AUDIO LISTENING) --- */
function initNkSoundGame() {
  nkGameTotalSteps = nkGameDiff === "easy" ? 8 : (nkGameDiff === "normal" ? 10 : 14);
  nkGameQuestions = [];
  for (let i = 0; i < nkGameTotalSteps; i++) {
    nkGameQuestions.push(shuffle(nkGamePool)[0]);
  }
  renderNkSoundStep();
}

function renderNkSoundStep() {
  nkGameLocked = false;
  hideNkFeedback();

  const target = nkGameQuestions[nkGameStep];
  const pct = Math.round(((nkGameStep + 1) / nkGameTotalSteps) * 100);
  updateNkTopHUD(`Suara ${nkGameStep + 1} / ${nkGameTotalSteps}`, pct);

  const distractors = shuffle(nkGamePool.filter(c => c.romaji !== target.romaji && c.character !== target.character))
    .filter((v, idx, arr) => arr.findIndex(x => x.character === v.character) === idx)
    .slice(0, 3);
  const options = shuffle([target, ...distractors]);

  const board = document.getElementById("nkGameBoard");
  board.innerHTML = `
    <div class="quiz-split-layout">
      <div class="quiz-left-panel">
        <div class="quiz-mode-pill">🔊 Dengarkan Suara &amp; Pilih Hurufnya</div>
        <div class="quiz-options-grid-2x2" id="nkSoundOptions"></div>
      </div>
      <div class="quiz-right-panel">
        <button type="button" class="nk-sound-hero-btn" id="nkPlayPromptSoundBtn">
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
          <span>Putar Suara</span>
        </button>
      </div>
    </div>
  `;

  const soundBtn = document.getElementById("nkPlayPromptSoundBtn");
  soundBtn.addEventListener("click", () => speak(target.character, soundBtn));

  // Putar otomatis saat soal muncul
  setTimeout(() => speak(target.character, soundBtn), 150);

  const optWrap = document.getElementById("nkSoundOptions");
  options.forEach(opt => {
    const btn = document.createElement("div");
    btn.className = "quiz-radio-option";
    btn.textContent = opt.character;

    btn.addEventListener("click", () => {
      if (nkGameLocked) return;
      nkGameLocked = true;

      const isOk = opt.character === target.character;
      optWrap.querySelectorAll(".quiz-radio-option").forEach(el => {
        el.classList.add("disabled");
        if (el.textContent === target.character) el.classList.add("correct");
      });

      if (isOk) {
        nkGameScore += 15;
        nkGameCorrectCount++;
        btn.classList.add("correct");
        speak(target.character);
        showNkFeedback(`Tepat sekali! Suara tadi adalah "${target.character}" (${target.romaji}). (+15 Poin)`, true);
      } else {
        btn.classList.add("wrong");
        showNkFeedback(`Salah pilih! Suara tadi adalah "${target.character}" (${target.romaji}).`, false);
      }

      updateNkTopHUD(`Suara ${nkGameStep + 1} / ${nkGameTotalSteps}`, pct);

      setTimeout(() => {
        nkGameStep++;
        if (nkGameStep >= nkGameTotalSteps) {
          const acc = Math.round((nkGameCorrectCount / nkGameTotalSteps) * 100);
          finishNkGame(`Pendengaranmu menjawab benar ${nkGameCorrectCount} dari ${nkGameTotalSteps} soal (${acc}%)!`);
        } else {
          renderNkSoundStep();
        }
      }, 950);
    });

    optWrap.appendChild(btn);
  });
}

/* --- EVENT LISTENERS KONTROL GAME --- */
document.querySelectorAll("#nkGameScriptToggle .tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#nkGameScriptToggle .tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    nkGameScript = btn.dataset.script;
  });
});

document.querySelectorAll("#nkGameDiffToggle .tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#nkGameDiffToggle .tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    nkGameDiff = btn.dataset.diff;
  });
});

document.querySelectorAll("[data-start-game]").forEach(btn => {
  btn.addEventListener("click", () => {
    startNkGame(btn.dataset.startGame);
  });
});

document.getElementById("nkGameBackLobbyBtn").addEventListener("click", openNkGameLobby);
document.getElementById("nkGameRestartNowBtn").addEventListener("click", () => {
  if (nkActiveGameType) startNkGame(nkActiveGameType);
});
document.getElementById("nkResultRetryBtn").addEventListener("click", () => {
  if (nkActiveGameType) startNkGame(nkActiveGameType);
});
document.getElementById("nkResultLobbyBtn").addEventListener("click", openNkGameLobby);

/* ===================== INISIALISASI ===================== */
async function init() {
  await loadData();
  updateNkLobbyBestBadges();
  showView("home");
}

init();