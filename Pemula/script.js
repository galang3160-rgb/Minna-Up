/* =========================================================================
   NakamaGakkou — Neo-Brutalist 3D Kana Dojo (Refined Motion & Performance)
   ========================================================================= */

const SET_ORDER = ["seion", "dakuon", "handakuon", "youon"];
const SET_LABELS = { seion: "Seion", dakuon: "Dakuon", handakuon: "Handakuon", youon: "Yōon" };
const CATEGORY_LABELS = { hiragana: "Hiragana", katakana: "Katakana" };

const VOWEL_COLS = ["a", "i", "u", "e", "o"];
const YOON_COLS = ["a", "u", "o"];
const YOON_HEAD = ["ya", "yu", "yo"];

const STROKE_COLORS = [
  "#38BDF8", "#FB7185", "#4ADE80", "#FBBF24", "#C084FC", "#2DD4BF", "#F472B6"
];

function getStrokeColor(index) {
  return STROKE_COLORS[index % STROKE_COLORS.length];
}

function debounce(fn, wait = 120) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

/* ===================== NAVBAR SHRINK ON SCROLL (PASSIVE + RAF) ===================== */
const fixedTopbar = document.getElementById("fixedTopbar");
if (fixedTopbar) {
  let scrollTicking = false;
  const updateTopbarScroll = () => {
    fixedTopbar.classList.toggle("is-scrolled", window.scrollY > 18);
    scrollTicking = false;
  };
  window.addEventListener("scroll", () => {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(updateTopbarScroll);
    }
  }, { passive: true });
  updateTopbarScroll();
}

/* ===================== TEMA & AUDIO POP RINGAN ===================== */
let popAudioCtx = null;
function playPopSound(freqStart = 580, freqEnd = 290) {
  try {
    if (!popAudioCtx) popAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (popAudioCtx.state === "suspended") popAudioCtx.resume();
    const osc = popAudioCtx.createOscillator();
    const gain = popAudioCtx.createGain();
    osc.type = "sine";
    const now = popAudioCtx.currentTime;
    osc.frequency.setValueAtTime(freqStart, now);
    osc.frequency.exponentialRampToValueAtTime(freqEnd, now + 0.08);
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(popAudioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  } catch (_) {}
}

function initTheme() {
  const savedTheme = localStorage.getItem("nakama_theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("nakama_theme", next);
  playPopSound();
}

initTheme();
const themeToggleBtn = document.getElementById("themeToggleBtn");
if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", toggleTheme);
}

/* ===================== TRANSISI KELUAR KE WEB UTAMA (SINKRON) ===================== */
const pageTransition = document.getElementById("pageTransition");
const ptLabel = document.getElementById("ptLabel");
let isNavigatingOut = false;
let navOutTimer = null;

function restoreFromCache() {
  clearTimeout(navOutTimer);
  isNavigatingOut = false;
  document.body.classList.remove("page-leaving");
  pageTransition?.classList.remove("active");
}

window.addEventListener("pageshow", restoreFromCache);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") restoreFromCache();
});

function smoothExitToMain(targetUrl, labelText = "Menu Utama") {
  if (!targetUrl || isNavigatingOut) return;
  isNavigatingOut = true;
  clearTimeout(navOutTimer);
  playPopSound(520, 280);

  if (pageTransition) {
    if (ptLabel) ptLabel.textContent = labelText;
    pageTransition.classList.add("active");
  }
  document.body.classList.add("page-leaving");

  navOutTimer = setTimeout(() => {
    window.location.href = encodeURI(targetUrl);
    setTimeout(restoreFromCache, 600);
  }, 240);
}

["backToMainWebBtn", "brandHomeLink"].forEach(id => {
  const el = document.getElementById(id);
  el?.addEventListener("click", (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    smoothExitToMain(el.getAttribute("href"), "Menu Utama");
  });
});

/* ===================== DATASET BAWAAN (FALLBACK) ===================== */
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
  { character: "の", romaji: "no", group: "na", category: "hiragana", set: "seion" },
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

  // Hiragana Dakuon & Handakuon
  { character: "が", romaji: "ga", group: "ga", category: "hiragana", set: "dakuon" },
  { character: "ぎ", romaji: "gi", group: "ga", category: "hiragana", set: "dakuon" },
  { character: "ぐ", romaji: "gu", group: "ga", category: "hiragana", set: "dakuon" },
  { character: "げ", romaji: "ge", group: "ga", category: "hiragana", set: "dakuon" },
  { character: "ご", romaji: "go", group: "ga", category: "hiragana", set: "dakuon" },
  { character: "ざ", romaji: "za", group: "za", category: "hiragana", set: "dakuon" },
  { character: "じ", romaji: "ji", group: "za", category: "hiragana", set: "dakuon" },
  { character: "ず", romaji: "zu", group: "za", category: "hiragana", set: "dakuon" },
  { character: "ぜ", romaji: "ze", group: "za", category: "hiragana", set: "dakuon" },
  { character: "ぞ", romaji: "zo", group: "za", category: "hiragana", set: "dakuon" },
  { character: "だ", romaji: "da", group: "da", category: "hiragana", set: "dakuon" },
  { character: "ぢ", romaji: "ji", group: "da", category: "hiragana", set: "dakuon" },
  { character: "づ", romaji: "zu", group: "da", category: "hiragana", set: "dakuon" },
  { character: "で", romaji: "de", group: "da", category: "hiragana", set: "dakuon" },
  { character: "ど", romaji: "do", group: "da", category: "hiragana", set: "dakuon" },
  { character: "ば", romaji: "ba", group: "ba", category: "hiragana", set: "dakuon" },
  { character: "び", romaji: "bi", group: "ba", category: "hiragana", set: "dakuon" },
  { character: "ぶ", romaji: "bu", group: "ba", category: "hiragana", set: "dakuon" },
  { character: "べ", romaji: "be", group: "ba", category: "hiragana", set: "dakuon" },
  { character: "ぼ", romaji: "bo", group: "ba", category: "hiragana", set: "dakuon" },
  { character: "ぱ", romaji: "pa", group: "pa", category: "hiragana", set: "handakuon" },
  { character: "ぴ", romaji: "pi", group: "pa", category: "hiragana", set: "handakuon" },
  { character: "ぷ", romaji: "pu", group: "pa", category: "hiragana", set: "handakuon" },
  { character: "ぺ", romaji: "pe", group: "pa", category: "hiragana", set: "handakuon" },
  { character: "ぽ", romaji: "po", group: "pa", category: "hiragana", set: "handakuon" },

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
  { character: "ハ", romaji: "ha", group: "ha", category: "katakana", set: "seion" },
  { character: "ヒ", romaji: "hi", group: "ha", category: "katakana", set: "seion" },
  { character: "フ", romaji: "fu", group: "ha", category: "katakana", set: "seion" },
  { character: "ヘ", romaji: "he", group: "ha", category: "katakana", set: "seion" },
  { character: "ホ", romaji: "ho", group: "ha", category: "katakana", set: "seion" },
  { character: "マ", romaji: "ma", group: "ma", category: "katakana", set: "seion" },
  { character: "ミ", romaji: "mi", group: "ma", category: "katakana", set: "seion" },
  { character: "ム", romaji: "mu", group: "ma", category: "katakana", set: "seion" },
  { character: "メ", romaji: "me", group: "ma", category: "katakana", set: "seion" },
  { character: "モ", romaji: "mo", group: "ma", category: "katakana", set: "seion" },
  { character: "ヤ", romaji: "ya", group: "ya", category: "katakana", set: "seion" },
  { character: "ユ", romaji: "yu", group: "ya", category: "katakana", set: "seion" },
  { character: "ヨ", romaji: "yo", group: "ya", category: "katakana", set: "seion" },
  { character: "ラ", romaji: "ra", group: "ra", category: "katakana", set: "seion" },
  { character: "リ", romaji: "ri", group: "ra", category: "katakana", set: "seion" },
  { character: "ル", romaji: "ru", group: "ra", category: "katakana", set: "seion" },
  { character: "レ", romaji: "re", group: "ra", category: "katakana", set: "seion" },
  { character: "ロ", romaji: "ro", group: "ra", category: "katakana", set: "seion" },
  { character: "ワ", romaji: "wa", group: "wa", category: "katakana", set: "seion" },
  { character: "ヲ", romaji: "wo", group: "wa", category: "katakana", set: "seion" },
  { character: "ン", romaji: "n", group: "wa", category: "katakana", set: "seion" },

  // Katakana Dakuon & Handakuon
  { character: "ガ", romaji: "ga", group: "ga", category: "katakana", set: "dakuon" },
  { character: "ギ", romaji: "gi", group: "ga", category: "katakana", set: "dakuon" },
  { character: "グ", romaji: "gu", group: "ga", category: "katakana", set: "dakuon" },
  { character: "ゲ", romaji: "ge", group: "ga", category: "katakana", set: "dakuon" },
  { character: "ゴ", romaji: "go", group: "ga", category: "katakana", set: "dakuon" },
  { character: "ザ", romaji: "za", group: "za", category: "katakana", set: "dakuon" },
  { character: "ジ", romaji: "ji", group: "za", category: "katakana", set: "dakuon" },
  { character: "ズ", romaji: "zu", group: "za", category: "katakana", set: "dakuon" },
  { character: "ゼ", romaji: "ze", group: "za", category: "katakana", set: "dakuon" },
  { character: "ゾ", romaji: "zo", group: "za", category: "katakana", set: "dakuon" },
  { character: "ダ", romaji: "da", group: "da", category: "katakana", set: "dakuon" },
  { character: "ヂ", romaji: "ji", group: "da", category: "katakana", set: "dakuon" },
  { character: "ヅ", romaji: "zu", group: "da", category: "katakana", set: "dakuon" },
  { character: "デ", romaji: "de", group: "da", category: "katakana", set: "dakuon" },
  { character: "ド", romaji: "do", group: "da", category: "katakana", set: "dakuon" },
  { character: "バ", romaji: "ba", group: "ba", category: "katakana", set: "dakuon" },
  { character: "ビ", romaji: "bi", group: "ba", category: "katakana", set: "dakuon" },
  { character: "ブ", romaji: "bu", group: "ba", category: "katakana", set: "dakuon" },
  { character: "ベ", romaji: "be", group: "ba", category: "katakana", set: "dakuon" },
  { character: "ボ", romaji: "bo", group: "ba", category: "katakana", set: "dakuon" },
  { character: "パ", romaji: "pa", group: "pa", category: "katakana", set: "handakuon" },
  { character: "ピ", romaji: "pi", group: "pa", category: "katakana", set: "handakuon" },
  { character: "プ", romaji: "pu", group: "pa", category: "katakana", set: "handakuon" },
  { character: "ペ", romaji: "pe", group: "pa", category: "katakana", set: "handakuon" },
  { character: "ポ", romaji: "po", group: "pa", category: "katakana", set: "handakuon" },

  // Katakana Yoon
  { character: "キャ", romaji: "kya", group: "kya", category: "katakana", set: "youon" },
  { character: "キュ", romaji: "kyu", group: "kya", category: "katakana", set: "youon" },
  { character: "キョ", romaji: "kyo", group: "kya", category: "katakana", set: "youon" }
];

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

/* ===================== STATE APLIKASI ===================== */
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
let vocabViewMode = "list";

let currentCharModal = null;
let preferStrokeStudio = false;
let currentStepStrokeIdx = 0;

let canvasEl = null;
let canvasCtx = null;
let canvasRect = null;
let canvasBound = false;
let isDrawing = false;

/* ===================== LOAD DATA ===================== */
async function loadData() {
  try {
    const res = await fetch("data/japanese.json");
    if (!res.ok) throw new Error("Fallback ke dataset bawaan");
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
  } catch (_) {
    allCharacters = [...BUILTIN_CHARACTERS];
    allVocabularies = [...BUILTIN_VOCAB];
  }

  allCharacters
    .filter(c => c.category === "hiragana" && c.set === "seion" && (c.group === "a" || c.group === "ka"))
    .forEach(c => selectedChars.add(`${c.category}|${c.character}`));
}

/* =========================================================================
   MESIN SUARA JEPANG NATIVE (DURASI PANJANG & VOKAL BULAT NATURAL)
   ========================================================================= */
let bestJapaneseVoice = null;

const VOWEL_EXTENSION_MAP = {
  a: "あ",
  i: "い",
  u: "う",
  e: "え",
  o: "お"
};

function selectBestJapaneseVoice() {
  if (!("speechSynthesis" in window)) return;
  const voices = window.speechSynthesis.getVoices();
  const jaVoices = voices.filter(v => v.lang && (v.lang.includes("ja") || v.lang.includes("JP")));
  if (!jaVoices.length) return;

  const rankVoice = (v) => {
    const name = v.name.toLowerCase();
    let s = 0;
    if (name.includes("natural") || name.includes("neural") || name.includes("online")) s += 120;
    if (name.includes("nanami") || name.includes("keita") || name.includes("aoi") || name.includes("mayu")) s += 95;
    if (name.includes("google") && name.includes("日本語")) s += 85;
    if (name.includes("kyoko") || name.includes("otoya") || name.includes("siri")) s += 75;
    if (!v.localService) s += 25;
    return s;
  };

  jaVoices.sort((a, b) => rankVoice(b) - rankVoice(a));
  bestJapaneseVoice = jaVoices[0];
}

if ("speechSynthesis" in window) {
  selectBestJapaneseVoice();
  window.speechSynthesis.onvoiceschanged = selectBestJapaneseVoice;
}

function buildNativeLongPhonetic(text) {
  const clean = text.trim();
  const charObj = allCharacters.find(c => c.character === clean);

  if (!charObj) {
    return `${clean}。`;
  }

  if (clean === "を" || clean === "ヲ") return "おー、お。";
  if (clean === "ん" || clean === "ン") return "んー、ん。";

  const lastVowel = charObj.romaji.slice(-1).toLowerCase();
  const vowelHira = VOWEL_EXTENSION_MAP[lastVowel] || "";

  return `${clean}${vowelHira}ー。`;
}

function speak(text, triggerBtn = null) {
  if (!text || !("speechSynthesis" in window)) return;

  if (triggerBtn) {
    triggerBtn.classList.add("is-speaking");
    setTimeout(() => triggerBtn.classList.remove("is-speaking"), 900);
  }

  window.speechSynthesis.cancel();
  if (!bestJapaneseVoice) selectBestJapaneseVoice();

  const isSingleChar = allCharacters.some(c => c.character === text.trim());
  const spokenText = buildNativeLongPhonetic(text);

  const ut = new SpeechSynthesisUtterance(spokenText);
  ut.lang = "ja-JP";
  if (bestJapaneseVoice) ut.voice = bestJapaneseVoice;

  ut.rate = isSingleChar ? 0.55 : 0.72;
  ut.pitch = 1.0;
  ut.volume = 1.0;

  window.speechSynthesis.speak(ut);
}

/* ===================== ROUTING MENU DENGAN ANIMASI BERARAH ===================== */
const VIEW_ORDER = {
  "learn": 0,
  "quiz": 1,
  "quiz-setup": 1.5,
  "result": 1.8,
  "vocab-read": 2
};

let currentViewId = "learn";
let isSwitchingView = false;

function showView(viewId, opts = {}) {
  const currentActive = document.querySelector(".view.active");
  const target = document.getElementById("view-" + viewId);
  if (!target) return;

  const activeNavKey = (viewId === "quiz" || viewId === "quiz-setup" || viewId === "result") ? "quiz" : viewId;
  document.querySelectorAll(".nav-link").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.view === activeNavKey);
  });

  const fromOrder = VIEW_ORDER[currentViewId] ?? 0;
  const toOrder = VIEW_ORDER[viewId] ?? 0;
  const direction = toOrder < fromOrder ? "back" : "forward";

  const activateTarget = (withEnterAnim = true) => {
    document.querySelectorAll(".view").forEach(v => {
      v.classList.remove("active", "enter-forward", "enter-back", "leave-forward", "leave-back");
    });

    target.classList.add("active");
    if (withEnterAnim) {
      target.classList.add(direction === "back" ? "enter-back" : "enter-forward");
    }
    currentViewId = viewId;

    if (viewId === "learn") {
      if (opts.category) learnCategory = opts.category;
      if (opts.set) learnSet = opts.set;
      renderLearn();
    } else if (viewId === "quiz") {
      ensureQuizStarted();
    } else if (viewId === "quiz-setup") {
      renderSetup();
    } else if (viewId === "vocab-read") {
      initVocabReading();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    isSwitchingView = false;
  };

  if (currentActive && currentActive !== target && !isSwitchingView) {
    isSwitchingView = true;
    playPopSound(direction === "forward" ? 620 : 480, direction === "forward" ? 340 : 260);
    currentActive.classList.remove("enter-forward", "enter-back", "leave-forward", "leave-back");
    currentActive.classList.add(direction === "back" ? "leave-back" : "leave-forward");
    setTimeout(() => activateTarget(true), 135);
  } else {
    activateTarget(opts.initial !== true);
  }
}

document.querySelectorAll("[data-view]").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    showView(btn.dataset.view, { category: btn.dataset.category, set: btn.dataset.set });
  });
});

/* ===================== 1. TABEL KANA ===================== */
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
  document.querySelectorAll("#learnScriptToggle .seg-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.category === learnCategory);
  });
  document.querySelectorAll("#subsetTabs .seg-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.set === learnSet);
  });

  const learnGrid = document.getElementById("learnGrid");
  if (!learnGrid) return;

  const items = allCharacters.filter(i => i.category === learnCategory && i.set === learnSet);
  const rows = buildChartRows(items, learnSet);

  const frag = document.createDocumentFragment();
  frag.appendChild(chartHeader(learnSet));

  let animIndex = 0;
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
      box.className = "kana-box";
      box.style.animationDelay = `${Math.min(animIndex * 8, 140)}ms`;
      animIndex++;

      box.innerHTML = `
        <span class="kana-char ${isYouon ? "is-youon" : ""}">${c.character}</span>
        <span class="kana-romaji">${c.romaji}</span>
      `;
      box.addEventListener("click", () => openKanaFlow(c));
      row.appendChild(box);
    });
    frag.appendChild(row);
  });

  learnGrid.className = "chart";
  learnGrid.innerHTML = "";
  learnGrid.appendChild(frag);
}

document.querySelectorAll("#learnScriptToggle .seg-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    playPopSound();
    learnCategory = btn.dataset.category;
    renderLearn();
  });
});

document.querySelectorAll("#subsetTabs .seg-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    playPopSound();
    learnSet = btn.dataset.set;
    renderLearn();
  });
});

/* Pencarian Karakter Kana (Debounced) */
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

if (searchInput && searchResults) {
  const handleKanaSearch = debounce(() => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) {
      searchResults.classList.add("hidden");
      return;
    }
    const matches = allCharacters.filter(c => c.romaji.includes(q) || c.character.includes(q)).slice(0, 8);
    searchResults.innerHTML = "";

    if (!matches.length) {
      searchResults.innerHTML = `<div class="search-item"><span>Tidak ada hasil</span></div>`;
    } else {
      const frag = document.createDocumentFragment();
      matches.forEach(item => {
        const d = document.createElement("div");
        d.className = "search-item";
        d.innerHTML = `<span><strong>${item.character}</strong> (${item.romaji})</span> <small>${CATEGORY_LABELS[item.category]}</small>`;
        d.addEventListener("click", () => {
          searchResults.classList.add("hidden");
          searchInput.value = "";
          openKanaFlow(item);
        });
        frag.appendChild(d);
      });
      searchResults.appendChild(frag);
    }
    searchResults.classList.remove("hidden");
  }, 100);

  searchInput.addEventListener("input", handleKanaSearch);

  document.addEventListener("click", e => {
    if (!e.target.closest(".search-box")) searchResults.classList.add("hidden");
  });
}

/* =========================================================================
   MODAL GORESAN & SUARA
   ========================================================================= */
const modalOverlay = document.getElementById("charModalOverlay");
const modalStep1 = document.getElementById("modalStep1");
const modalStep2 = document.getElementById("modalStep2");

function openKanaFlow(c) {
  currentCharModal = c;
  document.body.classList.add("modal-open");
  modalOverlay.classList.remove("hidden", "is-closing");

  if (preferStrokeStudio) {
    showStep2(c, true);
  } else {
    showStep1(c);
  }
}

function triggerCrossfade(el) {
  if (!el) return;
  el.classList.remove("fade-switch-enter");
  void el.offsetWidth;
  el.classList.add("fade-switch-enter");
}

function showStep1(c) {
  currentCharModal = c;
  modalStep1.classList.remove("hidden");
  modalStep2.classList.add("hidden");

  triggerCrossfade(document.getElementById("step1ContentGrid"));

  const step1Char = document.getElementById("step1Char");
  step1Char.textContent = c.character;
  step1Char.classList.toggle("is-youon", c.character.length > 1);

  document.getElementById("step1Romaji").textContent = c.romaji;
  speak(c.character, document.getElementById("step1SoundBtn"));
}

function showStep2(c, autoSpeak = false) {
  currentCharModal = c;
  preferStrokeStudio = true;
  modalStep1.classList.add("hidden");
  modalStep2.classList.remove("hidden");

  triggerCrossfade(document.getElementById("step2ContentGrid"));

  document.getElementById("modalMainChar").textContent = c.character;
  document.getElementById("modalMainRomaji").textContent = c.romaji;

  updateLeftColumnStripAndRow(c);
  loadAndInjectSvg(c);
  requestAnimationFrame(initCanvasDrawing);

  if (autoSpeak) {
    speak(c.character, document.getElementById("modalSoundBtn"));
  }
}

function navigateModalCharacter(direction) {
  if (!currentCharModal) return;
  const list = allCharacters.filter(
    it => it.category === currentCharModal.category && it.set === currentCharModal.set
  );
  if (!list.length) return;

  const idx = list.findIndex(it => it.character === currentCharModal.character);
  const nextIdx = (idx + direction + list.length) % list.length;
  const nextChar = list[nextIdx];

  const isStep2Active = !modalStep2.classList.contains("hidden");
  if (isStep2Active) {
    showStep2(nextChar, true);
  } else {
    showStep1(nextChar);
  }
}

function closeAllKanaModals() {
  if (modalOverlay.classList.contains("hidden")) return;
  modalOverlay.classList.add("is-closing");
  document.body.classList.remove("modal-open");

  setTimeout(() => {
    modalOverlay.classList.add("hidden");
    modalOverlay.classList.remove("is-closing");
    modalStep1.classList.add("hidden");
    modalStep2.classList.add("hidden");
    clearUserCanvas();
  }, 180);
}

document.getElementById("step1CharBox")?.addEventListener("click", () => {
  if (currentCharModal) speak(currentCharModal.character, document.getElementById("step1SoundBtn"));
});
document.getElementById("step1SoundBtn")?.addEventListener("click", (e) => {
  if (currentCharModal) speak(currentCharModal.character, e.currentTarget);
});
document.getElementById("step1NextBtn")?.addEventListener("click", () => {
  if (currentCharModal) showStep2(currentCharModal, false);
});
document.getElementById("step1BackBtn")?.addEventListener("click", closeAllKanaModals);
document.getElementById("modalCloseBtnStep1")?.addEventListener("click", closeAllKanaModals);
document.getElementById("modalBackToStep1Btn")?.addEventListener("click", () => {
  preferStrokeStudio = false;
  if (currentCharModal) showStep1(currentCharModal);
});
document.getElementById("modalCloseBtnStep2")?.addEventListener("click", closeAllKanaModals);

document.getElementById("step1PrevCharBtn")?.addEventListener("click", () => navigateModalCharacter(-1));
document.getElementById("step1NextCharBtn")?.addEventListener("click", () => navigateModalCharacter(1));
document.getElementById("step2PrevCharBtn")?.addEventListener("click", () => navigateModalCharacter(-1));
document.getElementById("step2NextCharBtn")?.addEventListener("click", () => navigateModalCharacter(1));

modalOverlay?.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeAllKanaModals();
});

/* Kanvas & Animasi SVG (Cached Rect, Zero Duplicate Listeners) */
const SVG_NS = "http://www.w3.org/2000/svg";
const strokeSvgWrapper = document.getElementById("strokeSvgWrapper");
const noAnimationNotice = document.getElementById("noAnimationNotice");
const noAnimChar = document.getElementById("noAnimChar");
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

  canvasRect = canvasEl.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvasEl.width = (canvasRect.width || 300) * dpr;
  canvasEl.height = (canvasRect.height || 300) * dpr;
  canvasCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

  clearUserCanvas();

  if (!canvasBound) {
    canvasBound = true;
    canvasEl.addEventListener("mousedown", (e) => {
      canvasRect = canvasEl.getBoundingClientRect();
      startDrawing(getPos(e));
    });
    canvasEl.addEventListener("mousemove", (e) => {
      if (isDrawing) draw(getPos(e));
    });
    window.addEventListener("mouseup", stopDrawing);

    canvasEl.addEventListener("touchstart", (e) => {
      e.preventDefault();
      if (e.touches.length === 1) {
        canvasRect = canvasEl.getBoundingClientRect();
        startDrawing(getTouchPos(e.touches[0]));
      }
    }, { passive: false });

    canvasEl.addEventListener("touchmove", (e) => {
      e.preventDefault();
      if (isDrawing && e.touches.length === 1) {
        draw(getTouchPos(e.touches[0]));
      }
    }, { passive: false });

    window.addEventListener("touchend", stopDrawing, { passive: true });
  }
}

function getPos(e) {
  return { x: e.clientX - canvasRect.left, y: e.clientY - canvasRect.top };
}
function getTouchPos(touch) {
  return { x: touch.clientX - canvasRect.left, y: touch.clientY - canvasRect.top };
}
function startDrawing(pos) {
  isDrawing = true;
  canvasCtx.beginPath();
  canvasCtx.moveTo(pos.x, pos.y);
  canvasCtx.lineCap = "round";
  canvasCtx.lineJoin = "round";
  canvasCtx.lineWidth = 14;
  canvasCtx.strokeStyle = "rgba(74, 222, 128, 0.85)";
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
clearCanvasBtn?.addEventListener("click", clearUserCanvas);

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
  if (!res.ok) throw new Error("Gagal memuat SVG");
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
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = "stroke-legend-pill";
    pill.innerHTML = `<span class="dot" style="background-color:${getStrokeColor(i)}"></span> Goresan ${i + 1}`;
    pill.addEventListener("click", () => playSingleAt(i));
    frag.appendChild(pill);
  }
  container.appendChild(frag);
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
  await sleep(160);

  for (let i = 0; i < strokeItems.length; i++) {
    const ok = await drawStroke(i, token);
    if (!ok) return;
    currentStepStrokeIdx = i + 1;
    await sleep(180 / SPEEDS[speedIdx]);
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
  noAnimationNotice?.classList.add("hidden");
  strokeSvgWrapper.classList.remove("hidden");

  const chars = Array.from(c.character);
  modalPlayStrokeBtn.disabled = true;
  modalNextStrokeBtn.disabled = true;
  strokeSvgWrapper.innerHTML = `<div class="stroke-skeleton" aria-label="Memuat goresan"></div>`;

  try {
    const svgTexts = await Promise.all(chars.map(ch => fetchCleanSvg(ch, c.category)));
    if (myToken !== animToken) return;

    const parts = svgTexts.map(parseStrokePaths);
    buildStrokeSvg(parts);
    renderStrokeLegend(strokeItems.length);

    modalPlayStrokeBtn.disabled = false;
    modalNextStrokeBtn.disabled = false;
    animateStrokeOrder();
  } catch (_) {
    if (myToken !== animToken) return;
    strokeSvgWrapper.innerHTML = "";
    strokeSvgWrapper.classList.add("hidden");
    if (noAnimChar) noAnimChar.textContent = c.character;
    noAnimationNotice?.classList.remove("hidden");
  }
}

modalPlayStrokeBtn?.addEventListener("click", () => animateStrokeOrder());
modalNextStrokeBtn?.addEventListener("click", () => playNextSingleStroke());
modalSpeedBtn?.addEventListener("click", () => {
  speedIdx = (speedIdx + 1) % SPEEDS.length;
  modalSpeedBtn.querySelector("span").textContent = `Kecepatan: ${SPEED_LABELS[speedIdx]}`;
});

function updateLeftColumnStripAndRow(c) {
  document.getElementById("stripTrace1").textContent = c.character;
  document.getElementById("stripTrace2").textContent = c.character;
  document.getElementById("stripTrace3").textContent = c.character;

  const groupContainer = document.getElementById("groupRowSelector");
  groupContainer.innerHTML = "";

  const sameGroupList = allCharacters.filter(
    it => it.category === c.category && it.set === c.set && it.group === c.group
  );

  const frag = document.createDocumentFragment();
  sameGroupList.forEach(item => {
    const itemBtn = document.createElement("div");
    itemBtn.className = `group-kana-item ${item.character === c.character ? "active" : ""}`;
    itemBtn.textContent = item.character;
    itemBtn.addEventListener("click", () => {
      showStep2(item, true);
    });
    frag.appendChild(itemBtn);
  });
  groupContainer.appendChild(frag);
}

document.getElementById("modalSoundBtn")?.addEventListener("click", (e) => {
  if (currentCharModal) speak(currentCharModal.character, e.currentTarget);
});

/* ===================== 2. KUIS & UPGRADED PILIHAN GANDA ===================== */
function shuffle(arr) {
  const res = [...arr];
  for (let i = res.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [res[i], res[j]] = [res[j], res[i]];
  }
  return res;
}

function getSelectedPool() {
  const chosen = allCharacters.filter(i => selectedChars.has(`${i.category}|${i.character}`));
  if (chosen.length >= 2) return chosen;
  return allCharacters.filter(i => i.category === "hiragana" && i.set === "seion" && (i.group === "a" || i.group === "ka"));
}

function ensureQuizStarted() {
  const pool = getSelectedPool();
  document.getElementById("activePoolCount").textContent = pool.length;
  startQuiz(pool, currentMode);
}

document.querySelectorAll("#quickModeSwitch .seg-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    playPopSound();
    document.querySelectorAll("#quickModeSwitch .seg-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentMode = btn.dataset.mode;
    startQuiz(getSelectedPool(), currentMode);
  });
});

document.getElementById("openSetupBtn")?.addEventListener("click", () => {
  showView("quiz-setup");
});

document.getElementById("quizKana")?.addEventListener("click", () => {
  if (currentItem && currentMode !== "r2h") {
    speak(currentItem.character);
  }
});

function renderSetup() {
  document.querySelectorAll("#setupScriptToggle .seg-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.category === setupCategory);
  });
  const container = document.getElementById("setupCharGroups");
  if (!container) return;

  const frag = document.createDocumentFragment();

  SET_ORDER.forEach(set => {
    const items = allCharacters.filter(i => i.category === setupCategory && i.set === set);
    if (!items.length) return;

    const block = document.createElement("div");
    block.innerHTML = `<div style="font-size:0.86rem;font-weight:900;color:var(--ink);margin-bottom:8px;">${SET_LABELS[set]}</div>`;

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
        const isSelected = selectedChars.has(keyOf(c));
        box.className = `kana-box ${isSelected ? "is-selected" : ""}`;
        box.innerHTML = `
          <span class="kana-char ${isYouon ? "is-youon" : ""}">${c.character}</span>
          <span class="kana-romaji">${c.romaji}</span>
        `;
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
    frag.appendChild(block);
  });

  container.innerHTML = "";
  container.appendChild(frag);

  const totalSelected = selectedChars.size;
  document.getElementById("selectedCount").textContent = `${totalSelected} dipilih`;
  document.getElementById("startQuizBtn").disabled = totalSelected === 0;
  document.getElementById("startStudyBtn").disabled = totalSelected === 0;
}

document.querySelectorAll("#setupScriptToggle .seg-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    playPopSound();
    setupCategory = btn.dataset.category;
    renderSetup();
  });
});

document.getElementById("selectAllBtn")?.addEventListener("click", () => {
  allCharacters.filter(i => i.category === setupCategory).forEach(i => selectedChars.add(`${i.category}|${i.character}`));
  renderSetup();
});

document.getElementById("clearAllBtn")?.addEventListener("click", () => {
  [...selectedChars].filter(k => k.startsWith(setupCategory + "|")).forEach(k => selectedChars.delete(k));
  renderSetup();
});

document.getElementById("startStudyBtn")?.addEventListener("click", () => {
  const chosen = allCharacters.filter(i => selectedChars.has(`${i.category}|${i.character}`));
  if (chosen.length) openKanaFlow(chosen[0]);
});

document.getElementById("startQuizBtn")?.addEventListener("click", () => {
  const chosen = allCharacters.filter(i => selectedChars.has(`${i.category}|${i.character}`));
  if (!chosen.length) return;
  showView("quiz");
});

function startQuiz(pool, mode) {
  currentMode = mode;
  activeQuizPool = [...pool];
  sessionQueue = shuffle(pool);
  currentIndex = 0;
  score = 0;
  correctCount = 0;
  document.getElementById("activePoolCount").textContent = activeQuizPool.length;
  generateQuizItem();
}

function generateQuizItem() {
  hasAnswered = false;
  currentItem = sessionQueue[currentIndex];
  if (!currentItem) return;

  document.getElementById("quizCounter").textContent = `${currentIndex + 1} / ${sessionQueue.length}`;
  document.getElementById("quizProgressFill").style.width = `${Math.round(((currentIndex + 1) / sessionQueue.length) * 100)}%`;

  const feedbackEl = document.getElementById("quizFeedback");
  if (feedbackEl) {
    feedbackEl.textContent = "";
    feedbackEl.className = "quiz-feedback";
  }

  const standardLayout = document.getElementById("quizStandardLayout");
  const flashcardLayout = document.getElementById("quizFlashcardLayout");
  const stateLabel = document.getElementById("quizStateLabel");
  const scoreBadge = document.getElementById("quizScore");
  const keyHint = document.getElementById("quizKeyHint");

  if (currentMode === "flashcard") {
    stateLabel.textContent = "Flashcard Kana";
    scoreBadge.classList.add("hidden");
    standardLayout.classList.add("hidden");
    flashcardLayout.classList.remove("hidden");
    renderQuizFlashcardItem();
    return;
  }

  stateLabel.textContent = "Sedang Mengerjakan";
  scoreBadge.classList.remove("hidden");
  scoreBadge.textContent = `Skor: ${score}`;
  standardLayout.classList.remove("hidden");
  flashcardLayout.classList.add("hidden");

  triggerCrossfade(standardLayout);

  const inputWrap = document.getElementById("answerInputWrap");
  const optionsWrap = document.getElementById("answerOptions");
  const quizKanaEl = document.getElementById("quizKana");
  const modeBadge = document.getElementById("quizModeBadge");

  if (currentMode === "type") {
    modeBadge.textContent = "Mengetik Jawaban";
    if (keyHint) keyHint.textContent = "Tekan Enter";
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
    if (keyHint) keyHint.textContent = "Tekan 1 - 4";
    quizKanaEl.textContent = currentItem.romaji;
    quizKanaEl.classList.remove("is-youon");

    inputWrap.classList.add("hidden");
    optionsWrap.classList.remove("hidden");
    buildChoicesStrict("character");
  } else {
    modeBadge.textContent = "Kana \u2192 Romaji";
    if (keyHint) keyHint.textContent = "Tekan 1 - 4";
    quizKanaEl.textContent = currentItem.character;
    quizKanaEl.classList.toggle("is-youon", currentItem.character.length > 1);

    inputWrap.classList.add("hidden");
    optionsWrap.classList.remove("hidden");
    buildChoicesStrict("romaji");
  }
}

/* Flashcard Kana */
const quizFlashcardCard = document.getElementById("quizFlashcardCard");
const quizFcFlipBtn = document.getElementById("quizFcFlipBtn");
const quizFcSoundBtn = document.getElementById("quizFcSoundBtn");
const quizFcPrevBtn = document.getElementById("quizFcPrevBtn");
const quizFcNextBtn = document.getElementById("quizFcNextBtn");

function renderQuizFlashcardItem() {
  quizFlashcardCard.classList.remove("is-flipped");
  const frontCharEl = document.getElementById("quizFcFrontChar");
  frontCharEl.textContent = currentItem.character;
  frontCharEl.classList.toggle("is-youon", currentItem.character.length > 1);

  document.getElementById("quizFcBackRomaji").textContent = currentItem.romaji;
  document.getElementById("quizFcBackMeta").textContent = `${CATEGORY_LABELS[currentItem.category]} \u2022 ${SET_LABELS[currentItem.set]}`;

  quizFcPrevBtn.disabled = currentIndex === 0;
  quizFcNextBtn.innerHTML = currentIndex === sessionQueue.length - 1 ? "Selesai" : "Selanjutnya &rarr;";
}

function toggleQuizFlashcardFlip() {
  if (!currentItem) return;
  const flipped = quizFlashcardCard.classList.toggle("is-flipped");
  if (flipped) speak(currentItem.character, quizFcSoundBtn);
}

quizFlashcardCard?.addEventListener("click", (e) => {
  if (e.target.closest("#quizFcSoundBtn")) return;
  toggleQuizFlashcardFlip();
});
quizFlashcardCard?.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    toggleQuizFlashcardFlip();
  }
});

quizFcFlipBtn?.addEventListener("click", toggleQuizFlashcardFlip);
quizFcSoundBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  if (currentItem) speak(currentItem.character, quizFcSoundBtn);
});
quizFcPrevBtn?.addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex--;
    generateQuizItem();
  }
});
quizFcNextBtn?.addEventListener("click", () => {
  currentIndex++;
  if (currentIndex >= sessionQueue.length) finishQuiz();
  else generateQuizItem();
});

/* Upgraded Pilihan Ganda */
function buildChoicesStrict(field) {
  const wrap = document.getElementById("answerOptions");
  wrap.innerHTML = "";

  const poolSource = activeQuizPool.length >= 4 ? activeQuizPool : allCharacters.filter(c => c.category === currentItem.category);
  const distractorsPool = poolSource.filter(item => item[field] !== currentItem[field]);

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

  const frag = document.createDocumentFragment();
  finalOptions.forEach((opt, idx) => {
    const box = document.createElement("div");
    box.className = "quiz-radio-option";
    box.style.animationDelay = `${idx * 28}ms`;
    box.dataset.val = opt[field];
    box.dataset.idx = idx + 1;

    box.innerHTML = `
      <span class="opt-key-badge">${idx + 1}</span>
      <span class="opt-main-text">${opt[field]}</span>
      <span class="opt-status-icon">✓</span>
    `;

    box.addEventListener("click", () => handleChoice(box, opt[field] === currentItem[field]));
    frag.appendChild(box);
  });
  wrap.appendChild(frag);
}

function handleChoice(selectedEl, isCorrect) {
  if (hasAnswered) return;
  hasAnswered = true;

  const target = currentMode === "r2h" ? currentItem.character : currentItem.romaji;
  const feedbackEl = document.getElementById("quizFeedback");

  document.querySelectorAll("#answerOptions .quiz-radio-option").forEach(el => {
    el.classList.add("disabled");
    const icon = el.querySelector(".opt-status-icon");
    if (el.dataset.val === target) {
      el.classList.add("correct");
      if (icon) icon.textContent = "✓";
    }
  });

  if (isCorrect) {
    score += 10;
    correctCount++;
    selectedEl.classList.add("correct");
    feedbackEl.textContent = "Benar! Pelafalan sangat tepat.";
    feedbackEl.className = "quiz-feedback is-correct";
    speak(currentItem.character);
  } else {
    selectedEl.classList.add("wrong");
    const wrongIcon = selectedEl.querySelector(".opt-status-icon");
    if (wrongIcon) wrongIcon.textContent = "✕";
    feedbackEl.textContent = `Kurang tepat — Jawaban: ${target}`;
    feedbackEl.className = "quiz-feedback is-wrong";
    speak(currentItem.character);
  }

  document.getElementById("quizScore").textContent = `Skor: ${score}`;

  setTimeout(() => {
    currentIndex++;
    if (currentIndex >= sessionQueue.length) finishQuiz();
    else generateQuizItem();
  }, 1000);
}

function checkTyped() {
  if (hasAnswered) return;
  const input = document.getElementById("answerInput");
  const val = input.value.trim().toLowerCase();
  if (!val) return;
  hasAnswered = true;
  input.disabled = true;

  const feedbackEl = document.getElementById("quizFeedback");

  if (val === currentItem.romaji.toLowerCase()) {
    score += 10;
    correctCount++;
    input.style.backgroundColor = "var(--c-correct-bg)";
    input.style.color = "var(--c-correct)";
    feedbackEl.textContent = "Benar!";
    feedbackEl.className = "quiz-feedback is-correct";
    speak(currentItem.character);
  } else {
    input.style.backgroundColor = "var(--c-wrong-bg)";
    input.style.color = "var(--c-wrong)";
    feedbackEl.textContent = `Salah — Jawaban: ${currentItem.romaji}`;
    feedbackEl.className = "quiz-feedback is-wrong";
    speak(currentItem.character);
  }

  document.getElementById("quizScore").textContent = `Skor: ${score}`;

  setTimeout(() => {
    input.style.backgroundColor = "";
    input.style.color = "";
    currentIndex++;
    if (currentIndex >= sessionQueue.length) finishQuiz();
    else generateQuizItem();
  }, 1000);
}

document.getElementById("submitAnswerBtn")?.addEventListener("click", checkTyped);
document.getElementById("answerInput")?.addEventListener("keydown", e => {
  if (e.key === "Enter") checkTyped();
});

function finishQuiz() {
  const total = sessionQueue.length;
  const titleHeading = document.getElementById("resultTitleHeading");
  const finalScoreEl = document.getElementById("finalScore");
  const finalAccuracyEl = document.getElementById("finalAccuracy");

  if (currentMode === "flashcard") {
    titleHeading.textContent = "Sesi Flashcard Selesai";
    finalScoreEl.textContent = `${total} Kartu`;
    finalAccuracyEl.textContent = "Seluruh kartu karakter pilihan telah dipelajari";
  } else {
    const acc = Math.round((correctCount / total) * 100);
    titleHeading.textContent = "Hasil Kuis Kana";
    finalScoreEl.textContent = `${correctCount} / ${total}`;
    finalAccuracyEl.textContent = `Akurasi: ${acc}%`;
  }

  showView("result");
}

document.getElementById("retrySameBtn")?.addEventListener("click", () => {
  showView("quiz");
});
document.getElementById("backToSelectBtn")?.addEventListener("click", () => {
  showView("quiz-setup");
});

/* ===================== SHORTCUT KEYBOARD GLOBAL ===================== */
document.addEventListener("keydown", (e) => {
  if (modalOverlay && !modalOverlay.classList.contains("hidden")) {
    if (e.key === "Escape") {
      closeAllKanaModals();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      navigateModalCharacter(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      navigateModalCharacter(-1);
    }
    return;
  }

  const quizViewActive = document.getElementById("view-quiz")?.classList.contains("active");
  if (quizViewActive && (currentMode === "h2r" || currentMode === "r2h") && !hasAnswered) {
    if (["1", "2", "3", "4"].includes(e.key)) {
      const idx = parseInt(e.key, 10) - 1;
      const options = document.querySelectorAll("#answerOptions .quiz-radio-option");
      if (options[idx]) options[idx].click();
    }
  }
});

/* ===================== 3. KOSAKATA (DAFTAR & FLASHCARD) ===================== */
const vocabSearchInput = document.getElementById("vocabSearchInput");
const vocabListBody = document.getElementById("vocabListBody");
const vocabListView = document.getElementById("vocabListView");
const vocabFlashcardView = document.getElementById("vocabFlashcardView");
const vocabFlashcard = document.getElementById("vocabFlashcard");

function getFilteredVocab() {
  const q = (vocabSearchInput ? vocabSearchInput.value : "").trim().toLowerCase();
  return allVocabularies.filter(v => {
    const matchType = vocabFilter === "all" || v.type === vocabFilter;
    const matchQuery = !q ||
      v.word.toLowerCase().includes(q) ||
      v.romaji.toLowerCase().includes(q) ||
      v.meaning.toLowerCase().includes(q);
    return matchType && matchQuery;
  });
}

function initVocabReading() {
  vocabList = getFilteredVocab();
  vocabIndex = 0;
  renderVocabList();
  renderVocabCard();
}

function renderVocabList() {
  if (!vocabListBody) return;
  vocabListBody.innerHTML = "";

  if (!vocabList.length) {
    vocabListBody.innerHTML = `<div style="padding:24px;text-align:center;font-weight:800;color:var(--dim);">Kosakata tidak ditemukan.</div>`;
    return;
  }

  const frag = document.createDocumentFragment();
  vocabList.forEach((item, idx) => {
    const row = document.createElement("div");
    row.className = "vocab-row";
    row.style.animationDelay = `${Math.min(idx * 12, 140)}ms`;
    row.innerHTML = `
      <div class="vocab-col-word">${item.word}</div>
      <div class="vocab-col-romaji">${item.romaji}</div>
      <div class="vocab-col-meaning">${item.meaning}</div>
      <button type="button" class="icon-btn vocab-row-audio" title="Dengarkan Pelafalan">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
      </button>
    `;
    const audioBtn = row.querySelector(".vocab-row-audio");
    audioBtn.addEventListener("click", () => speak(item.word, audioBtn));
    frag.appendChild(row);
  });
  vocabListBody.appendChild(frag);
}

function renderVocabCard() {
  if (!vocabList.length) return;
  const cur = vocabList[vocabIndex];
  vocabFlashcard.classList.remove("is-flipped");

  document.getElementById("vocabCounterText").textContent = `${vocabIndex + 1} / ${vocabList.length}`;
  document.getElementById("vocabWordText").textContent = cur.word;
  document.getElementById("vocabBackWordMini").textContent = cur.word;
  document.getElementById("vocabRomajiText").textContent = cur.romaji;
  document.getElementById("vocabMeaningText").textContent = cur.meaning;
  document.getElementById("vocabFrontTypeTag").textContent = (cur.type || "kana").toUpperCase();
}

vocabSearchInput?.addEventListener("input", debounce(initVocabReading, 120));

document.querySelectorAll("#vocabCategoryFilter .seg-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    playPopSound();
    document.querySelectorAll("#vocabCategoryFilter .seg-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    vocabFilter = btn.dataset.type;
    initVocabReading();
  });
});

document.querySelectorAll("#vocabViewToggle .seg-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    playPopSound();
    document.querySelectorAll("#vocabViewToggle .seg-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    vocabViewMode = btn.dataset.vmode;
    vocabListView.classList.toggle("hidden", vocabViewMode !== "list");
    vocabFlashcardView.classList.toggle("hidden", vocabViewMode !== "flashcard");
  });
});

function toggleVocabCardFlip() {
  if (!vocabList.length) return;
  const flipped = vocabFlashcard.classList.toggle("is-flipped");
  if (flipped) speak(vocabList[vocabIndex].word, document.getElementById("vocabAudioBtn"));
}

vocabFlashcard?.addEventListener("click", toggleVocabCardFlip);
vocabFlashcard?.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    toggleVocabCardFlip();
  }
});
document.getElementById("vocabFlipBtn")?.addEventListener("click", toggleVocabCardFlip);

document.getElementById("vocabPrevCardBtn")?.addEventListener("click", () => {
  if (!vocabList.length) return;
  vocabIndex = (vocabIndex - 1 + vocabList.length) % vocabList.length;
  renderVocabCard();
});

document.getElementById("vocabNextCardBtn")?.addEventListener("click", () => {
  if (!vocabList.length) return;
  vocabIndex = (vocabIndex + 1) % vocabList.length;
  renderVocabCard();
});

document.getElementById("vocabShuffleBtn")?.addEventListener("click", () => {
  playPopSound();
  vocabList = shuffle(vocabList);
  vocabIndex = 0;
  renderVocabCard();
});

document.getElementById("vocabAudioBtn")?.addEventListener("click", (e) => {
  e.stopPropagation();
  if (vocabList[vocabIndex]) speak(vocabList[vocabIndex].word, e.currentTarget);
});

/* ===================== INISIALISASI (LANGSUNG TABEL KANA) ===================== */
async function init() {
  await loadData();
  showView("learn", { category: "hiragana", set: "seion", initial: true });
}

init();