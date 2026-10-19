/* =========================================================
   NIHONGGO GAKKOU — KANJI PART CAROUSEL, MODAL & THEME ENGINE
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  // === 1. SISTEM TEMA (LIGHT/DARK) ===
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('themeKanjiPart') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      let currentTheme = document.documentElement.getAttribute('data-theme');
      let targetTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', targetTheme);
      localStorage.setItem('themeKanjiPart', targetTheme);
    });
  }

  const kanjiNumerals = [
    '一','二','三','四','五','六','七','八','九','十',
    '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
    '二十一','二十二','二十三','二十四','二十五'
  ];

  const totalParts = 25;
  let currentIndex = 0; // Dimulai dari Part 1 (Index 0)

  const container = document.getElementById('carouselContainer');
  const modalGrid = document.getElementById('modalChapterGrid');
  const currentChapterDisplay = document.getElementById('currentChapterDisplay');
  const cards = [];
  const gridItems = [];

  // === 2. FUNGSI TRANSISI HALUS ANTAR HALAMAN ===
  function smoothNavigate(targetUrl) {
    document.body.classList.add('page-leaving');
    setTimeout(() => {
      window.location.href = targetUrl;
    }, 340);
  }

  // === 3. GENERATE KARTU SLIDER & MODAL GRID ===
  for (let i = 0; i < totalParts; i++) {
    const partNumber = i + 1;
    const paddedNum = partNumber < 10 ? `0${partNumber}` : partNumber;
    const kanjiGlyph = kanjiNumerals[i] || String(partNumber);

    // A. Buat Kartu Carousel
    const card = document.createElement('a');
    card.href = `Part/index.html?part=${partNumber}`;
    card.className = 'chapter-flashcard';
    card.dataset.index = i;

    card.innerHTML = `
      <div class="flashcard-top">
        <span class="badge-status">#${paddedNum}</span>
      </div>
      <div class="flashcard-body">
        <div class="chapter-icon-box">
          ${kanjiGlyph}
        </div>
        <h2 class="chapter-title">Part ${partNumber}</h2>
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

    // Efek 3D Tilt pada Kartu Aktif (Desktop)
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

    // B. Buat Kotak Grid di Dalam Modal Popup
    if (modalGrid) {
      const gridBtn = document.createElement('button');
      gridBtn.type = 'button';
      gridBtn.className = 'chapter-grid-item';
      gridBtn.dataset.index = i;

      gridBtn.innerHTML = `
        <span class="cgi-num">${paddedNum}</span>
        <span class="cgi-label">PART</span>
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

  // === 4. UPDATE POSISI SLIDER & INDIKATOR ===
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

    const currentPartFormatted = (currentIndex + 1) < 10 ? `0${currentIndex + 1}` : (currentIndex + 1);
    if (currentChapterDisplay) {
      currentChapterDisplay.textContent = `Part ${currentPartFormatted}`;
    }

    gridItems.forEach((btn, i) => {
      btn.classList.toggle('active', i === currentIndex);
    });
  }

  // === 5. KONTROL MODAL (BUKA / TUTUP) ===
  const chapterModal = document.getElementById('chapterModal');
  const openModalBtn = document.getElementById('openChapterModal');
  const closeModalBtn = document.getElementById('closeChapterModal');

  function openModal() { if (chapterModal) chapterModal.classList.add('open'); }
  function closeModal() { if (chapterModal) chapterModal.classList.remove('open'); }

  if (openModalBtn) openModalBtn.addEventListener('click', openModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (chapterModal) {
    chapterModal.addEventListener('click', (e) => {
      if (e.target === chapterModal) closeModal();
    });
  }

  const navBackBtn = document.querySelector('.nav-back-circle');
  if (navBackBtn) {
    navBackBtn.addEventListener('click', function (e) {
      e.preventDefault();
      smoothNavigate(this.getAttribute('href'));
    });
  }

  // === 6. NAVIGASI PANAH, KEYBOARD & SWIPE LAYAR HP ===
  const nextBtn = document.getElementById('nextBtn');
  const prevBtn = document.getElementById('prevBtn');

  function goNext() {
    if (currentIndex < totalParts - 1) {
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
    if (chapterModal && chapterModal.classList.contains('open')) return;
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'ArrowLeft') goPrev();
  });

  // Swipe Jari Kiri/Kanan di HP
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

  // === 7. EFEK AUDIO POP ===
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

  // === 8. VISUAL FX (SPARKS & MOUSE TRAIL) ===
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
    const sparkColors = ['#DCFCE7', '#E0F2FE', '#FEF3C7', '#E9D5FF'];
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

          for (let i = 1; i < pts.length; i++) {
            const t = i / pts.length;
            ctx.strokeStyle = `rgba(21, 128, 61, ${t * 0.22})`;
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

  // Inisialisasi posisi awal slider
  updateCarousel();
});