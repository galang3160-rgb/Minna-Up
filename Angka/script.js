/* =========================================================================
   NAKAMAGAKKOU N5 — TOPIK BILANGAN & SATUAN GRID SELECTOR
   Koneksi Data Time/data/*.json & Time/index.html?topik=... Tetap Utuh
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
  // === 1. PATH SUMBER JSON & HALAMAN BELAJAR (TIDAK DIUBAH) ===
  const DATA_BASE_DIR = 'Time/data';
  const STUDY_PAGE_URL = 'Time/index.html';

  const vocabList = [
    { title: "Angka",       path: "angka",       group: "satuan", jp: "数字",   furi: "すうじ",   romaji: "suuji" },
    { title: "Batang",      path: "batang",      group: "satuan", jp: "〜本",   furi: "ほん",     romaji: "hon pon bon" },
    { title: "Benda",       path: "benda",       group: "satuan", jp: "〜つ",   furi: "ひとつ〜", romaji: "hitotsu futatsu" },
    { title: "Bulan",       path: "bulan",       group: "waktu",  jp: "〜月",   furi: "がつ",     romaji: "gatsu" },
    { title: "Cangkir",     path: "cangkir",     group: "satuan", jp: "〜杯",   furi: "はい",     romaji: "hai pai bai" },
    { title: "Durasi",      path: "durasi",      group: "waktu",  jp: "期間",   furi: "きかん",   romaji: "kikan" },
    { title: "Frekuensi",   path: "frekuensi",   group: "satuan", jp: "〜回",   furi: "かい",     romaji: "kai" },
    { title: "Hari",        path: "hari",        group: "waktu",  jp: "曜日",   furi: "ようび",   romaji: "youbi" },
    { title: "Hewan Kecil", path: "hewan-kecil", group: "satuan", jp: "〜匹",   furi: "ひき",     romaji: "hiki piki biki" },
    { title: "Jam",         path: "jam",         group: "waktu",  jp: "〜時",   furi: "じ",       romaji: "ji" },
    { title: "Lembar",      path: "lembar",      group: "satuan", jp: "〜枚",   furi: "まい",     romaji: "mai" },
    { title: "Manusia",     path: "manusia",     group: "satuan", jp: "〜人",   furi: "にん",     romaji: "nin hitori futari" },
    { title: "Menit",       path: "menit",       group: "waktu",  jp: "〜分",   furi: "ふん",     romaji: "fun pun" },
    { title: "Tanggal",     path: "tanggal",     group: "waktu",  jp: "〜日",   furi: "にち",     romaji: "nichi ka" },
    { title: "Umur",        path: "umur",        group: "satuan", jp: "〜歳",   furi: "さい",     romaji: "sai" },
    { title: "Urutan",      path: "urutan",      group: "satuan", jp: "〜番",   furi: "ばん",     romaji: "ban" },
    { title: "Waktu",       path: "waktu",       group: "waktu",  jp: "時間",   furi: "じかん",   romaji: "jikan" }
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

  const isModifiedClick = e => e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;

  let currentFilter = 'all';
  let searchQuery = '';
  let isNavigating = false;
  let navTimeout = null;

  // Cache jumlah kosakata agar tidak fetch berulang saat search/filter
  const countCache = {};

  // Elemen DOM
  const entryLoader = document.getElementById('entryLoader');
  const pageTransition = document.getElementById('pageTransition');
  const ptIconBox = document.getElementById('ptIconBox');
  const ptLabel = document.getElementById('ptLabel');
  const topicStage = document.getElementById('topicStage');
  const topicGrid = document.getElementById('topicGrid');
  const emptyState = document.getElementById('emptyState');
  const navBackBtn = document.getElementById('navBackBtn');
  const fixedTopbar = document.getElementById('fixedTopbar');
  const filterPills = document.getElementById('filterPills');
  const countAllEl = document.getElementById('countAll');
  const countWaktuEl = document.getElementById('countWaktu');
  const countSatuanEl = document.getElementById('countSatuan');
  const searchInput = document.getElementById('topicSearchInput');
  const searchClearBtn = document.getElementById('searchClearBtn');
  const resetSearchBtn = document.getElementById('resetSearchBtn');

  // === 2. SISTEM TEMA SINKRON (nakama_theme & themeN5) ===
  const htmlEl = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('nakama_theme') || localStorage.getItem('themeN5');

  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    htmlEl.setAttribute('data-theme', 'dark');
  } else {
    htmlEl.setAttribute('data-theme', 'light');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const targetTheme = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      htmlEl.setAttribute('data-theme', targetTheme);
      localStorage.setItem('nakama_theme', targetTheme);
      localStorage.setItem('themeN5', targetTheme);
      playPopSound();
    });
  }

  // === 3. LOADING MASUK RINGAN ===
  function dismissEntryLoader() {
    if (!entryLoader) return;
    entryLoader.classList.add('is-done');
    runStaggerIn(topicStage);
    setTimeout(() => {
      entryLoader.style.display = 'none';
    }, 300);
  }

  // === 4. NAVBAR SHRINK ON SCROLL (NATIVE, PASSIVE + RAF) ===
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

  // === 5. ANIMASI STAGGER & TIRAI PINDAH HALAMAN ===
  function runStaggerIn(containerEl) {
    if (!containerEl) return;
    const targets = containerEl.querySelectorAll('.stagger-item, .topic-card');
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

  // === 6. FETCH JUMLAH KOSAKATA DARI Time/data/*.json ===
  function loadTopicCount(item) {
    if (countCache[item.path]) return;
    const jsonPath = `${DATA_BASE_DIR}/${item.path}.json`;

    fetch(jsonPath)
      .then(res => (res.ok ? res.json() : []))
      .then(data => {
        const list = Array.isArray(data)
          ? data
          : (Object.values(data || {}).find(Array.isArray) || []);
        const label = list.length ? `${list.length} Kosakata` : 'Materi Siap';
        countCache[item.path] = label;
        const badge = document.getElementById(`count-${item.path}`);
        if (badge) badge.textContent = label;
      })
      .catch(() => {
        countCache[item.path] = 'Materi Siap';
        const badge = document.getElementById(`count-${item.path}`);
        if (badge) badge.textContent = 'Materi Siap';
      });
  }

  // === 7. FILTER TAB & PENCARIAN ===
  const waktuCount = vocabList.filter(i => i.group === 'waktu').length;
  const satuanCount = vocabList.filter(i => i.group === 'satuan').length;
  if (countAllEl) countAllEl.textContent = vocabList.length;
  if (countWaktuEl) countWaktuEl.textContent = waktuCount;
  if (countSatuanEl) countSatuanEl.textContent = satuanCount;

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
        renderTopicGrid(true);
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
    renderTopicGrid(true);
    searchInput?.focus();
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      updateSearchClearVisibility();
      renderTopicGrid(false);
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && searchQuery) {
        searchQuery = '';
        searchInput.value = '';
        updateSearchClearVisibility();
        renderTopicGrid(false);
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
      renderTopicGrid(false);
    });
  }

  if (resetSearchBtn) {
    resetSearchBtn.addEventListener('click', resetSearchAndFilter);
  }

  // === 8. RENDER 17 KARTU TOPIK ===
  function matchesSearch(item, q) {
    if (!q) return true;
    const haystack = `${item.title} ${item.path} ${item.jp} ${item.furi} ${item.romaji} ${item.group}`.toLowerCase();
    return haystack.includes(q);
  }

  function renderTopicGrid(animate = true) {
    if (!topicGrid) return;

    const list = vocabList.filter(item => {
      const passTab = currentFilter === 'all' ? true : item.group === currentFilter;
      return passTab && matchesSearch(item, searchQuery);
    });

    if (list.length === 0) {
      topicGrid.innerHTML = '';
      topicGrid.classList.add('hidden');
      emptyState?.classList.remove('hidden');
      return;
    }

    topicGrid.classList.remove('hidden');
    emptyState?.classList.add('hidden');

    const frag = document.createDocumentFragment();

    list.forEach((item, idx) => {
      const numLabel = String(idx + 1).padStart(2, '0');
      const jsonPath = `${DATA_BASE_DIR}/${item.path}.json`;
      const targetUrl = `${STUDY_PAGE_URL}?topik=${item.path}`;
      const countText = countCache[item.path] || '... Kata';

      const card = document.createElement('a');
      card.href = targetUrl;
      card.className = 'topic-card';
      card.dataset.json = jsonPath;

      card.innerHTML = `
        <div class="topic-card-top">
          <span class="topic-index">${numLabel}</span>
          <span class="topic-count-badge" id="count-${item.path}">${countText}</span>
        </div>

        <div class="topic-card-body">
          <span class="topic-jp" lang="ja">
            <ruby>${item.jp}<rt>${item.furi}</rt></ruby>
          </span>
        </div>

        <div class="topic-card-footer">
          <span class="topic-id">${item.title}</span>
          <span class="topic-arrow" aria-hidden="true">${ARROW_ICON_SVG}</span>
        </div>
      `;

      // Highlight instan saat disentuh di layar HP & iPad
      const clearPressed = () => card.classList.remove('is-pressed');
      card.addEventListener('touchstart', () => card.classList.add('is-pressed'), { passive: true });
      card.addEventListener('touchend', clearPressed, { passive: true });
      card.addEventListener('touchcancel', clearPressed, { passive: true });

      card.addEventListener('click', (e) => {
        if (isModifiedClick(e)) return;
        e.preventDefault();
        playPopSound(640, 360);

        topicGrid.querySelectorAll('.topic-card').forEach(c => {
          if (c !== card) c.classList.add('sibling-dimmed');
        });
        card.classList.add('card-launching');

        const cleanJp = item.jp.replace('〜', '').slice(0, 2);
        setTimeout(() => {
          smoothNavigate(targetUrl, item.title, cleanJp);
        }, 120);
      });

      frag.appendChild(card);
      loadTopicCount(item);
    });

    topicGrid.innerHTML = '';
    topicGrid.appendChild(frag);
    if (animate) runStaggerIn(topicStage);
  }

  // === 9. AUDIO POP RINGAN ===
  let audioCtx = null;
  function playPopSound(freqStart = 560, freqEnd = 280) {
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

  // Render awal di belakang loader, lalu buka layar
  renderTopicGrid(false);
  setTimeout(dismissEntryLoader, 560);
});