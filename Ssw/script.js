/* =========================================================================
   NAKAMAGAKKOU — SSW CATEGORY GRID SELECTOR
   Struktur Path: kategori/{NamaFolder}/index.html + Synced Transitions
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const BASE_DIR = 'kategori';

  // Daftar 12 bidang sesuai nama folder persis di dalam Ssw/kategori/
  const SSW_CATEGORIES = [
    { folder: 'Cleaning',           jp: '清掃',     furi: 'せいそう',         arti: 'Cleaning',           json: 'cleaning.json' },
    { folder: 'Driver',             jp: '運転',     furi: 'うんてん',         arti: 'Driver',             json: 'driver.json' },
    { folder: 'Hotel',              jp: '宿泊',     furi: 'しゅくはく',       arti: 'Hotel',              json: 'hotel.json' },
    { folder: 'Kaigo',              jp: '介護',     furi: 'かいご',           arti: 'Kaigo',              json: 'kaigo.json' },
    { folder: 'Konstruksi',         jp: '建設',     furi: 'けんせつ',         arti: 'Konstruksi',         json: 'konstruksi.json' },
    { folder: 'Otomotif',           jp: '整備',     furi: 'せいび',           arti: 'Otomotif',           json: 'otomotif.json' },
    { folder: 'Penerbangan',        jp: '航空',     furi: 'こうくう',         arti: 'Penerbangan',        json: 'penerbangan.json' },
    { folder: 'Pengolahan Makanan', jp: '食品製造', furi: 'しょくひんせいぞう', arti: 'Pengolahan Makanan', json: 'pengolahan_makanan.json' },
    { folder: 'Perikanan',          jp: '漁業',     furi: 'ぎょぎょう',       arti: 'Perikanan',          json: 'perikanan.json' },
    { folder: 'Perkayuan',          jp: '木材',     furi: 'もくざい',         arti: 'Perkayuan',          json: 'perkayuan.json' },
    { folder: 'Pertanian',          jp: '農業',     furi: 'のうぎょう',       arti: 'Pertanian',          json: 'pertanian.json' },
    { folder: 'Resto',              jp: '外食',     furi: 'がいしょく',       arti: 'Resto',              json: 'resto.json' }
  ];

  const HOME_ICON_SVG = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  `;

  const isModifiedClick = e => e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;

  let isNavigating = false;
  let navTimeout = null;

  // Elemen DOM
  const pageTransition = document.getElementById('pageTransition');
  const ptIconBox = document.getElementById('ptIconBox');
  const ptLabel = document.getElementById('ptLabel');
  const sswStage = document.getElementById('sswStage');
  const sswGrid = document.getElementById('sswGrid');
  const navBackBtn = document.getElementById('navBackBtn');

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

  // === 2. ANIMASI STAGGER & TIRAI PINDAH HALAMAN ===
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
      setTimeout(restoreFromCache, 650);
    }, 360);
  }

  window.addEventListener('pageshow', restoreFromCache);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') restoreFromCache();
  });

  if (navBackBtn) {
    navBackBtn.addEventListener('click', function (e) {
      if (isModifiedClick(e)) return;
      e.preventDefault();
      playPopSound(520, 280);
      smoothNavigate(this.getAttribute('href'), 'Menu Utama', HOME_ICON_SVG);
    });
  }

  // === 3. RENDER 12 KARTU GRID SSW ===
  function renderSswGrid() {
    if (!sswGrid) return;
    sswGrid.innerHTML = '';

    SSW_CATEGORIES.forEach((item) => {
      // Path menuju: kategori/{NamaFolder}/index.html?kategori=...&file=...
      const targetUrl = `${BASE_DIR}/${item.folder}/index.html?kategori=${encodeURIComponent(item.folder)}&file=${item.json}`;

      const card = document.createElement('a');
      card.href = encodeURI(targetUrl);
      card.className = 'ssw-card';
      card.innerHTML = `
        <span class="ssw-jp">
          <ruby>${item.jp}<rt>${item.furi}</rt></ruby>
        </span>
        <span class="ssw-id">${item.arti}</span>
      `;

      card.addEventListener('click', (e) => {
        if (isModifiedClick(e)) return;
        e.preventDefault();
        playPopSound(640, 360);

        sswGrid.querySelectorAll('.ssw-card').forEach(c => {
          if (c !== card) c.classList.add('sibling-dimmed');
        });
        card.classList.add('card-launching');

        // Tampilkan kanji pendek di kotak ikon tirai saat pindah halaman
        const shortKanji = item.jp.slice(0, 2);
        setTimeout(() => {
          smoothNavigate(targetUrl, item.arti, shortKanji);
        }, 160);
      });

      sswGrid.appendChild(card);
    });

    runStaggerIn(sswStage);
  }

  // === 4. AUDIO POP ===
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
      osc.frequency.exponentialRampToValueAtTime(freqEnd, now + 0.09);
      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch (_) {}
  }

  // === 5. VISUAL FX (AMBIENT ORB, SPARKS & MOUSE TRAIL) ===
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;

  if (!reduce) {
    const sun = document.getElementById('sun');
    if (sun && fine) {
      addEventListener('pointermove', e => {
        sun.style.transform = `translate(${(e.clientX / innerWidth - 0.5) * -36}px, ${(e.clientY / innerHeight - 0.5) * -36}px)`;
      }, { passive: true });
    }

    const fx = document.getElementById('fx');
    const sparkColors = ['#FDE047', '#FEF3C7', '#EAB308', '#FFFFFF'];
    addEventListener('click', e => {
      if (!fx || (e.clientX === 0 && e.clientY === 0)) return;
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
        let isPointerActive = false;
        let isLoopRunning = false;
        let idleTimer = null;
        const pts = [];

        function drawTrail() {
          if (isPointerActive) {
            x += (mx - x) * 0.34;
            y += (my - y) * 0.34;
            pts.push({ x, y });
            if (pts.length > 16) pts.shift();
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
                ? `rgba(253, 224, 71, ${t * 0.26})`
                : `rgba(17, 17, 17, ${t * 0.16})`;
              ctx.lineWidth = t * 8;
              ctx.beginPath();
              ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
              ctx.lineTo(pts[i].x, pts[i].y);
              ctx.stroke();
            }
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
  }

  renderSswGrid();
});