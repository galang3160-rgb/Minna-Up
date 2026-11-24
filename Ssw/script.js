/* =========================================================================
   NAKAMAGAKKOU — SSW CATEGORY GRID SELECTOR
   Cute Entry Loader, Native Scroll, Search, Filter Pills & Touch Feedback
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const BASE_DIR = 'kategori';

  // Konfigurasi Aktivasi Bidang SSW (Ubah ke 'ACTIVE' jika materi sudah siap)
  const SSW_FEATURE_CONFIG = {
    'Cleaning':           'LOCKED',
    'Driver':             'LOCKED',
    'Hotel':              'LOCKED',
    'Kaigo':              'ACTIVE',
    'Konstruksi':         'LOCKED',
    'Otomotif':           'LOCKED',
    'Penerbangan':        'LOCKED',
    'Pengolahan Makanan': 'ACTIVE',
    'Perikanan':          'ACTIVE',
    'Perkayuan':          'LOCKED',
    'Pertanian':          'LOCKED',
    'Resto':              'LOCKED'
  };

  const isCategoryActive = folder => SSW_FEATURE_CONFIG[folder] === 'ACTIVE';

  const SSW_CATEGORIES = [
    { folder: 'Cleaning',           jp: '清掃',     furi: 'せいそう',         romaji: 'seisou',           arti: 'Cleaning',           alias: 'kebersihan', json: 'cleaning.json' },
    { folder: 'Driver',             jp: '運転',     furi: 'うんてん',         romaji: 'unten',            arti: 'Driver',             alias: 'supir',      json: 'driver.json' },
    { folder: 'Hotel',              jp: '宿泊',     furi: 'しゅくはく',       romaji: 'shukuhaku',        arti: 'Hotel',              alias: 'penginapan', json: 'hotel.json' },
    { folder: 'Kaigo',              jp: '介護',     furi: 'かいご',           romaji: 'kaigo',            arti: 'Kaigo',              alias: 'perawat lansia', json: 'kaigo.json' },
    { folder: 'Konstruksi',         jp: '建設',     furi: 'けんせつ',         romaji: 'kensetsu',         arti: 'Konstruksi',         alias: 'bangunan',   json: 'konstruksi.json' },
    { folder: 'Otomotif',           jp: '整備',     furi: 'せいび',           romaji: 'seibi',            arti: 'Otomotif',           alias: 'mekanik',    json: 'otomotif.json' },
    { folder: 'Penerbangan',        jp: '航空',     furi: 'こうくう',         romaji: 'koukuu',           arti: 'Penerbangan',        alias: 'bandara',    json: 'penerbangan.json' },
    { folder: 'Pengolahan Makanan', jp: '食品製造', furi: 'しょくひんせいぞう', romaji: 'shokuhin seizou', arti: 'Pengolahan Makanan', alias: 'pm makanan', json: 'pengolahan_makanan.json' },
    { folder: 'Perikanan',          jp: '漁業',     furi: 'ぎょぎょう',       romaji: 'gyogyou',          arti: 'Perikanan',          alias: 'ikan laut',  json: 'perikanan.json' },
    { folder: 'Perkayuan',          jp: '木材',     furi: 'もくざい',         romaji: 'mokuzai',          arti: 'Perkayuan',          alias: 'kayu',       json: 'perkayuan.json' },
    { folder: 'Pertanian',          jp: '農業',     furi: 'のうぎょう',       romaji: 'nougyou',          arti: 'Pertanian',          alias: 'tani',       json: 'pertanian.json' },
    { folder: 'Resto',              jp: '外食',     furi: 'がいしょく',       romaji: 'gaishoku',         arti: 'Resto',              alias: 'restoran',   json: 'resto.json' }
  ];

  const HOME_ICON_SVG = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  `;

  const ARROW_ICON_SVG = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M7 17L17 7M7 7h10v10"/>
    </svg>
  `;

  const LOCK_ICON_SVG = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  `;

  const isModifiedClick = e => e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;

  let currentFilter = 'all';
  let searchQuery = '';
  let isNavigating = false;
  let navTimeout = null;

  // Elemen DOM
  const entryLoader = document.getElementById('entryLoader');
  const pageTransition = document.getElementById('pageTransition');
  const ptIconBox = document.getElementById('ptIconBox');
  const ptLabel = document.getElementById('ptLabel');
  const sswStage = document.getElementById('sswStage');
  const sswGrid = document.getElementById('sswGrid');
  const emptyState = document.getElementById('emptyState');
  const navBackBtn = document.getElementById('navBackBtn');
  const fixedTopbar = document.getElementById('fixedTopbar');
  const filterPills = document.getElementById('filterPills');
  const countAllEl = document.getElementById('countAll');
  const countActiveEl = document.getElementById('countActive');
  const searchInput = document.getElementById('sswSearchInput');
  const searchClearBtn = document.getElementById('searchClearBtn');
  const resetSearchBtn = document.getElementById('resetSearchBtn');

  // === 1. TEMA SIANG / MALAM ===
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

  // === 2. LOADING MASUK RINGAN ===
  function dismissEntryLoader() {
    if (!entryLoader) return;
    entryLoader.classList.add('is-done');
    runStaggerIn(sswStage);
    setTimeout(() => {
      entryLoader.style.display = 'none';
    }, 300);
  }

  // === 3. NAVBAR SHRINK ON SCROLL (NATIVE, PASSIVE + RAF) ===
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

  // === 4. ANIMASI STAGGER & TIRAI PINDAH HALAMAN ===
  function runStaggerIn(containerEl) {
    if (!containerEl) return;
    const targets = containerEl.querySelectorAll('.stagger-item, .ssw-card');
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
    if (entryLoader) {
      entryLoader.classList.add('is-done');
      entryLoader.style.display = 'none';
    }
    document.querySelectorAll('.card-launching, .sibling-dimmed, .is-pressed').forEach(el => {
      el.classList.remove('card-launching', 'sibling-dimmed', 'is-pressed');
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
    if (e.persisted) restoreFromCache();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      document.body.classList.remove('page-leaving');
      pageTransition?.classList.remove('active');
      isNavigating = false;
    }
  });

  if (navBackBtn) {
    navBackBtn.addEventListener('click', function (e) {
      if (isModifiedClick(e)) return;
      e.preventDefault();
      playPopSound(520, 280);
      smoothNavigate(this.getAttribute('href'), 'Menu Utama', HOME_ICON_SVG);
    });
  }

  function triggerLockedFeedback(cardEl) {
    playPopSound(260, 180);
    cardEl.classList.remove('shake-locked');
    void cardEl.offsetWidth;
    cardEl.classList.add('shake-locked');
  }

  // === 5. FILTER TAB & PENCARIAN ===
  const activeCount = SSW_CATEGORIES.filter(item => isCategoryActive(item.folder)).length;
  if (countAllEl) countAllEl.textContent = SSW_CATEGORIES.length;
  if (countActiveEl) countActiveEl.textContent = activeCount;

  if (filterPills) {
    filterPills.querySelectorAll('.filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const nextFilter = btn.dataset.filter;
        if (!nextFilter || nextFilter === currentFilter) return;

        currentFilter = nextFilter;
        filterPills.querySelectorAll('.filter-pill').forEach(p => {
          const isAct = p === btn;
          p.classList.toggle('active', isAct);
          p.setAttribute('aria-selected', String(isAct));
        });

        playPopSound();
        renderSswGrid(true);
      });
    });
  }

  function updateSearchClearVisibility() {
    if (!searchClearBtn) return;
    searchClearBtn.classList.toggle('hidden', searchQuery.length === 0);
  }

  function resetSearchAndFilter() {
    searchQuery = '';
    if (searchInput) searchInput.value = '';
    updateSearchClearVisibility();

    if (currentFilter !== 'all' && filterPills) {
      currentFilter = 'all';
      filterPills.querySelectorAll('.filter-pill').forEach(p => {
        const isAll = p.dataset.filter === 'all';
        p.classList.toggle('active', isAll);
        p.setAttribute('aria-selected', String(isAll));
      });
    }

    playPopSound();
    renderSswGrid(true);
    searchInput?.focus();
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      updateSearchClearVisibility();
      renderSswGrid(false);
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && searchQuery) {
        searchQuery = '';
        searchInput.value = '';
        updateSearchClearVisibility();
        renderSswGrid(false);
      }
    });
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      searchQuery = '';
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      updateSearchClearVisibility();
      playPopSound(480, 280);
      renderSswGrid(false);
    });
  }

  if (resetSearchBtn) {
    resetSearchBtn.addEventListener('click', resetSearchAndFilter);
  }

  // === 6. RENDER GRID BIDANG SSW ===
  function matchesSearch(item, q) {
    if (!q) return true;
    const haystack = `${item.arti} ${item.folder} ${item.jp} ${item.furi} ${item.romaji} ${item.alias}`.toLowerCase();
    return haystack.includes(q);
  }

  function renderSswGrid(animate = true) {
    if (!sswGrid) return;

    const list = SSW_CATEGORIES.filter(item => {
      const passTab = currentFilter === 'active' ? isCategoryActive(item.folder) : true;
      return passTab && matchesSearch(item, searchQuery);
    });

    if (list.length === 0) {
      sswGrid.innerHTML = '';
      sswGrid.classList.add('hidden');
      emptyState?.classList.remove('hidden');
      return;
    }

    sswGrid.classList.remove('hidden');
    emptyState?.classList.add('hidden');

    const frag = document.createDocumentFragment();

    list.forEach((item, idx) => {
      const isActive = isCategoryActive(item.folder);
      const numLabel = String(idx + 1).padStart(2, '0');
      const targetUrl = `${BASE_DIR}/${item.folder}/index.html?kategori=${encodeURIComponent(item.folder)}&file=${item.json}`;

      const card = document.createElement('a');
      card.href = isActive ? encodeURI(targetUrl) : '#';
      card.className = isActive ? 'ssw-card' : 'ssw-card is-locked';
      if (!isActive) card.setAttribute('aria-disabled', 'true');

      card.innerHTML = `
        <div class="ssw-card-top">
          <span class="ssw-index">${numLabel}</span>
          ${isActive
            ? `<span class="ssw-status-dot">Aktif</span>`
            : `<span class="ssw-lock-badge">${LOCK_ICON_SVG}<span>Segera</span></span>`
          }
        </div>

        <div class="ssw-card-body">
          <span class="ssw-jp" lang="ja">
            <ruby>${item.jp}<rt>${item.furi}</rt></ruby>
          </span>
        </div>

        <div class="ssw-card-footer">
          <span class="ssw-id">${item.arti}</span>
          <span class="ssw-arrow" aria-hidden="true">
            ${isActive ? ARROW_ICON_SVG : LOCK_ICON_SVG}
          </span>
        </div>
      `;

      // Highlight instan saat ditekan di layar sentuh (HP & iPad)
      if (isActive) {
        const clearPressed = () => card.classList.remove('is-pressed');
        card.addEventListener('touchstart', () => card.classList.add('is-pressed'), { passive: true });
        card.addEventListener('touchend', clearPressed, { passive: true });
        card.addEventListener('touchcancel', clearPressed, { passive: true });
      }

      card.addEventListener('click', (e) => {
        if (!isActive) {
          e.preventDefault();
          triggerLockedFeedback(card);
          return;
        }

        if (isModifiedClick(e)) return;
        e.preventDefault();
        playPopSound(640, 360);

        sswGrid.querySelectorAll('.ssw-card').forEach(c => {
          if (c !== card) c.classList.add('sibling-dimmed');
        });
        card.classList.add('card-launching');

        const shortKanji = item.jp.slice(0, 2);
        setTimeout(() => {
          smoothNavigate(targetUrl, item.arti, shortKanji);
        }, 120);
      });

      frag.appendChild(card);
    });

    sswGrid.innerHTML = '';
    sswGrid.appendChild(frag);
    if (animate) runStaggerIn(sswStage);
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

  // Render awal di belakang loader, lalu buka layar dengan halus
  renderSswGrid(false);
  setTimeout(dismissEntryLoader, 560);
});