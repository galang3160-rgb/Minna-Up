/* =========================================================================
   NAKAMAGAKKOU N5 — CAROUSEL TOPIK BILANGAN, MODAL GRID & TOUCH SWIPE
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
  // === 1. SISTEM TEMA SINKRON (LIGHT / DARK) ===
  const htmlEl = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('nakama_theme') || localStorage.getItem('themeN5') || 'light';

  htmlEl.setAttribute('data-theme', savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = htmlEl.getAttribute('data-theme');
      const targetTheme = currentTheme === 'light' ? 'dark' : 'light';
      htmlEl.setAttribute('data-theme', targetTheme);
      localStorage.setItem('nakama_theme', targetTheme);
      localStorage.setItem('themeN5', targetTheme);
      playPopSound();
    });
  }

  // === 2. DATA 17 TOPIK BILANGAN & PATH SUMBER JSON ===
  const DATA_BASE_DIR = 'Time/data';
  const STUDY_PAGE_URL = 'Time/index.html';

  const vocabList = [
    { title: "Angka", path: "angka" },
    { title: "Batang", path: "batang" },
    { title: "Benda", path: "benda" },
    { title: "Bulan", path: "bulan" },
    { title: "Cangkir", path: "cangkir" },
    { title: "Durasi", path: "durasi" },
    { title: "Frekuensi", path: "frekuensi" },
    { title: "Hari", path: "hari" },
    { title: "Hewan Kecil", path: "hewan-kecil" },
    { title: "Jam", path: "jam" },
    { title: "Lembar", path: "lembar" },
    { title: "Manusia", path: "manusia" },
    { title: "Menit", path: "menit" },
    { title: "Tanggal", path: "tanggal" },
    { title: "Umur", path: "umur" },
    { title: "Urutan", path: "urutan" },
    { title: "Waktu", path: "waktu" }
  ];

  const vectorIcons = [
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="16" y1="14" x2="16" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>`,
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`
  ];

  const totalCards = vocabList.length;
  let currentIndex = 0;

  const container = document.getElementById('carouselContainer');
  const modalGrid = document.getElementById('modalTopicGrid');
  const currentTopicLabel = document.getElementById('currentTopicLabel');
  const currentCardIndexDOM = document.getElementById('currentCardIndex');
  const totalCardsCountDOM = document.getElementById('totalCardsCount');
  const topbarBadgeDOM = document.getElementById('topbarBadge');
  const cards = [];
  const gridItems = [];

  if (totalCardsCountDOM) {
    totalCardsCountDOM.textContent = totalCards < 10 ? `0${totalCards}` : totalCards;
  }

  function smoothNavigate(targetUrl) {
    document.body.classList.add('page-leaving');
    setTimeout(() => {
      window.location.href = targetUrl;
    }, 320);
  }

  // === 3. GENERATE KARTU SLIDER & MODAL GRID SECARA DINAMIS ===
  for (let i = 0; i < totalCards; i++) {
    const item = vocabList[i];
    const paddedIndex = (i + 1) < 10 ? `0${i + 1}` : (i + 1);
    const jsonPath = `${DATA_BASE_DIR}/${item.path}.json`;
    const svgIcon = vectorIcons[i % vectorIcons.length];

    // A. Buat Kartu di Carousel
    const card = document.createElement('a');
    card.href = `${STUDY_PAGE_URL}?topik=${item.path}`;
    card.className = 'chapter-flashcard';
    card.dataset.index = i;
    card.dataset.json = jsonPath;

    card.innerHTML = `
      <div class="flashcard-header">
        <span class="badge-status">#${paddedIndex} • N5</span>
        <span class="topic-counter" id="count-${item.path}">... Kata</span>
      </div>
      <div class="flashcard-body">
        <div class="topic-icon-box">
          ${svgIcon}
        </div>
        <h2 class="chapter-title">${item.title}</h2>
        <p class="chapter-desc">Materi hitungan & satuan ${item.title.toLowerCase()}</p>
      </div>
      <div class="flashcard-footer">
        <span class="action-hint">Mulai Belajar</span>
        <div class="action-icon-circle">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M7 17L17 7M7 7h10v10"/>
          </svg>
        </div>
      </div>
    `;

    // B. Buat Tombol di Modal Grid
    let gridBtn = null;
    if (modalGrid) {
      gridBtn = document.createElement('button');
      gridBtn.type = 'button';
      gridBtn.className = 'topic-grid-btn';
      gridBtn.dataset.index = i;
      gridBtn.innerHTML = `
        <span class="tgb-title">${paddedIndex}. ${item.title}</span>
        <span class="tgb-sub" id="grid-count-${item.path}">Memuat...</span>
      `;
      gridBtn.addEventListener('click', () => {
        currentIndex = i;
        updateCarousel();
        closeModal();
      });
      modalGrid.appendChild(gridBtn);
      gridItems.push(gridBtn);
    }

    // Fetch jumlah kosakata dari file JSON
    fetch(jsonPath)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        const list = Array.isArray(data) ? data : (Object.values(data || {}).find(Array.isArray) || []);
        const labelText = list.length ? `${list.length} Kosakata` : 'Materi Siap';
        const countBadge = card.querySelector(`#count-${item.path}`);
        if (countBadge) countBadge.textContent = labelText;
        if (gridBtn) {
          const gridSub = gridBtn.querySelector(`#grid-count-${item.path}`);
          if (gridSub) gridSub.textContent = labelText;
        }
      })
      .catch(() => {
        const countBadge = card.querySelector(`#count-${item.path}`);
        if (countBadge) countBadge.textContent = 'Materi Siap';
        if (gridBtn) {
          const gridSub = gridBtn.querySelector(`#grid-count-${item.path}`);
          if (gridSub) gridSub.textContent = 'Materi Siap';
        }
      });

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

    // Efek 3D Tilt pada Kartu Aktif
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

    container.appendChild(card);
    cards.push(card);
  }

  // === 4. LOGIKA SLIDER ===
  function updateCarousel() {
    playPopSound();

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

    const activeTopic = vocabList[currentIndex];
    if (currentCardIndexDOM) {
      const dispNum = currentIndex + 1;
      currentCardIndexDOM.textContent = dispNum < 10 ? `0${dispNum}` : dispNum;
    }
    if (currentTopicLabel) {
      currentTopicLabel.textContent = activeTopic.title;
    }
    if (topbarBadgeDOM) {
      topbarBadgeDOM.textContent = `N5 • ${activeTopic.title}`;
    }

    gridItems.forEach((btn, i) => {
      btn.classList.toggle('active', i === currentIndex);
    });
  }

  // === 5. KONTROL MODAL TOPIK ===
  const topicModal = document.getElementById('topicModal');
  const openModalBtn = document.getElementById('openTopicModal');
  const closeModalBtn = document.getElementById('closeTopicModal');

  function openModal() {
    if (topicModal) topicModal.classList.add('open');
  }
  function closeModal() {
    if (topicModal) topicModal.classList.remove('open');
  }

  if (openModalBtn) openModalBtn.addEventListener('click', openModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (topicModal) {
    topicModal.addEventListener('click', (e) => {
      if (e.target === topicModal) closeModal();
    });
  }

  const navBackBtn = document.getElementById('navBackBtn');
  if (navBackBtn) {
    navBackBtn.addEventListener('click', function (e) {
      e.preventDefault();
      smoothNavigate(this.getAttribute('href'));
    });
  }

  // === 6. NAVIGASI TOMBOL, KEYBOARD & TOUCH SWIPE ===
  const nextBtn = document.getElementById('nextBtn');
  const prevBtn = document.getElementById('prevBtn');

  function goNext() {
    if (currentIndex < totalCards - 1) {
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

  if (nextBtn) nextBtn.addEventListener('click', goNext);
  if (prevBtn) prevBtn.addEventListener('click', goPrev);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
    if (topicModal && topicModal.classList.contains('open')) return;
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'ArrowLeft') goPrev();
  });

  // Swipe Jari Kiri/Kanan di HP
  let touchStartX = 0;
  if (container) {
    container.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    container.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) goNext();
        else goPrev();
      }
    }, { passive: true });
  }

  // === 7. SOUND EFFECT POP ===
  let audioCtx = null;
  function playPopSound() {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      const now = audioCtx.currentTime;
      osc.frequency.setValueAtTime(560, now);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }

  // === 8. VISUAL FX (SPARKS & MOUSE TRAIL) ===
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;

  if (!reduce) {
    const sun = document.getElementById('sun');
    if (sun && fine) {
      addEventListener('pointermove', e => {
        sun.style.transform = `translate(${(e.clientX / innerWidth - 0.5) * -32}px, ${(e.clientY / innerHeight - 0.5) * -32}px)`;
      });
    }

    const fx = document.getElementById('fx');
    const sparkColors = ['#DCFCE7', '#E0F2FE', '#FEF3C7', '#E9D5FF'];
    addEventListener('pointerdown', e => {
      if (!fx || e.target.closest('button, input, select, a')) return;
      const pulse = document.createElement('div');
      pulse.className = 'pulse';
      pulse.style.left = e.clientX + 'px';
      pulse.style.top = e.clientY + 'px';
      pulse.onanimationend = () => pulse.remove();
      fx.appendChild(pulse);

      for (let i = 0; i < 4; i++) {
        const angle = (Math.PI * 2 * i) / 4 + Math.random() * 0.4;
        const dist = 36 + Math.random() * 45;
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

    const canvas = document.getElementById('trail');
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

        const isDark = htmlEl.getAttribute('data-theme') === 'dark';

        for (let i = 1; i < pts.length; i++) {
          const t = i / pts.length;
          cctx.strokeStyle = isDark
            ? `rgba(74, 222, 128, ${t * 0.26})`
            : `rgba(21, 128, 61, ${t * 0.18})`;
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

  // Inisialisasi posisi awal
  updateCarousel();
});