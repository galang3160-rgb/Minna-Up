/**
 * NAKAMA GAKKOU — BILANGAN & SATUAN CLEAN FLASHCARD ENGINE
 * - Koneksi Tetap: data/${item.path}.json, localStorage 'nihonggo:selected_category', ?topik=, Modal 22 Kategori (Judul Saja).
 * - Pergantian kartu langsung & bersih tanpa animasi geser.
 * - Flip kartu 3D halus, balik kartu (JP) hanya Kanji & Furigana.
 * - Custom ukuran teks kartu (- dan +) tersimpan otomatis.
 * - Again ("Belum"): pindah ke posisi paling belakang antrean sesi (FIFO adil).
 * - Done ("Sudah"): dikeluarkan dari antrean aktif sesi & tersimpan.
 * - Audio Engine v2.2: Prioritas Neural/Natural/Enhanced untuk iPad, Tablet, dan Komputer.
 * - Shortcut: B = Belum, K = Sudah, ArrowLeft/Right = Navigasi, Spasi = Flip, R = Acak, J = Kanji, F = Furigana.
 */

document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);
  const esc = s => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuffle = a => {
    const r = [...a];
    for (let i = r.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [r[i], r[j]] = [r[j], r[i]];
    }
    return r;
  };

  function debounce(fn, wait = 120) {
    let t = null;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }

  const KANJI_REGEX = /[\u4e00-\u9faf\u3400-\u4dbf々]/;

  // ---------- TRANSISI KELUAR HALAMAN & ANTI BLANK SCREEN ----------
  const pageTransition = $('pageTransition');
  let isNavigatingOut = false;
  let navOutTimer = null;

  function restoreFromCache() {
    clearTimeout(navOutTimer);
    isNavigatingOut = false;
    document.body.classList.remove('page-leaving');
    pageTransition?.classList.remove('active');
  }

  window.addEventListener('pageshow', restoreFromCache);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') restoreFromCache();
  });

  function smoothExit(targetUrl, useHistoryBack = false) {
    if (isNavigatingOut) return;
    isNavigatingOut = true;
    clearTimeout(navOutTimer);
    stopSpeech();

    pageTransition?.classList.add('active');
    document.body.classList.add('page-leaving');

    navOutTimer = setTimeout(() => {
      if (useHistoryBack && window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = targetUrl;
      }
      setTimeout(restoreFromCache, 600);
    }, 240);
  }

  // ---------- TEMA SIANG / MALAM ----------
  const htmlEl = document.documentElement;
  const themeToggleBtn = $('themeToggleBtn');
  const savedTheme = localStorage.getItem('nakama_theme');

  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    htmlEl.setAttribute('data-theme', 'dark');
  } else {
    htmlEl.setAttribute('data-theme', 'light');
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const nextTheme = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      htmlEl.setAttribute('data-theme', nextTheme);
      localStorage.setItem('nakama_theme', nextTheme);
      playTone('pop');
    });
  }

  // ---------- CUSTOM UKURAN TEKS FLASHCARD (- / +) ----------
  const FC_SCALE_KEY = 'nakama:fc_scale';
  const FC_MIN_SCALE = 0.65;
  const FC_MAX_SCALE = 1.35;
  const FC_STEP_SCALE = 0.1;

  let fcScale = parseFloat(localStorage.getItem(FC_SCALE_KEY)) || 1.0;
  fcScale = Math.max(FC_MIN_SCALE, Math.min(FC_MAX_SCALE, fcScale));

  const btnCardZoomOut = $('btnCardZoomOut');
  const btnCardZoomIn = $('btnCardZoomIn');

  function applyFlashcardScale() {
    document.documentElement.style.setProperty('--fc-scale', fcScale.toFixed(2));
    try { localStorage.setItem(FC_SCALE_KEY, fcScale.toFixed(2)); } catch (e) {}
    if (btnCardZoomOut) btnCardZoomOut.disabled = fcScale <= FC_MIN_SCALE + 0.01;
    if (btnCardZoomIn) btnCardZoomIn.disabled = fcScale >= FC_MAX_SCALE - 0.01;
  }

  btnCardZoomOut?.addEventListener('click', () => {
    if (fcScale > FC_MIN_SCALE) {
      fcScale = Math.max(FC_MIN_SCALE, +(fcScale - FC_STEP_SCALE).toFixed(2));
      applyFlashcardScale();
      playTone('pop');
    }
  });

  btnCardZoomIn?.addEventListener('click', () => {
    if (fcScale < FC_MAX_SCALE) {
      fcScale = Math.min(FC_MAX_SCALE, +(fcScale + FC_STEP_SCALE).toFixed(2));
      applyFlashcardScale();
      playTone('pop');
    }
  });

  applyFlashcardScale();

  // ---------- DAFTAR 22 KATEGORI BILANGAN & SATUAN ----------
  const vocabList = [
    { title: "Angka", path: "angka" },
    { title: "Batang", path: "batang" },
    { title: "Benda", path: "benda" },
    { title: "Buku", path: "buku" },
    { title: "Bulan", path: "bulan" },
    { title: "Cangkir", path: "cangkir" },
    { title: "Durasi", path: "durasi" },
    { title: "Frekuensi", path: "frekuensi" },
    { title: "Hari", path: "hari" },
    { title: "Hewan Besar", path: "hewan-besar" },
    { title: "Hewan Kecil", path: "hewan-kecil" },
    { title: "Jam", path: "jam" },
    { title: "Lantai", path: "lantai" },
    { title: "Lembar", path: "lembar" },
    { title: "Manusia", path: "manusia" },
    { title: "Menit", path: "menit" },
    { title: "Pasang", path: "pasang" },
    { title: "Tanggal", path: "tanggal" },
    { title: "Umur", path: "umur" },
    { title: "Unit", path: "unit" },
    { title: "Urutan", path: "urutan" },
    { title: "Waktu", path: "waktu" }
  ];

  const DATA_PATH = item => `data/${item.path}.json`;
  const SAVE_KEY = 'nihonggo:selected_category';
  const HAFALAN_KEY = 'nakama:topik_hafalan_v1';

  // ---------- STATE UTAMA ----------
  let currentCategory = vocabList[0];
  let rawChapterVocab = [];
  let selectedIds = new Set();
  let activeVocab = [];
  let mode = 'carousel';
  let audioOn = true;
  let vocabZoomRem = 3.6;

  let isKanjiVisible = true;
  let isFuriVisible = true;
  let isReversedCard = false;

  let quizPool = [], qi = 0, qScore = 0, answered = false, runId = 0, loadId = 0;

  // ---------- COMPACT TOPBAR SAAT SCROLL LIST ----------
  const fixedTopbar = $('fixedTopbar');
  const checklistGridEl = $('checklistGrid');
  if (fixedTopbar && checklistGridEl) {
    let listTicking = false;
    checklistGridEl.addEventListener('scroll', () => {
      if (!listTicking) {
        listTicking = true;
        requestAnimationFrame(() => {
          fixedTopbar.classList.toggle('is-compact', checklistGridEl.scrollTop > 16);
          listTicking = false;
        });
      }
    }, { passive: true });
  }

  // ---------- PENYIMPANAN STATUS HAFALAN (LOCALSTORAGE) ----------
  let hafalanStore = {};
  try {
    hafalanStore = JSON.parse(localStorage.getItem(HAFALAN_KEY) || '{}') || {};
  } catch (e) {
    hafalanStore = {};
  }

  function saveHafalanStore() {
    try {
      localStorage.setItem(HAFALAN_KEY, JSON.stringify(hafalanStore));
    } catch (e) {}
  }

  function getItemKey(item) {
    return `${item.kanji}|${item.furigana}`;
  }

  function getCategoryStore(catPath = currentCategory.path) {
    if (!hafalanStore[catPath]) hafalanStore[catPath] = {};
    return hafalanStore[catPath];
  }

  function getItemHafalan(item) {
    return getCategoryStore()[getItemKey(item)] || null;
  }

  function isItemMastered(item) {
    const rec = getItemHafalan(item);
    return !!(rec && rec.status === 'sudah');
  }

  function updateHafalanSummary() {
    const summaryEl = $('hafalanSummary');
    if (!summaryEl) return;
    const total = rawChapterVocab.length;
    const masteredCount = rawChapterVocab.filter(isItemMastered).length;
    summaryEl.textContent = `Hafal: ${masteredCount} / ${total}`;
  }

  // =====================================================================
  //  AUDIO ENGINE v2.2 — KUALITAS TINGGI UNTUK IPAD, TABLET & KOMPUTER
  // =====================================================================
  let actx = null;
  const isAppleDevice = /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent);
  const isAppleTouch = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  const TTS_CONFIG = (() => {
    const meta = document.querySelector('meta[name="nakama-tts-endpoint"]');
    const user = window.NAKAMA_TTS_CONFIG || {};
    return {
      endpoint: String(user.endpoint || (meta && meta.content) || '').trim(),
      voiceId: user.voiceId || '',
      style: user.style || 'cute',
      timeoutMs: user.timeoutMs || 6000,
      cacheMax: user.cacheMax || 100,
      failCooldownMs: user.failCooldownMs || 60000
    };
  })();

  let jpVoice = null;
  let jpVoiceInfo = { tier: 'none', femaleHint: 'unknown', name: '' };
  let voiceRetryTimers = [];

  const FEMALE_HINT = /(female|woman|girl|kyoko|o-?ren|haruka|ayumi|sayaka|nanami|aoi|mayu|shiori|mizuki|ichika|momo|sakura|yui|hina|ja-jp-x-(htm|jab|jaf)|google (日本語|japanese))/;
  const MALE_HINT = /(\bmale\b|\bman\b|keita|otoya|ichiro|daichi|naoki|hattori|takumi|kenji|ryo\b|ja-jp-x-(jac|jad|jae))/;
  const QUALITY_ULTRA = /(neural|natural|premium|enhanced|wavenet|studio|siri)/;
  const QUALITY_HIGH = /(online|network|high[\s-]?quality)/;
  const QUALITY_LOW = /(compact|espeak|novelty|robot)/;

  const normLang = l => String(l || '').toLowerCase().replace('_', '-');

  function scoreVoice(v) {
    const name = `${v.name || ''} ${v.voiceURI || ''}`.toLowerCase();
    const lang = normLang(v.lang);
    let s = 0;

    if (lang === 'ja-jp') s += 60;
    else if (lang.startsWith('ja')) s += 45;
    else return -Infinity;

    const looksFemale = FEMALE_HINT.test(name);
    const looksMale = MALE_HINT.test(name);
    if (looksMale && !looksFemale) s -= 220;
    else if (looksFemale) s += 100;

    if (QUALITY_ULTRA.test(name)) s += 95;
    else if (QUALITY_HIGH.test(name)) s += 65;
    if (QUALITY_LOW.test(name)) s -= 70;

    if (!v.localService) s += 30;
    if (/nanami/.test(name) && /online|natural/.test(name)) s += 45;
    if (/kyoko/.test(name) && /premium|enhanced/.test(name)) s += 45;
    if (/google/.test(name)) s += 25;
    if (v.default) s += 4;

    return s;
  }

  function tierOf(v) {
    const name = `${v.name || ''} ${v.voiceURI || ''}`.toLowerCase();
    if (QUALITY_ULTRA.test(name)) return 'ultra';
    if (QUALITY_HIGH.test(name) || !v.localService) return 'high';
    return 'basic';
  }

  function selectBestJapaneseVoice() {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices() || [];
    const jaVoices = voices.filter(v => scoreVoice(v) > -Infinity);

    if (!jaVoices.length) {
      jpVoice = null;
      jpVoiceInfo = { tier: 'none', femaleHint: 'unknown', name: '' };
      return null;
    }

    jaVoices.sort((a, b) => scoreVoice(b) - scoreVoice(a));
    jpVoice = jaVoices[0];

    const n = `${jpVoice.name} ${jpVoice.voiceURI}`.toLowerCase();
    jpVoiceInfo = {
      tier: tierOf(jpVoice),
      femaleHint: MALE_HINT.test(n) && !FEMALE_HINT.test(n) ? 'male' : (FEMALE_HINT.test(n) ? 'female' : 'unknown'),
      name: jpVoice.name
    };
    return jpVoice;
  }

  function initVoices() {
    if (!('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;

    selectBestJapaneseVoice();

    if (typeof synth.addEventListener === 'function') {
      synth.addEventListener('voiceschanged', selectBestJapaneseVoice);
    } else {
      synth.onvoiceschanged = selectBestJapaneseVoice;
    }

    voiceRetryTimers.forEach(clearTimeout);
    voiceRetryTimers = [200, 600, 1400, 2800].map(ms =>
      setTimeout(() => { if (!jpVoice) selectBestJapaneseVoice(); }, ms)
    );
  }
  initVoices();

  window.addEventListener('pointerdown', () => {
    if (!jpVoice) selectBestJapaneseVoice();
  }, { once: true, passive: true });

  function getVoiceProfile() {
    if (jpVoiceInfo.femaleHint === 'male') {
      return { rate: 0.92, pitch: 1.22, volume: 1.0 };
    }
    if (jpVoiceInfo.tier === 'ultra') {
      return { rate: 0.94, pitch: 1.02, volume: 1.0 };
    }
    if (jpVoiceInfo.tier === 'high' || isAppleDevice) {
      return { rate: 0.91, pitch: 1.05, volume: 1.0 };
    }
    return { rate: 0.9, pitch: 1.08, volume: 1.0 };
  }

  function prepareSpeechText(text) {
    let t = String(text == null ? '' : text)
      .replace(/[（(][^）)]*[）)]/g, ' ')
      .replace(/[〜～~]/g, '')
      .replace(/[\/／]/g, '、')
      .replace(/\s+/g, ' ')
      .trim();
    if (!t) return '';
    if (!/[。！？!?、.]$/.test(t)) t += '。';
    return t;
  }

  let speakToken = 0;
  let currentUtterance = null;
  let audioEl = null;
  let remoteAbort = null;
  let remoteFailUntil = 0;
  let lastSpoken = { text: '', at: 0 };
  const remoteCache = new Map();

  function stopPlayback() {
    if (remoteAbort) { try { remoteAbort.abort(); } catch (e) {} remoteAbort = null; }
    if (audioEl) { try { audioEl.pause(); audioEl.currentTime = 0; } catch (e) {} }
    if ('speechSynthesis' in window) { try { window.speechSynthesis.cancel(); } catch (e) {} }
    currentUtterance = null;
  }

  function stopSpeech() {
    speakToken++;
    stopPlayback();
  }

  function remoteAvailable() {
    return !!TTS_CONFIG.endpoint && Date.now() >= remoteFailUntil && typeof fetch === 'function';
  }

  function cacheRemote(key, url) {
    remoteCache.set(key, url);
    while (remoteCache.size > TTS_CONFIG.cacheMax) {
      const oldestKey = remoteCache.keys().next().value;
      const oldUrl = remoteCache.get(oldestKey);
      remoteCache.delete(oldestKey);
      if (typeof oldUrl === 'string' && oldUrl.startsWith('blob:')) URL.revokeObjectURL(oldUrl);
    }
  }

  async function fetchRemoteAudioUrl(text, signal) {
    if (remoteCache.has(text)) return remoteCache.get(text);

    const res = await fetch(TTS_CONFIG.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        lang: 'ja-JP',
        gender: 'female',
        style: TTS_CONFIG.style,
        voiceId: TTS_CONFIG.voiceId
      }),
      credentials: 'same-origin',
      signal
    });
    if (!res.ok) throw new Error(`TTS HTTP ${res.status}`);

    const ct = (res.headers.get('content-type') || '').toLowerCase();
    let url;

    if (ct.includes('application/json')) {
      const j = await res.json();
      if (j.audioUrl) {
        url = j.audioUrl;
      } else if (j.audioBase64) {
        const bin = atob(j.audioBase64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        url = URL.createObjectURL(new Blob([bytes], { type: j.mimeType || 'audio/mpeg' }));
      } else {
        throw new Error('Balasan TTS tidak berisi audio');
      }
    } else if (ct.startsWith('audio/') || ct.includes('octet-stream')) {
      const blob = await res.blob();
      if (!blob.size) throw new Error('Audio TTS kosong');
      url = URL.createObjectURL(blob);
    } else {
      throw new Error('Tipe balasan TTS tidak dikenali');
    }

    cacheRemote(text, url);
    return url;
  }

  async function speakWithRemote(text, token) {
    const ctrl = new AbortController();
    remoteAbort = ctrl;
    const timer = setTimeout(() => ctrl.abort(), TTS_CONFIG.timeoutMs);

    let url;
    try {
      url = await fetchRemoteAudioUrl(text, ctrl.signal);
    } finally {
      clearTimeout(timer);
      if (remoteAbort === ctrl) remoteAbort = null;
    }

    if (token !== speakToken || !audioOn) return;

    if (!audioEl) audioEl = new Audio();
    audioEl.src = url;
    audioEl.volume = 1.0;
    await audioEl.play();
  }

  function speakWithBrowser(text, token) {
    if (!('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    if (!jpVoice) selectBestJapaneseVoice();

    const wasSpeaking = synth.speaking || synth.pending;
    if (wasSpeaking) {
      try { synth.cancel(); } catch (e) {}
    }

    const doSpeak = () => {
      if (token !== speakToken || !audioOn) return;

      const ut = new SpeechSynthesisUtterance(text);
      const profile = getVoiceProfile();
      ut.lang = jpVoice && jpVoice.lang ? jpVoice.lang.replace('_', '-') : 'ja-JP';
      if (jpVoice) ut.voice = jpVoice;
      ut.rate = profile.rate;
      ut.pitch = profile.pitch;
      ut.volume = profile.volume;

      const clear = () => { if (currentUtterance === ut) currentUtterance = null; };
      ut.onend = clear;
      ut.onerror = clear;

      currentUtterance = ut;
      try { if (synth.paused) synth.resume(); } catch (e) {}
      synth.speak(ut);
    };

    if (isAppleTouch || !wasSpeaking) {
      doSpeak();
    } else {
      setTimeout(doSpeak, 40);
    }
  }

  function speakJapanese(text) {
    if (!audioOn || !text) return;

    const spoken = prepareSpeechText(text);
    if (!spoken) return;

    const t = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    if (spoken === lastSpoken.text && t - lastSpoken.at < 250) return;
    lastSpoken = { text: spoken, at: t };

    if (remoteAbort) { try { remoteAbort.abort(); } catch (e) {} remoteAbort = null; }
    if (audioEl) { try { audioEl.pause(); audioEl.currentTime = 0; } catch (e) {} }

    const token = ++speakToken;

    if (remoteAvailable()) {
      if ('speechSynthesis' in window) { try { window.speechSynthesis.cancel(); } catch (e) {} }
      speakWithRemote(spoken, token).catch(() => {
        if (token !== speakToken) return;
        remoteFailUntil = Date.now() + TTS_CONFIG.failCooldownMs;
        speakWithBrowser(spoken, token);
      });
    } else {
      speakWithBrowser(spoken, token);
    }
  }

  document.addEventListener('visibilitychange', () => { if (document.hidden) stopSpeech(); });
  window.addEventListener('pagehide', stopSpeech);

  window.NakamaVoice = {
    info: () => ({
      voice: jpVoiceInfo.name || '(tidak ada voice Jepang terdeteksi)',
      tier: jpVoiceInfo.tier,
      genderHint: jpVoiceInfo.femaleHint,
      externalTTS: !!TTS_CONFIG.endpoint,
      externalAvailable: remoteAvailable()
    }),
    list: () => (window.speechSynthesis ? window.speechSynthesis.getVoices() : [])
      .filter(v => scoreVoice(v) > -Infinity)
      .map(v => ({ name: v.name, lang: v.lang, local: v.localService, score: scoreVoice(v) })),
    stop: stopSpeech
  };

  // ---------- EFEK SUARA UI ----------
  const TONES = {
    pop: ['sine', 560, 290, 0.08, 0.09],
    correct: ['sine', 580, 1160, 0.16, 0.14],
    wrong: ['sawtooth', 280, 150, 0.16, 0.1],
    flip: ['sine', 420, 240, 0.07, 0.08],
    win: ['triangle', 523, 1046, 0.3, 0.14]
  };

  function playTone(type) {
    if (!audioOn) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      const [wave, f1, f2, dur, vol] = TONES[type];
      const now = actx.currentTime;
      const osc = actx.createOscillator();
      const gain = actx.createGain();

      osc.type = wave;
      osc.frequency.setValueAtTime(f1, now);
      osc.frequency.exponentialRampToValueAtTime(f2, now + dur * 0.6);

      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + dur);
    } catch (e) {}
  }

  // ---------- NOTIFIKASI STATUS DATA ----------
  let noticeTimer = null;
  function showNotice(msg, autoHide = 0) {
    const n = $('dataNotice');
    if (!n) return;
    clearTimeout(noticeTimer);
    n.textContent = msg;
    n.hidden = false;
    if (autoHide) noticeTimer = setTimeout(() => { n.hidden = true; }, autoHide);
  }
  const hideNotice = () => {
    clearTimeout(noticeTimer);
    if ($('dataNotice')) $('dataNotice').hidden = true;
  };

  // ---------- MODAL PILIHAN KATEGORI (HANYA JUDUL SAJA) ----------
  const modalGrid = $('modalCategoryGrid');
  const categoryModal = $('categoryModal');
  const openModalBtn = $('openCategoryModal');
  const closeModalBtn = $('closeCategoryModal');
  const currentCategoryDisplay = $('currentCategoryDisplay');
  const gridButtons = [];

  if (modalGrid) {
    const frag = document.createDocumentFragment();
    vocabList.forEach(item => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'category-card-btn';
      btn.dataset.path = item.path;
      btn.innerHTML = `<span class="cat-title">${esc(item.title)}</span>`;

      btn.addEventListener('click', () => {
        playTone('pop');
        changeCategory(item);
        closeModal();
      });

      frag.appendChild(btn);
      gridButtons.push(btn);
    });
    modalGrid.appendChild(frag);
  }

  function openModal() { if (categoryModal) categoryModal.classList.add('open'); }
  function closeModal() { if (categoryModal) categoryModal.classList.remove('open'); }

  if (openModalBtn) openModalBtn.addEventListener('click', openModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (categoryModal) {
    categoryModal.addEventListener('click', e => {
      if (e.target === categoryModal) closeModal();
    });
  }

  function updateCategoryUI() {
    if (currentCategoryDisplay) currentCategoryDisplay.textContent = currentCategory.title;
    gridButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.path === currentCategory.path);
    });
  }

  // ---------- KONTROL KARTU: KANJI, FURIGANA, ARAH, ACAK ----------
  function updateCardVisibilityUI() {
    const container = $('carouselContainer');
    if (container) {
      container.classList.toggle('kanji-off', !isKanjiVisible);
      container.classList.toggle('furi-off', !isFuriVisible);
    }

    if ($('toggleKanjiLabel')) $('toggleKanjiLabel').textContent = isKanjiVisible ? 'Kanji: ON' : 'Kanji: OFF';
    if ($('kanjiStatusDot')) $('kanjiStatusDot').classList.toggle('is-off', !isKanjiVisible);
    if ($('toggleKanjiBtn')) {
      $('toggleKanjiBtn').classList.toggle('bg-matcha', isKanjiVisible);
      $('toggleKanjiBtn').classList.toggle('bg-surface', !isKanjiVisible);
    }

    if ($('toggleFuriLabel')) $('toggleFuriLabel').textContent = isFuriVisible ? 'Furigana: ON' : 'Furigana: OFF';
    if ($('furiStatusDot')) $('furiStatusDot').classList.toggle('is-off', !isFuriVisible);
    if ($('toggleFuriBtn')) {
      $('toggleFuriBtn').classList.toggle('bg-sky', isFuriVisible);
      $('toggleFuriBtn').classList.toggle('bg-surface', !isFuriVisible);
    }
  }

  function toggleKanjiVisibility() {
    isKanjiVisible = !isKanjiVisible;
    if (!isKanjiVisible && !isFuriVisible) isFuriVisible = true;
    updateCardVisibilityUI();
    playTone('pop');
  }

  function toggleFuriVisibility() {
    isFuriVisible = !isFuriVisible;
    if (!isFuriVisible && !isKanjiVisible) isKanjiVisible = true;
    updateCardVisibilityUI();
    playTone('pop');
  }

  function toggleCardDirection() {
    isReversedCard = !isReversedCard;
    if ($('swapDirectionLabel')) {
      $('swapDirectionLabel').textContent = isReversedCard ? 'JP ➔ ID' : 'ID ➔ JP';
    }
    Carousel.render();
    playTone('flip');
  }

  function handleShuffleCards() {
    if (activeVocab.length <= 1) return;
    activeVocab = shuffle(activeVocab);
    Carousel.index = 0;
    Carousel.render();
    playTone('pop');
  }

  $('toggleKanjiBtn')?.addEventListener('click', toggleKanjiVisibility);
  $('toggleFuriBtn')?.addEventListener('click', toggleFuriVisibility);
  $('swapDirectionBtn')?.addEventListener('click', toggleCardDirection);
  $('shuffleBtn')?.addEventListener('click', handleShuffleCards);

  // ---------- PEMBANGUNAN ANTREAN AWAL (TANPA DUPLIKASI) ----------
  function buildQueueFromSelection(list) {
    const seen = new Set();
    const fresh = [];
    const again = [];

    list.forEach(item => {
      if (seen.has(item.id)) return;
      seen.add(item.id);
      const rec = getItemHafalan(item);
      if (rec && rec.status === 'belum') {
        again.push({ item, order: rec.updatedAt || 0 });
      } else {
        fresh.push(item);
      }
    });

    again.sort((a, b) => a.order - b.order);
    return [...fresh, ...again.map(x => x.item)];
  }

  // ---------- PENCARIAN (DEBOUNCED) & CHECKLIST ----------
  const searchInput = $('searchInput');
  const btnClearSearch = $('btnClearSearch');

  function syncActiveVocab(preserveIndex = 0) {
    const query = (searchInput?.value || '').trim().toLowerCase();
    if (btnClearSearch) btnClearSearch.hidden = !query;

    const filtered = rawChapterVocab.filter(item => {
      if (!selectedIds.has(item.id)) return false;
      if (!query) return true;
      const arti = (item.arti || '').toLowerCase();
      const furi = (item.furigana || '').toLowerCase();
      const kanji = (item.kanji || '').toLowerCase();
      return arti.includes(query) || furi.includes(query) || kanji.includes(query);
    });

    activeVocab = buildQueueFromSelection(filtered);

    if ($('selectedCountBadge')) {
      $('selectedCountBadge').textContent = `${selectedIds.size} / ${rawChapterVocab.length} Terpilih`;
    }
    updateHafalanSummary();

    if (mode === 'carousel') {
      Carousel.index = activeVocab.length ? Math.max(0, Math.min(preserveIndex, activeVocab.length - 1)) : 0;
      Carousel.render();
    } else if (mode === 'list') {
      renderChecklist();
    } else if (mode === 'mc' || mode === 'typing') {
      startQuiz(mode);
    }

    if (query && activeVocab.length === 0) {
      showNotice(`Tidak ditemukan "${query}" pada topik ${currentCategory.title}.`);
    } else {
      hideNotice();
    }
  }

  searchInput?.addEventListener('input', debounce(() => syncActiveVocab(0), 120));
  btnClearSearch?.addEventListener('click', () => {
    searchInput.value = '';
    syncActiveVocab(0);
    searchInput.focus();
  });

  function renderChecklist() {
    const grid = $('checklistGrid');
    if (!grid) return;

    const query = (searchInput?.value || '').trim().toLowerCase();
    const listToShow = !query
      ? rawChapterVocab
      : rawChapterVocab.filter(item =>
          item.arti.toLowerCase().includes(query) ||
          item.furigana.toLowerCase().includes(query) ||
          item.kanji.toLowerCase().includes(query)
        );

    const frag = document.createDocumentFragment();
    listToShow.forEach(item => {
      const isChecked = selectedIds.has(item.id);
      const mastered = isItemMastered(item);
      const tile = document.createElement('div');
      tile.className = `check-tile ${isChecked ? 'is-checked' : ''}`;

      const mainJp = item.hasKanji ? item.kanji : item.furigana;
      const subJp = item.hasKanji ? item.furigana : '';

      const badgeHtml = mastered
        ? `<span class="tile-type-badge is-mastered">Hafal</span>`
        : `<span class="tile-type-badge ${item.hasKanji ? 'is-kanji' : 'is-kana'}">${item.hasKanji ? 'Kanji' : 'Kana'}</span>`;

      tile.innerHTML = `
        <div class="anim-check-box">
          <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div class="tile-info">
          <div class="tile-jp">
            <span class="tile-kanji furigana-font">${esc(mainJp)}</span>
            ${subJp ? `<span class="tile-furi furigana-font">${esc(subJp)}</span>` : ''}
            ${badgeHtml}
          </div>
          <span class="tile-arti">${esc(item.arti)}</span>
        </div>
      `;

      tile.addEventListener('click', () => {
        const store = getCategoryStore();
        const key = getItemKey(item);

        if (selectedIds.has(item.id)) {
          selectedIds.delete(item.id);
          tile.classList.remove('is-checked');
        } else {
          selectedIds.add(item.id);
          tile.classList.add('is-checked');
          if (store[key] && store[key].status === 'sudah') {
            delete store[key];
            saveHafalanStore();
            updateHafalanSummary();
          }
        }
        playTone('pop');
        if ($('selectedCountBadge')) {
          $('selectedCountBadge').textContent = `${selectedIds.size} / ${rawChapterVocab.length} Terpilih`;
        }
        const q = (searchInput?.value || '').trim().toLowerCase();
        activeVocab = buildQueueFromSelection(
          rawChapterVocab.filter(v =>
            selectedIds.has(v.id) &&
            (!q || v.arti.toLowerCase().includes(q) || v.furigana.toLowerCase().includes(q) || v.kanji.toLowerCase().includes(q))
          )
        );
      });

      frag.appendChild(tile);
    });

    grid.innerHTML = '';
    grid.appendChild(frag);
  }

  $('selectAllBtn')?.addEventListener('click', () => {
    const store = getCategoryStore();
    rawChapterVocab.forEach(v => {
      selectedIds.add(v.id);
      const k = getItemKey(v);
      if (store[k] && store[k].status === 'sudah') delete store[k];
    });
    saveHafalanStore();
    playTone('pop');
    syncActiveVocab(0);
  });

  $('selectKanjiOnlyBtn')?.addEventListener('click', () => {
    const kanjiItems = rawChapterVocab.filter(v => v.hasKanji);
    if (!kanjiItems.length) {
      showNotice(`Topik ${currentCategory.title} tidak memiliki kosakata ber-Kanji.`, 3000);
      return;
    }
    selectedIds = new Set(kanjiItems.map(v => v.id));
    playTone('pop');
    syncActiveVocab(0);
  });

  $('selectKanaOnlyBtn')?.addEventListener('click', () => {
    const kanaItems = rawChapterVocab.filter(v => !v.hasKanji);
    if (!kanaItems.length) {
      showNotice(`Semua kosakata di topik ${currentCategory.title} mengandung Kanji.`, 3000);
      return;
    }
    selectedIds = new Set(kanaItems.map(v => v.id));
    playTone('pop');
    syncActiveVocab(0);
  });

  $('deselectAllBtn')?.addEventListener('click', () => {
    selectedIds.clear();
    playTone('pop');
    syncActiveVocab(0);
  });

  // ---------- AKSI STATUS HAFALAN (LANGSUNG & BERSIH) ----------
  const btnStatusBelum = $('btnStatusBelum');
  const btnStatusSudah = $('btnStatusSudah');

  function updateStatusButtonsState() {
    const hasCard = activeVocab.length > 0;
    if (btnStatusBelum) btnStatusBelum.disabled = !hasCard;
    if (btnStatusSudah) btnStatusSudah.disabled = !hasCard;
  }

  function markCurrentSudah() {
    if (!activeVocab.length) return;
    const item = activeVocab[Carousel.index];
    if (!item) return;

    const store = getCategoryStore();
    store[getItemKey(item)] = {
      status: 'sudah',
      updatedAt: Date.now()
    };
    saveHafalanStore();

    selectedIds.delete(item.id);
    playTone('correct');

    activeVocab.splice(Carousel.index, 1);
    Carousel.index = activeVocab.length ? Math.min(Carousel.index, activeVocab.length - 1) : 0;

    if ($('selectedCountBadge')) {
      $('selectedCountBadge').textContent = `${selectedIds.size} / ${rawChapterVocab.length} Terpilih`;
    }
    updateHafalanSummary();
    Carousel.render();
  }

  function markCurrentBelum() {
    if (!activeVocab.length) return;
    const item = activeVocab[Carousel.index];
    if (!item) return;

    const store = getCategoryStore();
    store[getItemKey(item)] = {
      status: 'belum',
      updatedAt: Date.now()
    };
    saveHafalanStore();

    selectedIds.add(item.id);
    playTone('pop');

    if (activeVocab.length > 1) {
      const [moved] = activeVocab.splice(Carousel.index, 1);
      activeVocab.push(moved);
      if (Carousel.index >= activeVocab.length) Carousel.index = 0;
    }
    Carousel.render();
  }

  btnStatusSudah?.addEventListener('click', markCurrentSudah);
  btnStatusBelum?.addEventListener('click', markCurrentBelum);

  // ---------- FLASHCARD ENGINE (BIASA SAJA — INSTAN & RINGAN) ----------
  function buildJapaneseContentHTML(v) {
    if (v.hasKanji) {
      return `
        <span class="c-kanji furigana-font">${esc(v.kanji)}</span>
        <span class="c-furigana-pill furigana-font">${esc(v.furigana)}</span>
      `;
    }
    return `<span class="c-kana-only furigana-font">${esc(v.furigana)}</span>`;
  }

  let wasSwiping = false;

  const Carousel = {
    index: 0,
    activeCardEl: null,

    render() {
      const container = $('carouselContainer');
      if (!container) return;
      const n = activeVocab.length;
      if ($('carouselCounter')) {
        $('carouselCounter').textContent = n ? `${Math.min(this.index + 1, n)} / ${n}` : '0 / 0';
      }
      updateCardVisibilityUI();
      updateStatusButtonsState();

      container.innerHTML = '';

      if (!n) {
        const allDone = rawChapterVocab.length > 0 && rawChapterVocab.every(isItemMastered);
        const card = document.createElement('div');
        card.className = 'chapter-flashcard';
        card.innerHTML = `
          <div class="carousel-card-inner">
            <div class="carousel-face front">
              <div class="face-top-bar"><span class="c-tag">${allDone ? 'Selesai' : 'Info'}</span></div>
              <div class="face-center-content"><span class="c-arti">${allDone ? 'Semua Sudah Hafal!' : 'Tidak Ada Kata Aktif'}</span></div>
              <div class="face-bottom-hint">${allDone ? 'Buka "Pilih Kata" untuk mengulang materi lagi' : 'Pilih kata di menu "Pilih Kata" atau ubah pencarian'}</div>
            </div>
          </div>`;
        container.appendChild(card);
        this.activeCardEl = card;
        return;
      }

      this.index = Math.max(0, Math.min(this.index, n - 1));
      const v = activeVocab[this.index];

      const rec = getItemHafalan(v);
      const srBadge = (rec && rec.status === 'belum')
        ? `<span class="sr-badge">Perlu Diulang</span>`
        : '';

      const frontTag = isReversedCard ? 'Bahasa Jepang' : 'Bahasa Indonesia';
      const backTag = isReversedCard ? 'Bahasa Indonesia' : 'Bahasa Jepang';

      const frontContent = isReversedCard
        ? buildJapaneseContentHTML(v)
        : `<span class="c-arti">${esc(v.arti)}</span>`;

      const backContent = isReversedCard
        ? `<span class="c-arti">${esc(v.arti)}</span>`
        : buildJapaneseContentHTML(v);

      const frontHint = isReversedCard
        ? 'Ketuk kartu untuk melihat arti &rarr;'
        : 'Ketuk kartu untuk melihat bahasa Jepang &rarr;';

      const card = document.createElement('div');
      card.className = `chapter-flashcard ${v.hasKanji ? 'has-kanji' : 'kana-only-card'}`;

      card.innerHTML = `
        <div class="carousel-card-inner">
          <div class="carousel-face front">
            <div class="face-top-bar">
              <div class="face-tags-left">
                <span class="c-tag">${frontTag}</span>
                ${srBadge}
              </div>
              <button type="button" class="btn-card-speak" data-speak="${esc(v.furigana)}" title="Dengarkan Bahasa Jepang" aria-label="Dengarkan Bahasa Jepang">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                </svg>
              </button>
            </div>
            <div class="face-center-content">
              ${frontContent}
            </div>
            <div class="face-bottom-hint">${frontHint}</div>
          </div>

          <div class="carousel-face back">
            <div class="face-top-bar">
              <div class="face-tags-left">
                <span class="c-tag">${backTag}</span>
                ${srBadge}
              </div>
              <button type="button" class="btn-card-speak" data-speak="${esc(v.furigana)}" title="Dengarkan Pengucapan" aria-label="Dengarkan Pengucapan">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                </svg>
              </button>
            </div>
            <div class="face-center-content">
              ${backContent}
            </div>
            <div class="face-bottom-hint">Ketuk untuk membalik kartu</div>
          </div>
        </div>
      `;

      card.querySelectorAll('.btn-card-speak').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          speakJapanese(btn.dataset.speak);
        });
      });

      card.addEventListener('click', () => {
        if (wasSwiping) return;
        const willFlipToBack = !card.classList.contains('is-flipped');
        card.classList.add('is-flipping');
        card.classList.toggle('is-flipped');
        playTone('flip');
        if (willFlipToBack) speakJapanese(v.furigana);
        setTimeout(() => card.classList.remove('is-flipping'), 420);
      });

      container.appendChild(card);
      this.activeCardEl = card;
    },

    flipCurrent() {
      if (!activeVocab.length || !this.activeCardEl) return;
      this.activeCardEl.click();
    },

    go(dir) {
      if (activeVocab.length <= 1) return;
      this.index = (this.index + dir + activeVocab.length) % activeVocab.length;
      playTone('pop');
      this.render();
    }
  };

  // ---------- SWIPE DETECTOR SEDERHANA DI HP & IPAD (TANPA ANIMASI GESER) ----------
  let touchStartX = 0;
  let touchStartY = 0;
  const carouselEl = $('carouselContainer');

  if (carouselEl) {
    carouselEl.addEventListener('touchstart', e => {
      if (e.touches.length !== 1 || activeVocab.length <= 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      wasSwiping = false;
    }, { passive: true });

    carouselEl.addEventListener('touchend', e => {
      if (activeVocab.length <= 1 || !e.changedTouches.length) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;

      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        wasSwiping = true;
        setTimeout(() => { wasSwiping = false; }, 80);
        if (dx < 0) Carousel.go(1);
        else Carousel.go(-1);
      }
    }, { passive: true });
  }

  // ---------- ZOOM UKURAN TEKS KUIS ----------
  function updateVocabFontSize() {
    document.documentElement.style.setProperty('--vocab-font-size', `${vocabZoomRem}rem`);
  }
  $('btnZoomIn')?.addEventListener('click', () => {
    if (vocabZoomRem < 5.0) { vocabZoomRem = +(vocabZoomRem + 0.3).toFixed(1); updateVocabFontSize(); }
  });
  $('btnZoomOut')?.addEventListener('click', () => {
    if (vocabZoomRem > 2.0) { vocabZoomRem = +(vocabZoomRem - 0.3).toFixed(1); updateVocabFontSize(); }
  });

  $('btnMcSpeak')?.addEventListener('click', () => { if (quizPool[qi]) speakJapanese(quizPool[qi].furigana); });
  $('btnTypingSpeak')?.addEventListener('click', () => { if (quizPool[qi]) speakJapanese(quizPool[qi].furigana); });

  // ---------- NAVIGASI MODE PEMBELAJARAN ----------
  function setMode(newMode) {
    mode = newMode;
    runId++;
    fixedTopbar?.classList.remove('is-compact');

    document.querySelectorAll('.dock-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === newMode);
    });

    if ($('mode-carousel')) $('mode-carousel').hidden = (newMode !== 'carousel');
    if ($('mode-list')) $('mode-list').hidden = (newMode !== 'list');
    if ($('mode-result')) $('mode-result').hidden = true;
    if ($('quiz-global-header')) $('quiz-global-header').hidden = (newMode !== 'mc' && newMode !== 'typing');

    if ($('mode-mc')) $('mode-mc').hidden = (newMode !== 'mc');
    if ($('mode-typing')) $('mode-typing').hidden = (newMode !== 'typing');

    if (newMode === 'carousel') {
      Carousel.render();
    } else if (newMode === 'list') {
      renderChecklist();
    } else {
      startQuiz(newMode);
    }
  }

  document.querySelectorAll('.dock-item').forEach(b => {
    b.addEventListener('click', () => {
      playTone('pop');
      setMode(b.dataset.mode);
    });
  });

  $('btnBack')?.addEventListener('click', () => {
    if (mode !== 'carousel') {
      setMode('carousel');
    } else {
      smoothExit('../index.html', true);
    }
  });

  document.querySelector('.logo')?.addEventListener('click', function (e) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    smoothExit(this.getAttribute('href'), false);
  });

  $('btnAudioToggle')?.addEventListener('click', function () {
    audioOn = !audioOn;
    if (!audioOn) stopSpeech();
    const unmuted = this.querySelector('.icon-unmuted');
    const muted = this.querySelector('.icon-muted');
    if (unmuted) unmuted.style.display = audioOn ? 'block' : 'none';
    if (muted) muted.style.display = audioOn ? 'none' : 'block';
  });

  // ---------- SISTEM KUIS ----------
  function renderQuizPrompt(q, mainEl, subEl) {
    if (!mainEl) return;
    if (q.hasKanji && isKanjiVisible) {
      mainEl.textContent = q.kanji;
      if (subEl) {
        subEl.textContent = isFuriVisible ? q.furigana : '';
        subEl.hidden = !isFuriVisible;
      }
    } else {
      mainEl.textContent = q.furigana;
      if (subEl) {
        subEl.textContent = '';
        subEl.hidden = true;
      }
    }
  }

  function startQuiz(type) {
    if (activeVocab.length < 4) {
      showNotice('Minimal 4 kosakata terpilih diperlukan di topik ini untuk kuis.', 4000);
      setMode('carousel');
      return;
    }

    quizPool = shuffle(activeVocab);
    qi = 0;
    qScore = 0;
    answered = false;

    if ($('quizTitle')) {
      $('quizTitle').textContent = type === 'mc'
        ? `Pilihan Ganda · ${currentCategory.title}`
        : `Mengetik · ${currentCategory.title}`;
    }
    if ($('quizProgressFill')) $('quizProgressFill').style.width = '0%';

    if (type === 'mc') runMC();
    else if (type === 'typing') runTyping();
  }

  function setQuizProgress() {
    if ($('quizProgressFill')) $('quizProgressFill').style.width = `${(qi / quizPool.length) * 100}%`;
    if ($('quizCounter')) $('quizCounter').textContent = `Soal ${qi + 1} / ${quizPool.length}`;
    if ($('quizScore')) $('quizScore').textContent = `Benar ${qScore}`;
  }

  function showResult(score, total) {
    runId++;
    if ($('quizProgressFill')) $('quizProgressFill').style.width = '100%';
    if ($('mode-mc')) $('mode-mc').hidden = true;
    if ($('mode-typing')) $('mode-typing').hidden = true;
    if ($('mode-result')) $('mode-result').hidden = false;

    if ($('resultScore')) $('resultScore').textContent = `Skor: ${score} / ${total}`;
    const pct = Math.round((score / total) * 100);
    if ($('resultRing')) $('resultRing').style.setProperty('--pct', pct);
    if ($('resultPct')) $('resultPct').textContent = pct + '%';

    playTone('win');
  }

  function runMC() {
    if (qi >= quizPool.length) {
      return showResult(qScore, quizPool.length);
    }

    setQuizProgress();
    answered = false;
    const q = quizPool[qi];
    renderQuizPrompt(q, $('mcQuestionText'), $('mcQuestionSub'));

    if ($('mcFeedback')) {
      $('mcFeedback').textContent = '';
      $('mcFeedback').className = 'feedback-text';
    }
    if ($('btnMcNext')) $('btnMcNext').disabled = true;

    const wrongs = shuffle(rawChapterVocab.filter(v => v.id !== q.id && v.arti !== q.arti)).slice(0, 3);
    const optionsBox = $('mcOptions');
    if (!optionsBox) return;
    optionsBox.innerHTML = '';

    const frag = document.createDocumentFragment();
    shuffle([q, ...wrongs]).forEach((item, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-mc-option';
      btn.dataset.key = ['A', 'B', 'C', 'D'][i];
      btn.dataset.id = item.id;
      btn.textContent = item.arti;

      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;

        optionsBox.querySelectorAll('.btn-mc-option').forEach(b => {
          b.disabled = true;
          if (b.dataset.id === String(q.id)) b.classList.add('correct');
        });

        if (item.id === q.id) {
          qScore++;
          if ($('mcFeedback')) {
            $('mcFeedback').textContent = `✓ Benar! (${q.furigana} = ${q.arti})`;
            $('mcFeedback').classList.add('correct');
          }
          playTone('correct');
          speakJapanese(q.furigana);
        } else {
          btn.classList.add('wrong');
          if ($('mcFeedback')) {
            $('mcFeedback').textContent = `✕ Jawaban: ${q.arti}`;
            $('mcFeedback').classList.add('wrong');
          }
          playTone('wrong');
        }

        if ($('quizScore')) $('quizScore').textContent = `Benar ${qScore}`;
        if ($('btnMcNext')) {
          $('btnMcNext').disabled = false;
          $('btnMcNext').focus();
        }
      });

      frag.appendChild(btn);
    });
    optionsBox.appendChild(frag);
  }

  $('btnMcNext')?.addEventListener('click', () => {
    qi++;
    runMC();
  });

  const normalize = s => s.toLowerCase().replace(/\s*\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();

  function runTyping() {
    if (qi >= quizPool.length) {
      return showResult(qScore, quizPool.length);
    }

    setQuizProgress();
    answered = false;
    const q = quizPool[qi];
    renderQuizPrompt(q, $('typingQuestionText'), $('typingQuestionSub'));

    if ($('typingFeedback')) {
      $('typingFeedback').textContent = '';
      $('typingFeedback').className = 'feedback-text';
    }

    const input = $('typingInput');
    if (!input) return;
    input.value = '';
    input.className = 'input-typing-field';
    input.disabled = false;

    if ($('btnTypingCheck')) $('btnTypingCheck').disabled = false;
    if ($('btnTypingNext')) $('btnTypingNext').disabled = true;

    setTimeout(() => input.focus(), 60);
  }

  function checkTyping() {
    if (answered) return;
    const input = $('typingInput');
    if (!input) return;
    const answer = normalize(input.value);
    if (!answer) return;

    answered = true;
    input.disabled = true;
    if ($('btnTypingCheck')) $('btnTypingCheck').disabled = true;

    const q = quizPool[qi];
    const accepted = [
      normalize(q.arti),
      normalize(q.furigana),
      ...q.arti.split(/[\/,]/).map(normalize),
      ...q.furigana.split(/[\/,]/).map(normalize)
    ].filter(Boolean);

    if (accepted.includes(answer)) {
      qScore++;
      input.classList.add('correct');
      if ($('typingFeedback')) {
        $('typingFeedback').textContent = `✓ Benar! (${q.furigana} — ${q.arti})`;
        $('typingFeedback').classList.add('correct');
      }
      playTone('correct');
      speakJapanese(q.furigana);
    } else {
      input.classList.add('wrong');
      if ($('typingFeedback')) {
        $('typingFeedback').textContent = `Jawaban: ${q.arti} (${q.furigana})`;
        $('typingFeedback').classList.add('wrong');
      }
      playTone('wrong');
    }

    if ($('quizScore')) $('quizScore').textContent = `Benar ${qScore}`;
    if ($('btnTypingNext')) {
      $('btnTypingNext').disabled = false;
      $('btnTypingNext').focus();
    }
  }

  $('btnTypingCheck')?.addEventListener('click', checkTyping);
  $('typingInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') checkTyping();
  });
  $('btnTypingNext')?.addEventListener('click', () => {
    qi++;
    runTyping();
  });

  $('btnRetryQuiz')?.addEventListener('click', () => setMode(mode));
  $('btnResultCards')?.addEventListener('click', () => setMode('carousel'));

  // Pintasan Keyboard Desktop / iPad Keyboard
  // Flashcard: B = Belum, K = Sudah, ArrowLeft/Right = Navigasi, Spasi = Flip, R = Acak, J = Kanji, F = Furigana
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeModal();
      return;
    }
    if (categoryModal && categoryModal.classList.contains('open')) return;
    if (e.target.matches('input, textarea, select') || e.target.isContentEditable) return;

    if (e.code === 'KeyJ') {
      e.preventDefault();
      toggleKanjiVisibility();
    } else if (e.code === 'KeyF') {
      e.preventDefault();
      toggleFuriVisibility();
    } else if (mode === 'carousel') {
      if (e.code === 'KeyB') {
        e.preventDefault();
        markCurrentBelum();
      } else if (e.code === 'KeyK') {
        e.preventDefault();
        markCurrentSudah();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        Carousel.go(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        Carousel.go(-1);
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        handleShuffleCards();
      } else if (e.key === ' ') {
        e.preventDefault();
        Carousel.flipCurrent();
      }
    } else if (mode === 'mc' && /^[1-4]$/.test(e.key)) {
      const opts = document.querySelectorAll('#mcOptions .btn-mc-option');
      const b = opts[+e.key - 1];
      if (b && !b.disabled) b.click();
    }
  });

  // ---------- PEMUATAN DATA JSON PER KATEGORI ----------
  function parseBracketedJapanese(str) {
    const match = str.match(/^(.+?)[（(\[](.+?)[）)\]]$/);
    if (match) {
      return { kanji: match[1].trim(), furigana: match[2].trim() };
    }
    return null;
  }

  function normalizeData(raw) {
    const list = Array.isArray(raw) ? raw : Object.values(raw || {}).find(Array.isArray);
    if (!list) throw new Error('Format JSON harus berupa array kosakata');
    const pick = (o, keys) => {
      for (const k of keys) {
        if (o[k] != null && String(o[k]).trim() !== '') return String(o[k]).trim();
      }
      return '';
    };

    return list
      .filter(o => o && typeof o === 'object')
      .map(o => {
        let rawKanji = pick(o, ['kanji', 'tulisan', 'jp_kanji']);
        let rawFuri = pick(o, ['furigana', 'hiragana', 'kana', 'bacaan', 'cara_baca', 'jepang', 'kata', 'word', 'romaji']);
        const arti = pick(o, ['arti', 'indonesia', 'meaning', 'terjemahan']);

        if (!rawKanji && rawFuri) {
          const parsed = parseBracketedJapanese(rawFuri);
          if (parsed) {
            rawKanji = parsed.kanji;
            rawFuri = parsed.furigana;
          } else if (KANJI_REGEX.test(rawFuri)) {
            rawKanji = rawFuri;
          }
        }

        const furigana = rawFuri || rawKanji;
        const kanji = rawKanji || furigana;
        const hasKanji = KANJI_REGEX.test(kanji);

        return { kanji, furigana, arti, hasKanji };
      })
      .filter(v => v.furigana && v.arti)
      .map((v, idx) => ({ ...v, id: idx }));
  }

  const EMERGENCY_DATA = [
    { kanji: '一', furigana: 'いち', arti: 'Satu' },
    { kanji: '二', furigana: 'に', arti: 'Dua' },
    { kanji: '三', furigana: 'さん', arti: 'Tiga' },
    { kanji: '四', furigana: 'よん / し', arti: 'Empat' },
    { kanji: '五', furigana: 'ご', arti: 'Lima' }
  ].map((v, idx) => ({
    ...v,
    hasKanji: KANJI_REGEX.test(v.kanji),
    id: idx
  }));

  async function changeCategory(categoryObj) {
    currentCategory = categoryObj;
    updateCategoryUI();

    const currentLoad = ++loadId;
    let failMsg = '';
    const path = DATA_PATH(currentCategory);

    try {
      const res = await fetch(path, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`File ${path} tidak ditemukan (${res.status})`);
      const data = normalizeData(await res.json());
      if (currentLoad !== loadId) return;
      rawChapterVocab = data;
    } catch (e) {
      if (currentLoad !== loadId) return;
      rawChapterVocab = EMERGENCY_DATA;
      failMsg = `Gagal memuat "${path}". Menampilkan contoh angka.`;
    }

    if (failMsg) showNotice(failMsg, 4500);
    else hideNotice();

    try {
      localStorage.setItem(SAVE_KEY, currentCategory.path);
      const url = new URL(location.href);
      url.searchParams.set('topik', currentCategory.path);
      history.replaceState(null, '', url);
    } catch (e) {}

    selectedIds = new Set(
      rawChapterVocab
        .filter(v => !isItemMastered(v))
        .map(v => v.id)
    );
    syncActiveVocab(0);
  }

  const urlParam = new URLSearchParams(location.search).get('topik');
  let savedCat = null;
  try { savedCat = localStorage.getItem(SAVE_KEY); } catch (e) {}

  const initialCat = vocabList.find(c => c.path === urlParam) ||
                     vocabList.find(c => c.path === savedCat) ||
                     vocabList[0];

  changeCategory(initialCat);
});