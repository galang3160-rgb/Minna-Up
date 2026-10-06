document.addEventListener('DOMContentLoaded', () => {
  // === SISTEM TEMA DARK/LIGHT MODE ===
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('theme') || 'light'; 
  
  document.documentElement.setAttribute('data-theme', savedTheme);

  themeToggle.addEventListener('click', () => {
    let currentTheme = document.documentElement.getAttribute('data-theme');
    let targetTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', targetTheme);
    localStorage.setItem('theme', targetTheme); 
  });


  // === SPLASH SCREEN LOGIC ===
  setTimeout(() => {
    const splash = document.getElementById('splash');
    splash.classList.add('hidden');
    setTimeout(() => { splash.style.display = 'none'; }, 800);
  }, 2200);

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const $ = id => document.getElementById(id);

  /* === View Switching dengan Efek Fade Out & Blur === */
  const main = $('viewMain'), kot =$('viewKotoba');
  
  const swap = (a, b) => { 
    a.classList.add('fade-out'); // Animasi Keluar
    
    setTimeout(() => { 
      a.classList.remove('active', 'fade-out'); 
      b.classList.add('active'); // Tampilkan halaman baru dengan Animasi Masuk
    }, 400); 
  };
  
  $('btnBackToMain')?.addEventListener('click', () => swap(kot, main));

  /* === ANIMASI KLIK 360 DERAJAT === */
  const btnKotoba = $('btnKotoba');
  if (btnKotoba) {
    btnKotoba.addEventListener('click', function(e) {
      e.preventDefault(); 
      const visual = this.querySelector('.card-visual') || this.querySelector('.level-visual');
      visual.classList.add('spin-anim'); 
      
      setTimeout(() => {
        visual.classList.remove('spin-anim');
        swap(main, kot);
      }, 600);
    });
  }

  document.querySelectorAll('.tile-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault(); 
      const targetHref = this.getAttribute('href');
      const visual = this.querySelector('.card-visual') || this.querySelector('.level-visual');
      visual.classList.add('spin-anim'); 
      
      setTimeout(() => {
        visual.classList.remove('spin-anim');
        if (targetHref && targetHref !== '#') {
          window.location.href = targetHref;
        }
      }, 600);
    });
  });

  if (reduce) return;

  /* Ambient Parallax Orb */
  const sun = $('sun');
  addEventListener('pointermove', e => {
    sun.style.transform = `translate(${(e.clientX / innerWidth - 0.5) * -40}px, ${(e.clientY / innerHeight - 0.5) * -40}px)`;
  });

  /* Click Effects Partikel */
  const fx = $('fx'), kana = [...'あいうえお桜学心和光緑葉'];
  addEventListener('pointerdown', e => {
    const p = document.createElement('div');
    p.className = 'pulse'; 
    p.style.left = e.clientX + 'px'; 
    p.style.top = e.clientY + 'px';
    p.onanimationend = () => p.remove(); 
    fx.appendChild(p);
    
    if (e.target.closest('.theme-btn')) return;
    
    for (let i = 0; i < 6; i++) {
      const a = Math.PI * 2 * i / 6 + Math.random() * 0.5;
      const d = 60 + Math.random() * 80;
      const el = document.createElement('span');
      el.className = 'k'; 
      el.textContent = kana[Math.random() * kana.length | 0];
      el.style.cssText = `left:${e.clientX}px; top:${e.clientY}px; font-size:${16 + Math.random() * 14}px; --dx:${Math.cos(a) * d}px; --dy:${Math.sin(a) * d - 30}px; --r:${(Math.random() - 0.5) * 60}deg`;
      el.onanimationend = () => el.remove(); 
      fx.appendChild(el);
    }
  });

  if (!fine) return;

  /* === 3D Tilt Effect & Dynamic Mouse Shadow === */
  document.querySelectorAll('[data-tilt]').forEach(c => {
    
    c.addEventListener('mousemove', e => {
      const r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      
      // 1. Kalkulasi untuk sudut Tilt 3D
      c.style.setProperty('--mx', x + 'px'); 
      c.style.setProperty('--my', y + 'px');
      c.style.transform = `perspective(1000px) rotateX(${-(y / r.height - 0.5) * 10}deg) rotateY(${(x / r.width - 0.5) * 10}deg) scale(1.02)`;
      
      // 2. Kalkulasi untuk arah Bayangan (Shadow Tracking) khusus kartu Level
      const centerX = r.width / 2;
      const centerY = r.height / 2;
      const shadowX = ((x - centerX) / centerX) * 25; 
      const shadowY = ((y - centerY) / centerY) * 25;
      
      c.style.setProperty('--sx', shadowX);
      c.style.setProperty('--sy', shadowY);
    });

    c.addEventListener('mouseleave', () => {
      c.style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
      c.style.transform = ''; 
      
      // Reset bayangan ke tengah
      c.style.setProperty('--sx', 0);
      c.style.setProperty('--sy', 0);
      
      setTimeout(() => c.style.transition = '', 500);
    });
  });

  /* Cursor Trail */
  const cv = $('trail'), ctx = cv.getContext('2d');
  const fit = () => { cv.width = innerWidth; cv.height = innerHeight; }; 
  fit(); 
  addEventListener('resize', fit);
  
  let mx = -99, my = -99, x = mx, y = my; 
  const pts = [], em = [];
  
  addEventListener('pointermove', e => {
    mx = e.clientX; my = e.clientY;
    if (Math.random() > 0.6) {
      em.push({ x: mx, y: my, vx: (Math.random() - 0.5) * 0.5, vy: -Math.random() * 1 - 0.2, s: Math.random() * 2 + 1, a: 1 });
    }
    if (em.length > 50) em.shift();
  });
  
  (function loop() {
    x += (mx - x) * 0.3; y += (my - y) * 0.3;
    pts.push({ x, y }); if (pts.length > 20) pts.shift();
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.globalCompositeOperation = 'source-over'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    
    for (let i = 1; i < pts.length; i++) {
      const t = i / pts.length;
      ctx.strokeStyle = `rgba(16, 185, 129, ${t * 0.3})`;
      ctx.lineWidth = t * 12; ctx.beginPath(); ctx.moveTo(pts[i - 1].x, pts[i - 1].y); ctx.lineTo(pts[i].x, pts[i].y); ctx.stroke();
    }
    for (let i = em.length - 1; i >= 0; i--) {
      const p = em[i]; p.x += p.vx; p.y += p.vy; p.a -= 0.02;
      if (p.a <= 0) { em.splice(i, 1); continue; }
      ctx.fillStyle = `rgba(52, 211, 153, ${p.a * 0.8})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fill();
    }
    requestAnimationFrame(loop);
  })();
});