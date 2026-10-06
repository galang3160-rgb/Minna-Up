/* =========================================================
   NAKAMAGAKKOU N5 — Carousel Kosakata (Terhubung ke Time/data/*.json)
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
  const DATA_BASE_DIR = 'Time/data'; // Folder sumber JSON
  const STUDY_PAGE_URL = 'Time/index.html'; // Target halaman belajar

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

  // Update total card count pada topbar/counter
  if (totalCardsCountDOM) {
    totalCardsCountDOM.textContent = totalCards < 10 ? `0${totalCards}` : totalCards;
  }

  // === 3. GENERATE KARTU SECARA DINAMIS DENGAN LINK KE JSON ===
  for (let i = 0; i < totalCards; i++) {
    const item = vocabList[i];
    const jsonPath = `${DATA_BASE_DIR}/${item.path}.json`;

    // Dropdown Navigasi
    if (chapterSelect) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = item.title;
      chapterSelect.appendChild(opt);
    }

    // Elemen Kartu Anchor
    // Membawa query param '?topik=' agar halaman belajar Time/index.html langsung membaca file JSON yang sesuai
    const card = document.createElement('a');
    card.href = `${STUDY_PAGE_URL}?topik=${item.path}`; 
    card.className = 'chapter-flashcard';
    card.dataset.index = i;
    card.dataset.json = jsonPath;
    
    card.innerHTML = `
      <div class="flashcard-header">
        <span class="badge-status">Kosakata</span>
        <span class="topic-counter" id="count-${item.path}">... Kosakata</span>
      </div>
      <div class="flashcard-body">
        <span class="chapter-tag">KATEGORI N5</span>
        <h2 class="chapter-title">${item.title}</h2>
        <p class="chapter-desc">Materi hitungan & satuan ${item.title.toLowerCase()}</p>
      </div>
      <div class="flashcard-footer">
        <span class="action-hint">Mulai Belajar</span>
        <div class="action-icon-circle">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </div>
      </div>
    `;

    // Ambil data JSON untuk menampilkan jumlah kata real-time di badge kartu
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

    // Klik Event: Kartu non-aktif bergeser ke tengah, kartu aktif membuka link
    card.addEventListener('click', function(e) {
      if (!this.classList.contains('active')) {
        e.preventDefault(); 
        currentIndex = parseInt(this.dataset.index);
        updateCarousel();
      }
    });

    // 3D Tilt Hover
    card.addEventListener('mousemove', function(e) {
      if (this.classList.contains('active')) {
        const r = this.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        this.style.transform = `perspective(1000px) rotateX(${-(y / r.height - 0.5) * 6}deg) rotateY(${(x / r.width - 0.5) * 6}deg) scale(1.02)`;
      }
    });

    card.addEventListener('mouseleave', function() {
      if (this.classList.contains('active')) {
        this.style.transform = `translateX(0) scale(1) translateZ(0)`;
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

    // Update Counter & Badge Topbar
    if (currentCardIndexDOM) {
      let dispNum = currentIndex + 1;
      currentCardIndexDOM.textContent = dispNum < 10 ? `0${dispNum}` : dispNum;
    }
    if (chapterSelect && parseInt(chapterSelect.value) !== currentIndex) {
      chapterSelect.value = currentIndex;
    }
    if (topbarBadgeDOM) {
      topbarBadgeDOM.textContent = vocabList[currentIndex].title;
    }
  }

  // === 5. NAVIGASI TOMBOL & KEYBOARD ===
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
      currentIndex = parseInt(e.target.value);
      updateCarousel();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (document.activeElement === chapterSelect) return;
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'ArrowLeft') goPrev();
  });

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
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }

  // Posisi awal
  updateCarousel();
});