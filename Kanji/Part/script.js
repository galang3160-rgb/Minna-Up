/**
 * NIHONGGO GAKKOU — KANJI & DOKKAI LEARNING ENGINE
 * Lokasi File JSON: kode/part_1.json s.d. kode/part_25.json
 * Fitur:
 * - Dynamic Infinite Flashcard & Dokkai (Otomatis mengikuti total data di JSON)
 * - Auto-Highlight Kanji yang dipelajari di bacaan Dokkai (Tebal, Hijau, Garis Bawah)
 * - Modal Transisi Elegan: "Part Selesai · Dokkai Time"
 * - TTS Suara Bahasa Jepang & Kontrol Zoom Teks
 * - Kuis Pilihan Ganda Interaktif
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

  // =========================================================
  // 1. KONFIGURASI FILE & STATE
  // =========================================================
  // Sesuai lokasi folder yang kamu tentukan: kode/part_X.json
  const DATA_PATH = n => `data/part_${n}.json`;
  const totalParts = 25;
  const SAVE_KEY = 'nihonggo:kanji_current_part';

  const kanjiNumerals = [
    '一','二','三','四','五','六','七','八','九','十',
    '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
    '二十一','二十二','二十三','二十四','二十五'
  ];

  let currentPart = 1;
  let rawKanjiList = [];
  let activeKanjiList = [];
  let dokkaiData = { title: '', items: [] };
  let currentSentenceIndex = 0;
  let mode = 'carousel'; // 'carousel', 'mc', 'dokkai'
  let audioOn = true;
  let dokkaiFontSizeRem = 1.4;
  let vocabZoomRem = 4.4;

  // State Kuis Pilihan Ganda
  let quizPool = [];
  let qi = 0;
  let qScore = 0;
  let answered = false;

  // =========================================================
  // 2. AUDIO FEEDBACK (SFX SINE WAVE)
  // =========================================================
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

  // =========================================================
  // 3. CANVAS MOUSE TRAIL
  // =========================================================
  const canvas = $('mouseTrail');
  if (canvas) {
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
  }

  // =========================================================
  // 4. NOTIFIKASI BANNER
  // =========================================================
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

  // =========================================================
  // 5. MODAL GRID SELEKSI PART 1-25
  // =========================================================
  const modalGrid = $('modalChapterGrid');
  const chapterModal = $('chapterModal');
  const openModalBtn = $('openChapterModal');
  const closeModalBtn = $('closeChapterModal');
  const currentChapterDisplay = $('currentChapterDisplay');
  const gridButtons = [];

  if (modalGrid) {
    for (let i = 0; i < totalParts; i++) {
      const partNum = i + 1;
      const padded = partNum < 10 ? `0${partNum}` : partNum;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chapter-grid-item';
      btn.dataset.part = partNum;
      btn.innerHTML = `
        <span class="cgi-num">${padded}</span>
        <span class="cgi-label">PART</span>
        <span class="cgi-kanji-bg">${kanjiNumerals[i]}</span>
      `;

      btn.addEventListener('click', () => {
        loadPart(partNum);
        closeModal();
      });

      modalGrid.appendChild(btn);
      gridButtons.push(btn);
    }
  }

  function openModal() { if (chapterModal) chapterModal.classList.add('open'); }
  function closeModal() { if (chapterModal) chapterModal.classList.remove('open'); }

  if (openModalBtn) openModalBtn.addEventListener('click', openModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (chapterModal) {
    chapterModal.addEventListener('click', e => {
      if (e.target === chapterModal) closeModal();
    });
  }

  function updatePartUI() {
    const padded = currentPart < 10 ? `0${currentPart}` : currentPart;
    if (currentChapterDisplay) currentChapterDisplay.textContent = `Part ${padded}`;
    gridButtons.forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.part, 10) === currentPart);
    });
  }

  // =========================================================
  // 6. PENCARIAN KANJI (LEVEL-SCOPED)
  // =========================================================
  const searchInput = $('searchInput');
  const btnClearSearch = $('btnClearSearch');

  function applySearchFilter() {
    const query = (searchInput?.value || '').trim().toLowerCase();
    if (btnClearSearch) btnClearSearch.hidden = !query;

    if (!query) {
      activeKanjiList = [...rawKanjiList];
    } else {
      activeKanjiList = rawKanjiList.filter(item => {
        const kanji = (item.kanji || '').toLowerCase();
        const furigana = (item.furigana || '').toLowerCase();
        const arti = (item.arti || '').toLowerCase();
        return kanji.includes(query) || furigana.includes(query) || arti.includes(query);
      });
    }

    if (mode === 'carousel') {
      Carousel.render();
    } else if (mode === 'mc') {
      startQuiz();
    }

    if (query && activeKanjiList.length === 0) {
      showNotice(`Tidak ada kanji yang cocok dengan "${query}" di Part ${currentPart}.`);
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

  // =========================================================
  // 7. CAROUSEL FLASHCARD KANJI (INFINITE SESUAI ISI JSON)
  // =========================================================
  const Carousel = {
    index: 0,
    render() {
      const container = $('carouselContainer');
      if (!container) return;
      container.innerHTML = '';

      if (!activeKanjiList.length) {
        if ($('carouselCounter'))$('carouselCounter').textContent = '0 / 0';
        container.innerHTML = `
          <div class="chapter-flashcard center">
            <div class="carousel-card-inner">
              <div class="carousel-face front">
                <span class="c-tag">Status</span>
                <span class="c-arti">Data Kosong</span>
              </div>
            </div>
          </div>`;
        return;
      }

      // Render SEMUA kartu tanpa batasan
      activeKanjiList.forEach((v, i) => {
        const card = document.createElement('div');
        card.className = 'chapter-flashcard hidden';
        card.innerHTML = `
          <div class="carousel-card-inner">
            <!-- DEPAN KARTU -->
            <div class="carousel-face front">
              <div class="card-top-info">
                <span class="c-tag">Kanji</span>
              </div>
              <div class="card-mid-info">
                <span class="c-kanji furigana-font">${esc(v.kanji)}</span>
              </div>
              <div class="card-bot-info">
                <span class="flip-hint">Ketuk untuk membalik</span>
              </div>
            </div>

            <!-- BELAKANG KARTU: TEPAT DI TENGAH -->
            <div class="carousel-face back">
              <div class="card-top-info">
                <span class="c-tag">Detail Kanji</span>
              </div>
              <div class="card-mid-info card-back-centered">
                <span class="c-furigana furigana-font">${esc(v.furigana)}</span>
                <div class="c-divider"></div>
                <span class="c-arti">${esc(v.arti)}</span>
              </div>
              <div class="card-bot-info">
                <span class="flip-hint">Ketuk untuk kembali</span>
              </div>
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
      const total = activeKanjiList.length;

      // Hitungan otomatis 1 / Total (Infinite)
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
      if (!activeKanjiList.length) return;

      // Saat kartu kanji terakhir selesai -> Tampilkan Modal Part Selesai / Dokkai Time
      if (dir === 1 && this.index === activeKanjiList.length - 1) {
        showCompletionModal();
        return;
      }

      if (dir === -1 && this.index === 0) return;

      this.index = Math.max(0, Math.min(this.index + dir, activeKanjiList.length - 1));
      this.update();
      playTone('pop');
    }
  };

  if ($('btnCarouselNext'))$('btnCarouselNext').addEventListener('click', () => Carousel.go(1));
  if ($('btnCarouselPrev'))$('btnCarouselPrev').addEventListener('click', () => Carousel.go(-1));
  if ($('shuffleBtn')) {$('shuffleBtn').addEventListener('click', () => {
      activeKanjiList = shuffle(activeKanjiList);
      Carousel.render();
      playTone('pop');
    });
  }

  // =========================================================
  // 8. MODAL SELESAI: PART SELESAI · DOKKAI TIME
  // =========================================================
  const completionModal = $('completionModal');
  function showCompletionModal() {
    if (completionModal) {
      completionModal.classList.add('is-active');
      completionModal.setAttribute('aria-hidden', 'false');
      playTone('win');
    }
  }

  function hideCompletionModal() {
    if (completionModal) {
      completionModal.classList.remove('is-active');
      completionModal.setAttribute('aria-hidden', 'true');
    }
  }

  if ($('btnRepeatCards')) {$('btnRepeatCards').addEventListener('click', () => {
      hideCompletionModal();
      Carousel.index = 0;
      Carousel.update();
    });
  }

  if ($('btnStartDokkaiNow')) {$('btnStartDokkaiNow').addEventListener('click', () => {
      hideCompletionModal();
      setMode('dokkai');
    });
  }

  // =========================================================
  // 9. DOKKAI ENGINE: DYNAMIC, HIGHLIGHT KANJI & AUDIO TTS
  // =========================================================

  // Highlight kanji yang dipelajari di dalam kalimat dokkai
  function highlightLearnedKanji(japaneseText) {
    if (!japaneseText) return '';
    if (!rawKanjiList.length) return esc(japaneseText);

    // Ambil daftar kanji dari part aktif
    const kanjiList = rawKanjiList.map(item => item.kanji).filter(Boolean);
    kanjiList.sort((a, b) => b.length - a.length);

    const escapedKanjis = kanjiList.map(k => k.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
    const regex = new RegExp(`(${escapedKanjis.join('|')})`, 'g');

    return japaneseText.replace(regex, '<span class="dokkai-highlight-kanji" title="Kanji yang dipelajari">$1</span>');
  }

  function initDokkai() {
    if (!dokkaiData || !dokkaiData.items || dokkaiData.items.length === 0) {
      showNotice('Materi Dokkai untuk part ini belum tersedia.');
      return;
    }
    currentSentenceIndex = 0;
    renderDokkaiSentence();
  }

  function renderDokkaiSentence() {
    const total = dokkaiData.items.length; // Otomatis berapa pun jumlah kalimat di JSON
    const item = dokkaiData.items[currentSentenceIndex];

    if ($('dokkaiTitle')) {$('dokkaiTitle').textContent = dokkaiData.title || `Latihan Dokkai — Part ${currentPart}`;
    }
    if ($('dokkaiCounter')) {$('dokkaiCounter').textContent = `Kalimat ${currentSentenceIndex + 1} dari ${total}`;
    }

    // Render Teks dengan Highlight Kanji
    if ($('dokkaiSentenceText')) {$('dokkaiSentenceText').innerHTML = highlightLearnedKanji(item.japanese || '');
    }

    if ($('dokkaiMeaningText')) {$('dokkaiMeaningText').textContent = item.indonesian || '';
    }

    // Reset Box Terjemahan
    if ($('dokkaiTranslation'))$('dokkaiTranslation').classList.remove('show');
    if ($('toggleTransBtn')) {
      const span = $('toggleTransBtn').querySelector('span');
      if (span) span.textContent = 'Lihat Terjemahan';
    }

    // Navigasi Prev/Next
    if ($('dokkaiPrevBtn')) {$('dokkaiPrevBtn').style.visibility = currentSentenceIndex === 0 ? 'hidden' : 'visible';
    }
    if ($('dokkaiNextBtn')) {
      if (currentSentenceIndex === total - 1) {
        $('dokkaiNextBtn').textContent = 'Selesai & Ulangi Part';
      } else {
        $('dokkaiNextBtn').textContent = 'Kalimat Selanjutnya →';
      }
    }
  }

  if ($('dokkaiNextBtn')) {$('dokkaiNextBtn').addEventListener('click', () => {
      if (currentSentenceIndex < dokkaiData.items.length - 1) {
        currentSentenceIndex++;
        renderDokkaiSentence();
        playTone('pop');
      } else {
        setMode('carousel');
      }
    });
  }

  if ($('dokkaiPrevBtn')) {$('dokkaiPrevBtn').addEventListener('click', () => {
      if (currentSentenceIndex > 0) {
        currentSentenceIndex--;
        renderDokkaiSentence();
        playTone('pop');
      }
    });
  }

  if ($('toggleTransBtn')) {$('toggleTransBtn').addEventListener('click', () => {
      const box = $('dokkaiTranslation');
      if (box) {
        const isShowing = box.classList.toggle('show');
        const span = $('toggleTransBtn').querySelector('span');
        if (span) span.textContent = isShowing ? 'Tutup Terjemahan' : 'Lihat Terjemahan';
      }
    });
  }

  // Audio Speech Synthesis (TTS Suara Jepang)
  if ($('btnReadAloud')) {$('btnReadAloud').addEventListener('click', () => {
      const currentItem = dokkaiData.items[currentSentenceIndex];
      if (!currentItem || !currentItem.japanese) return;

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(currentItem.japanese);
        utterance.lang = 'ja-JP';
        utterance.rate = 0.88;
        window.speechSynthesis.speak(utterance);
      } else {
        showNotice('Perangkat Anda tidak mendukung audio percakapan bahasa Jepang.', 3000);
      }
    });
  }

  // Zoom Text Dokkai
  if ($('btnDokkaiZoomIn')) {$('btnDokkaiZoomIn').addEventListener('click', () => {
      if (dokkaiFontSizeRem < 2.5) {
        dokkaiFontSizeRem += 0.15;
        document.documentElement.style.setProperty('--dokkai-font-size', `${dokkaiFontSizeRem}rem`);
      }
    });
  }
  if ($('btnDokkaiZoomOut')) {$('btnDokkaiZoomOut').addEventListener('click', () => {
      if (dokkaiFontSizeRem > 1.0) {
        dokkaiFontSizeRem -= 0.15;
        document.documentElement.style.setProperty('--dokkai-font-size', `${dokkaiFontSizeRem}rem`);
      }
    });
  }

  // =========================================================
  // 10. KUIS PILIHAN GANDA (MC)
  // =========================================================
  function startQuiz() {
    if (activeKanjiList.length < 4) {
      showNotice('Dibutuhkan minimal 4 kanji di part ini untuk kuis pilihan ganda.', 3500);
      setMode('carousel');
      return;
    }

    quizPool = shuffle(activeKanjiList);
    qi = 0;
    qScore = 0;
    answered = false;

    if ($('quizTitle'))$('quizTitle').textContent = `Pilihan Ganda · Part ${currentPart}`;
    if ($('quizProgressFill'))$('quizProgressFill').style.width = '0%';
    runMC();
  }

  function setQuizProgress() {
    if ($('quizProgressFill'))$('quizProgressFill').style.width = `${(qi / quizPool.length) * 100}%`;
    if ($('quizCounter'))$('quizCounter').textContent = `Soal ${qi + 1} / ${quizPool.length}`;
    if ($('quizScore'))$('quizScore').textContent = `Benar ${qScore}`;
  }

  function runMC() {
    if (qi >= quizPool.length) {
      return showResult(qScore, quizPool.length);
    }

    setQuizProgress();
    answered = false;
    const q = quizPool[qi];

    if ($('mcQuestionText'))$('mcQuestionText').textContent = q.kanji;
    if ($('mcFeedback')) {
      $('mcFeedback').textContent = '';$('mcFeedback').className = 'feedback-text';
    }
    if ($('btnMcNext'))$('btnMcNext').disabled = true;

    const wrongs = shuffle(rawKanjiList.filter(v => v.id !== q.id && v.arti !== q.arti)).slice(0, 3);
    const optionsBox = $('mcOptions');
    if (!optionsBox) return;
    optionsBox.innerHTML = '';

    shuffle([q, ...wrongs]).forEach((item, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-mc-option';
      btn.dataset.key = ['A', 'B', 'C', 'D'][i];
      btn.dataset.id = item.id;
      btn.textContent = `${item.furigana} (${item.arti})`;

      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;

        optionsBox.querySelectorAll('.btn-mc-option').forEach(b => {
          b.disabled = true;
          if (b.dataset.id === String(q.id)) b.classList.add('correct');
        });

        if (item.id === q.id) {
          qScore++;
          $('mcFeedback').textContent = 'Benar!';$('mcFeedback').classList.add('correct');
          playTone('correct');
        } else {
          btn.classList.add('wrong');
          $('mcFeedback').textContent = 'Kurang Tepat!';$('mcFeedback').classList.add('wrong');
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

  function showResult(score, total) {
    if ($('quizProgressFill'))$('quizProgressFill').style.width = '100%';
    if ($('mode-mc'))$('mode-mc').hidden = true;
    if ($('mode-result'))$('mode-result').hidden = false;

    if ($('resultScore'))$('resultScore').textContent = `Skor Akhir: ${score} / ${total}`;
    const pct = Math.round((score / total) * 100);
    if ($('resultRing'))$('resultRing').style.setProperty('--pct', pct);
    if ($('resultPct'))$('resultPct').textContent = pct + '%';
    playTone('win');
  }

  if ($('btnRetryQuiz'))$('btnRetryQuiz').addEventListener('click', () => startQuiz());
  if ($('btnResultCards'))$('btnResultCards').addEventListener('click', () => setMode('carousel'));

  if ($('btnZoomIn')) {$('btnZoomIn').addEventListener('click', () => {
      if (vocabZoomRem < 6.0) {
        vocabZoomRem += 0.3;
        document.documentElement.style.setProperty('--vocab-font-size', `${vocabZoomRem}rem`);
      }
    });
  }
  if ($('btnZoomOut')) {$('btnZoomOut').addEventListener('click', () => {
      if (vocabZoomRem > 2.2) {
        vocabZoomRem -= 0.3;
        document.documentElement.style.setProperty('--vocab-font-size', `${vocabZoomRem}rem`);
      }
    });
  }

  // =========================================================
  // 11. SWITCH MODE
  // =========================================================
  function setMode(newMode) {
    mode = newMode;

    document.querySelectorAll('.dock-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === newMode);
    });

    if ($('mode-carousel'))$('mode-carousel').hidden = (newMode !== 'carousel');
    if ($('mode-mc'))$('mode-mc').hidden = (newMode !== 'mc');
    if ($('mode-dokkai'))$('mode-dokkai').hidden = (newMode !== 'dokkai');
    if ($('mode-result'))$('mode-result').hidden = true;
    if ($('quiz-global-header'))$('quiz-global-header').hidden = (newMode !== 'mc');

    if (newMode === 'carousel') {
      Carousel.update();
    } else if (newMode === 'mc') {
      startQuiz();
    } else if (newMode === 'dokkai') {
      initDokkai();
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

  if ($('btnAudioToggle')) {$('btnAudioToggle').addEventListener('click', function() {
      audioOn = !audioOn;
      const unmuted = this.querySelector('.icon-unmuted');
      const muted = this.querySelector('.icon-muted');
      if (unmuted) unmuted.style.display = audioOn ? 'block' : 'none';
      if (muted) muted.style.display = audioOn ? 'none' : 'block';
    });
  }

  // =========================================================
  // 12. FETCH & NORMALISASI DARI kode/part_X.json
  // =========================================================
  async function loadPart(partNum) {
    currentPart = parseInt(partNum, 10);
    updatePartUI();

    try {
      const res = await fetch(DATA_PATH(currentPart), { cache: 'no-cache' });
      if (!res.ok) throw new Error(`Status ${res.status}: Gagal memuat ${DATA_PATH(currentPart)}`);
      
      const json = await res.json();
      
      // Ambil SEMUA kartu kanji yang ada di JSON tanpa batasan
      const cards = json.flashcards || [];
      rawKanjiList = cards.map((item, idx) => ({
        id: idx,
        kanji: item.kanji || '',
        furigana: item.furigana || '',
        arti: item.arti || ''
      })).filter(c => c.kanji && c.arti);

      // Ambil SEMUA kalimat dokkai yang ada di JSON tanpa batasan
      dokkaiData = {
        title: json.dokkai?.title || `Dokkai Part ${currentPart}`,
        items: (json.dokkai?.items || []).filter(item => item && item.japanese)
      };

      hideNotice();
    } catch (e) {
      console.error(e);
      showNotice(`Gagal membaca ${DATA_PATH(currentPart)}. Pastikan file ada di dalam folder 'kode/'.`, 5000);
      rawKanjiList = [];
      dokkaiData = { title: '', items: [] };
    }

    try {
      localStorage.setItem(SAVE_KEY, currentPart);
      const url = new URL(location.href);
      url.searchParams.set('part', currentPart);
      history.replaceState(null, '', url);
    } catch (e) {}

    applySearchFilter();
    if (mode === 'dokkai') initDokkai();
  }

  // =========================================================
  // 13. SHORTCUT KEYBOARD
  // =========================================================
  window.addEventListener('keydown', e => {
    if (e.target.matches('input, textarea')) return;
    if (completionModal && completionModal.classList.contains('is-active')) return;

    if (mode === 'carousel') {
      if (e.code === 'ArrowRight') Carousel.go(1);
      else if (e.code === 'ArrowLeft') Carousel.go(-1);
      else if (e.code === 'Space') {
        e.preventDefault();
        const activeCard = document.querySelector('.chapter-flashcard.center');
        if (activeCard) activeCard.classList.toggle('is-flipped');
      }
    } else if (mode === 'dokkai') {
      if (e.code === 'ArrowRight' || e.code === 'Space') {
        e.preventDefault();
        if ($('dokkaiNextBtn'))$('dokkaiNextBtn').click();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if ($('dokkaiPrevBtn'))$('dokkaiPrevBtn').click();
      }
    }
  });

  // =========================================================
  // 14. INISIALISASI HALAMAN
  // =========================================================
  const urlParams = new URLSearchParams(location.search);
  let initPart = parseInt(urlParams.get('part'), 10);
  if (!initPart && urlParams.get('data')) {
    const match = urlParams.get('data').match(/part_(\d+)\.json/);
    if (match) initPart = parseInt(match[1], 10);
  }
  if (!initPart || initPart < 1 || initPart > totalParts) {
    initPart = parseInt(localStorage.getItem(SAVE_KEY), 10) || 1;
  }

  loadPart(initPart);
});