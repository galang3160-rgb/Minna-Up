/* =========================================================
   NIHONGGO GAKKOU
   FULL JAVASCRIPT LOGIC (SLIDER, MODAL, SOUND & SMOOTH TRANSITIONS)
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const kanjiNumerals = [
    '一','二','三','四','五','六','七','八','九','十',
    '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
    '二十一','二十二','二十三','二十四','二十五'
  ];
  const totalChapters = 25;
  let currentIndex = 0; // Dimulai dari Bab 1 (Index 0)

  const container = document.getElementById('carouselContainer');
  const modalGrid = document.getElementById('modalChapterGrid');
  const currentChapterDisplay = document.getElementById('currentChapterDisplay');
  const cards = [];
  const gridItems = [];

  // === 1. FUNGSI TRANSISI HALUS ANTAR HALAMAN ===
  function smoothNavigate(targetUrl) {
    document.body.classList.add('page-leaving');
    setTimeout(() => {
      window.location.href = targetUrl;
    }, 380); // Waktu jeda transisi keluar (ms)
  }

  // === 2. GENERATE KARTU SLIDER & MODAL GRID ===
  for (let i = 0; i < totalChapters; i++) {
    const babNumber = i + 1;
    const paddedNum = babNumber < 10 ? `0${babNumber}` : babNumber;

    // A. Buat Elemen Kartu Slider
    const card = document.createElement('a');
    card.href = `Bab/index.html?bab=${babNumber}`;
    card.className = 'chapter-flashcard';
    card.dataset.index = i;

    card.innerHTML = `
      <div class="flashcard-body">
        <span class="badge-status">READY</span>
        <span class="chapter-tag">LEVEL</span>
        <h2 class="chapter-title">Bab ${babNumber}</h2>
      </div>
      <div class="flashcard-footer">
        <span class="action-hint">Buka Modul</span>
        <div class="action-icon-circle">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      </div>
    `;

    // Klik Event Kartu:
    // Jika kartu di samping diklik -> geser ke tengah.
    // Jika kartu aktif di tengah diklik -> navigasi halus ke materi.html?bab=X.
    card.addEventListener('click', function(e) {
      if (!this.classList.contains('active')) {
        e.preventDefault();
        currentIndex = parseInt(this.dataset.index);
        updateCarousel();
      } else {
        e.preventDefault();
        smoothNavigate(this.getAttribute('href'));
      }
    });

    // Efek 3D Tilt pada Kartu Aktif
    card.addEventListener('mousemove', function(e) {
      if (this.classList.contains('active')) {
        const r = this.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        this.style.transform = `perspective(1000px) rotateX(${-(y / r.height - 0.5) * 8}deg) rotateY(${(x / r.width - 0.5) * 8}deg) scale(1.02)`;
      }
    });

    card.addEventListener('mouseleave', function() {
      if (this.classList.contains('active')) {
        this.style.transform = `translateX(0) scale(1) translateZ(0)`;
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
        <span class="cgi-label">BAB</span>
        <span class="cgi-kanji-bg">${kanjiNumerals[i]}</span>
      `;

      // Jika nomor bab di modal diklik: Geser slider & tutup modal
      gridBtn.addEventListener('click', () => {
        currentIndex = i;
        updateCarousel();
        closeModal();
      });

      modalGrid.appendChild(gridBtn);
      gridItems.push(gridBtn);
    }
  }

  // === 3. UPDATE POSISI SLIDER & INDIKATOR ===
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

    // Update Label Nomor Bab di Navbar
    const currentBabFormatted = (currentIndex + 1) < 10 ? `0${currentIndex + 1}` : (currentIndex + 1);
    if (currentChapterDisplay) {
      currentChapterDisplay.textContent = `Bab ${currentBabFormatted}`;
    }

    // Update Indikator Aktif di Grid Modal
    gridItems.forEach((btn, i) => {
      if (i === currentIndex) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // === 4. KONTROL MODAL (BUKA / TUTUP) ===
  const chapterModal = document.getElementById('chapterModal');
  const openModalBtn = document.getElementById('openChapterModal');
  const closeModalBtn = document.getElementById('closeChapterModal');

  function openModal() {
    if (chapterModal) chapterModal.classList.add('open');
  }

  function closeModal() {
    if (chapterModal) chapterModal.classList.remove('open');
  }

  if (openModalBtn) openModalBtn.addEventListener('click', openModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

  if (chapterModal) {
    chapterModal.addEventListener('click', (e) => {
      if (e.target === chapterModal) closeModal();
    });
  }

  // Tombol Back di Navbar dengan transisi mulus
  const navBackBtn = document.querySelector('.nav-back-circle');
  if (navBackBtn) {
    navBackBtn.addEventListener('click', function(e) {
      e.preventDefault();
      smoothNavigate(this.getAttribute('href'));
    });
  }

  // === 5. NAVIGASI PANAH & KEYBOARD ===
  const nextBtn = document.getElementById('nextBtn');
  const prevBtn = document.getElementById('prevBtn');

  function goNext() {
    if (currentIndex < totalChapters - 1) {
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

  // === 6. EFEK AUDIO POP ===
  let audioCtx = null;
  function playPopSound() {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      const now = audioCtx.currentTime;
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {}
  }

  // Inisialisasi posisi awal slider saat halaman dimuat
  updateCarousel();
});