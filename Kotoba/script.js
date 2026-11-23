/* =========================================================================
   NAKAMAGAKKOU — 2-STAGE MATERIAL & CHAPTER SELECTOR (N5 - N1)
   Refined Motion, Lenis Smooth Scroll, Mobile & iPad Touch Drag
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {

  // Ganti ke 'Kotoba' jika folder utamamu bernama Kotoba/N5/..., bukan Data/N5/...
  const BASE_DIR = 'Data';

  const SUB_DATA = {
    N5: {
      Minna1: {
        title: "Minna 1",
        desc: "Kosakata Dasar N5",
        itemLabel: "Bab",
        paramKey: "bab",
        jsonPrefix: "bab",
        startNum: 1,
        total: 25,
        htmlPath: `${BASE_DIR}/N5/Minna1/index.html`
      },
      Soumatome: {
        title: "Soumatome",
        desc: "Rangkuman N5",
        itemLabel: "Part",
        paramKey: "part",
        jsonPrefix: "Soumatome",
        startNum: 1,
        total: 6,
        htmlPath: `${BASE_DIR}/N5/Soumatome/index.html`
      }
    },
    N4: {
      Minna2: {
        title: "Minna 2",
        desc: "Kosakata Lanjutan N4",
        itemLabel: "Bab",
        paramKey: "bab",
        jsonPrefix: "bab",
        startNum: 26,
        total: 25,
        htmlPath: `${BASE_DIR}/N4/Minna2/index.html`
      },
      Soumatome: {
        title: "Soumatome",
        desc: "Rangkuman N4",
        itemLabel: "Part",
        paramKey: "part",
        jsonPrefix: "Soumatome",
        startNum: 1,
        total: 6,
        htmlPath: `${BASE_DIR}/N4/Soumatome/index.html`
      }
    },
    N3: {
      Mori: {
        title: "Mori",
        desc: "Nihongo no Mori N3",
        itemLabel: "Mori",
        paramKey: "mori",
        jsonDir: "kode",
        jsonPrefix: "Mori",
        startNum: 1,
        total: 37,
        htmlPath: `${BASE_DIR}/N3/Mori/index.html`
      },
      Soumatome: {
        title: "Soumatome",
        desc: "Rangkuman N3",
        itemLabel: "Part",
        paramKey: "part",
        jsonPrefix: "Soumatome",
        startNum: 1,
        total: 36,
        htmlPath: `${BASE_DIR}/N3/Soumatome/index.html`
      }
    },
    N2: {
      Mori: {
        title: "Mori",
        desc: "Nihongo no Mori N2",
        itemLabel: "Mori",
        paramKey: "mori",
        jsonDir: "kode",
        jsonPrefix: "Mori",
        startNum: 1,
        total: 63,
        htmlPath: `${BASE_DIR}/N2/Mori/index.html`
      },
      Soumatome: {
        title: "Soumatome",
        desc: "Rangkuman N2",
        itemLabel: "Part",
        paramKey: "part",
        jsonPrefix: "Soumatome",
        startNum: 1,
        total: 47,
        htmlPath: `${BASE_DIR}/N2/Soumatome/index.html`
      }
    },
    N1: {
      Mori: {
        title: "Mori",
        desc: "Nihongo no Mori N1",
        itemLabel: "Mori",
        paramKey: "mori",
        jsonDir: "kode",
        jsonPrefix: "Mori",
        startNum: 1,
        total: 69,
        htmlPath: `${BASE_DIR}/N1/Mori/index.html`
      },
      Soumatome: {
        title: "Soumatome",
        desc: "Rangkuman N1",
        itemLabel: "Part",
        paramKey: "part",
        jsonPrefix: "Soumatome",
        startNum: 1,
        total: 49,
        htmlPath: `${BASE_DIR}/N1/Soumatome/index.html`
      }
    }
  };

  const HOME_ICON_SVG = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  `;

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isModifiedClick = e => e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;

  // === LENIS SMOOTH SCROLL (RINGAN, NATIVE TOUCH DI HP/IPAD, SAFE LIFECYCLE) ===
  let lenis = null;
  let lenisRafId = null;

  if (!reduceMotion && typeof window.Lenis === 'function') {
    lenis = new window.Lenis({
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 1
    });

    function lenisRaf(time) {
      lenis.raf(time);
      lenisRafId = requestAnimationFrame(lenisRaf);
    }
    lenisRafId = requestAnimationFrame(lenisRaf);
  }

  // === NAVBAR SHRINK ON SCROLL (PASSIVE + RAF) ===
  const fixedTopbar = document.getElementById('fixedTopbar');
  if (fixedTopbar) {
    let scrollTicking = false;
    const updateTopbarScroll = () => {
      fixedTopbar.classList.toggle('is-scrolled', window.scrollY > 18);
      scrollTicking = false;
    };

    window.addEventListener('scroll', () => {
      if (!scrollTicking) {
        scrollTicking = true;
        requestAnimationFrame(updateTopbarScroll);
      }
    }, { passive: true });
    updateTopbarScroll();
  }

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
  let isNavigating = false;
  let navTimeout = null;
  let stageTimer = null;

  // Elemen DOM
  const pageTransition = document.getElementById('pageTransition');
  const ptIconBox = document.getElementById('ptIconBox');
  const ptLabel = document.getElementById('ptLabel');

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
  const brandHomeLink = document.getElementById('brandHomeLink');

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

  // === HELPER ANIMASI STAGGER & TIRAI PINDAH HALAMAN ===
  function runStaggerIn(containerEl) {
    if (!containerEl) return;
    const targets = containerEl.querySelectorAll('.stagger-item, .book-bento-card');
    targets.forEach((el, idx) => {
      el.style.setProperty('--stagger-i', idx);
      el.classList.remove('stagger-animate');
      void el.offsetWidth;
      el.classList.add('stagger-animate');
    });
  }

  function restoreFromCache() {
    clearTimeout(navTimeout);
    isNavigating = false;
    document.body.classList.remove('page-leaving');
    pageTransition?.classList.remove('active');
    document.querySelectorAll('.card-launching, .sibling-dimmed').forEach(el => {
      el.classList.remove('card-launching', 'sibling-dimmed');
    });
  }

  function smoothNavigate(targetUrl, labelText = 'Memuat...', iconHtml = HOME_ICON_SVG) {
    if (!targetUrl || targetUrl === '#' || isNavigating) return;
    isNavigating = true;
    clearTimeout(navTimeout);

    if (pageTransition) {
      if (ptLabel) ptLabel.textContent = labelText;
      if (ptIconBox) ptIconBox.innerHTML = iconHtml;
      pageTransition.classList.add('active');
    }
    document.body.classList.add('page-leaving');

    navTimeout = setTimeout(() => {
      window.location.href = encodeURI(targetUrl);
      setTimeout(restoreFromCache, 600);
    }, 240);
  }

  window.addEventListener('pageshow', (e) => {
    restoreFromCache();
    if (e.persisted) {
      initFromUrlOrStorage();
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      restoreFromCache();
    }
  });

  // === 1. LEVEL PILLS & NAVIGASI ===
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
          const isFromDeck = currentBookKey !== null;
          currentLevel = lvl;
          localStorage.setItem('nakama_level', currentLevel);
          playPopSound();
          showBookSelectionStage(isFromDeck);
        }
      });
    });
  }

  if (backToBookBtn) {
    backToBookBtn.addEventListener('click', () => {
      playPopSound(480, 260);
      showBookSelectionStage(true);
    });
  }

  if (navBackBtn) {
    navBackBtn.addEventListener('click', function (e) {
      if (isModifiedClick(e)) return;
      e.preventDefault();
      if (currentBookKey !== null) {
        playPopSound(480, 260);
        showBookSelectionStage(true);
      } else {
        playPopSound(520, 280);
        smoothNavigate(this.getAttribute('href'), 'Menu Utama', HOME_ICON_SVG);
      }
    });
  }

  if (brandHomeLink) {
    brandHomeLink.addEventListener('click', function (e) {
      if (isModifiedClick(e)) return;
      if (currentBookKey !== null) {
        e.preventDefault();
        playPopSound(480, 260);
        showBookSelectionStage(true);
      }
    });
  }

  // === 2. TAMPILAN 1: KARTU BUKU MINIMALIS ===
  function renderBookSelectionContent() {
    currentBookKey = null;
    updateLevelPills();
    syncUrlState(currentLevel, null);

    if (chapterCarouselStage) {
      chapterCarouselStage.classList.add('hidden');
      chapterCarouselStage.classList.remove('stage-enter-forward', 'stage-enter-back', 'stage-leave-forward', 'stage-leave-back');
    }
    if (openModalBtn) openModalBtn.classList.add('hidden');
    if (backToBookBtn) backToBookBtn.classList.add('hidden');
    if (bookSelectionStage) {
      bookSelectionStage.classList.remove('hidden', 'stage-leave-forward', 'stage-leave-back');
    }

    if (stageLevelBadge) stageLevelBadge.textContent = `JLPT ${currentLevel}`;
    if (stageMainTitle) stageMainTitle.textContent = `Pilih Materi ${currentLevel}`;

    if (!bookBentoGrid) return;
    const books = SUB_DATA[currentLevel];
    const frag = document.createDocumentFragment();

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
        playPopSound(640, 360);
        bookBentoGrid.querySelectorAll('.book-bento-card').forEach(c => {
          if (c !== btnCard) c.classList.add('sibling-dimmed');
        });
        btnCard.classList.add('card-launching');

        setTimeout(() => {
          openChapterCarousel(currentLevel, bookKey, true);
        }, 120);
      });

      frag.appendChild(btnCard);
    });

    bookBentoGrid.innerHTML = '';
    bookBentoGrid.appendChild(frag);
    runStaggerIn(bookSelectionStage);
  }

  function showBookSelectionStage(animateBack = false) {
    clearTimeout(stageTimer);

    if (animateBack && chapterCarouselStage && !chapterCarouselStage.classList.contains('hidden')) {
      chapterCarouselStage.classList.remove('stage-enter-forward', 'stage-enter-back');
      chapterCarouselStage.classList.add('stage-leave-back');

      stageTimer = setTimeout(() => {
        renderBookSelectionContent();
        bookSelectionStage?.classList.remove('stage-enter-forward', 'stage-enter-back');
        void bookSelectionStage?.offsetWidth;
        bookSelectionStage?.classList.add('stage-enter-back');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 135);
    } else {
      renderBookSelectionContent();
    }
  }

  // === 3. TAMPILAN 2: LAYERED DECK & QUICK-JUMP ===
  function renderChapterCarouselContent(validLevel, validBookKey, animateForward = false) {
    currentLevel = validLevel;
    currentBookKey = validBookKey;
    currentIndex = 0;

    localStorage.setItem('nakama_level', currentLevel);
    updateLevelPills();
    syncUrlState(currentLevel, currentBookKey);

    const book = SUB_DATA[currentLevel][currentBookKey];

    if (bookSelectionStage) {
      bookSelectionStage.classList.add('hidden');
      bookSelectionStage.classList.remove('stage-enter-forward', 'stage-enter-back', 'stage-leave-forward', 'stage-leave-back');
    }
    if (chapterCarouselStage) {
      chapterCarouselStage.classList.remove('hidden', 'stage-leave-forward', 'stage-leave-back', 'stage-enter-forward', 'stage-enter-back');
      if (animateForward) {
        void chapterCarouselStage.offsetWidth;
        chapterCarouselStage.classList.add('stage-enter-forward');
      }
    }
    if (openModalBtn) openModalBtn.classList.remove('hidden');
    if (backToBookBtn) backToBookBtn.classList.remove('hidden');

    if (activeBookLabel) activeBookLabel.textContent = book.title;

    const startNum = book.startNum;
    const total = book.total;
    const endNum = startNum + total - 1;

    if (modalTagLabel) modalTagLabel.textContent = `${currentLevel} • ${book.title.toUpperCase()} (${startNum}-${endNum})`;
    if (modalTitleLabel) modalTitleLabel.textContent = `Pilih ${book.itemLabel}`;

    cards = [];
    gridItems = [];
    jumpPills = [];

    const cardsFrag = document.createDocumentFragment();
    const jumpFrag = document.createDocumentFragment();
    const modalFrag = document.createDocumentFragment();

    const folderBase = `${BASE_DIR}/${currentLevel}/${currentBookKey}`;
    const targetHtmlPath = book.htmlPath || `${folderBase}/index.html`;
    const paramKey = book.paramKey || 'bab';
    const jsonDir = book.jsonDir ? `${book.jsonDir}/` : 'kode/';

    for (let i = 0; i < total; i++) {
      const babNum = startNum + i;
      const paddedNum = babNum < 10 ? `0${babNum}` : babNum;
      const svgIcon = vectorIcons[i % vectorIcons.length];
      const jsonFile = `${book.jsonPrefix}${babNum}.json`;
      const jsonFullPath = `${jsonDir}${jsonFile}`;
      const targetHref = `${targetHtmlPath}?${paramKey}=${babNum}&file=${jsonFile}&kode=${jsonFullPath}&level=${currentLevel}&kategori=${currentBookKey}`;

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
        if (wasSwiping) {
          e.preventDefault();
          return;
        }
        if (!this.classList.contains('active')) {
          e.preventDefault();
          currentIndex = i;
          updateCarousel();
        } else {
          if (isModifiedClick(e)) return;
          e.preventDefault();
          playPopSound(640, 360);
          this.classList.add('card-launching');
          const label = `${book.title} • ${book.itemLabel} ${babNum}`;
          setTimeout(() => {
            smoothNavigate(this.getAttribute('href'), label, svgIcon);
          }, 110);
        }
      });

      cardsFrag.appendChild(card);
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
        jumpFrag.appendChild(pill);
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
        modalFrag.appendChild(gridBtn);
        gridItems.push(gridBtn);
      }
    }

    container.innerHTML = '';
    container.appendChild(cardsFrag);
    if (quickJumpStrip) {
      quickJumpStrip.innerHTML = '';
      quickJumpStrip.appendChild(jumpFrag);
    }
    if (modalGrid) {
      modalGrid.innerHTML = '';
      modalGrid.appendChild(modalFrag);
    }

    updateCarousel(false);
  }

  function openChapterCarousel(level, bookKey, animateForward = false) {
    const validLevel = normalizeLevel(level) || 'N5';
    const validBookKey = normalizeBookKey(validLevel, bookKey);
    if (!validBookKey) {
      currentLevel = validLevel;
      showBookSelectionStage(false);
      return;
    }

    clearTimeout(stageTimer);

    if (animateForward && bookSelectionStage && !bookSelectionStage.classList.contains('hidden')) {
      bookSelectionStage.classList.remove('stage-enter-forward', 'stage-enter-back');
      bookSelectionStage.classList.add('stage-leave-forward');

      stageTimer = setTimeout(() => {
        renderChapterCarouselContent(validLevel, validBookKey, true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 135);
    } else {
      renderChapterCarouselContent(validLevel, validBookKey, false);
    }
  }

  // === 4. UPDATE DECK & QUICK-JUMP ===
  function updateCarousel(withSound = true) {
    if (!currentBookKey || !SUB_DATA[currentLevel][currentBookKey]) return;
    if (withSound) playPopSound();

    const book = SUB_DATA[currentLevel][currentBookKey];

    cards.forEach((card, i) => {
      card.classList.remove('active', 'prev', 'next', 'hidden-left', 'hidden-right', 'is-dragging');
      card.style.transform = '';
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

  // === 5. MODAL (TERINTEGRASI DENGAN LENIS STOP/START) ===
  const chapterModal = document.getElementById('chapterModal');
  const closeModalBtn = document.getElementById('closeChapterModal');

  function openModal() {
    if (!chapterModal) return;
    chapterModal.classList.add('open');
    document.body.classList.add('modal-open');
    if (lenis) lenis.stop();
  }
  function closeModal() {
    if (!chapterModal) return;
    chapterModal.classList.remove('open');
    document.body.classList.remove('modal-open');
    if (lenis) lenis.start();
  }

  if (openModalBtn) openModalBtn.addEventListener('click', openModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (chapterModal) {
    chapterModal.addEventListener('click', (e) => {
      if (e.target === chapterModal) closeModal();
    });
  }

  // === 6. NAVIGASI PANAH, KEYBOARD & REAL-TIME TOUCH DRAG (HP & IPAD) ===
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
  let touchStartY = 0;
  let touchDeltaX = 0;
  let isSwiping = false;
  let wasSwiping = false;

  if (container) {
    container.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1 || !cards[currentIndex]) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchDeltaX = 0;
      isSwiping = false;
      wasSwiping = false;
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
      if (e.touches.length !== 1 || !cards[currentIndex]) return;
      const dx = e.touches[0].clientX - touchStartX;
      const dy = e.touches[0].clientY - touchStartY;

      if (!isSwiping && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
        isSwiping = true;
        cards[currentIndex].classList.add('is-dragging');
      }

      if (isSwiping) {
        touchDeltaX = dx;
        const clamped = Math.max(-120, Math.min(120, dx * 0.65));
        const rot = clamped * 0.04;
        cards[currentIndex].style.transform = `translate3d(${clamped}px, 0, 0) rotate(${rot}deg)`;
      }
    }, { passive: true });

    container.addEventListener('touchend', () => {
      if (!cards[currentIndex]) return;
      cards[currentIndex].classList.remove('is-dragging');
      cards[currentIndex].style.transform = '';

      if (isSwiping) {
        wasSwiping = true;
        setTimeout(() => { wasSwiping = false; }, 60);
        if (touchDeltaX < -42) goNext();
        else if (touchDeltaX > 42) goPrev();
      }
      isSwiping = false;
      touchDeltaX = 0;
    }, { passive: true });
  }

  // === 7. AUDIO POP RINGAN ===
  let audioCtx = null;
  function playPopSound(freqStart = 580, freqEnd = 290) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      const now = audioCtx.currentTime;
      osc.frequency.setValueAtTime(freqStart, now);
      osc.frequency.exponentialRampToValueAtTime(freqEnd, now + 0.08);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (_) {}
  }

  // === 8. INISIALISASI DARI URL / LOCALSTORAGE ===
  function initFromUrlOrStorage() {
    const params = new URLSearchParams(window.location.search);
    const paramLevel = normalizeLevel(params.get('level'));
    const savedLevel = normalizeLevel(localStorage.getItem('nakama_level'));
    currentLevel = paramLevel || savedLevel || 'N5';
    localStorage.setItem('nakama_level', currentLevel);

    const paramBook = normalizeBookKey(currentLevel, params.get('buku'));
    if (paramBook) {
      openChapterCarousel(currentLevel, paramBook, false);
    } else {
      showBookSelectionStage(false);
    }
  }

  initFromUrlOrStorage();
});