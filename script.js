document.addEventListener('DOMContentLoaded', () => {
  // === 1. SPLASH SCREEN ===
  setTimeout(() => {
    const splash = document.getElementById('splash');
    if (splash) {
      splash.classList.add('hidden');
      setTimeout(() => { splash.style.display = 'none'; }, 650);
    }
  }, 1500);

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const $ = id => document.getElementById(id);

  // === 2. VIEW SWITCHING (MAIN <-> KANJI / KOTOBA) ===
  const viewMain = $('viewMain');
  const viewKanji = $('viewKanji');
  const viewKotoba = $('viewKotoba');

  const swapView = (fromEl, toEl) => {
    if (!fromEl || !toEl) return;
    fromEl.classList.add('fade-out');
    setTimeout(() => {
      fromEl.classList.remove('active', 'fade-out');
      toEl.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 240);
  };

  $('btnBackFromKanji')?.addEventListener('click', () => swapView(viewKanji, viewMain));$('btnBackFromKotoba')?.addEventListener('click', () => swapView(viewKotoba, viewMain));

  // Klik Kanji -> Buka Submenu Kanji
  $('btnKanji')?.addEventListener('click', function (e) {
    e.preventDefault();
    const icon = this.querySelector('.icon-box') || this;
    icon.classList.add('spin-anim');
    setTimeout(() => {
      icon.classList.remove('spin-anim');
      swapView(viewMain, viewKanji);
    }, 420);
  });

  // Klik Kotoba -> Buka Submenu Kotoba
  $('btnKotoba')?.addEventListener('click', function (e) {
    e.preventDefault();
    const icon = this.querySelector('.icon-box') || this;
    icon.classList.add('spin-anim');
    setTimeout(() => {
      icon.classList.remove('spin-anim');
      swapView(viewMain, viewKotoba);
    }, 420);
  });

  // Klik Kartu Link Langsung (Angka, Pemula, N5, N4)
  document.querySelectorAll('.tile-link').forEach(card => {
    card.addEventListener('click', function (e) {
      e.preventDefault();
      const href = this.getAttribute('href');
      const icon = this.querySelector('.icon-box') || this;
      icon.classList.add('spin-anim');
      setTimeout(() => {
        icon.classList.remove('spin-anim');
        if (href && href !== '#') window.location.href = href;
      }, 420);
    });
  });

  if (reduce) return;

  // === 3. PARALLAX AMBIENT ORB ===
  const sun = $('sun');
  if (sun) {
    addEventListener('pointermove', e => {
      sun.style.transform = `translate(${(e.clientX / innerWidth - 0.5) * -36}px, ${(e.clientY / innerHeight - 0.5) * -36}px)`;
    });
  }

  // === 4. GEOMETRIC SPARKS ON CLICK ===
  const fx = $('fx');
  const sparkColors = ['#DCFCE7', '#E0F2FE', '#FEF3C7', '#E9D5FF'];
  addEventListener('pointerdown', e => {
    if (!fx) return;
    const pulse = document.createElement('div');
    pulse.className = 'pulse';
    pulse.style.left = e.clientX + 'px';
    pulse.style.top = e.clientY + 'px';
    pulse.onanimationend = () => pulse.remove();
    fx.appendChild(pulse);

    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6 + Math.random() * 0.4;
      const dist = 45 + Math.random() * 55;
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

  if (!fine) return;

  // === 5. 3D TILT DESKTOP ===
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const rotX = -((y / r.height - 0.5) * 9);
      const rotY = (x / r.width - 0.5) * 9;
      card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-3px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.2s ease';
      card.style.transform = '';
      setTimeout(() => { card.style.transition = ''; }, 350);
    });
  });

  // === 6. SMOOTH MOUSE TRAIL ===
  const cv = $('trail');
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
});