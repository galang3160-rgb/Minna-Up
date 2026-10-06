/**
 * NAKAMA GAKKOU — INTERACTIVE LEARNING ENGINE
 * Logika: Level-Scoped Search, Modal Bab 1-25, Flashcard Bersih (Nav Kiri-Kanan),
 * Quiz Pilihan Ganda Split-View (Zoom Kontrol +/-, Feedback Simple),
 * Quiz Mengetik Terpusat, Web Audio API & Mouse Trail
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

  // ---------- KONFIGURASI DATA & MODAL ----------
  const DATA_PATH = n => `kode/bab${n}.json`;
  const totalChapters = 25;
  const SAVE_KEY = 'nihonggo:bab';

  const kanjiNumerals = [
    '一','二','三','四','五','六','七','八','九','十',
    '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
    '二十一','二十二','二十三','二十四','二十五'
  ];

  // ---------- STATE UTAMA ----------
  let currentBab = 1;
  let rawChapterVocab = [];   // Kosakata bab aktif
  let activeVocab = [];       // Kosakata terfilter pencarian di bab aktif
  let mode = 'carousel';      // 'carousel', 'mc', 'typing'
  let audioOn = true;
  let vocabZoomRem = 3.4;     // Ukuran font kontrol zoom +/-

  // Kuis State
  let quizPool = [], qi = 0, qScore = 0, answered = false, runId = 0, loadId = 0;

  // ---------- AUDIO ENGINE ----------
  let actx = null;
  const TONES = {
    pop: ['sine', 600, 300, 0.1, 0.12],
    correct: ['sine', 600, 1200, 0.2, 0.2],
    wrong: ['sawtooth', 300, 150, 0.2, 0.15],
    flip: ['sine', 400, 200, 0.08, 0.08],
    win: ['triangle', 523, 1046, 0.4, 0.2]
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

  // ---------- CANVAS MOUSE TRAIL ----------
  const canvas = $('mouseTrail');
  const cctx = canvas.getContext('2d');
  let particles = [];
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  if (!isTouchDevice) {
    window.addEventListener('mousemove', e => {
      for (let i = 0; i < 2; i++) {
        particles.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          size: Math.random() * 4 + 2,
          alpha: 0.7,
          color: Math.random() > 0.4 ? '#10B981' : '#34D399'
        });
      }
    });

    (function renderParticles() {
      cctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        cctx.save();
        cctx.globalAlpha = p.alpha;
        cctx.beginPath();
        cctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        cctx.fillStyle = p.color;
        cctx.shadowBlur = 6;
        cctx.shadowColor = '#10B981';
        cctx.fill();
        cctx.restore();

        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.025;
        p.size = Math.max(0, p.size - 0.06);
        if (p.alpha <= 0) particles.splice(i, 1);
      }
      requestAnimationFrame(renderParticles);
    })();
  }

  // ---------- NOTIFIKASI STATUS DATA ----------
  let noticeTimer = null;
  function showNotice(msg, autoHide = 0) {
    const n = $('dataNotice');
    clearTimeout(noticeTimer);
    n.textContent = msg;
    n.hidden = false;
    if (autoHide) noticeTimer = setTimeout(() => { n.hidden = true; }, autoHide);
  }
  const hideNotice = () => { clearTimeout(noticeTimer); $('dataNotice').hidden = true; };

  // ---------- MODAL LEVEL BAB 1-25 ----------
  const modalGrid = $('modalChapterGrid');
  const chapterModal = $('chapterModal');
  const openModalBtn = $('openChapterModal');
  const closeModalBtn = $('closeChapterModal');
  const currentChapterDisplay = $('currentChapterDisplay');
  const gridButtons = [];

  for (let i = 0; i < totalChapters; i++) {
    const babNum = i + 1;
    const padded = babNum < 10 ? `0${babNum}` : babNum;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chapter-grid-item';
    btn.dataset.bab = babNum;
    btn.innerHTML = `
      <span class="cgi-num">${padded}</span>
      <span class="cgi-label">BAB</span>
      <span class="cgi-kanji-bg">${kanjiNumerals[i]}</span>
    `;

    btn.addEventListener('click', () => {
      changeChapter(babNum);
      closeModal();
    });

    modalGrid.appendChild(btn);
    gridButtons.push(btn);
  }

  function openModal() { chapterModal.classList.add('open'); }
  function closeModal() { chapterModal.classList.remove('open'); }

  openModalBtn.addEventListener('click', openModal);
  closeModalBtn.addEventListener('click', closeModal);
  chapterModal.addEventListener('click', e => {
    if (e.target === chapterModal) closeModal();
  });

  function updateChapterUI() {
    const padded = currentBab < 10 ? `0${currentBab}` : currentBab;
    currentChapterDisplay.textContent = `Bab ${padded}`;
    gridButtons.forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.bab, 10) === currentBab);
    });
  }

  // ---------- SISTEM PENCARIAN KOSAKATA (LEVEL-SCOPED) ----------
  const searchInput = $('searchInput');
  const btnClearSearch = $('btnClearSearch');

  function applySearchFilter() {
    const query = searchInput.value.trim().toLowerCase();
    btnClearSearch.hidden = !query;

    if (!query) {
      activeVocab = [...rawChapterVocab];
    } else {
      activeVocab = rawChapterVocab.filter(item => {
        const arti = (item.arti || '').toLowerCase();
        const furigana = (item.furigana || '').toLowerCase();
        return arti.includes(query) || furigana.includes(query);
      });
    }

    if (mode === 'carousel') {
      Carousel.render();
    } else {
      startQuiz(mode);
    }

    if (query && activeVocab.length === 0) {
      showNotice(`Tidak ada kosakata yang cocok dengan "${query}" pada Level Bab ${currentBab}.`);
    } else {
      hideNotice();
    }
  }

  searchInput.addEventListener('input', applySearchFilter);
  btnClearSearch.addEventListener('click', () => {
    searchInput.value = '';
    applySearchFilter();
    searchInput.focus();
  });

  // ---------- FLASHCARD KOSAKATA (MINIMALIS) ----------
  const Carousel = {
    index: 0,
    render() {
      const container = $('carouselContainer');
      container.innerHTML = '';

      if (!activeVocab.length) {
        $('carouselCounter').textContent = '0 / 0';
        container.innerHTML = `
          <div class="chapter-flashcard center">
            <div class="carousel-card-inner">
              <div class="carousel-face front">
                <span class="c-tag">Status</span>
                <span class="c-arti">Kosong</span>
              </div>
            </div>
          </div>`;
        return;
      }

      activeVocab.forEach((v, i) => {
        const card = document.createElement('div');
        card.className = 'chapter-flashcard hidden';
        card.innerHTML = `
          <div class="carousel-card-inner">
            <div class="carousel-face front">
              <span class="c-tag">Arti</span>
              <span class="c-arti">${esc(v.arti)}</span>
            </div>
            <div class="carousel-face back">
              <span class="c-tag">Jepang</span>
              <span class="c-furigana furigana-font">${esc(v.furigana)}</span>
            </div>
          </div>
        `;

        card.addEventListener('click', () => {
          if (i === this.index) {
            card.classList.toggle('is-flipped');
            playTone('flip');
          } else {
            this.index = i;
            this.update();
            playTone('pop');
          }
        });

        container.appendChild(card);
      });

      this.index = 0;
      this.update();
    },
    update() {
      const cards = $('carouselContainer').children;
      const n = cards.length;
      $('carouselCounter').textContent = n ? `${Math.min(this.index + 1, n)} / ${n}` : '0 / 0';
      if (!n) return;

      [...cards].forEach((c, i) => {
        if (i === this.index) {
          c.className = 'chapter-flashcard center';
        } else {
          c.className = 'chapter-flashcard hidden';
          c.classList.remove('is-flipped');
        }
      });
    },
    go(dir) {
      if (!activeVocab.length) return;
      this.index = (this.index + dir + activeVocab.length) % activeVocab.length;
      this.update();
      playTone('pop');
    }
  };

  $('btnCarouselNext').addEventListener('click', () => Carousel.go(1));$('btnCarouselPrev').addEventListener('click', () => Carousel.go(-1));

  // ---------- KONTROL ZOOM UKURAN TEKS (+ & -) ----------
  function updateVocabFontSize() {
    document.documentElement.style.setProperty('--vocab-font-size', `${vocabZoomRem}rem`);
  }
  $('btnZoomIn').addEventListener('click', () => {
    if (vocabZoomRem < 5.2) {
      vocabZoomRem = +(vocabZoomRem + 0.3).toFixed(1);
      updateVocabFontSize();
    }
  });
  $('btnZoomOut').addEventListener('click', () => {
    if (vocabZoomRem > 1.8) {
      vocabZoomRem = +(vocabZoomRem - 0.3).toFixed(1);
      updateVocabFontSize();
    }
  });

  // ---------- NAVIGASI MODE PEMBELAJARAN ----------
  function setMode(newMode) {
    mode = newMode;
    runId++;

    document.querySelectorAll('.dock-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === newMode);
    });

    $('mode-carousel').hidden = (newMode !== 'carousel');$('mode-result').hidden = true;
    $('quiz-global-header').hidden = (newMode === 'carousel');

    $('mode-mc').hidden = (newMode !== 'mc');$('mode-typing').hidden = (newMode !== 'typing');

    if (newMode === 'carousel') {
      Carousel.update();
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

  $('btnAudioToggle').addEventListener('click', function() {
    audioOn = !audioOn;
    this.querySelector('.icon-unmuted').style.display = audioOn ? 'block' : 'none';
    this.querySelector('.icon-muted').style.display = audioOn ? 'none' : 'block';
  });

  // ---------- SISTEM KUIS (SPLIT-VIEW & CENTERING) ----------
  function startQuiz(type) {
    if (activeVocab.length < 4) {
      showNotice('Dibutuhkan minimal 4 kosakata di level ini untuk memulai latihan.', 4000);
      setMode('carousel');
      return;
    }

    quizPool = shuffle(activeVocab);
    qi = 0;
    qScore = 0;
    answered = false;

    $('quizTitle').textContent = type === 'mc' ? `Pilihan Ganda · Bab ${currentBab}` : `Quiz Mengetik · Bab ${currentBab}`;
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
    $('quizProgressFill').style.width = '100\%';$('mode-mc').hidden = true;
    $('mode-typing').hidden = true;
    $('mode-result').hidden = false;

    $('resultScore').textContent = `Skor: ${score} / ${total}`;
    const pct = Math.round((score / total) * 100);
    $('resultRing').style.setProperty('--pct', pct);$('resultPct').textContent = pct + '%';

    playTone('win');
  }

  // 1. Pilihan Ganda (2 Kolom Desktop, 1 Kolom Mobile)
  function runMC() {
    if (qi >= quizPool.length) {
      return showResult(qScore, quizPool.length);
    }

    setQuizProgress();
    answered = false;
    const q = quizPool[qi];
    $('mcQuestionText').textContent = q.furigana;
    $('mcFeedback').textContent = '';
    $('mcFeedback').className = 'feedback-text';$('btnMcNext').disabled = true;

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
          $('mcFeedback').textContent = 'Benar';$('mcFeedback').classList.add('correct');
          playTone('correct');
        } else {
          btn.classList.add('wrong');
          $('mcFeedback').textContent = 'Salah';$('mcFeedback').classList.add('wrong');
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

  // 2. Mengetik (Centered Single Column)
  const normalize = s => s.toLowerCase().replace(/\s*\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();

  function runTyping() {
    if (qi >= quizPool.length) {
      return showResult(qScore, quizPool.length);
    }

    setQuizProgress();
    answered = false;
    $('typingQuestionText').textContent = quizPool[qi].furigana;
    $('typingFeedback').textContent = '';$('typingFeedback').className = 'feedback-text';

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
    const accepted = [normalize(q.arti), ...q.arti.split(/[\/,]/).map(normalize)].filter(Boolean);

    if (accepted.includes(answer)) {
      qScore++;
      input.classList.add('correct');
      $('typingFeedback').textContent = 'Benar';$('typingFeedback').classList.add('correct');
      playTone('correct');
    } else {
      input.classList.add('wrong');
      $('typingFeedback').textContent = 'Salah';$('typingFeedback').classList.add('wrong');
      playTone('wrong');
    }

    $('quizScore').textContent = `Benar ${qScore}`;
    $('btnTypingNext').disabled = false;
    $('btnTypingNext').focus();
  }

  $('btnTypingCheck').addEventListener('click', checkTyping);$('typingInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') checkTyping();
  });
  $('btnTypingNext').addEventListener('click', () => {
    qi++;
    runTyping();
  });

  // Tombol Hasil Kuis
  $('btnRetryQuiz').addEventListener('click', () => setMode(mode));$('btnResultCards').addEventListener('click', () => setMode('carousel'));

  // Keyboard Navigation
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
    if (e.target.matches('input, textarea')) return;

    if (mode === 'carousel') {
      if (e.key === 'ArrowRight') Carousel.go(1);
      else if (e.key === 'ArrowLeft') Carousel.go(-1);
    } else if (mode === 'mc' && /^[1-4]$/.test(e.key)) {
      const opts = document.querySelectorAll('#mcOptions .btn-mc-option');
      const b = opts[+e.key - 1];
      if (b && !b.disabled) b.click();
    }
  });

  // ---------- PEMUATAN DATA JSON LEVEL BAB ----------
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
      .map(o => ({
        furigana: pick(o, ['furigana', 'jepang', 'kata', 'kanji', 'hiragana', 'word']),
        arti: pick(o, ['arti', 'indonesia', 'meaning', 'terjemahan'])
      }))
      .filter(v => v.furigana && v.arti)
      .map((v, idx) => ({ ...v, id: idx }));
  }

  const EMERGENCY_DATA = [
    { furigana: 'わたし', arti: 'Saya' },
    { furigana: 'あなた', arti: 'Kamu / Anda' },
    { furigana: 'せんせい', arti: 'Guru' },
    { furigana: 'がくせい', arti: 'Siswa' }
  ].map((v, idx) => ({ ...v, id: idx }));

  async function changeChapter(babNum) {
    currentBab = parseInt(babNum, 10);
    updateChapterUI();

    const currentLoad = ++loadId;
    let failMsg = '';

    try {
      const res = await fetch(DATA_PATH(currentBab), { cache: 'no-cache' });
      if (!res.ok) throw new Error(`File ${DATA_PATH(currentBab)} tidak ditemukan (${res.status})`);
      const data = normalizeData(await res.json());
      if (currentLoad !== loadId) return;
      rawChapterVocab = data;
    } catch (e) {
      if (currentLoad !== loadId) return;
      console.warn(e);
      rawChapterVocab = EMERGENCY_DATA;
      failMsg = `Level Bab ${currentBab} gagal dimuat (${e.message}). Menampilkan kosakata cadangan.`;
    }

    if (failMsg) showNotice(failMsg);
    else hideNotice();

    try {
      localStorage.setItem(SAVE_KEY, currentBab);
      const url = new URL(location.href);
      url.searchParams.set('bab', currentBab);
      history.replaceState(null, '', url);
    } catch (e) {}

    applySearchFilter();
  }

  const validBab = v => {
    const n = parseInt(v, 10);
    return n >= 1 && n <= totalChapters ? n : null;
  };

  let savedBab = null;
  try { savedBab = localStorage.getItem(SAVE_KEY); } catch (e) {}
  const initialBab = validBab(new URLSearchParams(location.search).get('bab')) || validBab(savedBab) || 1;

  changeChapter(initialBab);
});