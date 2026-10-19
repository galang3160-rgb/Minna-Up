/* =========================================================
   NAKAMAGAKKOU N5 — CAROUSEL KOSAKATA & TOUCH SWIPE
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  // === 1. SISTEM TEMA (LIGHT/DARK) ===
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('themeN5') || 'light';
  
  document.documentElement.setAttribute('data-theme', savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      let currentTheme = document.documentElement.getAttribute('data-theme');
      let targetTheme = currentTheme === 'light' ? 'dark' : 'light';
      
      document.documentElement.setAttribute('data-theme', targetTheme);
      localStorage.setItem('themeN5', targetTheme);
    });
  }

  // === 2. DATA KOSAKATA & PATH SUMBER JSON ===
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

  const totalCards = vocabList.length;
  let currentIndex = 0;

  const container = document.getElementById('carouselContainer');
  const chapterSelect = document.getElementById('chapterSelect');
  const currentCardIndexDOM = document.getElementById('currentCardIndex');
  const totalCardsCountDOM = document.getElementById('totalCardsCount');
  const topbarBadgeDOM = document.getElementById('topbarBadge');
  const cards = [];

  if (totalCardsCountDOM) {
    totalCardsCountDOM.textContent = totalCards < 10 ? `0${totalCards}` : totalCards;
  }

  // === 3. GENERATE KARTU SECARA DINAMIS ===
  for (let i = 0; i < totalCards; i++) {
    const item = vocabList[i];
    const jsonPath = `${DATA_BASE_DIR}/${item.path}.json`;

    if (chapterSelect) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = item.title;
      chapterSelect.appendChild(opt);
    }

    const card = document.createElement('a');
    card.href = `${STUDY_PAGE_URL}?topik=${item.path}`;
    card.className = 'chapter-flashcard';
    card.dataset.index = i;
    card.dataset.json = jsonPath;
    
    card.innerHTML = `
      <div class="flashcard-header">
        <span class="badge-status">Kosakata</span>
        <span class="topic-counter" id="count-${item.path}">... Kata</span>
      </div>
      <div class="flashcard-body">
        <span class="chapter-tag">KATEGORI N5</span>
        <h2 class="chapter-title">${item.title}</h2>
        <p class="chapter-desc">Materi hitungan & satuan ${item.title.toLowerCase()}</p>
      </div>
      <div class="flashcard-footer">
        <span class="action-hint">Mulai Belajar</span>
        <div class="action-icon-circle">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </div>
      </div>
    `;

    fetch(jsonPath)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        const countBadge = card.querySelector(`#count-${item.path}`);
        if (countBadge && Array.isArray(data)) {
          countBadge.textContent = `${data.length} Kosakata`;
        }
      })
      .catch(() => {
        const countBadge = card.querySelector(`#count-${item.path}`);
        if (countBadge) countBadge.textContent = 'Materi Siap';
      });

    card.addEventListener('click', function(e) {
      if (!this.classList.contains('active')) {
        e.preventDefault();
        currentIndex = parseInt(this.dataset.index, 10);
        updateCarousel();
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

    if (currentCardIndexDOM) {
      let dispNum = currentIndex + 1;
      currentCardIndexDOM.textContent = dispNum < 10 ? `0${dispNum}` : dispNum;
    }
    if (chapterSelect && parseInt(chapterSelect.value, 10) !== currentIndex) {
      chapterSelect.value = currentIndex;
    }
    if (topbarBadgeDOM) {
      topbarBadgeDOM.textContent = vocabList[currentIndex].title;
    }
  }

  // === 5. NAVIGASI TOMBOL, KEYBOARD & TOUCH SWIPE ===
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

  if (chapterSelect) {
    chapterSelect.addEventListener('change', (e) => {
      currentIndex = parseInt(e.target.value, 10);
      updateCarousel();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (document.activeElement === chapterSelect) return;
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

  // === 6. SOUND EFFECT POP ===
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

  // === 7. VISUAL FX (SPARKS & MOUSE TRAIL) ===
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

        for (let i = 1; i < pts.length; i++) {
          const t = i / pts.length;
          cctx.strokeStyle = `rgba(21, 128, 61, ${t * 0.18})`;
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