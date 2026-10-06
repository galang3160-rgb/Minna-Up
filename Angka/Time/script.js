/**
 * NAKAMA GAKKOU — INTERACTIVE LEARNING ENGINE
 * Mode: Pembacaan Berkas JSON Kategori (data/*.json)
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

  // ---------- DAFTAR KATEGORI SESUAI GAMBAR & FOLDER DATA ----------
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

  // Penunjuk path data ke folder data/<nama>.json
  const DATA_PATH = item => `data/${item.path}.json`;
  const SAVE_KEY = 'nihonggo:selected_category';

  // ---------- STATE UTAMA ----------
  let currentCategory = vocabList[0];
  let rawChapterVocab = [];   // Kosakata asli dari file JSON
  let activeVocab = [];       // Kosakata terfilter pencarian
  let mode = 'carousel';      // 'carousel', 'mc', 'typing'
  let audioOn = true;
  let vocabZoomRem = 3.4;

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

  // ---------- STATUS NOTICE ----------
  let noticeTimer = null;
  function showNotice(msg, autoHide = 0) {
    const n = $('dataNotice');
    clearTimeout(noticeTimer);
    n.textContent = msg;
    n.hidden = false;
    if (autoHide) noticeTimer = setTimeout(() => { n.hidden = true; }, autoHide);
  }
  const hideNotice = () => { clearTimeout(noticeTimer); $('dataNotice').hidden = true; };

  // ---------- MODAL PILIHAN KATEGORI JSON ----------
  const modalGrid = $('modalCategoryGrid');
  const categoryModal = $('categoryModal');
  const openModalBtn = $('openCategoryModal');
  const closeModalBtn = $('closeCategoryModal');
  const currentCategoryDisplay = $('currentCategoryDisplay');
  const gridButtons = [];

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

  function openModal() { categoryModal.classList.add('open'); }
  function closeModal() { categoryModal.classList.remove('open'); }

  openModalBtn.addEventListener('click', openModal);
  closeModalBtn.addEventListener('click', closeModal);
  categoryModal.addEventListener('click', e => {
    if (e.target === categoryModal) closeModal();
  });

  function updateCategoryUI() {
    currentCategoryDisplay.textContent = currentCategory.title;
    gridButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.path === currentCategory.path);
    });
  }

  // ---------- PENCARIAN KOSAKATA ----------
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
      showNotice(`Tidak ada hasil untuk "${query}" di topik ${currentCategory.title}.`);
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

  // ---------- FLASHCARD KOSAKATA ----------
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

  // ---------- ZOOM UKURAN TEKS ----------
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

  // ---------- KONTROL MODE DOCK NAVIGASI ----------
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

  // ---------- SISTEM LATIHAN & KUIS ----------
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

    $('quizTitle').textContent = type === 'mc' ? `Pilihan Ganda · ${currentCategory.title}` : `Quiz Mengetik · ${currentCategory.title}`;
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

  // 1. Logika Pilihan Ganda
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

  // 2. Logika Mengetik
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

  $('btnRetryQuiz').addEventListener('click', () => setMode(mode));$('btnResultCards').addEventListener('click', () => setMode('carousel'));

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

  // ---------- PEMUATAN DATA JSON (data/*.json) ----------
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
      rawChapterVocab = [];
      failMsg = `Gagal memuat "${path}" (${e.message}). Pastikan folder data/ sudah tersedia.`;
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

  // Cek parameter topik aktif saat pertama load
  const urlParam = new URLSearchParams(location.search).get('topik');
  let savedCat = null;
  try { savedCat = localStorage.getItem(SAVE_KEY); } catch (e) {}

  const initialCat = vocabList.find(c => c.path === urlParam) || 
                     vocabList.find(c => c.path === savedCat) || 
                     vocabList[0];

  changeCategory(initialCat);
});