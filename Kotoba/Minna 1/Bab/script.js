/**
 * NAKAMA GAKKOU — REFINED TACTILE LEARNING ENGINE
 * Fitur: Level-Scoped Search, Modal Bab 1-25, Flashcard 3D + Touch Swipe + Keyboard Space,
 * Japanese Native TTS, Quiz Pilihan Ganda & Mengetik, Web Audio SFX & Smooth Trail
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

  // ---------- STATE UTAMA ----------
  let currentBab = 1;
  let rawChapterVocab = [];
  let activeVocab = [];
  let mode = 'carousel';
  let audioOn = true;
  let vocabZoomRem = 3.6;

  let quizPool = [], qi = 0, qScore = 0, answered = false, runId = 0, loadId = 0;

  // ---------- WEB AUDIO SFX & JAPANESE TTS ----------
  let actx = null;
  let jpVoice = null;

  function initJapaneseVoice() {
    if (!('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    const ja = voices.filter(v => v.lang && (v.lang.includes('ja') || v.lang.includes('JP')));
    if (ja.length) {
      ja.sort((a, b) => {
        const score = v => (v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('google') ? 10 : 0);
        return score(b) - score(a);
      });
      jpVoice = ja[0];
    }
  }
  if ('speechSynthesis' in window) {
    initJapaneseVoice();
    window.speechSynthesis.onvoiceschanged = initJapaneseVoice;
  }

  function speakJapanese(text) {
    if (!audioOn || !text || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const ut = new SpeechSynthesisUtterance(text);
    ut.lang = 'ja-JP';
    if (jpVoice) ut.voice = jpVoice;
    ut.rate = 0.85;
    ut.pitch = 1.04;
    window.speechSynthesis.speak(ut);
  }

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

  // ---------- VISUAL FX (AMBIENT, SPARKS & SMOOTH TRAIL) ----------
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

  // ---------- SISTEM PENCARIAN KOSAKATA ----------
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
      showNotice(`Tidak ditemukan "${query}" pada Bab ${currentBab}.`);
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

  // ---------- FLASHCARD KOSAKATA INTERAKTIF ----------
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
                <div class="face-top-bar"><span class="c-tag">Info</span></div>
                <div class="face-center-content"><span class="c-arti">Tidak Ada Kata</span></div>
                <div class="face-bottom-hint">Coba kata kunci lain</div>
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
              <div class="face-top-bar">
                <span class="c-tag">Bahasa Indonesia</span>
                <button type="button" class="btn-card-speak" data-speak="${esc(v.furigana)}" title="Dengarkan Bahasa Jepang">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  </svg>
                </button>
              </div>
              <div class="face-center-content">
                <span class="c-arti">${esc(v.arti)}</span>
              </div>
              <div class="face-bottom-hint">Ketuk kartu untuk melihat bahasa Jepang &rarr;</div>
            </div>

            <div class="carousel-face back">
              <div class="face-top-bar">
                <span class="c-tag">Bahasa Jepang</span>
                <button type="button" class="btn-card-speak" data-speak="${esc(v.furigana)}" title="Dengarkan Pengucapan">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  </svg>
                </button>
              </div>
              <div class="face-center-content">
                <span class="c-furigana furigana-font">${esc(v.furigana)}</span>
              </div>
              <div class="face-bottom-hint">Ketuk untuk kembali ke arti</div>
            </div>
          </div>
        `;

        // Tombol Speaker di dalam kartu
        card.querySelectorAll('.btn-card-speak').forEach(btn => {
          btn.addEventListener('click', e => {
            e.stopPropagation();
            speakJapanese(btn.dataset.speak);
          });
        });

        // Klik Kartu untuk Flip
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
    flipCurrent() {
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

  $('btnCarouselNext').addEventListener('click', () => Carousel.go(1));$('btnCarouselPrev').addEventListener('click', () => Carousel.go(-1));

  // Swipe Jari Kiri/Kanan di Flashcard HP
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

  // ---------- KONTROL ZOOM UKURAN TEKS (+ & -) ----------
  function updateVocabFontSize() {
    document.documentElement.style.setProperty('--vocab-font-size', `${vocabZoomRem}rem`);
  }
  $('btnZoomIn').addEventListener('click', () => { if (vocabZoomRem < 5.0) { vocabZoomRem = +(vocabZoomRem + 0.3).toFixed(1); updateVocabFontSize(); } });$('btnZoomOut').addEventListener('click', () => {
    if (vocabZoomRem > 2.0) {
      vocabZoomRem = +(vocabZoomRem - 0.3).toFixed(1);
      updateVocabFontSize();
    }
  });

  // Tombol Speak di Kuis
  $('btnMcSpeak')?.addEventListener('click', () => { if (quizPool[qi]) speakJapanese(quizPool[qi].furigana); });$('btnTypingSpeak')?.addEventListener('click', () => {
    if (quizPool[qi]) speakJapanese(quizPool[qi].furigana);
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

  $('btnAudioToggle').addEventListener('click', function () {
    audioOn = !audioOn;
    this.querySelector('.icon-unmuted').style.display = audioOn ? 'block' : 'none';
    this.querySelector('.icon-muted').style.display = audioOn ? 'none' : 'block';
  });

  // ---------- SISTEM KUIS ----------
  function startQuiz(type) {
    if (activeVocab.length < 4) {
      showNotice('Minimal 4 kosakata diperlukan untuk latihan kuis.', 4000);
      setMode('carousel');
      return;
    }

    quizPool = shuffle(activeVocab);
    qi = 0;
    qScore = 0;
    answered = false;

    $('quizTitle').textContent = type === 'mc' ? `Pilihan Ganda · Bab ${currentBab}` : `Mengetik · Bab ${currentBab}`;
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

  // 1. Pilihan Ganda
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
          $('mcFeedback').textContent = '✓ Jawaban Benar!';
          $('mcFeedback').classList.add('correct');
          playTone('correct');
          speakJapanese(q.furigana);
        } else {
          btn.classList.add('wrong');
          $('mcFeedback').textContent = `✕ Kurang Tepat`;
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

  // 2. Mengetik
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
      $('typingFeedback').textContent = '✓ Jawaban Benar!';
      $('typingFeedback').classList.add('correct');
      playTone('correct');
      speakJapanese(q.furigana);
    } else {
      input.classList.add('wrong');
      $('typingFeedback').textContent = `Jawaban: ${q.arti}`;
      $('typingFeedback').classList.add('wrong');
      playTone('wrong');
    }

    $('quizScore').textContent = `Benar ${qScore}`;
    $('btnTypingNext').disabled = false;
    $('btnTypingNext').focus();
  }

  $('btnTypingCheck').addEventListener('click', checkTyping);
  $('typingInput').addEventListener('keydown', e => { if (e.key === 'Enter') checkTyping(); });$('btnTypingNext').addEventListener('click', () => {
    qi++;
    runTyping();
  });

  $('btnRetryQuiz').addEventListener('click', () => setMode(mode));$('btnResultCards').addEventListener('click', () => setMode('carousel'));

  // Pintasan Keyboard Desktop
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
    if (e.target.matches('input, textarea')) return;

    if (mode === 'carousel') {
      if (e.key === 'ArrowRight') Carousel.go(1);
      else if (e.key === 'ArrowLeft') Carousel.go(-1);
      else if (e.key === ' ') {
        e.preventDefault();
        Carousel.flipCurrent();
      }
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
    { furigana: 'がくせい', arti: 'Siswa / Mahasiswa' },
    { furigana: 'かいしゃいん', arti: 'Karyawan Perusahaan' },
    { furigana: 'びょういん', arti: 'Rumah Sakit' }
  ].map((v, idx) => ({ ...v, id: idx }));

  async function changeChapter(babNum) {
    currentBab = parseInt(babNum, 10);
    updateChapterUI();

    const currentLoad = ++loadId;
    let failMsg = '';

    try {
      const res = await fetch(DATA_PATH(currentBab), { cache: 'no-cache' });
      if (!res.ok) throw new Error(`File ${DATA_PATH(currentBab)} belum tersedia`);
      const data = normalizeData(await res.json());
      if (currentLoad !== loadId) return;
      rawChapterVocab = data;
    } catch (e) {
      if (currentLoad !== loadId) return;
      rawChapterVocab = EMERGENCY_DATA;
      failMsg = `Bab ${currentBab} menggunakan kosakata contoh.`;
    }

    if (failMsg) showNotice(failMsg, 3000);
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