/* =========================================================================
   NAKAMAGAKKOU — 2-STAGE MATERIAL & CHAPTER SELECTOR (N5 - N1)
   Path Otomatis: Data/{Level}/{Kategori}/index.html
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {

  const SUB_DATA = {
    N5: {
      Minna1: {
        title: "Minna 1",
        desc: "Kosakata Dasar N5",
        itemLabel: "Bab",
        jsonPrefix: "bab",
        startNum: 1,
        total: 25,
        htmlPath: "Data/N5/Minna1/index.html"
      },
      Soumatome: {
        title: "Soumatome",
        desc: "Rangkuman N5",
        itemLabel: "Part",
        jsonPrefix: "Soumatome",
        startNum: 1,
        total: 6,
        htmlPath: "Data/N5/Soumatome/index.html"
      }
    },
    N4: {
      Minna2: {
        title: "Minna 2",
        desc: "Kosakata Lanjutan N4",
        itemLabel: "Bab",
        jsonPrefix: "bab",
        startNum: 26,
        total: 25,
        htmlPath: "Data/N4/Minna2/index.html"
      },
      Soumatome: {
        title: "Soumatome",
        desc: "Rangkuman N4",
        itemLabel: "Part",
        jsonPrefix: "Soumatome",
        startNum: 1,
        total: 6,
        htmlPath: "Data/N4/Soumatome/index.html"
      }
    },
    N3: {
      Mori: {
        title: "Mori",
        desc: "Nihongo no Mori N3",
        itemLabel: "Mori",
        jsonPrefix: "Mori",
        startNum: 1,
        total: 37,
        htmlPath: "Data/N3/Mori/index.html"
      },
      Soumatome: {
        title: "Soumatome",
        desc: "Rangkuman N3",
        itemLabel: "Part",
        jsonPrefix: "Soumatome",
        startNum: 1,
        total: 36,
        htmlPath: "Data/N3/Soumatome/index.html"
      }
    },
    N2: {
      Mori: {
        title: "Mori",
        desc: "Nihongo no Mori N2",
        itemLabel: "Mori",
        jsonPrefix: "Mori",
        startNum: 1,
        total: 63,
        htmlPath: "Data/N2/Mori/index.html"
      },
      Soumatome: {
        title: "Soumatome",
        desc: "Rangkuman N2",
        itemLabel: "Part",
        jsonPrefix: "Soumatome",
        startNum: 1,
        total: 47,
        htmlPath: "Data/N2/Soumatome/index.html"
      }
    },
    N1: {
      Mori: {
        title: "Mori",
        desc: "Nihongo no Mori N1",
        itemLabel: "Mori",
        jsonPrefix: "Mori",
        startNum: 1,
        total: 69,
        htmlPath: "Data/N1/Mori/index.html"
      },
      Soumatome: {
        title: "Soumatome",
        desc: "Rangkuman N1",
        itemLabel: "Part",
        jsonPrefix: "Soumatome",
        startNum: 1,
        total: 49,
        htmlPath: "Data/N1/Soumatome/index.html"
      }
    }
  };

  function normalizeLevel(raw) {
    if (!raw) return null;
    const upper = String(raw).trim().toUpperCase();
    return SUB_DATA[upper] ? upper : null;
  }

  function normalizeBookKey(level, rawBook) {
    if (!level || !rawBook || !SUB_DATA[level]) return null;
    const target = String(rawBook).trim().toLowerCase();
    const keys = Object.keys(SUB_DATA[level]);
    return keys.find(k => k.toLowerCase() === target) || null;
  }

  function syncUrlState(level, bookKey) {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('level', level);
      if (bookKey) url.searchParams.set('buku', bookKey);
      else url.searchParams.delete('buku');
      window.history.replaceState({}, '', url.toString());
    } catch (_) {}
  }

  // State Aplikasi
  let currentLevel = 'N5';
  let currentBookKey = null;
  let currentIndex = 0;
  let cards = [];
  let gridItems = [];
  let jumpPills = [];

  // Elemen DOM
  const bookSelectionStage = document.getElementById('bookSelectionStage');
  const bookBentoGrid = document.getElementById('bookBentoGrid');
  const stageLevelBadge = document.getElementById('stageLevelBadge');
  const stageMainTitle = document.getElementById('stageMainTitle');

  const chapterCarouselStage = document.getElementById('chapterCarouselStage');
  const container = document.getElementById('carouselContainer');
  const modalGrid = document.getElementById('modalChapterGrid');
  const quickJumpStrip = document.getElementById('quickJumpStrip');
  const currentChapterDisplay = document.getElementById('currentChapterDisplay');
  const openModalBtn = document.getElementById('openChapterModal');
  const modalTagLabel = document.getElementById('modalTagLabel');
  const modalTitleLabel = document.getElementById('modalTitleLabel');
  const deckProgressFill = document.getElementById('deckProgressFill');

  const levelPillsContainer = document.getElementById('levelPills');
  const backToBookBtn = document.getElementById('backToBookBtn');
  const activeBookLabel = document.getElementById('activeBookLabel');
  const navBackBtn = document.getElementById('navBackBtn');

  const nextBtn = document.getElementById('nextBtn');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtnMobile = document.getElementById('nextBtnMobile');
  const prevBtnMobile = document.getElementById('prevBtnMobile');

  // === 0. TEMA SIANG / MALAM ===
  const htmlEl = document.documentElement;
  const themeToggleBtn = document.getElementById('themeToggleBtn');
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
      playPopSound();
    });
  }

  const vectorIcons = [
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.2 6.6L22 9.7l-5 4.9 1.2 6.9L12 18.2 5.8 21.5 7 14.6 2 9.7l6.8-1.1L12 2z"/></svg>`
  ];

  function smoothNavigate(targetUrl) {
    document.body.classList.add('page-leaving');
    setTimeout(() => {
      window.location.href = targetUrl;
    }, 260);
  }

  window.addEventListener('pageshow', () => {
    document.body.classList.remove('page-leaving');
    initFromUrlOrStorage();
  });

  // === 1. LEVEL PILLS ===
  function updateLevelPills() {
    if (!levelPillsContainer) return;
    levelPillsContainer.querySelectorAll('.lvl-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.level === currentLevel);
    });
  }

  if (levelPillsContainer) {
    levelPillsContainer.querySelectorAll('.lvl-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const lvl = normalizeLevel(btn.dataset.level);
        if (lvl) {
          currentLevel = lvl;
          localStorage.setItem('nakama_level', currentLevel);
          playPopSound();
          showBookSelectionStage();
        }
      });
    });
  }

  if (backToBookBtn) {
    backToBookBtn.addEventListener('click', () => {
      playPopSound();
      showBookSelectionStage();
    });
  }

  if (navBackBtn) {
    navBackBtn.addEventListener('click', function (e) {
      e.preventDefault();
      if (currentBookKey !== null) {
        playPopSound();
        showBookSelectionStage();
      } else {
        smoothNavigate(this.getAttribute('href'));
      }
    });
  }

  // === 2. TAMPILAN 1: KARTU BUKU MINIMALIS ===
  function showBookSelectionStage() {
    currentBookKey = null;
    updateLevelPills();
    syncUrlState(currentLevel, null);

    if (chapterCarouselStage) chapterCarouselStage.classList.add('hidden');
    if (openModalBtn) openModalBtn.classList.add('hidden');
    if (backToBookBtn) backToBookBtn.classList.add('hidden');
    if (bookSelectionStage) bookSelectionStage.classList.remove('hidden');

    if (stageLevelBadge) stageLevelBadge.textContent = `JLPT ${currentLevel}`;
    if (stageMainTitle) stageMainTitle.textContent = `Pilih Materi ${currentLevel}`;

    if (!bookBentoGrid) return;
    bookBentoGrid.innerHTML = '';
    const books = SUB_DATA[currentLevel];

    Object.keys(books).forEach((bookKey, idx) => {
      const book = books[bookKey];
      const iconSvg = vectorIcons[idx % vectorIcons.length];

      const btnCard = document.createElement('button');
      btnCard.type = 'button';
      btnCard.className = 'book-bento-card';

      btnCard.innerHTML = `
        <div class="book-card-top">
          <div class="book-big-icon">${iconSvg}</div>
          <div class="book-meta-badges">
            <span class="book-level-tag">${currentLevel}</span>
            <span class="book-total-tag">${book.total} ${book.itemLabel}</span>
          </div>
        </div>
        <div class="book-card-body">
          <h2 class="book-card-name">${book.title}</h2>
          <p class="book-card-desc">${book.desc}</p>
        </div>
        <div class="book-cta-bar">
          <span class="book-cta-text">Buka ${book.title}</span>
          <div class="book-cta-arrow">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        </div>
      `;

      btnCard.addEventListener('click', () => {
        playPopSound();
        openChapterCarousel(currentLevel, bookKey);
      });

      bookBentoGrid.appendChild(btnCard);
    });
  }

  // === 3. TAMPILAN 2: LAYERED DECK & QUICK-JUMP ===
  function openChapterCarousel(level, bookKey) {
    const validLevel = normalizeLevel(level) || 'N5';
    const validBookKey = normalizeBookKey(validLevel, bookKey);
    if (!validBookKey) {
      currentLevel = validLevel;
      showBookSelectionStage();
      return;
    }

    currentLevel = validLevel;
    currentBookKey = validBookKey;
    currentIndex = 0;

    localStorage.setItem('nakama_level', currentLevel);
    updateLevelPills();
    syncUrlState(currentLevel, currentBookKey);

    const book = SUB_DATA[currentLevel][currentBookKey];

    if (bookSelectionStage) bookSelectionStage.classList.add('hidden');
    if (chapterCarouselStage) chapterCarouselStage.classList.remove('hidden');
    if (openModalBtn) openModalBtn.classList.remove('hidden');
    if (backToBookBtn) backToBookBtn.classList.remove('hidden');

    if (activeBookLabel) activeBookLabel.textContent = book.title;

    const startNum = book.startNum;
    const total = book.total;
    const endNum = startNum + total - 1;

    if (modalTagLabel) modalTagLabel.textContent = `${currentLevel} • ${book.title.toUpperCase()} (${startNum}-${endNum})`;
    if (modalTitleLabel) modalTitleLabel.textContent = `Pilih ${book.itemLabel}`;

    container.innerHTML = '';
    if (modalGrid) modalGrid.innerHTML = '';
    if (quickJumpStrip) quickJumpStrip.innerHTML = '';
    cards = [];
    gridItems = [];
    jumpPills = [];

    const folderBase = `Data/${currentLevel}/${currentBookKey}`;
    const targetHtmlPath = book.htmlPath || `${folderBase}/index.html`;

    for (let i = 0; i < total; i++) {
      const babNum = startNum + i;
      const paddedNum = babNum < 10 ? `0${babNum}` : babNum;
      const svgIcon = vectorIcons[i % vectorIcons.length];
      const jsonFile = `${book.jsonPrefix}${babNum}.json`;
      const targetHref = `${targetHtmlPath}?bab=${babNum}&file=${jsonFile}&kode=kode/${jsonFile}&level=${currentLevel}&kategori=${currentBookKey}`;

      const card = document.createElement('a');
      card.href = targetHref;
      card.className = 'chapter-flashcard';
      card.dataset.index = i;

      card.innerHTML = `
        <div class="flashcard-top">
          <span class="badge-status">#${paddedNum}</span>
          <span class="badge-book">${book.title}</span>
        </div>
        <div class="flashcard-body">
          <span class="chapter-watermark" aria-hidden="true">${paddedNum}</span>
          <div class="chapter-icon-box">${svgIcon}</div>
          <h2 class="chapter-title">${book.itemLabel} ${babNum}</h2>
        </div>
        <div class="chapter-start-bar">
          <span class="action-hint">Mulai</span>
          <div class="action-icon-circle">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M7 17L17 7M7 7h10v10"/>
            </svg>
          </div>
        </div>
      `;

      card.addEventListener('click', function (e) {
        if (!this.classList.contains('active')) {
          e.preventDefault();
          currentIndex = i;
          updateCarousel();
        } else {
          e.preventDefault();
          smoothNavigate(this.getAttribute('href'));
        }
      });

      container.appendChild(card);
      cards.push(card);

      if (quickJumpStrip) {
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = 'jump-pill';
        pill.textContent = `#${paddedNum}`;
        pill.addEventListener('click', () => {
          currentIndex = i;
          updateCarousel();
        });
        quickJumpStrip.appendChild(pill);
        jumpPills.push(pill);
      }

      if (modalGrid) {
        const gridBtn = document.createElement('button');
        gridBtn.type = 'button';
        gridBtn.className = 'chapter-grid-item';
        gridBtn.dataset.index = i;
        gridBtn.innerHTML = `
          <span class="cgi-num">${paddedNum}</span>
          <span class="cgi-label">${book.itemLabel.toUpperCase()}</span>
        `;
        gridBtn.addEventListener('click', () => {
          currentIndex = i;
          updateCarousel();
          closeModal();
        });
        modalGrid.appendChild(gridBtn);
        gridItems.push(gridBtn);
      }
    }

    updateCarousel(false);
  }

  // === 4. UPDATE DECK & QUICK-JUMP ===
  function updateCarousel(withSound = true) {
    if (!currentBookKey || !SUB_DATA[currentLevel][currentBookKey]) return;
    if (withSound) playPopSound();

    const book = SUB_DATA[currentLevel][currentBookKey];

    cards.forEach((card, i) => {
      card.classList.remove('active', 'prev', 'next', 'hidden-left', 'hidden-right');
      if (i === currentIndex) card.classList.add('active');
      else if (i === currentIndex - 1) card.classList.add('prev');
      else if (i === currentIndex + 1) card.classList.add('next');
      else if (i < currentIndex - 1) card.classList.add('hidden-left');
      else card.classList.add('hidden-right');
    });

    const activeBabNum = book.startNum + currentIndex;
    const formatted = activeBabNum < 10 ? `0${activeBabNum}` : activeBabNum;
    if (currentChapterDisplay) {
      currentChapterDisplay.textContent = `${book.itemLabel} ${formatted}`;
    }

    if (deckProgressFill && cards.length > 0) {
      deckProgressFill.style.width = `${Math.round(((currentIndex + 1) / cards.length) * 100)}%`;
    }

    const atStart = currentIndex <= 0;
    const atEnd = currentIndex >= cards.length - 1;
    if (prevBtn) prevBtn.disabled = atStart;
    if (prevBtnMobile) prevBtnMobile.disabled = atStart;
    if (nextBtn) nextBtn.disabled = atEnd;
    if (nextBtnMobile) nextBtnMobile.disabled = atEnd;

    jumpPills.forEach((pill, i) => {
      const isAct = i === currentIndex;
      pill.classList.toggle('active', isAct);
      if (isAct) {
        pill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    });

    gridItems.forEach((btn, i) => {
      btn.classList.toggle('active', i === currentIndex);
    });
  }

  // === 5. MODAL ===
  const chapterModal = document.getElementById('chapterModal');
  const closeModalBtn = document.getElementById('closeChapterModal');

  function openModal() {
    if (chapterModal) chapterModal.classList.add('open');
  }
  function closeModal() {
    if (chapterModal) chapterModal.classList.remove('open');
  }

  if (openModalBtn) openModalBtn.addEventListener('click', openModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (chapterModal) {
    chapterModal.addEventListener('click', (e) => {
      if (e.target === chapterModal) closeModal();
    });
  }

  // === 6. NAVIGASI PANAH, KEYBOARD & SWIPE ===
  function goNext() {
    if (currentBookKey && currentIndex < cards.length - 1) {
      currentIndex++;
      updateCarousel();
    }
  }

  function goPrev() {
    if (currentBookKey && currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    }
  }

  if (nextBtn) nextBtn.addEventListener('click', goNext);
  if (prevBtn) prevBtn.addEventListener('click', goPrev);
  if (nextBtnMobile) nextBtnMobile.addEventListener('click', goNext);
  if (prevBtnMobile) prevBtnMobile.addEventListener('click', goPrev);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
    if (!currentBookKey) return;
    if (chapterModal && chapterModal.classList.contains('open')) return;
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'ArrowLeft') goPrev();
  });

  let touchStartX = 0;
  if (container) {
    container.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) goNext();
        else goPrev();
      }
    }, { passive: true });
  }

  // === 7. AUDIO POP ===
  let audioCtx = null;
  function playPopSound() {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      const now = audioCtx.currentTime;
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(290, now + 0.09);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch (_) {}
  }

  // === 8. VISUAL FX ===
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;

  if (!reduce) {
    const sun = document.getElementById('sun');
    if (sun) {
      addEventListener('pointermove', e => {
        sun.style.transform = `translate(${(e.clientX / innerWidth - 0.5) * -36}px, ${(e.clientY / innerHeight - 0.5) * -36}px)`;
      });
    }

    const fx = document.getElementById('fx');
    const sparkColors = ['#FDE047', '#FEF3C7', '#EAB308', '#FFFFFF'];
    addEventListener('pointerdown', e => {
      if (!fx) return;
      const pulse = document.createElement('div');
      pulse.className = 'pulse';
      pulse.style.left = e.clientX + 'px';
      pulse.style.top = e.clientY + 'px';
      pulse.onanimationend = () => pulse.remove();
      fx.appendChild(pulse);

      for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 * i) / 5 + Math.random() * 0.4;
        const dist = 40 + Math.random() * 50;
        const sp = document.createElement('span');
        sp.className = 'spark';
        sp.style.left = e.clientX + 'px';
        sp.style.top = e.clientY + 'px';
        sp.style.background = sparkColors[i % sparkColors.length];
        sp.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
        sp.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
        sp.style.setProperty('--r', `${(Math.random() - 0.5) * 180}deg`);
        sp.onanimationend = () => sp.remove();
        fx.appendChild(sp);
      }
    });

    if (fine) {
      const cv = document.getElementById('trail');
      if (cv) {
        const ctx = cv.getContext('2d');
        const resize = () => { cv.width = innerWidth; cv.height = innerHeight; };
        resize();
        addEventListener('resize', resize);

        let mx = -100, my = -100, x = mx, y = my;
        const pts = [];

        addEventListener('pointermove', e => {
          mx = e.clientX;
          my = e.clientY;
        });

        (function drawTrail() {
          x += (mx - x) * 0.32;
          y += (my - y) * 0.32;
          pts.push({ x, y });
          if (pts.length > 16) pts.shift();

          ctx.clearRect(0, 0, cv.width, cv.height);
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          const isDark = htmlEl.getAttribute('data-theme') === 'dark';

          for (let i = 1; i < pts.length; i++) {
            const t = i / pts.length;
            ctx.strokeStyle = isDark
              ? `rgba(234, 179, 8, ${t * 0.24})`
              : `rgba(17, 17, 17, ${t * 0.16})`;
            ctx.lineWidth = t * 8;
            ctx.beginPath();
            ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
            ctx.lineTo(pts[i].x, pts[i].y);
            ctx.stroke();
          }
          requestAnimationFrame(drawTrail);
        })();
      }
    }
  }

  // === 9. INISIALISASI DARI URL / LOCALSTORAGE ===
  function initFromUrlOrStorage() {
    const params = new URLSearchParams(window.location.search);
    const paramLevel = normalizeLevel(params.get('level'));
    const savedLevel = normalizeLevel(localStorage.getItem('nakama_level'));
    currentLevel = paramLevel || savedLevel || 'N5';
    localStorage.setItem('nakama_level', currentLevel);

    const paramBook = normalizeBookKey(currentLevel, params.get('buku'));
    if (paramBook) {
      openChapterCarousel(currentLevel, paramBook);
    } else {
      showBookSelectionStage();
    }
  }

  initFromUrlOrStorage();
});