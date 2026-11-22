/**
- NAKAMA GAKKOU — SOUMATOME LEARNING ENGINE + STATUS HAFALAN + JP VOICE ENGINE v2
- Membaca: kode/soumatome1.json, kode/soumatome2.json, dst.
- Interval Pengulangan "Belum": 1 menit -> 5 menit -> 15 menit (tanpa notif pop-up)
 *
- AUDIO v2 (disamakan persis dengan engine Bab 1-25):
-  - selectBestJapaneseVoice(): skor fleksibel (bahasa + kualitas + perkiraan gender), bukan daftar nama saja
-  - voiceschanged + retry berkala agar voice tidak gagal dimuat saat halaman pertama dibuka
-  - speakJapanese(text): satu kanal audio, antrean dibatalkan otomatis -> tidak ada suara ganda
-  - Arsitektur AI TTS opsional via endpoint proxy milik Anda (API key HANYA di server, bukan di frontend)
-  - Jika endpoint kosong / gagal -> otomatis memakai SpeechSynthesis browser
 *
- KONFIGURASI TTS EKSTERNAL (opsional) — pilih salah satu, sebelum script ini dimuat:
-   <meta name="nakama-tts-endpoint" content="/api/tts">
-   atau  <script>window.NAKAMA_TTS_CONFIG = { endpoint: '/api/tts', voiceId: '', style: 'cute' };</script>
 *
- KONTRAK ENDPOINT:
-   POST  { text, lang: 'ja-JP', gender: 'female', style, voiceId }
-   Balasan salah satu: audio biner (Content-Type: audio/*)  ATAU  JSON { audioUrl } / { audioBase64, mimeType }
 */

document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuffle = a => {
    const r = [...a];
    for (let i = r.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [r[i], r[j]] = [r[j], r[i]];
    }
    return r;
  };

  const KANJI_REGEX = /[\u4e00-\u9faf\u3400-\u4dbf々]/;
  const JP_CHAR_REGEX = /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\u3400-\u4dbf々]/;

  // ---------- KONFIGURASI PATH FILE SOUMATOME ----------
  const DATA_PATH = n => `kode/Soumatome${n}.json`;
  const SAVE_KEY = 'nakama:soumatome_part';
  const THEME_KEY = 'nakama_theme';
  const HAFALAN_KEY = 'nakama:soumatome_hafalan_v1';

  // Interval Spaced Repetition dalam menit (1 menit, 5 menit, 15 menit)
  const SR_INTERVALS_MIN = [1, 5, 15];

  const partDataCache = new Map();
  let availableParts = [];

  // ---------- STATE UTAMA ----------
  let currentPart = 1;
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

  function getPartStore(partNum = currentPart) {
    if (!hafalanStore[partNum]) hafalanStore[partNum] = {};
    return hafalanStore[partNum];
  }

  function getItemHafalan(item) {
    return getPartStore()[getItemKey(item)] || null;
  }

  function isItemMastered(item) {
    const rec = getItemHafalan(item);
    return rec && rec.status === 'sudah';
  }

  function isItemDue(item, now = Date.now()) {
    const rec = getItemHafalan(item);
    return rec && rec.status === 'belum' && rec.nextReview && rec.nextReview <= now;
  }

  function updateHafalanSummary() {
    const summaryEl = $('hafalanSummary');
    if (!summaryEl) return;
    const total = rawChapterVocab.length;
    const masteredCount = rawChapterVocab.filter(isItemMastered).length;
    summaryEl.textContent = `Hafal: ${masteredCount} / ${total}`;
  }

  // ---------- FITUR DARK MODE / LIGHT MODE ----------
  const btnThemeToggle = $('btnThemeToggle');

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
      localStorage.setItem('nakama:theme', theme);
    } catch (e) {}
  }

  let savedTheme = 'light';
  try {
    savedTheme = localStorage.getItem(THEME_KEY) || localStorage.getItem('nakama:theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  } catch (e) {}
  applyTheme(savedTheme);

  if (btnThemeToggle) {
    btnThemeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      applyTheme(current === 'dark' ? 'light' : 'dark');
      playTone('pop');
    });
  }

  // =====================================================================
  //  AUDIO ENGINE v2 — SUARA JEPANG (SpeechSynthesis + opsi AI TTS via proxy)
  // =====================================================================
  let actx = null;

  // ---- Konfigurasi TTS eksternal (tanpa secret di frontend) ----
  const TTS_CONFIG = (() => {
    const meta = document.querySelector('meta[name="nakama-tts-endpoint"]');
    const user = window.NAKAMA_TTS_CONFIG || {};
    return {
      endpoint: String(user.endpoint || (meta && meta.content) || '').trim(),
      voiceId: user.voiceId || '',
      style: user.style || 'cute',
      timeoutMs: user.timeoutMs || 6000,
      cacheMax: user.cacheMax || 80,
      failCooldownMs: user.failCooldownMs || 60000
    };
  })();

  // ---- State suara ----
  let jpVoice = null;
  let jpVoiceInfo = { tier: 'none', femaleHint: 'unknown', name: '' };
  let voiceRetryTimers = [];

  // Petunjuk gender dari nama/URI voice. Browser TIDAK menyediakan properti gender,
  // jadi ini hanya heuristik; hasilnya bisa meleset di perangkat tertentu.
  const FEMALE_HINT = /(female|woman|girl|kyoko|o-?ren|haruka|ayumi|sayaka|nanami|aoi|mayu|shiori|mizuki|ichika|momo|sakura|yui|hina|ja-jp-x-(htm|jab)|google (日本語|japanese))/;
  const MALE_HINT = /(\bmale\b|\bman\b|keita|otoya|ichiro|daichi|naoki|hattori|takumi|kenji|ryo\b|ja-jp-x-(jac|jad))/;

  // Kata kunci kualitas (bukan jaminan, hanya indikator)
  const QUALITY_HIGH = /(neural|natural|premium|enhanced|high[\s-]?quality|wavenet|studio|online|siri)/;
  const QUALITY_LOW = /(compact|espeak|novelty|robot)/;

  const normLang = l => String(l || '').toLowerCase().replace('_', '-');

  function scoreVoice(v) {
    const name = `${v.name || ''} ${v.voiceURI || ''}`.toLowerCase();
    const lang = normLang(v.lang);
    let s = 0;

    // Bahasa
    if (lang === 'ja-jp') s += 60;
    else if (lang.startsWith('ja')) s += 45;
    else return -Infinity;

    // Perkiraan gender (cewek diutamakan)
    const looksFemale = FEMALE_HINT.test(name);
    const looksMale = MALE_HINT.test(name);
    if (looksMale && !looksFemale) s -= 200;
    else if (looksFemale) s += 90;

    // Kualitas
    if (QUALITY_HIGH.test(name)) s += 70;
    if (QUALITY_LOW.test(name)) s -= 60;
    if (!v.localService) s += 25;            // voice online/jaringan umumnya lebih natural
    if (/microsoft/.test(name) && /online|natural/.test(name)) s += 30;
    if (/google/.test(name)) s += 20;
    if (v.default) s += 3;

    return s;
  }

  function tierOf(v) {
    const name = `${v.name || ''} ${v.voiceURI || ''}`.toLowerCase();
    if (QUALITY_HIGH.test(name)) return 'high';
    if (!v.localService) return 'good';
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

  // Muat voice dengan benar: langsung, via voiceschanged, dan retry berkala
  // (Chrome sering mengisi daftar voice secara asinkron).
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
    voiceRetryTimers = [250, 600, 1200, 2500, 5000].map(ms =>
      setTimeout(() => { if (!jpVoice) selectBestJapaneseVoice(); }, ms)
    );
  }
  initVoices();

  // Gesture pertama pengguna: segarkan daftar voice (membantu Chrome Android)
  window.addEventListener('pointerdown', () => {
    if (!jpVoice) selectBestJapaneseVoice();
  }, { once: true, passive: true });

  // ---- Profil suara: lembut, jernih, sedikit tinggi tapi tetap natural ----
  function getVoiceProfile() {
    if (jpVoiceInfo.tier === 'high') {
      // Voice neural/natural sudah ekspresif: jangan dipaksa terlalu tinggi
      return { rate: 0.92, pitch: 1.08, volume: 1.0 };
    }
    if (jpVoiceInfo.femaleHint === 'male') {
      // Hanya voice cowok yang tersedia: naikkan pitch sedikit (hasil tetap terbatas)
      return { rate: 0.93, pitch: 1.35, volume: 1.0 };
    }
    return { rate: 0.9, pitch: 1.18, volume: 1.0 };
  }

  // ---- Persiapan teks agar pelafalan lebih akurat ----
  // Pemanggil sudah mengirim furigana (bacaan), jadi kanji tidak salah dibaca.
  function prepareSpeechText(text) {
    let t = String(text == null ? '' : text)
      .replace(/[（(][^）)]*[）)]/g, ' ')   // buang keterangan dalam kurung
      .replace(/[〜～~]/g, '')               // tanda "sampai/pola"
      .replace(/[\/／]/g, '、')              // pemisah varian -> jeda
      .replace(/\s+/g, ' ')
      .trim();
    if (!t) return '';
    if (!/[。！？!?、.]$/.test(t)) t += '。';  // akhiran memberi intonasi turun yang natural
    return t;
  }

  // ---- Kanal audio tunggal (anti suara ganda) ----
  let speakToken = 0;
  let currentUtterance = null;      // referensi agar tidak di-GC (bug Chrome)
  let audioEl = null;               // satu elemen <audio> dipakai ulang
  let remoteAbort = null;
  let remoteFailUntil = 0;
  let lastSpoken = { text: '', at: 0 };
  const remoteCache = new Map();    // teks -> URL audio

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

    if (token !== speakToken || !audioOn) return;   // sudah digantikan permintaan baru

    if (!audioEl) audioEl = new Audio();
    audioEl.src = url;
    audioEl.volume = 1.0;
    await audioEl.play();                           // gagal -> fallback ke browser TTS
  }

  function speakWithBrowser(text, token) {
    if (!('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    if (!jpVoice) selectBestJapaneseVoice();

    try { synth.cancel(); } catch (e) {}

    // Jeda singkat setelah cancel() mencegah Chrome menelan utterance berikutnya
    setTimeout(() => {
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
    }, 60);
  }

  // API publik lama dipertahankan: speakJapanese(text)
  function speakJapanese(text) {
    if (!audioOn || !text) return;

    const spoken = prepareSpeechText(text);
    if (!spoken) return;

    // Abaikan ketukan beruntun untuk teks yang sama (<250 ms)
    const t = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    if (spoken === lastSpoken.text && t - lastSpoken.at < 250) return;
    lastSpoken = { text: spoken, at: t };

    stopPlayback();                 // hentikan suara sebelumnya -> tidak ada tumpang tindih
    const token = ++speakToken;

    if (remoteAvailable()) {
      speakWithRemote(spoken, token).catch(() => {
        if (token !== speakToken) return;                 // sengaja dibatalkan
        remoteFailUntil = Date.now() + TTS_CONFIG.failCooldownMs;
        speakWithBrowser(spoken, token);                  // fallback otomatis
      });
    } else {
      speakWithBrowser(spoken, token);
    }
  }

  // Hentikan suara saat tab disembunyikan / halaman ditutup
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopSpeech(); });
  window.addEventListener('pagehide', stopSpeech);

  // Info diagnostik (opsional, untuk Console): NakamaVoice.info()
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

  // ---------- EFEK BUNYI UI (WEB AUDIO) ----------
  const TONES = {
    pop: ['sine', 560, 290, 0.08, 0.1],
    correct: ['sine', 580, 1160, 0.18, 0.16],
    wrong: ['sawtooth', 280, 150, 0.18, 0.12],
    flip: ['sine', 420, 240, 0.07, 0.08],
    win: ['triangle', 523, 1046, 0.35, 0.16]
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

  // ---------- VISUAL FX ----------
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;

  if (!reduce) {
    const sun = $('sun');
    if (sun && fine) {
      addEventListener('pointermove', e => {
        sun.style.transform = `translate(${(e.clientX / innerWidth - 0.5) * -30}px, ${(e.clientY / innerHeight - 0.5) * -30}px)`;
      });
    }

    const fx = $('fx');
    const sparkColors = ['#D8F5E0', '#DFF2FE', '#FEF0C7', '#EDE4FF'];
    addEventListener('pointerdown', e => {
      if (!fx || e.target.closest('button, input, a')) return;
      const pulse = document.createElement('div');
      pulse.className = 'pulse';
      pulse.style.left = e.clientX + 'px';
      pulse.style.top = e.clientY + 'px';
      pulse.onanimationend = () => pulse.remove();
      fx.appendChild(pulse);

      for (let i = 0; i < 4; i++) {
        const angle = (Math.PI * 2 * i) / 4 + Math.random() * 0.5;
        const dist = 32 + Math.random() * 40;
        const sp = document.createElement('span');
        sp.className = 'spark';
        sp.style.left = e.clientX + 'px';
        sp.style.top = e.clientY + 'px';
        sp.style.background = sparkColors[i % sparkColors.length];
        sp.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
        sp.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
        sp.style.setProperty('--r', `${(Math.random() - 0.5) * 160}deg`);
        sp.onanimationend = () => sp.remove();
        fx.appendChild(sp);
      }
    });

    const canvas = $('mouseTrail');
    if (canvas && fine) {
      const cctx = canvas.getContext('2d');
      const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      window.addEventListener('resize', resizeCanvas);
      resizeCanvas();

      let mx = -100, my = -100, x = mx, y = my;
      const pts = [];

      window.addEventListener('pointermove', e => {
        mx = e.clientX;
        my = e.clientY;
      });

      (function drawTrail() {
        x += (mx - x) * 0.32;
        y += (my - y) * 0.32;
        pts.push({ x, y });
        if (pts.length > 14) pts.shift();

        cctx.clearRect(0, 0, canvas.width, canvas.height);
        cctx.lineCap = 'round';
        cctx.lineJoin = 'round';

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        for (let i = 1; i < pts.length; i++) {
          const t = i / pts.length;
          cctx.strokeStyle = isDark ? `rgba(110, 231, 183, ${t * 0.24})` : `rgba(21, 128, 61, ${t * 0.18})`;
          cctx.lineWidth = t * 8;
          cctx.beginPath();
          cctx.moveTo(pts[i - 1].x, pts[i - 1].y);
          cctx.lineTo(pts[i].x, pts[i].y);
          cctx.stroke();
        }
        requestAnimationFrame(drawTrail);
      })();
    }
  }

  // ---------- NOTIFIKASI STATUS DATA (HANYA UNTUK ERROR / PERINGATAN) ----------
  let noticeTimer = null;
  function showNotice(msg, autoHide = 0) {
    const n = $('dataNotice');
    clearTimeout(noticeTimer);
    n.textContent = msg;
    n.hidden = false;
    if (autoHide) noticeTimer = setTimeout(() => { n.hidden = true; }, autoHide);
  }
  const hideNotice = () => { clearTimeout(noticeTimer); $('dataNotice').hidden = true; };

  // ---------- MODAL PILIH PART SOUMATOME ----------
  const modalGrid = $('modalChapterGrid');
  const chapterModal = $('chapterModal');
  const openModalBtn = $('openChapterModal');
  const closeModalBtn = $('closeChapterModal');
  const currentChapterDisplay = $('currentChapterDisplay');
  let gridButtons = [];

  function buildModalButtons(parts) {
    modalGrid.innerHTML = '';
    gridButtons = [];

    parts.forEach(partNum => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chapter-grid-item';
      btn.dataset.part = partNum;
      btn.innerHTML = `
        <span class="cgi-num">Part ${partNum}</span>
        <span class="cgi-label">SOUMATOME</span>
      `;

      btn.addEventListener('click', () => {
        changePart(partNum);
        closeModal();
      });

      modalGrid.appendChild(btn);
      gridButtons.push(btn);
    });

    updatePartUI();
  }

  function openModal() { chapterModal.classList.add('open'); }
  function closeModal() { chapterModal.classList.remove('open'); }

  openModalBtn.addEventListener('click', openModal);
  closeModalBtn.addEventListener('click', closeModal);
  chapterModal.addEventListener('click', e => {
    if (e.target === chapterModal) closeModal();
  });

  function updatePartUI() {
    currentChapterDisplay.textContent = `Part ${currentPart}`;
    document.title = `Nakama Gakkou — Part ${currentPart}`;
    gridButtons.forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.part, 10) === currentPart);
    });
  }

  // ---------- KONTROL KARTU: KANJI, FURIGANA, ARAH, ACAK ----------
  function updateCardVisibilityUI() {
    const container = $('carouselContainer');
    container.classList.toggle('kanji-off', !isKanjiVisible);
    container.classList.toggle('furi-off', !isFuriVisible);

    $('toggleKanjiLabel').textContent = isKanjiVisible ? 'Kanji: ON' : 'Kanji: OFF';
    $('kanjiStatusDot').classList.toggle('is-off', !isKanjiVisible);
    $('toggleKanjiBtn').classList.toggle('bg-matcha', isKanjiVisible);
    $('toggleKanjiBtn').classList.toggle('bg-surface', !isKanjiVisible);

    $('toggleFuriLabel').textContent = isFuriVisible ? 'Furigana: ON' : 'Furigana: OFF';
    $('furiStatusDot').classList.toggle('is-off', !isFuriVisible);
    $('toggleFuriBtn').classList.toggle('bg-sky', isFuriVisible);
    $('toggleFuriBtn').classList.toggle('bg-surface', !isFuriVisible);
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
    $('swapDirectionLabel').textContent = isReversedCard ? 'JP ➔ ID' : 'ID ➔ JP';
    Carousel.render(Carousel.index);
    playTone('flip');
  }

  function handleShuffleCards() {
    if (activeVocab.length <= 1) return;
    activeVocab = shuffle(activeVocab);
    Carousel.render(0);
    playTone('pop');
  }

  $('toggleKanjiBtn').addEventListener('click', toggleKanjiVisibility);
  $('toggleFuriBtn').addEventListener('click', toggleFuriVisibility);
  $('swapDirectionBtn').addEventListener('click', toggleCardDirection);
  $('shuffleBtn').addEventListener('click', handleShuffleCards);

  // ---------- PRIORITAS ANTREAN SPACED REPETITION ----------
  function prioritizeVocab(list) {
    const now = Date.now();
    return [...list].sort((a, b) => {
      const aDue = isItemDue(a, now) ? 1 : 0;
      const bDue = isItemDue(b, now) ? 1 : 0;
      if (aDue !== bDue) return bDue - aDue;

      const recA = getItemHafalan(a);
      const recB = getItemHafalan(b);
      const aBelum = recA && recA.status === 'belum' ? 1 : 0;
      const bBelum = recB && recB.status === 'belum' ? 1 : 0;

      if (aBelum && bBelum) {
        return (recA.nextReview || 0) - (recB.nextReview || 0);
      }
      return a.id - b.id;
    });
  }

  // ---------- PENCARIAN & CHECKLIST ----------
  const searchInput = $('searchInput');
  const btnClearSearch = $('btnClearSearch');

  function syncActiveVocab(preserveIndex = 0) {
    const query = searchInput.value.trim().toLowerCase();
    btnClearSearch.hidden = !query;

    const filtered = rawChapterVocab.filter(item => {
      if (!selectedIds.has(item.id)) return false;
      if (!query) return true;
      const arti = (item.arti || '').toLowerCase();
      const furi = (item.furigana || '').toLowerCase();
      const kanji = (item.kanji || '').toLowerCase();
      return arti.includes(query) || furi.includes(query) || kanji.includes(query);
    });

    activeVocab = prioritizeVocab(filtered);

    $('selectedCountBadge').textContent = `${selectedIds.size} / ${rawChapterVocab.length} Terpilih`;
    updateHafalanSummary();

    if (mode === 'carousel') {
      Carousel.render(preserveIndex);
    } else if (mode === 'list') {
      renderChecklist();
    } else if (mode === 'mc' || mode === 'typing') {
      startQuiz(mode);
    }

    if (query && activeVocab.length === 0) {
      showNotice(`Tidak ditemukan "${query}" pada pilihan Part ${currentPart}.`);
    } else {
      hideNotice();
    }
  }

  searchInput.addEventListener('input', () => syncActiveVocab(0));
  btnClearSearch.addEventListener('click', () => {
    searchInput.value = '';
    syncActiveVocab(0);
    searchInput.focus();
  });

  function renderChecklist() {
    const grid = $('checklistGrid');
    grid.innerHTML = '';

    const query = searchInput.value.trim().toLowerCase();
    const listToShow = !query
      ? rawChapterVocab
      : rawChapterVocab.filter(item =>
          item.arti.toLowerCase().includes(query) ||
          item.furigana.toLowerCase().includes(query) ||
          item.kanji.toLowerCase().includes(query)
        );

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
        const store = getPartStore();
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
        $('selectedCountBadge').textContent = `${selectedIds.size} / ${rawChapterVocab.length} Terpilih`;
        const q = searchInput.value.trim().toLowerCase();
        activeVocab = prioritizeVocab(
          rawChapterVocab.filter(v =>
            selectedIds.has(v.id) &&
            (!q || v.arti.toLowerCase().includes(q) || v.furigana.toLowerCase().includes(q) || v.kanji.toLowerCase().includes(q))
          )
        );
      });

      grid.appendChild(tile);
    });
  }

  $('selectAllBtn').addEventListener('click', () => {
    const store = getPartStore();
    rawChapterVocab.forEach(v => {
      selectedIds.add(v.id);
      const k = getItemKey(v);
      if (store[k] && store[k].status === 'sudah') delete store[k];
    });
    saveHafalanStore();
    playTone('pop');
    syncActiveVocab(0);
  });

  $('selectKanjiOnlyBtn').addEventListener('click', () => {
    const kanjiItems = rawChapterVocab.filter(v => v.hasKanji);
    if (!kanjiItems.length) {
      showNotice(`Part ${currentPart} tidak memiliki kosakata ber-Kanji.`, 3000);
      return;
    }
    selectedIds = new Set(kanjiItems.map(v => v.id));
    playTone('pop');
    syncActiveVocab(0);
  });

  $('selectKanaOnlyBtn').addEventListener('click', () => {
    const kanaItems = rawChapterVocab.filter(v => !v.hasKanji);
    if (!kanaItems.length) {
      showNotice(`Semua kosakata di Part ${currentPart} mengandung Kanji.`, 3000);
      return;
    }
    selectedIds = new Set(kanaItems.map(v => v.id));
    playTone('pop');
    syncActiveVocab(0);
  });

  $('deselectAllBtn').addEventListener('click', () => {
    selectedIds.clear();
    playTone('pop');
    syncActiveVocab(0);
  });

  // ---------- AKSI STATUS HAFALAN: "SUDAH" & "BELUM" (TANPA NOTIF) ----------
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

    const store = getPartStore();
    store[getItemKey(item)] = {
      status: 'sudah',
      level: 0,
      nextReview: null,
      updatedAt: Date.now()
    };
    saveHafalanStore();

    selectedIds.delete(item.id);
    playTone('correct');

    const nextIdx = Math.min(Carousel.index, Math.max(0, activeVocab.length - 2));
    syncActiveVocab(nextIdx);
  }

  function markCurrentBelum() {
    if (!activeVocab.length) return;
    const item = activeVocab[Carousel.index];
    if (!item) return;

    const store = getPartStore();
    const key = getItemKey(item);
    const prev = store[key];

    const nextLevel = (prev && prev.status === 'belum')
      ? Math.min((prev.level || 0) + 1, SR_INTERVALS_MIN.length - 1)
      : 0;
    const delayMin = SR_INTERVALS_MIN[nextLevel];

    store[key] = {
      status: 'belum',
      level: nextLevel,
      nextReview: Date.now() + delayMin * 60 * 1000,
      updatedAt: Date.now()
    };
    saveHafalanStore();

    selectedIds.add(item.id);
    playTone('pop');

    if (activeVocab.length > 1) {
      const [moved] = activeVocab.splice(Carousel.index, 1);
      activeVocab.push(moved);
      const nextIdx = Carousel.index >= activeVocab.length ? 0 : Carousel.index;
      Carousel.render(nextIdx);
    } else {
      Carousel.render(0);
    }
  }

  btnStatusSudah?.addEventListener('click', markCurrentSudah);
  btnStatusBelum?.addEventListener('click', markCurrentBelum);

  // Pemeriksa Otomatis Spaced Repetition (tanpa notif pop-up)
  setInterval(() => {
    if (mode !== 'carousel' || !activeVocab.length) return;
    const now = Date.now();
    const dueIdx = activeVocab.findIndex((item, idx) => idx !== Carousel.index && isItemDue(item, now));
    if (dueIdx !== -1) {
      const [dueItem] = activeVocab.splice(dueIdx, 1);
      const insertPos = Math.min(Carousel.index + 1, activeVocab.length);
      activeVocab.splice(insertPos, 0, dueItem);

      const currentCardEl = $('carouselContainer')?.children[Carousel.index];
      const isFlipped = currentCardEl && currentCardEl.classList.contains('is-flipped');
      if (!isFlipped) {
        Carousel.render(insertPos);
      }
    }
  }, 5000);

  // ---------- FLASHCARD KOSAKATA INTERAKTIF ----------
  function buildJapaneseContentHTML(v, includeSubArti = false) {
    if (v.hasKanji) {
      return `
        <span class="c-kanji furigana-font">${esc(v.kanji)}</span>
        <span class="c-furigana-pill furigana-font">${esc(v.furigana)}</span>
        ${includeSubArti ? `<span class="c-arti-sub">${esc(v.arti)}</span>` : ''}
      `;
    }
    return `
      <span class="c-kana-only furigana-font">${esc(v.furigana)}</span>
      ${includeSubArti ? `<span class="c-arti-sub">${esc(v.arti)}</span>` : ''}
    `;
  }

  const Carousel = {
    index: 0,
    render(startIndex = 0) {
      const container = $('carouselContainer');
      container.innerHTML = '';
      updateCardVisibilityUI();
      updateStatusButtonsState();

      if (!activeVocab.length) {
        $('carouselCounter').textContent = '0 / 0';
        const allDone = rawChapterVocab.length > 0 && rawChapterVocab.every(isItemMastered);
        container.innerHTML = `
          <div class="chapter-flashcard center">
            <div class="carousel-card-inner">
              <div class="carousel-face front">
                <div class="face-top-bar"><span class="c-tag">${allDone ? 'Selesai' : 'Info'}</span></div>
                <div class="face-center-content"><span class="c-arti">${allDone ? 'Semua Sudah Hafal!' : 'Tidak Ada Kata Aktif'}</span></div>
                <div class="face-bottom-hint">${allDone ? 'Buka "Pilih Kata" untuk mengulang materi lagi' : 'Pilih kata di menu "Pilih Kata" atau ubah pencarian'}</div>
              </div>
            </div>
          </div>`;
        return;
      }

      const now = Date.now();
      activeVocab.forEach((v, i) => {
        const card = document.createElement('div');
        card.className = `chapter-flashcard hidden ${v.hasKanji ? 'has-kanji' : 'kana-only-card'}`;

        const rec = getItemHafalan(v);
        const srBadge = (rec && rec.status === 'belum')
          ? `<span class="sr-badge">${rec.nextReview <= now ? 'Ulang Sekarang' : 'Perlu Diulang'}</span>`
          : '';

        const frontTag = isReversedCard ? 'Bahasa Jepang' : 'Bahasa Indonesia';
        const backTag = isReversedCard ? 'Bahasa Indonesia' : 'Bahasa Jepang';

        const frontContent = isReversedCard
          ? buildJapaneseContentHTML(v, false)
          : `<span class="c-arti">${esc(v.arti)}</span>`;

        const backContent = isReversedCard
          ? `<span class="c-arti">${esc(v.arti)}</span>`
          : buildJapaneseContentHTML(v, true);

        const frontHint = isReversedCard
          ? 'Ketuk kartu untuk melihat arti &rarr;'
          : 'Ketuk kartu untuk melihat bahasa Jepang &rarr;';

        card.innerHTML = `
          <div class="carousel-card-inner">
            <div class="carousel-face front">
              <div class="face-top-bar">
                <div class="face-tags-left">
                  <span class="c-tag">${frontTag}</span>
                  ${srBadge}
                </div>
                <button type="button" class="btn-card-speak" data-speak="${esc(v.furigana)}" title="Dengarkan Bahasa Jepang">
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
                <button type="button" class="btn-card-speak" data-speak="${esc(v.furigana)}" title="Dengarkan Pengucapan">
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
          if (i === this.index) {
            const willFlipToBack = !card.classList.contains('is-flipped');
            card.classList.toggle('is-flipped');
            playTone('flip');
            if (willFlipToBack) speakJapanese(v.furigana);
          } else {
            this.index = i;
            this.update();
            playTone('pop');
          }
        });

        container.appendChild(card);
      });

      this.index = Math.max(0, Math.min(startIndex, activeVocab.length - 1));
      this.update();
    },
    update() {
      const cards = $('carouselContainer').children;
      const n = activeVocab.length;
      $('carouselCounter').textContent = n ? `${Math.min(this.index + 1, n)} / ${n}` : '0 / 0';
      updateStatusButtonsState();
      if (!n) return;

      [...cards].forEach((c, i) => {
        c.style.transform = '';
        if (i === this.index) {
          c.classList.remove('hidden');
          c.classList.add('center');
        } else {
          c.classList.remove('center', 'is-flipped');
          c.classList.add('hidden');
        }
      });
    },
    flipCurrent() {
      if (!activeVocab.length) return;
      const cards = $('carouselContainer').children;
      const activeCard = cards[this.index];
      if (activeCard) activeCard.click();
    },
    go(dir) {
      if (!activeVocab.length) return;
      this.index = (this.index + dir + activeVocab.length) % activeVocab.length;
      this.update();
      playTone('pop');
    }
  };

  $('btnCarouselNext').addEventListener('click', () => Carousel.go(1));
  $('btnCarouselPrev').addEventListener('click', () => Carousel.go(-1));

  // Swipe Jari Kiri/Kanan di Flashcard HP
  let touchStartX = 0;
  let touchDeltaX = 0;
  const carouselEl = $('carouselContainer');

  if (carouselEl) {
    carouselEl.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
      touchDeltaX = 0;
    }, { passive: true });

    carouselEl.addEventListener('touchmove', e => {
      const activeCard = carouselEl.children[Carousel.index];
      if (!activeCard) return;
      touchDeltaX = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(touchDeltaX) > 10) {
        const clamped = Math.max(-70, Math.min(70, touchDeltaX * 0.45));
        activeCard.style.transform = `translateX(${clamped}px) rotate(${clamped * 0.05}deg)`;
      }
    }, { passive: true });

    carouselEl.addEventListener('touchend', () => {
      const activeCard = carouselEl.children[Carousel.index];
      if (activeCard) activeCard.style.transform = '';
      if (Math.abs(touchDeltaX) > 40) {
        if (touchDeltaX < 0) Carousel.go(1);
        else Carousel.go(-1);
      }
      touchDeltaX = 0;
    }, { passive: true });
  }

  // ---------- ZOOM UKURAN TEKS ----------
  function updateVocabFontSize() {
    document.documentElement.style.setProperty('--vocab-font-size', `${vocabZoomRem}rem`);
  }
  $('btnZoomIn').addEventListener('click', () => {
    if (vocabZoomRem < 5.0) { vocabZoomRem = +(vocabZoomRem + 0.3).toFixed(1); updateVocabFontSize(); }
  });
  $('btnZoomOut').addEventListener('click', () => {
    if (vocabZoomRem > 2.0) { vocabZoomRem = +(vocabZoomRem - 0.3).toFixed(1); updateVocabFontSize(); }
  });

  $('btnMcSpeak')?.addEventListener('click', () => { if (quizPool[qi]) speakJapanese(quizPool[qi].furigana); });
  $('btnTypingSpeak')?.addEventListener('click', () => { if (quizPool[qi]) speakJapanese(quizPool[qi].furigana); });

  // ---------- NAVIGASI MODE PEMBELAJARAN ----------
  function setMode(newMode) {
    mode = newMode;
    runId++;

    document.querySelectorAll('.dock-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === newMode);
    });

    $('mode-carousel').hidden = (newMode !== 'carousel');
    $('mode-list').hidden = (newMode !== 'list');
    $('mode-result').hidden = true;
    $('quiz-global-header').hidden = (newMode !== 'mc' && newMode !== 'typing');

    $('mode-mc').hidden = (newMode !== 'mc');
    $('mode-typing').hidden = (newMode !== 'typing');

    if (newMode === 'carousel') {
      Carousel.render(Carousel.index);
    } else if (newMode === 'list') {
      renderChecklist();
    } else {
      startQuiz(newMode);
    }
  }

  document.querySelectorAll('.dock-item').forEach(b => {
    b.addEventListener('click', () => setMode(b.dataset.mode));
  });

  $('btnBack').addEventListener('click', () => {
    if (mode !== 'carousel') {
      setMode('carousel');
    } else if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '../index.html';
    }
  });

  $('btnAudioToggle').addEventListener('click', function () {
    audioOn = !audioOn;
    if (!audioOn) stopSpeech();   // [AUDIO v2] matikan suara yang sedang berjalan saat OFF
    this.querySelector('.icon-unmuted').style.display = audioOn ? 'block' : 'none';
    this.querySelector('.icon-muted').style.display = audioOn ? 'none' : 'block';
  });

  // ---------- SISTEM KUIS ----------
  function renderQuizPrompt(q, mainEl, subEl) {
    if (q.hasKanji && isKanjiVisible) {
      mainEl.textContent = q.kanji;
      subEl.textContent = isFuriVisible ? q.furigana : '';
      subEl.hidden = !isFuriVisible;
    } else {
      mainEl.textContent = q.furigana;
      subEl.textContent = '';
      subEl.hidden = true;
    }
  }

  function startQuiz(type) {
    if (activeVocab.length < 4) {
      showNotice('Minimal 4 kosakata terpilih diperlukan untuk latihan kuis.', 4000);
      setMode('carousel');
      return;
    }

    quizPool = shuffle(activeVocab);
    qi = 0;
    qScore = 0;
    answered = false;

    $('quizTitle').textContent = type === 'mc' ? `Pilihan Ganda · Part ${currentPart}` : `Mengetik · Part ${currentPart}`;
    $('quizProgressFill').style.width = '0%';

    if (type === 'mc') runMC();
    else if (type === 'typing') runTyping();
  }

  function setQuizProgress() {
    $('quizProgressFill').style.width = `${(qi / quizPool.length) * 100}%`;
    $('quizCounter').textContent = `Soal ${qi + 1} / ${quizPool.length}`;
    $('quizScore').textContent = `Benar ${qScore}`;
  }

  function showResult(score, total) {
    runId++;
    $('quizProgressFill').style.width = '100%';
    $('mode-mc').hidden = true;
    $('mode-typing').hidden = true;
    $('mode-result').hidden = false;

    $('resultScore').textContent = `Skor: ${score} / ${total}`;
    const pct = Math.round((score / total) * 100);
    $('resultRing').style.setProperty('--pct', pct);
    $('resultPct').textContent = pct + '%';

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

    $('mcFeedback').textContent = '';
    $('mcFeedback').className = 'feedback-text';
    $('btnMcNext').disabled = true;

    const wrongs = shuffle(rawChapterVocab.filter(v => v.id !== q.id && v.arti !== q.arti)).slice(0, 3);
    const optionsBox = $('mcOptions');
    optionsBox.innerHTML = '';

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
          $('mcFeedback').textContent = '✓ Jawaban Benar!';
          $('mcFeedback').classList.add('correct');
          playTone('correct');
          speakJapanese(q.furigana);
        } else {
          btn.classList.add('wrong');
          $('mcFeedback').textContent = `✕ Jawaban: ${q.arti}`;
          $('mcFeedback').classList.add('wrong');
          playTone('wrong');
        }

        $('quizScore').textContent = `Benar ${qScore}`;
        $('btnMcNext').disabled = false;
        $('btnMcNext').focus();
      });

      optionsBox.appendChild(btn);
    });
  }

  $('btnMcNext').addEventListener('click', () => {
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

    $('typingFeedback').textContent = '';
    $('typingFeedback').className = 'feedback-text';

    const input = $('typingInput');
    input.value = '';
    input.className = 'input-typing-field';
    input.disabled = false;

    $('btnTypingCheck').disabled = false;
    $('btnTypingNext').disabled = true;

    setTimeout(() => input.focus(), 60);
  }

  function checkTyping() {
    if (answered) return;
    const input = $('typingInput');
    const answer = normalize(input.value);
    if (!answer) return;

    answered = true;
    input.disabled = true;
    $('btnTypingCheck').disabled = true;

    const q = quizPool[qi];
    const accepted = [
      normalize(q.arti),
      normalize(q.furigana),
      ...q.arti.split(/[\/,]/).map(normalize)
    ].filter(Boolean);

    if (accepted.includes(answer)) {
      qScore++;
      input.classList.add('correct');
      $('typingFeedback').textContent = `✓ Benar! (${q.furigana} — ${q.arti})`;
      $('typingFeedback').classList.add('correct');
      playTone('correct');
      speakJapanese(q.furigana);
    } else {
      input.classList.add('wrong');
      $('typingFeedback').textContent = `Jawaban: ${q.arti} (${q.furigana})`;
      $('typingFeedback').classList.add('wrong');
      playTone('wrong');
    }

    $('quizScore').textContent = `Benar ${qScore}`;
    $('btnTypingNext').disabled = false;
    $('btnTypingNext').focus();
  }

  $('btnTypingCheck').addEventListener('click', checkTyping);
  $('typingInput').addEventListener('keydown', e => { if (e.key === 'Enter') checkTyping(); });
  $('btnTypingNext').addEventListener('click', () => {
    qi++;
    runTyping();
  });

  $('btnRetryQuiz').addEventListener('click', () => setMode(mode));
  $('btnResultCards').addEventListener('click', () => setMode('carousel'));

  // Pintasan Keyboard Desktop
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
    if (e.target.matches('input, textarea, select')) return;

    if (e.code === 'KeyK') {
      e.preventDefault();
      toggleKanjiVisibility();
    } else if (e.code === 'KeyF') {
      e.preventDefault();
      toggleFuriVisibility();
    } else if (mode === 'carousel') {
      if (e.key === 'ArrowRight') Carousel.go(1);
      else if (e.key === 'ArrowLeft') Carousel.go(-1);
      else if (e.code === 'KeyR') {
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

  // ---------- PARSER UNIVERSAL JSON SOUMATOME ----------
  function parseBracketedJapanese(str) {
    const match = str.match(/^(.+?)[（(\[](.+?)[）)\]]$/);
    if (match) {
      return { kanji: match[1].trim(), furigana: match[2].trim() };
    }
    return null;
  }

  function extractVocabArray(raw) {
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === 'object') {
      for (const val of Object.values(raw)) {
        if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') {
          return val;
        }
      }
      const combined = [];
      for (const val of Object.values(raw)) {
        if (Array.isArray(val)) combined.push(...val);
      }
      if (combined.length > 0) return combined;
    }
    return [];
  }

  function normalizeData(raw) {
    const list = extractVocabArray(raw);
    if (!list.length) throw new Error('Data kosakata kosong');

    const pick = (o, keys) => {
      for (const k of keys) {
        if (o[k] != null && String(o[k]).trim() !== '') return String(o[k]).trim();
      }
      return '';
    };

    return list
      .filter(o => o && typeof o === 'object')
      .map(o => {
        let rawKanji = pick(o, ['kanji', 'tulisan', 'jp_kanji', 'kotoba', 'vocab', 'vocabulary', 'char', 'character']);
        let rawFuri = pick(o, ['furigana', 'hiragana', 'kana', 'bacaan', 'cara_baca', 'reading', 'yomi', 'furi', 'romaji', 'jepang', 'jp', 'kata', 'word']);
        let arti = pick(o, ['arti', 'indonesia', 'meaning', 'terjemahan', 'id', 'indo', 'indonesian', 'definisi', 'translation']);

        if (!arti || (!rawFuri && !rawKanji)) {
          const strVals = Object.values(o)
            .filter(v => typeof v === 'string' && v.trim() !== '')
            .map(v => v.trim());
          const jpStrings = strVals.filter(s => JP_CHAR_REGEX.test(s));
          const nonJpStrings = strVals.filter(s => !JP_CHAR_REGEX.test(s) && !/^\d+$/.test(s));

          if (!rawKanji && !rawFuri && jpStrings.length > 0) {
            if (jpStrings.length >= 2) {
              rawKanji = jpStrings[0];
              rawFuri = jpStrings[1];
            } else {
              rawFuri = jpStrings[0];
            }
          }
          if (!arti && nonJpStrings.length > 0) {
            arti = nonJpStrings[nonJpStrings.length - 1];
          }
        }

        if (!rawKanji && rawFuri) {
          const parsed = parseBracketedJapanese(rawFuri);
          if (parsed) {
            rawKanji = parsed.kanji;
            rawFuri = parsed.furigana;
          } else if (KANJI_REGEX.test(rawFuri)) {
            rawKanji = rawFuri;
          }
        } else if (rawKanji && !rawFuri) {
          const parsed = parseBracketedJapanese(rawKanji);
          if (parsed) {
            rawKanji = parsed.kanji;
            rawFuri = parsed.furigana;
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

  // ---------- PEMINDAIAN OTOMATIS FILE kode/soumatome1.json DST ----------
  async function fetchAndParsePart(partNum) {
    if (partDataCache.has(partNum)) {
      return partDataCache.get(partNum);
    }
    const res = await fetch(DATA_PATH(partNum), { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const parsed = normalizeData(json);
    if (!parsed.length) throw new Error('Isi kosakata kosong');
    partDataCache.set(partNum, parsed);
    return parsed;
  }

  async function scanAllAvailableParts() {
    const found = [];
    const batchSize = 10;
    let keepScanning = true;
    let start = 1;

    while (keepScanning && start <= 100) {
      const nums = Array.from({ length: batchSize }, (_, idx) => start + idx);
      const results = await Promise.all(
        nums.map(async n => {
          try {
            await fetchAndParsePart(n);
            return n;
          } catch (e) {
            return null;
          }
        })
      );

      for (const n of results) {
        if (n !== null) {
          found.push(n);
        } else {
          keepScanning = false;
          break;
        }
      }
      start += batchSize;
    }

    availableParts = found.length > 0 ? found : [1];
    buildModalButtons(availableParts);
  }

  const EMERGENCY_DATA = [
    { kanji: '私', furigana: 'わたし', arti: 'Saya' },
    { kanji: 'あなた', furigana: 'あなた', arti: 'Kamu / Anda' },
    { kanji: '先生', furigana: 'せんせい', arti: 'Guru' },
    { kanji: '学生', furigana: 'がくせい', arti: 'Siswa / Mahasiswa' },
    { kanji: '会社員', furigana: 'かいしゃいん', arti: 'Karyawan Perusahaan' },
    { kanji: '病院', furigana: 'びょういん', arti: 'Rumah Sakit' }
  ].map((v, idx) => ({
    ...v,
    hasKanji: KANJI_REGEX.test(v.kanji),
    id: idx
  }));

  async function changePart(partNum) {
    currentPart = parseInt(partNum, 10);
    updatePartUI();

    const currentLoad = ++loadId;
    let failMsg = '';

    try {
      const data = await fetchAndParsePart(currentPart);
      if (currentLoad !== loadId) return;
      rawChapterVocab = data;
    } catch (e) {
      if (currentLoad !== loadId) return;
      rawChapterVocab = EMERGENCY_DATA;
      failMsg = `File ${DATA_PATH(currentPart)} gagal dimuat (${e.message}). Pastikan dibuka via Live Server / HTTP.`;
    }

    if (failMsg) showNotice(failMsg, 5000);
    else hideNotice();

    try {
      localStorage.setItem(SAVE_KEY, currentPart);
      const url = new URL(location.href);
      url.searchParams.delete('bab');
      url.searchParams.set('part', currentPart);
      history.replaceState(null, '', url);
    } catch (e) {}

    selectedIds = new Set(
      rawChapterVocab
        .filter(v => !isItemMastered(v))
        .map(v => v.id)
    );
    syncActiveVocab(0);
  }

  // ---------- INISIALISASI AWAL ----------
  (async function init() {
    await scanAllAvailableParts();

    const validPart = v => {
      const n = parseInt(v, 10);
      return availableParts.includes(n) ? n : null;
    };

    let savedPart = null;
    try { savedPart = localStorage.getItem(SAVE_KEY); } catch (e) {}
    const params = new URLSearchParams(location.search);
    const initialPart = validPart(params.get('part')) || validPart(savedPart) || availableParts[0] || 1;

    await changePart(initialPart);
  })();
});