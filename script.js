document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);

  // =========================================================================
  // 0. KONFIGURASI AKTIVASI FITUR
  // =========================================================================
  const FEATURE_CONFIG = {
    pemula: 'ACTIVE',
    kotoba: 'ACTIVE',
    angka:  'ACTIVE',
    kanji:  'LOCKED',
    bunpou: 'LOCKED'
  };

  const isFeatureActive = key => FEATURE_CONFIG[key] === 'ACTIVE';

  // Terapkan status terkunci pada kartu menu utama
  document.querySelectorAll('[data-feature]').forEach(card => {
    const key = card.getAttribute('data-feature');
    if (!isFeatureActive(key)) {
      card.classList.add('is-locked');
      card.removeAttribute('data-tilt');
      const arrow = card.querySelector('.card-arrow');
      if (arrow) {
        arrow.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        `;
      }
    }
  });

  // =========================================================================
  // 1. SPLASH SCREEN & DARK MODE
  // =========================================================================
  setTimeout(() => {
    const splash = $('splash');
    if (splash) {
      splash.classList.add('hidden');
      setTimeout(() => { splash.style.display = 'none'; }, 650);
    }
  }, 1400);

  const htmlEl = document.documentElement;
  const themeToggleBtn = $('themeToggleBtn');
  const savedTheme = localStorage.getItem('nakama_theme');

  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    htmlEl.setAttribute('data-theme', 'dark');
  } else {
    htmlEl.setAttribute('data-theme', 'light');
  }

  themeToggleBtn?.addEventListener('click', () => {
    const nextTheme = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    htmlEl.setAttribute('data-theme', nextTheme);
    localStorage.setItem('nakama_theme', nextTheme);
    playPopSound();
  });

  // =========================================================================
  // 2. EFEK AUDIO POP & TRANSISI HALAMAN
  // =========================================================================
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
    } catch (e) {}
  }

  function smoothNavigate(targetUrl) {
    document.body.classList.add('page-leaving');
    setTimeout(() => {
      window.location.href = targetUrl;
    }, 340);
  }

  // =========================================================================
  // 3. DATA HIRARKI KOTOBA N5 - N1 & HREF ASLI
  // =========================================================================
  // Href asli `Kotoba/Minna 1/index.html` dan `Kotoba/Minna 2/index.html` tetap terjaga
  // pada atribut kartu buku, dan saat diklik membuka Carousel Bab 1-25 di halaman utama.
  const KOTOBA_BOOKS = {
    N5: [
      { id: 'Soumatome', title: 'Soumatome', indexTag: '01', cardClass: 'card-kotoba', href: 'Kotoba/N5/Soumatome/index.html', babBaseHref: 'Kotoba/N5/Soumatome/Bab/index.html', startBab: 1, totalBab: 25 },
      { id: 'Minna',     title: 'Minna no Nihongo', indexTag: '02', cardClass: 'card-angka',  href: 'Kotoba/Minna 1/index.html',      babBaseHref: 'Kotoba/Minna 1/Bab/index.html',      startBab: 1, totalBab: 25 }
    ],
    N4: [
      { id: 'Soumatome', title: 'Soumatome', indexTag: '01', cardClass: 'card-kotoba', href: 'Kotoba/N4/Soumatome/index.html', babBaseHref: 'Kotoba/N4/Soumatome/Bab/index.html', startBab: 1, totalBab: 25 },
      { id: 'Minna',     title: 'Minna no Nihongo', indexTag: '02', cardClass: 'card-kanji',  href: 'Kotoba/Minna 2/index.html',      babBaseHref: 'Kotoba/Minna 2/Bab/index.html',      startBab: 26, totalBab: 25 }
    ],
    N3: [
      { id: 'Soumatome', title: 'Soumatome', indexTag: '01', cardClass: 'card-kotoba', href: 'Kotoba/N3/Soumatome/index.html', babBaseHref: 'Kotoba/N3/Soumatome/Bab/index.html', startBab: 1, totalBab: 25 },
      { id: 'Mori',      title: 'Mori',      indexTag: '02', cardClass: 'card-angka',  href: 'Kotoba/N3/Mori/index.html',      babBaseHref: 'Kotoba/N3/Mori/Bab/index.html',      startBab: 1, totalBab: 25 }
    ],
    N2: [
      { id: 'Soumatome', title: 'Soumatome', indexTag: '01', cardClass: 'card-kotoba', href: 'Kotoba/N2/Soumatome/index.html', babBaseHref: 'Kotoba/N2/Soumatome/Bab/index.html', startBab: 1, totalBab: 25 },
      { id: 'Mori',      title: 'Mori',      indexTag: '02', cardClass: 'card-pemula', href: 'Kotoba/N2/Mori/index.html',      babBaseHref: 'Kotoba/N2/Mori/Bab/index.html',      startBab: 1, totalBab: 25 }
    ],
    N1: [
      { id: 'Soumatome', title: 'Soumatome', indexTag: '01', cardClass: 'card-kotoba', href: 'Kotoba/N1/Soumatome/index.html', babBaseHref: 'Kotoba/N1/Soumatome/Bab/index.html', startBab: 1, totalBab: 25 },
      { id: 'Mori',      title: 'Mori',      indexTag: '02', cardClass: 'card-angka',  href: 'Kotoba/N1/Mori/index.html',      babBaseHref: 'Kotoba/N1/Mori/Bab/index.html',      startBab: 1, totalBab: 25 }
    ]
  };

  // =========================================================================
  // 4. VIEW SWITCHING & TOPBAR CONTROLLER
  // =========================================================================
  const viewMain = $('viewMain');
  const viewKanji = $('viewKanji');
  const viewKotoba = $('viewKotoba');
  const viewKotobaBooks = $('viewKotobaBooks');
  const viewChapters = $('viewChapters');

  const globalBackBtn = $('globalBackBtn');
  const navCrumbTag = $('navCrumbTag');
  const openModalBtn = $('openChapterModal');

  let currentView = viewMain;
  let selectedLevel = 'N5';
  let selectedBook = null;

  function updateTopbarState(targetView) {
    if (targetView === viewMain) {
      globalBackBtn?.classList.add('hidden-el');
      navCrumbTag?.classList.add('hidden-el');
      openModalBtn?.classList.add('hidden-el');
      document.body.classList.remove('cinema-mode');
    } else if (targetView === viewKanji) {
      globalBackBtn?.classList.remove('hidden-el');
      navCrumbTag?.classList.remove('hidden-el');
      navCrumbTag.textContent = 'Kanji';
      openModalBtn?.classList.add('hidden-el');
      document.body.classList.remove('cinema-mode');
    } else if (targetView === viewKotoba) {
      globalBackBtn?.classList.remove('hidden-el');
      navCrumbTag?.classList.remove('hidden-el');
      navCrumbTag.textContent = 'Kotoba';
      openModalBtn?.classList.add('hidden-el');
      document.body.classList.remove('cinema-mode');
    } else if (targetView === viewKotobaBooks) {
      globalBackBtn?.classList.remove('hidden-el');
      navCrumbTag?.classList.remove('hidden-el');
      navCrumbTag.textContent = `Kotoba • ${selectedLevel}`;
      openModalBtn?.classList.add('hidden-el');
      document.body.classList.remove('cinema-mode');
    } else if (targetView === viewChapters) {
      globalBackBtn?.classList.remove('hidden-el');
      navCrumbTag?.classList.remove('hidden-el');
      navCrumbTag.textContent = `${selectedLevel} • ${selectedBook ? selectedBook.title : ''}`;
      openModalBtn?.classList.remove('hidden-el');
      document.body.classList.add('cinema-mode');
    }
  }

  function swapView(fromEl, toEl) {
    if (!fromEl || !toEl || fromEl === toEl) return;
    playPopSound();
    fromEl.classList.add('fade-out');
    setTimeout(() => {
      fromEl.classList.remove('active', 'fade-out');
      toEl.classList.add('active');
      currentView = toEl;
      updateTopbarState(toEl);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 240);
  }

  // Tombol Back di Topbar Kapsul
  globalBackBtn?.addEventListener('click', () => {
    if (currentView === viewChapters) {
      swapView(viewChapters, viewKotobaBooks);
    } else if (currentView === viewKotobaBooks) {
      swapView(viewKotobaBooks, viewKotoba);
    } else if (currentView === viewKotoba || currentView === viewKanji) {
      swapView(currentView, viewMain);
    }
  });

  // Klik Logo Brand -> Kembali ke Menu Utama
  $('brandHomeLink')?.addEventListener('click', (e) => {
    if (currentView !== viewMain) {
      e.preventDefault();
      swapView(currentView, viewMain);
    }
  });

  // Klik Kanji (Terkunci jika LOCKED)
  $('btnKanji')?.addEventListener('click', function (e) {
    e.preventDefault();
    if (!isFeatureActive('kanji')) {
      this.classList.remove('shake-locked');
      void this.offsetWidth;
      this.classList.add('shake-locked');
      return;
    }
    const icon = this.querySelector('.icon-box') || this;
    icon.classList.add('spin-anim');
    setTimeout(() => {
      icon.classList.remove('spin-anim');
      swapView(viewMain, viewKanji);
    }, 420);
  });

  // Klik Kotoba -> Buka Pilihan N5 - N1
  $('btnKotoba')?.addEventListener('click', function (e) {
    e.preventDefault();
    if (!isFeatureActive('kotoba')) return;
    const icon = this.querySelector('.icon-box') || this;
    icon.classList.add('spin-anim');
    setTimeout(() => {
      icon.classList.remove('spin-anim');
      swapView(viewMain, viewKotoba);
    }, 420);
  });

  // Klik Link Langsung (Angka, Pemula, Kanji N5/N4)
  document.querySelectorAll('.tile-link').forEach(card => {
    card.addEventListener('click', function (e) {
      e.preventDefault();
      const feat = this.getAttribute('data-feature');
      if (feat && !isFeatureActive(feat)) return;
      const href = this.getAttribute('href');
      const icon = this.querySelector('.icon-box') || this;
      icon.classList.add('spin-anim');
      setTimeout(() => {
        icon.classList.remove('spin-anim');
        if (href && href !== '#') smoothNavigate(href);
      }, 420);
    });
  });

  // Klik Level N5 - N1 -> Render 2 Kartu Buku (Soumatome & Minna / Mori)
  document.querySelectorAll('.kotoba-level-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const level = this.getAttribute('data-level');
      if (!level || !KOTOBA_BOOKS[level]) return;
      selectedLevel = level;

      const icon = this.querySelector('.icon-box') || this;
      icon.classList.add('spin-anim');
      setTimeout(() => {
        icon.classList.remove('spin-anim');
        renderBooksForLevel(level);
        swapView(viewKotoba, viewKotobaBooks);
      }, 420);
    });
  });

  function renderBooksForLevel(level) {
    const booksGrid = $('kotobaBooksGrid');
    if (!booksGrid) return;
    booksGrid.innerHTML = '';

    const books = KOTOBA_BOOKS[level] || [];
    books.forEach((book, idx) => {
      const card = document.createElement('a');
      card.href = book.href; // Menjaga href asli (misal Kotoba/Minna 1/index.html)
      card.className = `neo-card ${book.cardClass}`;
      card.setAttribute('data-tilt', '');

      const svgBook = idx === 0
        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`
        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`;

      card.innerHTML = `
        <span class="card-index">${book.indexTag}</span>
        <div class="icon-box">${svgBook}</div>
        <div class="card-footer">
          <h2 class="card-title">${book.title}</h2>
          <span class="card-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
          </span>
        </div>
      `;

      card.addEventListener('click', function (e) {
        e.preventDefault();
        selectedBook = book;
        const icon = this.querySelector('.icon-box') || this;
        icon.classList.add('spin-anim');
        setTimeout(() => {
          icon.classList.remove('spin-anim');
          buildChapterCarousel(book);
          swapView(viewKotobaBooks, viewChapters);
        }, 420);
      });

      booksGrid.appendChild(card);
    });

    bindTiltEffects(booksGrid.querySelectorAll('[data-tilt]'));
  }

  // =========================================================================
  // 5. SLIDER CAROUSEL KARTU BAB & MODAL GRID (1 - 25)
  // =========================================================================
  const carouselContainer = $('carouselContainer');
  const modalGrid = $('modalChapterGrid');
  const currentChapterDisplay = $('currentChapterDisplay');
  const modalRangeTag = $('modalRangeTag');

  let currentIndex = 0;
  let activeTotalChapters = 25;
  let activeStartChapter = 1;
  let cards = [];
  let gridItems = [];

  const vectorIcons = [
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.2 6.6L22 9.7l-5 4.9 1.2 6.9L12 18.2 5.8 21.5 7 14.6 2 9.7l6.8-1.1L12 2z"/></svg>`
  ];

  function buildChapterCarousel(bookConfig) {
    if (!carouselContainer || !modalGrid) return;
    carouselContainer.innerHTML = '';
    modalGrid.innerHTML = '';
    cards = [];
    gridItems = [];
    currentIndex = 0;

    activeStartChapter = bookConfig.startBab || 1;
    activeTotalChapters = bookConfig.totalBab || 25;
    const endBab = activeStartChapter + activeTotalChapters - 1;

    if (modalRangeTag) {
      modalRangeTag.textContent = `BAB ${activeStartChapter} - ${endBab}`;
    }

    for (let i = 0; i < activeTotalChapters; i++) {
      const babNumber = activeStartChapter + i;
      const paddedNum = babNumber < 10 ? `0${babNumber}` : babNumber;
      const svgIcon = vectorIcons[i % vectorIcons.length];

      // Kartu Slider Bab
      const card = document.createElement('a');
      card.href = `${bookConfig.babBaseHref}?bab=${babNumber}`;
      card.className = 'chapter-flashcard';
      card.dataset.index = i;

      card.innerHTML = `
        <div class="flashcard-top">
          <span class="badge-status">#${paddedNum}</span>
        </div>
        <div class="flashcard-body">
          <div class="chapter-icon-box">
            ${svgIcon}
          </div>
          <h2 class="chapter-title">Bab ${babNumber}</h2>
        </div>
        <div class="flashcard-footer">
          <span class="action-hint">Mulai</span>
          <div class="action-icon-circle">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M7 17L17 7M7 7h10v10"/>
            </svg>
          </div>
        </div>
      `;

      card.addEventListener('click', function (e) {
        if (!this.classList.contains('active')) {
          e.preventDefault();
          currentIndex = parseInt(this.dataset.index, 10);
          updateCarousel();
        } else {
          e.preventDefault();
          smoothNavigate(this.getAttribute('href'));
        }
      });

      card.addEventListener('mousemove', function (e) {
        if (this.classList.contains('active')) {
          const r = this.getBoundingClientRect();
          const x = e.clientX - r.left;
          const y = e.clientY - r.top;
          this.style.transform = `perspective(1000px) rotateX(${-((y / r.height - 0.5) * 7)}deg) rotateY(${(x / r.width - 0.5) * 7}deg) scale(1.02)`;
        }
      });

      card.addEventListener('mouseleave', function () {
        if (this.classList.contains('active')) {
          this.style.transform = '';
        }
      });

      carouselContainer.appendChild(card);
      cards.push(card);

      // Item Grid di Modal Popup
      const gridBtn = document.createElement('button');
      gridBtn.type = 'button';
      gridBtn.className = 'chapter-grid-item';
      gridBtn.dataset.index = i;
      gridBtn.innerHTML = `
        <span class="cgi-num">${paddedNum}</span>
        <span class="cgi-label">BAB</span>
      `;
      gridBtn.addEventListener('click', () => {
        currentIndex = i;
        updateCarousel();
        closeModal();
      });

      modalGrid.appendChild(gridBtn);
      gridItems.push(gridBtn);
    }

    updateCarousel(false);
  }

  function updateCarousel(withSound = true) {
    if (withSound) playPopSound();

    cards.forEach((card, i) => {
      card.classList.remove('active', 'prev', 'next', 'hidden-left', 'hidden-right');
      card.style.transform = '';

      if (i === currentIndex) {
        card.classList.add('active');
      } else if (i === currentIndex - 1) {
        card.classList.add('prev');
      } else if (i === currentIndex + 1) {
        card.classList.add('next');
      } else if (i < currentIndex - 1) {
        card.classList.add('hidden-left');
      } else if (i > currentIndex + 1) {
        card.classList.add('hidden-right');
      }
    });

    const activeBabNum = activeStartChapter + currentIndex;
    const currentBabFormatted = activeBabNum < 10 ? `0${activeBabNum}` : activeBabNum;
    if (currentChapterDisplay) {
      currentChapterDisplay.textContent = `Bab ${currentBabFormatted}`;
    }

    gridItems.forEach((btn, i) => {
      btn.classList.toggle('active', i === currentIndex);
    });
  }

  function goNext() {
    if (currentIndex < activeTotalChapters - 1) {
      currentIndex++;
      updateCarousel();
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    }
  }

  $('nextBtn')?.addEventListener('click', goNext);
  $('prevBtn')?.addEventListener('click', goPrev);

  // Modal Popup Kontrol
  const chapterModal = $('chapterModal');
  function openModal() { chapterModal?.classList.add('open'); }
  function closeModal() { chapterModal?.classList.remove('open'); }

  openModalBtn?.addEventListener('click', openModal);
  $('closeChapterModal')?.addEventListener('click', closeModal);
  chapterModal?.addEventListener('click', (e) => {
    if (e.target === chapterModal) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
    if (currentView !== viewChapters) return;
    if (chapterModal && chapterModal.classList.contains('open')) return;
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'ArrowLeft') goPrev();
  });

  // Swipe Jari di HP untuk Carousel
  let touchStartX = 0;
  if (carouselContainer) {
    carouselContainer.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carouselContainer.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) goNext();
        else goPrev();
      }
    }, { passive: true });
  }

  // =========================================================================
  // 6. PARALLAX, SPARKS, 3D TILT & MOUSE TRAIL
  // =========================================================================
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;

  function bindTiltEffects(nodes) {
    if (reduce || !fine) return;
    nodes.forEach(card => {
      if (card.classList.contains('is-locked')) return;
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        const rotX = -((y / r.height - 0.5) * 9);
        const rotY = (x / r.width - 0.5) * 9;
        card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-3px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.2s ease';
        card.style.transform = '';
        setTimeout(() => { card.style.transition = ''; }, 350);
      });
    });
  }

  bindTiltEffects(document.querySelectorAll('[data-tilt]'));

  if (!reduce) {
    const sun = $('sun');
    if (sun) {
      addEventListener('pointermove', e => {
        sun.style.transform = `translate(${(e.clientX / innerWidth - 0.5) * -36}px, ${(e.clientY / innerHeight - 0.5) * -36}px)`;
      });
    }

    const fx = $('fx');
    const sparkColors = ['#DCFCE7', '#E0F2FE', '#FEF3C7', '#E9D5FF'];
    addEventListener('pointerdown', e => {
      if (!fx) return;
      const pulse = document.createElement('div');
      pulse.className = 'pulse';
      pulse.style.left = e.clientX + 'px';
      pulse.style.top = e.clientY + 'px';
      pulse.onanimationend = () => pulse.remove();
      fx.appendChild(pulse);

      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6 + Math.random() * 0.4;
        const dist = 42 + Math.random() * 52;
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
      const cv = $('trail');
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
              ? `rgba(74, 222, 128, ${t * 0.28})`
              : `rgba(21, 128, 61, ${t * 0.22})`;
            ctx.lineWidth = t * 9;
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
});