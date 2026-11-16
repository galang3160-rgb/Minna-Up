/* =========================================================================
   NAKAMAGAKKOU — 2-STAGE MATERIAL & CHAPTER SELECTOR (N5 - N1)
   Path Otomatis: Data/{Level}/{Kategori}/index.html
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. DATA LEVEL N5 - N1, SUB-KATEGORI, JUMLAH JSON & LINK HTML TUJUAN
  //    Mengikuti struktur: Data/{Level}/{Kategori}/index.html
  // =========================================================================
  const SUB_DATA = {
    N5: {
      Minna1: {
        title: "Minna 1",
        desc: "Kosakata Dasar N5",
        itemLabel: "Bab",
        jsonPrefix: "bab",                        // bab1.json, bab2.json ...
        startNum: 1,
        total: 25,                                // Bab 1 - 25
        htmlPath: "Data/N5/Minna1/index.html"     // Menuju Data/N5/Minna1/index.html
      },
      Soumatome: {
        title: "Soumatome",
        desc: "Rangkuman N5",
        itemLabel: "Bab",
        jsonPrefix: "Soumatome",                  // Soumatome1.json, Soumatome2.json ...
        startNum: 1,
        total: 6,
        htmlPath: "Data/N5/Soumatome/index.html"  // Menuju Data/N5/Soumatome/index.html
      }
    },
    N4: {
      Minna2: {
        title: "Minna 2",
        desc: "Kosakata Lanjutan N4",
        itemLabel: "Bab",
        jsonPrefix: "bab",                        // bab26.json, bab27.json ...
        startNum: 26,
        total: 25,                                // Bab 26 - 50
        htmlPath: "Data/N4/Minna2/index.html"     // Menuju Data/N4/Minna2/index.html
      },
      Soumatome: {
        title: "Soumatome",
        desc: "Rangkuman N4",
        itemLabel: "Bab",
        jsonPrefix: "Soumatome",                  // Soumatome1.json, dst.
        startNum: 1,
        total: 6,
        htmlPath: "Data/N4/Soumatome/index.html"  // Menuju Data/N4/Soumatome/index.html
      }
    },
    N3: {
      Mori: {
        title: "Mori",
        desc: "Nihongo no Mori N3",
        itemLabel: "Bab",
        jsonPrefix: "Mori",                       // Mori1.json, Mori2.json ...
        startNum: 1,
        total: 37,
        htmlPath: "Data/N3/Mori/index.html"       // Menuju Data/N3/Mori/index.html
      },
      Soumatome: {
        title: "Soumatome",
        desc: "Rangkuman N3",
        itemLabel: "Bab",
        jsonPrefix: "Soumatome",                  // Soumatome1.json, dst.
        startNum: 1,
        total: 36,
        htmlPath: "Data/N3/Soumatome/index.html"  // Menuju Data/N3/Soumatome/index.html
      }
    },
    N2: {
      Mori: {
        title: "Mori",
        desc: "Nihongo no Mori N2",
        itemLabel: "Bab",
        jsonPrefix: "Mori",                       // Mori1.json, Mori2.json ...
        startNum: 1,
        total: 63,
        htmlPath: "Data/N2/Mori/index.html"       // Menuju Data/N2/Mori/index.html
      },
      Soumatome: {
        title: "Soumatome",
        desc: "Rangkuman N2",
        itemLabel: "Bab",
        jsonPrefix: "Soumatome",                  // Soumatome1.json, dst.
        startNum: 1,
        total: 47,
        htmlPath: "Data/N2/Soumatome/index.html"  // Menuju Data/N2/Soumatome/index.html
      }
    },
    N1: {
      Mori: {
        title: "Mori",
        desc: "Nihongo no Mori N1",
        itemLabel: "Bab",
        jsonPrefix: "Mori",                       // Mori1.json, Mori2.json ...
        startNum: 1,
        total: 69,
        htmlPath: "Data/N1/Mori/index.html"       // Menuju Data/N1/Mori/index.html
      },
      Soumatome: {
        title: "Soumatome",
        desc: "Rangkuman N1",
        itemLabel: "Bab",
        jsonPrefix: "Soumatome",                  // Soumatome1.json, dst.
        startNum: 1,
        total: 49,
        htmlPath: "Data/N1/Soumatome/index.html"  // Menuju Data/N1/Soumatome/index.html
      }
    }
  };

  // State Aplikasi
  const urlParams = new URLSearchParams(window.location.search);
  let currentLevel = urlParams.get('level') || localStorage.getItem('nakama_level') || 'N5';
  if (!SUB_DATA[currentLevel]) currentLevel = 'N5';

  let currentBookKey = urlParams.get('buku') || null;
  let currentIndex = 0;
  let cards = [];
  let gridItems = [];

  // Elemen DOM
  const bookSelectionStage = document.getElementById('bookSelectionStage');
  const bookBentoGrid = document.getElementById('bookBentoGrid');
  const stageLevelBadge = document.getElementById('stageLevelBadge');
  const stageMainTitle = document.getElementById('stageMainTitle');

  const chapterCarouselStage = document.getElementById('chapterCarouselStage');
  const container = document.getElementById('carouselContainer');
  const modalGrid = document.getElementById('modalChapterGrid');
  const currentChapterDisplay = document.getElementById('currentChapterDisplay');
  const openModalBtn = document.getElementById('openChapterModal');
  const modalTagLabel = document.getElementById('modalTagLabel');
  const modalTitleLabel = document.getElementById('modalTitleLabel');

  const levelPillsContainer = document.getElementById('levelPills');
  const backToBookBtn = document.getElementById('backToBookBtn');
  const activeBookLabel = document.getElementById('activeBookLabel');
  const navBackBtn = document.getElementById('navBackBtn');

  // === 0. INISIALISASI & TOGGLE MODE MALAM ===
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

  const vectorIcons = [
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.2 6.6L22 9.7l-5 4.9 1.2 6.9L12 18.2 5.8 21.5 7 14.6 2 9.7l6.8-1.1L12 2z"/></svg>`
  ];

  function smoothNavigate(targetUrl) {
    document.body.classList.add('page-leaving');
    setTimeout(() => {
      window.location.href = targetUrl;
    }, 320);
  }

  // === 1. UPDATE TOMBOL LEVEL (N5 - N1) ===
  function updateLevelPills() {
    if (!levelPillsContainer) return;
    levelPillsContainer.querySelectorAll('.lvl-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.level === currentLevel);
    });
  }

  if (levelPillsContainer) {
    levelPillsContainer.querySelectorAll('.lvl-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const lvl = btn.dataset.level;
        if (SUB_DATA[lvl]) {
          currentLevel = lvl;
          localStorage.setItem('nakama_level', currentLevel);
          playPopSound();
          showBookSelectionStage();
        }
      });
    });
  }

  // Klik Chip Buku -> Kembali ke Pilihan Buku
  if (backToBookBtn) {
    backToBookBtn.addEventListener('click', () => {
      playPopSound();
      showBookSelectionStage();
    });
  }

  // Klik Tombol Back Kiri Atas
  if (navBackBtn) {
    navBackBtn.addEventListener('click', function (e) {
      e.preventDefault();
      if (currentBookKey !== null) {
        playPopSound();
        showBookSelectionStage();
      } else {
        smoothNavigate(this.getAttribute('href'));
      }
    });
  }

  // =========================================================================
  // 2. TAMPILAN 1: TAMPILKAN 2 KARTU BUKU BESAR (CONTOH N5: MINNA 1 & SOUMATOME)
  // =========================================================================
  function showBookSelectionStage() {
    currentBookKey = null;
    updateLevelPills();

    // Sembunyikan Carousel Bab, tampilkan Bento Buku
    if (chapterCarouselStage) chapterCarouselStage.classList.add('hidden');
    if (openModalBtn) openModalBtn.classList.add('hidden');
    if (backToBookBtn) backToBookBtn.classList.add('hidden');
    if (bookSelectionStage) bookSelectionStage.classList.remove('hidden');

    if (stageLevelBadge) stageLevelBadge.textContent = `JLPT ${currentLevel}`;
    if (stageMainTitle) stageMainTitle.textContent = `Pilih Materi ${currentLevel}`;

    if (!bookBentoGrid) return;
    bookBentoGrid.innerHTML = '';
    const books = SUB_DATA[currentLevel];

    Object.keys(books).forEach((bookKey, idx) => {
      const book = books[bookKey];
      const iconSvg = vectorIcons[idx % vectorIcons.length];

      const btnCard = document.createElement('button');
      btnCard.type = 'button';
      btnCard.className = 'book-bento-card';

      btnCard.innerHTML = `
        <div class="book-card-header">
          <span class="book-level-tag">${currentLevel}</span>
          <span class="book-total-tag">${book.total} ${book.itemLabel}</span>
        </div>
        <div class="book-card-center">
          <div class="book-big-icon">${iconSvg}</div>
          <div>
            <h2 class="book-card-name">${book.title}</h2>
            <p class="book-card-desc">${book.desc}</p>
          </div>
        </div>
        <div class="book-card-footer">
          <span class="book-cta-text">Buka ${book.title}</span>
          <div class="book-cta-arrow">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        </div>
      `;

      btnCard.addEventListener('click', () => {
        playPopSound();
        openChapterCarousel(bookKey);
      });

      bookBentoGrid.appendChild(btnCard);
    });
  }

  // =========================================================================
  // 3. TAMPILAN 2: BUKA CAROUSEL BAB SESUAI BUKU YANG DIKLIK
  // =========================================================================
  function openChapterCarousel(bookKey) {
    currentBookKey = bookKey;
    currentIndex = 0;

    const book = SUB_DATA[currentLevel][currentBookKey];

    // Sembunyikan Bento Buku, tampilkan Carousel Bab
    if (bookSelectionStage) bookSelectionStage.classList.add('hidden');
    if (chapterCarouselStage) chapterCarouselStage.classList.remove('hidden');
    if (openModalBtn) openModalBtn.classList.remove('hidden');
    if (backToBookBtn) backToBookBtn.classList.remove('hidden');

    if (activeBookLabel) activeBookLabel.textContent = book.title;

    const startNum = book.startNum;
    const total = book.total;
    const endNum = startNum + total - 1;

    if (modalTagLabel) modalTagLabel.textContent = `${currentLevel} • ${book.title.toUpperCase()} (${startNum}-${endNum})`;
    if (modalTitleLabel) modalTitleLabel.textContent = `Pilih ${book.itemLabel}`;

    container.innerHTML = '';
    if (modalGrid) modalGrid.innerHTML = '';
    cards = [];
    gridItems = [];

    // Folder dasar tempat HTML berada (contoh: Data/N5/Minna1)
    const folderBase = `Data/${currentLevel}/${currentBookKey}`;
    // Path HTML (contoh: Data/N5/Minna1/index.html)
    const targetHtmlPath = book.htmlPath || `${folderBase}/index.html`;

    for (let i = 0; i < total; i++) {
      const babNum = startNum + i;
      const paddedNum = babNum < 10 ? `0${babNum}` : babNum;
      const svgIcon = vectorIcons[i % vectorIcons.length];

      // Nama file JSON sesuai aturanmu: bab1.json, bab26.json, Mori1.json, Soumatome1.json
      const jsonFile = `${book.jsonPrefix}${babNum}.json`;

      // Link ke Data/{Level}/{Kategori}/index.html beserta parameter lengkap
      const targetHref = `${targetHtmlPath}?bab=${babNum}&file=${jsonFile}&kode=kode/${jsonFile}&level=${currentLevel}&kategori=${currentBookKey}`;

      // A. Buat Kartu Bab di Carousel
      const card = document.createElement('a');
      card.href = targetHref;
      card.className = 'chapter-flashcard';
      card.dataset.index = i;

      card.innerHTML = `
        <div class="flashcard-top">
          <span class="badge-status">#${paddedNum}</span>
          <span class="badge-book">${book.title}</span>
        </div>
        <div class="flashcard-body">
          <div class="chapter-icon-box">
            ${svgIcon}
          </div>
          <h2 class="chapter-title">${book.itemLabel} ${babNum}</h2>
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
          currentIndex = i;
          updateCarousel();
        } else {
          e.preventDefault();
          smoothNavigate(this.getAttribute('href'));
        }
      });

      // Efek 3D Tilt
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

      // B. Buat Tombol di Modal Grid
      if (modalGrid) {
        const gridBtn = document.createElement('button');
        gridBtn.type = 'button';
        gridBtn.className = 'chapter-grid-item';
        gridBtn.dataset.index = i;

        gridBtn.innerHTML = `
          <span class="cgi-num">${paddedNum}</span>
          <span class="cgi-label">${book.itemLabel.toUpperCase()}</span>
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

    updateCarousel();
  }

  // === 4. UPDATE POSISI SLIDER CAROUSEL ===
  function updateCarousel() {
    if (!currentBookKey) return;
    playPopSound();

    const book = SUB_DATA[currentLevel][currentBookKey];

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

    const activeBabNum = book.startNum + currentIndex;
    const formatted = activeBabNum < 10 ? `0${activeBabNum}` : activeBabNum;
    if (currentChapterDisplay) {
      currentChapterDisplay.textContent = `${book.itemLabel} ${formatted}`;
    }

    gridItems.forEach((btn, i) => {
      btn.classList.toggle('active', i === currentIndex);
    });
  }

  // === 5. MODAL KONTROL ===
  const chapterModal = document.getElementById('chapterModal');
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

  // === 6. NAVIGASI PANAH, KEYBOARD & SWIPE ===
  const nextBtn = document.getElementById('nextBtn');
  const prevBtn = document.getElementById('prevBtn');

  function goNext() {
    if (currentBookKey && currentIndex < cards.length - 1) {
      currentIndex++;
      updateCarousel();
    }
  }

  function goPrev() {
    if (currentBookKey && currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    }
  }

  if (nextBtn) nextBtn.addEventListener('click', goNext);
  if (prevBtn) prevBtn.addEventListener('click', goPrev);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
    if (!currentBookKey) return;
    if (chapterModal && chapterModal.classList.contains('open')) return;
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'ArrowLeft') goPrev();
  });

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

  // Jalankan: Jika ada ?buku=Minna1 di URL langsung buka carousel, jika tidak tampilkan Pilihan Buku
  if (currentBookKey && SUB_DATA[currentLevel][currentBookKey]) {
    openChapterCarousel(currentBookKey);
  } else {
    showBookSelectionStage();
  }
});