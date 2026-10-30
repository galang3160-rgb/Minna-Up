/**
 * NAKAMA GAKKOU — TACTILE NEO-BRUTALIST VOCABULARY ENGINE
 * Fitur: Pilihan Kategori JSON (data/*.json), Pencarian Level-Scoped,
 * Flashcard 3D + Touch Swipe, Kuis Pilihan Ganda & Mengetik, Web Audio SFX
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

  // ---------- DAFTAR KATEGORI SESUAI FOLDER DATA ----------
  const vocabList = [
    { title: "Angka", path: "angka" },
    { title: "Batang", path: "batang" },
    { title: "Benda", path: "benda" },
    { title: "Bulan", path: "bulan" },
    { title: "Cangkir", path: "cangkir" },
    { title: "Durasi", path: "durasi" },
    { title: "Frekuensi", path: "frekuensi" },
    { title: "Hari", path: "hari" },
    { title: "Hewan Kecil", path: "hewan-kecil" },
    { title: "Jam", path: "jam" },
    { title: "Lembar", path: "lembar" },
    { title: "Manusia", path: "manusia" },
    { title: "Menit", path: "menit" },
    { title: "Tanggal", path: "tanggal" },
    { title: "Umur", path: "umur" },
    { title: "Urutan", path: "urutan" },
    { title: "Waktu", path: "waktu" }
  ];

  const DATA_PATH = item => `data/${item.path}.json`;
  const SAVE_KEY = 'nihonggo:selected_category';

  // ---------- STATE UTAMA ----------
  let currentCategory = vocabList[0];
  let rawChapterVocab = [];
  let activeVocab = [];
  let mode = 'carousel'; // 'carousel', 'mc', 'typing'
  let audioOn = true;
  let vocabZoomRem = 4.0;

  let quizPool = [], qi = 0, qScore = 0, answered = false, runId = 0, loadId = 0;

  // ---------- AUDIO FEEDBACK ----------
  let actx = null;
  const TONES = {
    pop: ['sine', 580, 290, 0.08, 0.1],
    correct: ['sine', 600, 1200, 0.18, 0.16],
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

  // ---------- VISUAL FX (AMBIENT, SPARKS & TRAIL) ----------
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;

  if (!reduce) {
    const sun = $('sun');
    if (sun && fine) {
      addEventListener('pointermove', e => {
        sun.style.transform = `translate(${(e.clientX / innerWidth - 0.5) * -32}px, ${(e.clientY / innerHeight - 0.5) * -32}px)`;
      });
    }

    const fx = $('fx');
    const sparkColors = ['#DCFCE7', '#E0F2FE', '#FEF3C7', '#E9D5FF'];
    addEventListener('pointerdown', e => {
      if (!fx || e.target.closest('button, input, select, a')) return;
      const pulse = document.createElement('div');
      pulse.className = 'pulse';
      pulse.style.left = e.clientX + 'px';
      pulse.style.top = e.clientY + 'px';
      pulse.onanimationend = () => pulse.remove();
      fx.appendChild(pulse);

      for (let i = 0; i < 4; i++) {
        const angle = (Math.PI * 2 * i) / 4 + Math.random() * 0.4;
        const dist = 36 + Math.random() * 45;
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

        for (let i = 1; i < pts.length; i++) {
          const t = i / pts.length;
          cctx.strokeStyle = `rgba(21, 128, 61, ${t * 0.18})`;
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

  // ---------- NOTIFIKASI BANNER ----------
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
    if ($('dataNotice'))$('dataNotice').hidden = true;
  };

  // ---------- MODAL PILIHAN KATEGORI JSON ----------
  const modalGrid = $('modalCategoryGrid');
  const categoryModal = $('categoryModal');
  const openModalBtn = $('openCategoryModal');
  const closeModalBtn = $('closeCategoryModal');
  const currentCategoryDisplay = $('currentCategoryDisplay');
  const gridButtons = [];

  if (modalGrid) {
    vocabList.forEach(item => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'category-card-btn';
      btn.dataset.path = item.path;
      btn.innerHTML = `
        <span class="cat-title">${esc(item.title)}</span>
        <span class="cat-file">data/${esc(item.path)}.json</span>
      `;

      btn.addEventListener('click', () => {
        changeCategory(item);
        closeModal();
      });

      modalGrid.appendChild(btn);
      gridButtons.push(btn);
    });
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

  // ---------- PENCARIAN KOSAKATA ----------
  const searchInput = $('searchInput');
  const btnClearSearch = $('btnClearSearch');

  function applySearchFilter() {
    const query = (searchInput?.value || '').trim().toLowerCase();
    if (btnClearSearch) btnClearSearch.hidden = !query;

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
    } else if (mode === 'mc') {
      startQuiz('mc');
    }

    if (query && activeVocab.length === 0) {
      showNotice(`Tidak ditemukan "${query}" pada topik ${currentCategory.title}.`);
    } else {
      hideNotice();
    }
  }

  if (searchInput) searchInput.addEventListener('input', applySearchFilter);
  if (btnClearSearch) {
    btnClearSearch.addEventListener('click', () => {
      searchInput.value = '';
      applySearchFilter();
      searchInput.focus();
    });
  }

  // ---------- FLASHCARD 3D FLIP KOSAKATA + SWIPE ----------
  const Carousel = {
    index: 0,
    render() {
      const container = $('carouselContainer');
      if (!container) return;
      container.innerHTML = '';

      if (!activeVocab.length) {
        if ($('carouselCounter'))$('carouselCounter').textContent = '0 / 0';
        container.innerHTML = `
          <div class="chapter-flashcard center">
            <div class="carousel-card-inner">
              <div class="carousel-face front">
                <span class="c-tag">Info</span>
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
      const container = $('carouselContainer');
      if (!container) return;
      const cards = container.children;
      const total = activeVocab.length;

      if ($('carouselCounter')) {$('carouselCounter').textContent = total ? `${this.index + 1} / ${total}` : '0 / 0';
      }
      if (!total) return;

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

  if ($('btnCarouselNext'))$('btnCarouselNext').addEventListener('click', () => Carousel.go(1));
  if ($('btnCarouselPrev'))$('btnCarouselPrev').addEventListener('click', () => Carousel.go(-1));

  // Touch Swipe di HP
  let touchStartX = 0;
  const carouselEl = $('carouselContainer');
  if (carouselEl) {
    carouselEl.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    carouselEl.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) Carousel.go(1);
        else Carousel.go(-1);
      }
    }, { passive: true });
  }

  // ---------- ZOOM UKURAN TEKS (+ & -) ----------
  function updateVocabFontSize() {
    document.documentElement.style.setProperty('--vocab-font-size', `${vocabZoomRem}rem`);
  }
  if ($('btnZoomIn')) {$('btnZoomIn').addEventListener('click', () => {
      if (vocabZoomRem < 5.2) {
        vocabZoomRem = +(vocabZoomRem + 0.3).toFixed(1);
        updateVocabFontSize();
      }
    });
  }
  if ($('btnZoomOut')) {$('btnZoomOut').addEventListener('click', () => {
      if (vocabZoomRem > 1.8) {
        vocabZoomRem = +(vocabZoomRem - 0.3).toFixed(1);
        updateVocabFontSize();
      }
    });
  }

  // ---------- NAVIGASI MODE PEMBELAJARAN ----------
  function setMode(newMode) {
    mode = newMode;
    runId++;

    document.querySelectorAll('.dock-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === newMode);
    });

    if ($('mode-carousel'))$('mode-carousel').hidden = (newMode !== 'carousel');
    if ($('mode-result'))$('mode-result').hidden = true;
    if ($('quiz-global-header'))$('quiz-global-header').hidden = (newMode === 'carousel');

    if ($('mode-mc'))$('mode-mc').hidden = (newMode !== 'mc');
    if ($('mode-typing'))$('mode-typing').hidden = (newMode !== 'typing');

    if (newMode === 'carousel') {
      Carousel.update();
    } else {
      startQuiz(newMode);
    }
  }

  document.querySelectorAll('.dock-item').forEach(b => {
    b.addEventListener('click', () => setMode(b.dataset.mode));
  });

  if ($('btnBack')) {$('btnBack').addEventListener('click', () => {
      if (mode !== 'carousel') {
        setMode('carousel');
      } else if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = '../index.html';
      }
    });
  }

  if ($('btnAudioToggle')) {$('btnAudioToggle').addEventListener('click', function () {
      audioOn = !audioOn;
      const unmuted = this.querySelector('.icon-unmuted');
      const muted = this.querySelector('.icon-muted');
      if (unmuted) unmuted.style.display = audioOn ? 'block' : 'none';
      if (muted) muted.style.display = audioOn ? 'none' : 'block';
    });
  }

  // ---------- SISTEM KUIS ----------
  function startQuiz(type) {
    if (activeVocab.length < 4) {
      showNotice('Dibutuhkan minimal 4 kosakata di topik ini untuk kuis.', 4000);
      setMode('carousel');
      return;
    }

    quizPool = shuffle(activeVocab);
    qi = 0;
    qScore = 0;
    answered = false;

    if ($('quizTitle'))$('quizTitle').textContent = type === 'mc' ? `Pilihan Ganda · ${currentCategory.title}` : `Quiz Mengetik · ${currentCategory.title}`;
    if ($('quizProgressFill'))$('quizProgressFill').style.width = '0%';

    if (type === 'mc') runMC();
    else if (type === 'typing') runTyping();
  }

  function setQuizProgress() {
    if ($('quizProgressFill'))$('quizProgressFill').style.width = `${(qi / quizPool.length) * 100}%`;
    if ($('quizCounter'))$('quizCounter').textContent = `Soal ${qi + 1} / ${quizPool.length}`;
    if ($('quizScore'))$('quizScore').textContent = `Benar ${qScore}`;
  }

  function showResult(score, total) {
    runId++;
    if ($('quizProgressFill'))$('quizProgressFill').style.width = '100%';
    if ($('mode-mc'))$('mode-mc').hidden = true;
    if ($('mode-typing'))$('mode-typing').hidden = true;
    if ($('mode-result'))$('mode-result').hidden = false;

    if ($('resultScore'))$('resultScore').textContent = `Skor: ${score} / ${total}`;
    const pct = Math.round((score / total) * 100);
    if ($('resultRing'))$('resultRing').style.setProperty('--pct', pct);
    if ($('resultPct'))$('resultPct').textContent = pct + '%';

    playTone('win');
  }

  // 1. Pilihan Ganda
  function runMC() {
    if (qi >= quizPool.length) {
      return showResult(qScore, quizPool.length);
    }

    setQuizProgress();
    answered = false;
    const q = quizPool[qi];
    if ($('mcQuestionText'))$('mcQuestionText').textContent = q.furigana;
    if ($('mcFeedback')) {
      $('mcFeedback').textContent = '';$('mcFeedback').className = 'feedback-text';
    }
    if ($('btnMcNext'))$('btnMcNext').disabled = true;

    const wrongs = shuffle(rawChapterVocab.filter(v => v.id !== q.id && v.arti !== q.arti)).slice(0, 3);
    const optionsBox = $('mcOptions');
    if (!optionsBox) return;
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
          if ($('mcFeedback')) {
            $('mcFeedback').textContent = 'Benar';$('mcFeedback').classList.add('correct');
          }
          playTone('correct');
        } else {
          btn.classList.add('wrong');
          if ($('mcFeedback')) {
            $('mcFeedback').textContent = 'Salah';$('mcFeedback').classList.add('wrong');
          }
          playTone('wrong');
        }

        if ($('quizScore'))$('quizScore').textContent = `Benar ${qScore}`;
        if ($('btnMcNext')) {$('btnMcNext').disabled = false;
          $('btnMcNext').focus();
        }
      });

      optionsBox.appendChild(btn);
    });
  }

  if ($('btnMcNext')) {$('btnMcNext').addEventListener('click', () => {
      qi++;
      runMC();
    });
  }

  // 2. Mengetik
  const normalize = s => s.toLowerCase().replace(/\s*\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();

  function runTyping() {
    if (qi >= quizPool.length) {
      return showResult(qScore, quizPool.length);
    }

    setQuizProgress();
    answered = false;
    if ($('typingQuestionText'))$('typingQuestionText').textContent = quizPool[qi].furigana;
    if ($('typingFeedback')) {
      $('typingFeedback').textContent = '';$('typingFeedback').className = 'feedback-text';
    }

    const input = $('typingInput');
    if (!input) return;
    input.value = '';
    input.className = 'input-typing-field';
    input.disabled = false;

    if ($('btnTypingCheck'))$('btnTypingCheck').disabled = false;
    if ($('btnTypingNext'))$('btnTypingNext').disabled = true;

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
    if ($('btnTypingCheck'))$('btnTypingCheck').disabled = true;

    const q = quizPool[qi];
    const accepted = [normalize(q.arti), ...q.arti.split(/[\/,]/).map(normalize)].filter(Boolean);

    if (accepted.includes(answer)) {
      qScore++;
      input.classList.add('correct');
      if ($('typingFeedback')) {
        $('typingFeedback').textContent = 'Benar';$('typingFeedback').classList.add('correct');
      }
      playTone('correct');
    } else {
      input.classList.add('wrong');
      if ($('typingFeedback')) {
        $('typingFeedback').textContent = 'Salah';$('typingFeedback').classList.add('wrong');
      }
      playTone('wrong');
    }

    if ($('quizScore'))$('quizScore').textContent = `Benar ${qScore}`;
    if ($('btnTypingNext')) {$('btnTypingNext').disabled = false;
      $('btnTypingNext').focus();
    }
  }

  if ($('btnTypingCheck'))$('btnTypingCheck').addEventListener('click', checkTyping);
  if ($('typingInput')) {$('typingInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') checkTyping();
    });
  }
  if ($('btnTypingNext')) {$('btnTypingNext').addEventListener('click', () => {
      qi++;
      runTyping();
    });
  }

  if ($('btnRetryQuiz'))$('btnRetryQuiz').addEventListener('click', () => setMode(mode));
  if ($('btnResultCards'))$('btnResultCards').addEventListener('click', () => setMode('carousel'));

  // Keyboard Shortcuts
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

  // ---------- PEMUATAN DATA JSON ----------
  function normalizeData(raw) {
    const list = Array.isArray(raw) ? raw : Object.values(raw || {}).find(Array.isArray);
    if (!list) throw new Error('Format JSON harus berupa array');
    const pick = (o, keys) => {
      for (const k of keys) {
        if (o[k] != null && String(o[k]).trim() !== '') return String(o[k]).trim();
      }
      return '';
    };

    return list
      .filter(o => o && typeof o === 'object')
      .map(o => ({
        furigana: pick(o, ['furigana', 'jepang', 'kata', 'kanji', 'hiragana', 'word', 'romaji']),
        arti: pick(o, ['arti', 'indonesia', 'meaning', 'terjemahan'])
      }))
      .filter(v => v.furigana && v.arti)
      .map((v, idx) => ({ ...v, id: idx }));
  }

  const EMERGENCY_DATA = [
    { furigana: 'いち', arti: 'Satu' },
    { furigana: 'に', arti: 'Dua' },
    { furigana: 'さん', arti: 'Tiga' },
    { furigana: 'し / よん', arti: 'Empat' }
  ].map((v, idx) => ({ ...v, id: idx }));

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
      console.warn(e);
      rawChapterVocab = EMERGENCY_DATA;
      failMsg = `Gagal memuat "${path}" (${e.message}). Menampilkan data cadangan.`;
    }

    if (failMsg) showNotice(failMsg);
    else hideNotice();

    try {
      localStorage.setItem(SAVE_KEY, currentCategory.path);
      const url = new URL(location.href);
      url.searchParams.set('topik', currentCategory.path);
      history.replaceState(null, '', url);
    } catch (e) {}

    applySearchFilter();
  }

  const urlParam = new URLSearchParams(location.search).get('topik');
  let savedCat = null;
  try { savedCat = localStorage.getItem(SAVE_KEY); } catch (e) {}

  const initialCat = vocabList.find(c => c.path === urlParam) || 
                     vocabList.find(c => c.path === savedCat) || 
                     vocabList[0];

  changeCategory(initialCat);
});