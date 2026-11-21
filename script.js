document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);

  // =========================================================================
  // 0. KONFIGURASI AKTIVASI FITUR (8 BLOK UTAMA)
  // =========================================================================
  const FEATURE_CONFIG = {
    angka:   'ACTIVE',
    kanji:   'LOCKED',
    kotoba:  'ACTIVE',
    pemula:  'ACTIVE',
    bunpou:  'LOCKED',
    ssw:     'ACTIVE',
    choukai: 'LOCKED',
    jft:     'LOCKED'
  };

  const isFeatureActive = key => FEATURE_CONFIG[key] === 'ACTIVE';

  const isModifiedClick = e => e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;

  document.querySelectorAll('[data-feature]').forEach(card => {
    const key = card.getAttribute('data-feature');
    if (!isFeatureActive(key)) {
      card.classList.add('is-locked');
      card.setAttribute('aria-disabled', 'true');
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
  // 1. ANTI BLANK SCREEN (BFCACHE, BACK BUTTON HP & GUARD NAVIGASI)
  // =========================================================================
  let navTimeout = null;
  let isNavigating = false;

  function restorePageFromCache() {
    clearTimeout(navTimeout);
    isNavigating = false;
    document.body.classList.remove('page-leaving');

    const splash = $('splash');
    if (splash && sessionStorage.getItem('nakama_splash_seen') === '1') {
      splash.classList.add('hidden');
      splash.style.display = 'none';
    }

    document.querySelectorAll('.spin-anim').forEach(el => el.classList.remove('spin-anim'));
    document.querySelectorAll('.neo-card').forEach(card => {
      card.style.transform = '';
    });
  }

  window.addEventListener('pageshow', restorePageFromCache);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      restorePageFromCache();
    }
  });

  // =========================================================================
  // 2. SPLASH SCREEN & TEMA SIANG/MALAM
  // =========================================================================
  const splash = $('splash');
  if (splash) {
    if (sessionStorage.getItem('nakama_splash_seen') === '1') {
      splash.classList.add('hidden');
      splash.style.display = 'none';
    } else {
      sessionStorage.setItem('nakama_splash_seen', '1');
      setTimeout(() => {
        splash.classList.add('hidden');
        setTimeout(() => { splash.style.display = 'none'; }, 550);
      }, 900);
    }
  }

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
  // 3. AUDIO POP & NAVIGASI HALAMAN AMAN
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
    } catch (_) {}
  }

  function smoothNavigate(targetUrl) {
    if (!targetUrl || targetUrl === '#' || isNavigating) return;
    isNavigating = true;
    clearTimeout(navTimeout);
    document.body.classList.add('page-leaving');

    navTimeout = setTimeout(() => {
      window.location.href = encodeURI(targetUrl);
      setTimeout(() => {
        isNavigating = false;
        document.body.classList.remove('page-leaving');
      }, 500);
    }, 240);
  }

  // =========================================================================
  // 4. DATA HIRARKI KOTOBA (CADANGAN) & DATA MODUL JFT
  // =========================================================================
  const KOTOBA_BOOKS = {
    N5: [
      { id: 'Soumatome', title: 'Soumatome', indexTag: '01', cardClass: 'card-kotoba', href: 'Kotoba/N5/Soumatome/index.html', babBaseHref: 'Kotoba/N5/Soumatome/Bab/index.html', startBab: 1, totalBab: 25 },
      { id: 'Minna',     title: 'Minna no Nihongo', indexTag: '02', cardClass: 'card-angka',  href: 'Kotoba/Minna 1/index.html',      babBaseHref: 'Kotoba/Minna 1/Bab/index.html',      startBab: 1, totalBab: 25 }
    ],
    N4: [
      { id: 'Soumatome', title: 'Soumatome', indexTag: '01', cardClass: 'card-kotoba', href: 'Kotoba/N4/Soumatome/index.html', babBaseHref: 'Kotoba/N4/Soumatome/Bab/index.html', startBab: 1, totalBab: 25 },
      { id: 'Minna',     title: 'Minna no Nihongo', indexTag: '02', cardClass: 'card-kanji',  href: 'Kotoba/Minna 2/index.html',      babBaseHref: 'Kotoba/Minna 2/Bab/index.html',      startBab: 26, totalBab: 25 }
    ]
  };

  const JFT_MODULES_DATA = {
    materi: {
      tag: 'MODUL 01 • MATERI PEMBELAJARAN',
      title: 'Materi Pembelajaran JFT-Basic A2',
      href: 'Jft/Materi/index.html',
      ctaText: 'Buka Materi Pembelajaran',
      desc: 'Fokus pada penguasaan ekspresi komunikasi sehari-hari di Jepang mengacu pada kurikulum standar Japan Foundation (Irodori Tingkat Dasar A2).',
      pills: [
        '<b>Topik 1:</b> Perkenalan Diri, Tempat Tinggal & Lingkungan Sekitar',
        '<b>Topik 2:</b> Berbelanja, Memesan Makanan & Transportasi Umum',
        '<b>Topik 3:</b> Komunikasi di Tempat Kerja, Instruksi & Jadwal Shift',
        '<b>Topik 4:</b> Keadaan Darurat, Kesehatan & Aturan Kehidupan di Jepang'
      ]
    },
    latihan: {
      tag: 'MODUL 02 • LATIHAN SOAL',
      title: 'Latihan Soal Per Seksi JFT-Basic',
      href: 'Jft/Latihan/index.html',
      ctaText: 'Mulai Latihan Soal',
      desc: 'Wadah latihan soal terfokus per seksi kompetensi JFT-Basic. Memudahkan latihan bertahap sebelum masuk ke simulasi penuh.',
      pills: [
        '<b>Seksi 1 (Moji & Goi):</b> ~15 Soal bacaan Kanji kontekstual & makna kosakata harian',
        '<b>Seksi 2 (Kaiwa & Hyougen):</b> ~15 Soal melengkapi dialog & ekspresi sopan santun',
        '<b>Seksi 3 (Choukai):</b> ~10 Soal mendengarkan pengumuman, percakapan kerja & instruksi',
        '<b>Seksi 4 (Dokkai):</b> ~10 Soal membaca pesan singkat, poster, email & jadwal kerja'
      ]
    },
    simulasi: {
      tag: 'MODUL 03 • SIMULASI UJIAN (CBT)',
      title: 'Simulasi Ujian CBT JFT-Basic (60 Menit)',
      href: 'Jft/Simulasi/index.html',
      ctaText: 'Mulai Simulasi CBT',
      desc: 'Kerangka simulasi Computer-Based Testing (CBT) dengan format penilaian terkalibrasi (0–250 poin). Batas nilai lulus (Passing Grade) adalah 200 poin.',
      pills: [
        '<b>Durasi Ujian:</b> 60 Menit nonstop tanpa jeda antar seksi',
        '<b>Total Soal:</b> ~50 Soal pilihan ganda berbasis layar komputer / HP',
        '<b>Skor Kelulusan:</b> Minimal 200 dari maksimal 250 Poin (Standar Level A2)',
        '<b>Fitur CBT:</b> Penanda soal ragu-ragu, pemutar audio Choukai & rekap skor instan'
      ]
    },
    pembahasan: {
      tag: 'MODUL 04 • PEMBAHASAN SOAL',
      title: 'Pembahasan Soal, Transkrip & Strategi Lulus',
      href: 'Jft/Pembahasan/index.html',
      ctaText: 'Buka Pembahasan Soal',
      desc: 'Halaman pembahasan mendalam untuk mengulas kunci jawaban, bedah kosakata pengecoh, serta transkrip lengkap untuk bagian pendengaran (Choukai).',
      pills: [
        '<b>Bedah Moji & Goi:</b> Daftar Kanji yang sering muncul di kehidupan kerja Jepang',
        '<b>Analisis Kaiwa:</b> Penggunaan bentuk sopan (Desu/Masu) vs bentuk kasual',
        '<b>Transkrip Choukai:</b> Teks percakapan lengkap beserta kata kunci jawaban',
        '<b>Teknik Skimming Dokkai:</b> Cara cepat menemukan informasi inti pada memo & tabel'
      ]
    }
  };

  // =========================================================================
  // 5. VIEW SWITCHING, HISTORY API & ANTI BACK-LOOP
  // =========================================================================
  const viewMain = $('viewMain');
  const viewKanji = $('viewKanji');
  const viewJft = $('viewJft');
  const viewKotobaBooks = $('viewKotobaBooks');
  const viewChapters = $('viewChapters');

  const globalBackBtn = $('globalBackBtn');
  const navCrumbTag = $('navCrumbTag');
  const openModalBtn = $('openChapterModal');

  const viewMap = {
    viewMain,
    viewKanji,
    viewJft,
    viewKotobaBooks,
    viewChapters
  };

  let currentView = viewMain;
  let selectedLevel = 'N5';
  let selectedBook = null;
  let swapTimer = null;
  let internalNavDepth = 0;

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
    } else if (targetView === viewJft) {
      globalBackBtn?.classList.remove('hidden-el');
      navCrumbTag?.classList.remove('hidden-el');
      navCrumbTag.textContent = 'JFT-Basic';
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

  function swapView(fromEl, toEl, pushHistory = true, withSound = true) {
    if (!toEl || fromEl === toEl) return;
    clearTimeout(swapTimer);
    if (withSound) playPopSound();

    if (pushHistory) {
      const viewId = toEl.id || 'viewMain';
      const hash = viewId === 'viewMain' ? location.pathname + location.search : `#${viewId}`;
      history.pushState({ viewId }, '', hash);
      internalNavDepth++;
    }

    if (fromEl) fromEl.classList.add('fade-out');

    swapTimer = setTimeout(() => {
      Object.values(viewMap).forEach(v => {
        if (v && v !== toEl) v.classList.remove('active', 'fade-out');
      });
      toEl.classList.remove('fade-out');
      toEl.classList.add('active');
      currentView = toEl;
      updateTopbarState(toEl);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 180);
  }

  function handleHistoryPopState(e) {
    if (internalNavDepth > 0) internalNavDepth--;
    const hashId = location.hash ? location.hash.replace('#', '') : '';
    const targetId = (e.state && e.state.viewId) ? e.state.viewId : (viewMap[hashId] ? hashId : 'viewMain');
    const targetEl = viewMap[targetId] || viewMain;
    if (currentView !== targetEl) {
      swapView(currentView, targetEl, false, false);
    }
  }

  window.addEventListener('popstate', (e) => {
    restorePageFromCache();
    handleHistoryPopState(e);
  });

  const initialHash = location.hash ? location.hash.replace('#', '') : '';
  if (initialHash && viewMap[initialHash] && initialHash !== 'viewMain') {
    const allowInitial =
      (initialHash === 'viewJft' && isFeatureActive('jft')) ||
      (initialHash === 'viewKanji' && isFeatureActive('kanji'));

    if (allowInitial) {
      Object.values(viewMap).forEach(v => v?.classList.remove('active'));
      viewMap[initialHash].classList.add('active');
      currentView = viewMap[initialHash];
      updateTopbarState(currentView);
      history.replaceState({ viewId: initialHash }, '', `#${initialHash}`);
    } else {
      history.replaceState({ viewId: 'viewMain' }, '', location.pathname + location.search);
    }
  } else {
    history.replaceState({ viewId: 'viewMain' }, '', location.pathname + location.search);
  }

  globalBackBtn?.addEventListener('click', () => {
    if (internalNavDepth > 0) {
      history.back();
      return;
    }
    if (currentView === viewChapters) {
      swapView(viewChapters, viewKotobaBooks, false);
    } else {
      swapView(currentView, viewMain, false);
      history.replaceState({ viewId: 'viewMain' }, '', location.pathname + location.search);
    }
  });

  $('brandHomeLink')?.addEventListener('click', (e) => {
    if (isModifiedClick(e)) return;
    if (currentView !== viewMain) {
      e.preventDefault();
      if (internalNavDepth > 0) {
        history.go(-internalNavDepth);
        internalNavDepth = 0;
      } else {
        swapView(currentView, viewMain, false);
        history.replaceState({ viewId: 'viewMain' }, '', location.pathname + location.search);
      }
    }
  });

  function triggerLockedFeedback(cardEl) {
    playPopSound();
    cardEl.classList.remove('shake-locked');
    void cardEl.offsetWidth;
    cardEl.classList.add('shake-locked');
  }

  $('btnKanji')?.addEventListener('click', function (e) {
    if (!isFeatureActive('kanji')) {
      e.preventDefault();
      triggerLockedFeedback(this);
      return;
    }
    if (isModifiedClick(e)) return;
    e.preventDefault();
    const icon = this.querySelector('.icon-box') || this;
    icon.classList.add('spin-anim');
    setTimeout(() => {
      icon.classList.remove('spin-anim');
      swapView(viewMain, viewKanji, true);
    }, 340);
  });

  $('btnJft')?.addEventListener('click', function (e) {
    if (!isFeatureActive('jft')) {
      e.preventDefault();
      triggerLockedFeedback(this);
      return;
    }
    if (isModifiedClick(e)) return;
    e.preventDefault();
    const icon = this.querySelector('.icon-box') || this;
    icon.classList.add('spin-anim');
    setTimeout(() => {
      icon.classList.remove('spin-anim');
      swapView(viewMain, viewJft, true);
    }, 340);
  });

  const jftModuleCards = document.querySelectorAll('.jft-module-card');
  const jftWorkspaceTag = $('jftWorkspaceTag');
  const jftWorkspaceTitle = $('jftWorkspaceTitle');
  const jftWorkspaceDesc = $('jftWorkspaceDesc');
  const jftSectionPills = $('jftSectionPills');
  const jftWorkspacePanel = $('jftWorkspacePanel');
  const jftWorkspaceLink = $('jftWorkspaceLink');

  jftModuleCards.forEach(card => {
    card.addEventListener('click', function (e) {
      if (isModifiedClick(e)) return;
      e.preventDefault();
      playPopSound();

      const modKey = this.getAttribute('data-jft-module');
      const data = JFT_MODULES_DATA[modKey];
      if (!data) return;

      const targetHref = this.getAttribute('href') || data.href;

      jftModuleCards.forEach(c => c.classList.remove('active-module'));
      this.classList.add('active-module');

      if (jftWorkspaceTag) jftWorkspaceTag.textContent = data.tag;
      if (jftWorkspaceTitle) jftWorkspaceTitle.textContent = data.title;
      if (jftWorkspaceDesc) jftWorkspaceDesc.textContent = data.desc;
      if (jftWorkspaceLink) {
        jftWorkspaceLink.setAttribute('href', targetHref);
        const spanText = jftWorkspaceLink.querySelector('span');
        if (spanText) spanText.textContent = data.ctaText || 'Buka Halaman Modul';
        jftWorkspaceLink.classList.remove('hidden-el');
      }
      if (jftSectionPills) {
        jftSectionPills.innerHTML = data.pills
          .map(item => `<div class="jft-pill-item">${item}</div>`)
          .join('');
      }

      jftWorkspacePanel?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });

  jftWorkspaceLink?.addEventListener('click', function (e) {
    if (isModifiedClick(e)) return;
    e.preventDefault();
    playPopSound();
    smoothNavigate(this.getAttribute('href'));
  });

  document.querySelectorAll('.tile-link').forEach(card => {
    card.addEventListener('click', function (e) {
      const feat = this.getAttribute('data-feature');

      if (feat && !isFeatureActive(feat)) {
        e.preventDefault();
        triggerLockedFeedback(this);
        return;
      }

      if (isModifiedClick(e)) return;
      e.preventDefault();

      const href = this.getAttribute('href');
      const icon = this.querySelector('.icon-box') || this;
      playPopSound();
      icon.classList.add('spin-anim');
      setTimeout(() => {
        icon.classList.remove('spin-anim');
        if (href && href !== '#') smoothNavigate(href);
      }, 320);
    });
  });

  // =========================================================================
  // 6. SLIDER CAROUSEL KARTU BAB & MODAL GRID (1 - 25)
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

      const card = document.createElement('a');
      card.href = `${bookConfig.babBaseHref}?bab=${babNumber}`;
      card.className = 'chapter-flashcard';
      card.dataset.index = i;

      card.innerHTML = `
        <div class="flashcard-top">
          <span class="badge-status">#${paddedNum}</span>
        </div>
        <div class="flashcard-body">
          <div class="chapter-icon-box">${svgIcon}</div>
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
          if (isModifiedClick(e)) return;
          e.preventDefault();
          smoothNavigate(this.getAttribute('href'));
        }
      });

      carouselContainer.appendChild(card);
      cards.push(card);

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

      if (i === currentIndex) card.classList.add('active');
      else if (i === currentIndex - 1) card.classList.add('prev');
      else if (i === currentIndex + 1) card.classList.add('next');
      else if (i < currentIndex - 1) card.classList.add('hidden-left');
      else if (i > currentIndex + 1) card.classList.add('hidden-right');
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
  // 7. PARALLAX, SPARKS, 3D TILT & TRAIL ON-DEMAND
  // =========================================================================
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;

  if (!reduce && fine) {
    document.querySelectorAll('.neo-card').forEach(card => {
      card.addEventListener('pointermove', e => {
        if (card.classList.contains('is-locked')) return;
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        card.style.setProperty('--mx', `${x}px`);
        card.style.setProperty('--my', `${y}px`);

        const rotX = -((y / r.height - 0.5) * 9);
        const rotY = (x / r.width - 0.5) * 9;
        card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-3px)`;
      });

      card.addEventListener('pointerleave', () => {
        if (card.classList.contains('is-locked')) return;
        card.style.transition = 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.2s ease';
        card.style.transform = '';
        setTimeout(() => { card.style.transition = ''; }, 350);
      });
    });

    const sun = $('sun');
    if (sun) {
      addEventListener('pointermove', e => {
        sun.style.transform = `translate(${(e.clientX / innerWidth - 0.5) * -40}px, ${(e.clientY / innerHeight - 0.5) * -40}px)`;
      }, { passive: true });
    }

    const cv = $('trail');
    if (cv) {
      const ctx = cv.getContext('2d');
      const resize = () => {
        cv.width = innerWidth;
        cv.height = innerHeight;
      };
      resize();
      addEventListener('resize', resize);

      let mx = -100, my = -100, x = mx, y = my;
      let isPointerActive = false;
      let isLoopRunning = false;
      let idleTimer = null;
      const pts = [];

      function drawTrail() {
        if (isPointerActive) {
          x += (mx - x) * 0.34;
          y += (my - y) * 0.34;
          pts.push({ x, y });
          if (pts.length > 18) pts.shift();
        } else if (pts.length > 0) {
          pts.shift();
        }

        ctx.clearRect(0, 0, cv.width, cv.height);

        if (pts.length > 1) {
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          const isDark = htmlEl.getAttribute('data-theme') === 'dark';

          for (let i = 1; i < pts.length; i++) {
            const t = i / pts.length;
            ctx.strokeStyle = isDark
              ? `rgba(74, 222, 128, ${t * 0.3})`
              : `rgba(21, 128, 61, ${t * 0.24})`;
            ctx.lineWidth = t * 10;
            ctx.beginPath();
            ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
            ctx.lineTo(pts[i].x, pts[i].y);
            ctx.stroke();
          }

          const head = pts[pts.length - 1];
          ctx.beginPath();
          ctx.arc(head.x, head.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = isDark ? 'rgba(74, 222, 128, 0.55)' : 'rgba(21, 128, 61, 0.45)';
          ctx.fill();
        }

        if (isPointerActive || pts.length > 0) {
          requestAnimationFrame(drawTrail);
        } else {
          isLoopRunning = false;
        }
      }

      addEventListener('pointermove', e => {
        if (!isPointerActive) {
          x = e.clientX;
          y = e.clientY;
        }
        mx = e.clientX;
        my = e.clientY;
        isPointerActive = true;
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => { isPointerActive = false; }, 160);

        if (!isLoopRunning) {
          isLoopRunning = true;
          requestAnimationFrame(drawTrail);
        }
      }, { passive: true });
    }
  }

  if (!reduce) {
    const fx = $('fx');
    const sparkColors = ['#DCFCE7', '#E0F2FE', '#FEF3C7', '#E9D5FF', '#FFE4E6', '#CCFBF1', '#FFEDD5', '#ECFCCB'];
    addEventListener('click', e => {
      if (!fx || (e.clientX === 0 && e.clientY === 0)) return;
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
  }
});