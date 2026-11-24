document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);

  // =========================================================================
  // 0. KONFIGURASI AKTIVASI FITUR & DURASI LOADING (MS)
  // =========================================================================
  const LOADER_ENTRY_DURATION = 1200; // Durasi loading saat masuk halaman (1,2 detik)
  const LOADER_NAV_DURATION   = 450;  // Durasi loading saat klik pindah halaman (0,45 detik)

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

  const featureCards = Array.from(document.querySelectorAll('#mainBentoGrid [data-feature]'));

  featureCards.forEach(card => {
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
  // 1. FILTER HEADBAR (SEMUA / AKTIF) & NAVBAR SHRINK ON SCROLL
  // =========================================================================
  const topbarCenter = $('topbarCenter');
  const filterPills = $('filterPills');
  const countAllEl = $('countAll');
  const countActiveEl = $('countActive');
  let currentFilter = 'all';

  const activeCount = featureCards.filter(c => isFeatureActive(c.getAttribute('data-feature'))).length;
  if (countAllEl) countAllEl.textContent = featureCards.length;
  if (countActiveEl) countActiveEl.textContent = activeCount;

  function applyMainFilter(filterType) {
    currentFilter = filterType;
    featureCards.forEach(card => {
      const isAct = isFeatureActive(card.getAttribute('data-feature'));
      const hide = filterType === 'active' && !isAct;
      card.classList.toggle('hidden-el', hide);
    });
  }

  if (filterPills) {
    filterPills.querySelectorAll('.filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const nextFilter = btn.dataset.filter;
        if (!nextFilter || nextFilter === currentFilter) return;

        filterPills.querySelectorAll('.filter-pill').forEach(p => {
          const isAct = p === btn;
          p.classList.toggle('active', isAct);
          p.setAttribute('aria-selected', String(isAct));
        });

        playPopSound();
        applyMainFilter(nextFilter);
      });
    });
  }

  const fixedTopbar = $('fixedTopbar');
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

  // =========================================================================
  // 2. LOADING RINGAN & ANTI STUCK (BFCACHE / BACK BUTTON)
  // =========================================================================
  const entryLoader = $('entryLoader');
  const loaderText = $('loaderText');
  let isNavigating = false;
  let navTimeout = null;

  function showLoader(label = 'Memuat') {
    if (!entryLoader) return;
    if (loaderText) loaderText.textContent = label;
    entryLoader.style.display = 'grid';
    entryLoader.classList.remove('is-done');
  }

  function hideLoader(immediate = false) {
    if (!entryLoader) return;
    entryLoader.classList.add('is-done');
    if (immediate) {
      entryLoader.style.display = 'none';
    } else {
      setTimeout(() => {
        if (entryLoader.classList.contains('is-done')) {
          entryLoader.style.display = 'none';
        }
      }, 240);
    }
  }

  function restorePageFromCache() {
    clearTimeout(navTimeout);
    isNavigating = false;
    hideLoader(true);
    document.querySelectorAll('.neo-card').forEach(card => {
      card.style.transform = '';
    });
  }

  if (entryLoader) {
    if (sessionStorage.getItem('nakama_loader_seen') === '1') {
      hideLoader(true);
    } else {
      sessionStorage.setItem('nakama_loader_seen', '1');
      setTimeout(() => hideLoader(false), LOADER_ENTRY_DURATION);
    }
  }

  window.addEventListener('pageshow', (e) => {
    if (e.persisted) restorePageFromCache();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      restorePageFromCache();
    }
  });

  // =========================================================================
  // 3. TEMA SIANG / MALAM & TOGGLE SUARA KLIK
  // =========================================================================
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

  const soundToggleBtn = $('soundToggleBtn');
  let soundEnabled = localStorage.getItem('nakama_sound') !== 'off';

  function syncSoundButton() {
    if (!soundToggleBtn) return;
    soundToggleBtn.classList.toggle('is-muted', !soundEnabled);
    soundToggleBtn.setAttribute('aria-pressed', String(soundEnabled));
    soundToggleBtn.title = soundEnabled ? 'Matikan Suara Klik' : 'Aktifkan Suara Klik';
  }
  syncSoundButton();

  soundToggleBtn?.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem('nakama_sound', soundEnabled ? 'on' : 'off');
    syncSoundButton();
    if (soundEnabled) playPopSound(620, 340);
  });

  // =========================================================================
  // 4. AUDIO POP & NAVIGASI LANGSUNG DENGAN LOADING IMUT
  // =========================================================================
  let audioCtx = null;
  function playPopSound(freqStart = 580, freqEnd = 290) {
    if (!soundEnabled) return;
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

  function navigateWithLoader(targetUrl, sourceEl = null) {
    if (!targetUrl || targetUrl === '#' || isNavigating) return;
    isNavigating = true;
    clearTimeout(navTimeout);

    const titleText =
      sourceEl?.querySelector('.card-title')?.textContent?.trim() ||
      sourceEl?.querySelector('.chapter-title')?.textContent?.trim() ||
      sourceEl?.querySelector('span')?.textContent?.trim() ||
      'Memuat';

    showLoader(`Membuka ${titleText}`);

    navTimeout = setTimeout(() => {
      window.location.href = encodeURI(targetUrl);
    }, LOADER_NAV_DURATION);
  }

  // =========================================================================
  // 5. DATA HIRARKI KOTOBA (CADANGAN) & DATA MODUL JFT
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
  // 6. VIEW SWITCHING (INSTAN), HISTORY API & ANTI BACK-LOOP
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
  let internalNavDepth = 0;

  function updateTopbarState(targetView) {
    if (targetView === viewMain) {
      globalBackBtn?.classList.add('hidden-el');
      navCrumbTag?.classList.add('hidden-el');
      openModalBtn?.classList.add('hidden-el');
      topbarCenter?.classList.remove('hidden-el');
      document.body.classList.remove('cinema-mode');
    } else if (targetView === viewKanji) {
      globalBackBtn?.classList.remove('hidden-el');
      navCrumbTag?.classList.remove('hidden-el');
      navCrumbTag.textContent = 'Kanji';
      openModalBtn?.classList.add('hidden-el');
      topbarCenter?.classList.add('hidden-el');
      document.body.classList.remove('cinema-mode');
    } else if (targetView === viewJft) {
      globalBackBtn?.classList.remove('hidden-el');
      navCrumbTag?.classList.remove('hidden-el');
      navCrumbTag.textContent = 'JFT-Basic';
      openModalBtn?.classList.add('hidden-el');
      topbarCenter?.classList.add('hidden-el');
      document.body.classList.remove('cinema-mode');
    } else if (targetView === viewKotobaBooks) {
      globalBackBtn?.classList.remove('hidden-el');
      navCrumbTag?.classList.remove('hidden-el');
      navCrumbTag.textContent = `Kotoba • ${selectedLevel}`;
      openModalBtn?.classList.add('hidden-el');
      topbarCenter?.classList.add('hidden-el');
      document.body.classList.remove('cinema-mode');
    } else if (targetView === viewChapters) {
      globalBackBtn?.classList.remove('hidden-el');
      navCrumbTag?.classList.remove('hidden-el');
      navCrumbTag.textContent = `${selectedLevel} • ${selectedBook ? selectedBook.title : ''}`;
      openModalBtn?.classList.remove('hidden-el');
      topbarCenter?.classList.add('hidden-el');
      document.body.classList.add('cinema-mode');
    }
  }

  function swapView(fromEl, toEl, pushHistory = true, withSound = true) {
    if (!toEl || fromEl === toEl) return;
    if (withSound) playPopSound(580, 310);

    if (pushHistory) {
      const viewId = toEl.id || 'viewMain';
      const hash = viewId === 'viewMain' ? location.pathname + location.search : `#${viewId}`;
      history.pushState({ viewId }, '', hash);
      internalNavDepth++;
    }

    Object.values(viewMap).forEach(v => {
      if (v && v !== toEl) v.classList.remove('active');
    });

    document.querySelectorAll('.neo-card').forEach(c => {
      c.style.transform = '';
    });

    toEl.classList.add('active');
    currentView = toEl;
    updateTopbarState(toEl);
    window.scrollTo({ top: 0 });
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
      swapView(viewChapters, viewKotobaBooks, false, true);
    } else {
      swapView(currentView, viewMain, false, true);
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
        swapView(currentView, viewMain, false, true);
        history.replaceState({ viewId: 'viewMain' }, '', location.pathname + location.search);
      }
    }
  });

  function triggerLockedFeedback(cardEl) {
    playPopSound(260, 180);
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
    swapView(viewMain, viewKanji, true, true);
  });

  $('btnJft')?.addEventListener('click', function (e) {
    if (!isFeatureActive('jft')) {
      e.preventDefault();
      triggerLockedFeedback(this);
      return;
    }
    if (isModifiedClick(e)) return;
    e.preventDefault();
    swapView(viewMain, viewJft, true, true);
  });

  // Interaksi 4 Modul di dalam Halaman JFT
  const jftModuleCards = document.querySelectorAll('.jft-module-card');
  const jftWorkspaceTag = $('jftWorkspaceTag');
  const jftWorkspaceTitle = $('jftWorkspaceTitle');
  const jftWorkspaceDesc = $('jftWorkspaceDesc');
  const jftSectionPills = $('jftSectionPills');
  const jftWorkspacePanel = $('jftWorkspacePanel');
  const jftWorkspaceLink = $('jftWorkspaceLink');
  let activeJftCard = null;

  jftModuleCards.forEach(card => {
    card.addEventListener('click', function (e) {
      if (isModifiedClick(e)) return;
      e.preventDefault();
      playPopSound(600, 330);

      const modKey = this.getAttribute('data-jft-module');
      const data = JFT_MODULES_DATA[modKey];
      if (!data) return;

      const targetHref = this.getAttribute('href') || data.href;
      activeJftCard = this;

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
    playPopSound(640, 360);
    navigateWithLoader(this.getAttribute('href'), activeJftCard || this);
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
      playPopSound(640, 360);
      if (href && href !== '#') navigateWithLoader(href, this);
    });
  });

  // =========================================================================
  // 7. SLIDER CAROUSEL KARTU BAB & MODAL GRID (1 - 25)
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
          navigateWithLoader(this.getAttribute('href'), this);
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
  // 8. SUBTLE 3D TILT (DESKTOP ONLY, CACHED RECT + RAF, ZERO LAYOUT THRASH)
  // =========================================================================
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;

  if (!reduce && fine) {
    document.querySelectorAll('.neo-card[data-tilt]').forEach(card => {
      let rect = null;
      let rafId = null;

      card.addEventListener('pointerenter', () => {
        if (card.classList.contains('is-locked')) return;
        rect = card.getBoundingClientRect();
      });

      card.addEventListener('pointermove', e => {
        if (!rect || card.classList.contains('is-locked')) return;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          card.style.setProperty('--mx', `${x}px`);
          card.style.setProperty('--my', `${y}px`);
          const rotX = -((y / rect.height - 0.5) * 4.5);
          const rotY = (x / rect.width - 0.5) * 4.5;
          card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-2px)`;
        });
      });

      card.addEventListener('pointerleave', () => {
        rect = null;
        if (rafId) cancelAnimationFrame(rafId);
        if (card.classList.contains('is-locked')) return;
        card.style.transform = '';
      });
    });
  }
});