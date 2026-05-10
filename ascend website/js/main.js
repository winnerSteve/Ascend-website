/* ━━━ ASCEND — SHARED JS ━━━ */

// ─── PAGE TRANSITION ─────────────────────────────────────
const overlay = document.getElementById('site-overlay');
if (overlay) {
  // Reveal on load
  requestAnimationFrame(() => {
    requestAnimationFrame(() => overlay.classList.add('out'));
  });

  // Cover on navigation
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') ||
        href.startsWith('tel:') || a.target === '_blank') return;
    e.preventDefault();
    overlay.classList.remove('out');
    setTimeout(() => { window.location = href; }, 560);
  });
}

// ─── SCROLL PROGRESS ─────────────────────────────────────
const progressBar = document.getElementById('scroll-progress');
if (progressBar) {
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
    progressBar.style.width = Math.min(pct, 100) + '%';
  }, { passive: true });
}

// ─── CUSTOM CURSOR ────────────────────────────────────────
(function initCursor() {
  if (window.innerWidth <= 900) return;
  document.body.classList.add('custom-cursor');
  const dot  = document.createElement('div'); dot.className  = 'cursor-dot';
  const ring = document.createElement('div'); ring.className = 'cursor-ring';
  document.body.append(dot, ring);
  let px = 0, py = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => { px = e.clientX; py = e.clientY; });
  document.addEventListener('mouseover', e => {
    ring.classList.toggle('hover', !!e.target.closest('a, button, [data-hover], .card, .partner-cell, .accordion-btn'));
  });
  (function tick() {
    dot.style.cssText  = `left:${px}px;top:${py}px`;
    rx += (px - rx) * 0.12; ry += (py - ry) * 0.12;
    ring.style.cssText = `left:${rx}px;top:${ry}px`;
    if (ring.classList.contains('hover')) ring.style.cssText += ';width:46px;height:46px';
    requestAnimationFrame(tick);
  })();
})();

// ─── NAV ─────────────────────────────────────────────────
(function initNav() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  if (!hamburger || !mobileNav) return;
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open');
    document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
  });
  mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Highlight active nav link
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const lp = a.getAttribute('href').split('/').pop();
    if (lp === path) a.classList.add('active');
  });
})();

// ─── CANVAS PARTICLES ────────────────────────────────────
class Particles {
  constructor(canvas) {
    this.c   = canvas;
    this.ctx = canvas.getContext('2d');
    this.pts = [];
    this.mx  = -999; this.my = -999;
    this.isMob = window.innerWidth < 768;
    this.N     = this.isMob ? 38 : 72;
    this.maxD  = this.isMob ? 90 : 115;
    this._resize(); this._spawn();
    window.addEventListener('resize', () => { this._resize(); this._spawn(); });
    window.addEventListener('mousemove', e => {
      const r = this.c.getBoundingClientRect();
      this.mx = e.clientX - r.left;
      this.my = e.clientY - r.top;
    });
    this._draw();
  }
  _resize() {
    this.c.width  = this.c.offsetWidth  || window.innerWidth;
    this.c.height = this.c.offsetHeight || window.innerHeight;
  }
  _spawn() {
    this.pts = Array.from({ length: this.N }, () => ({
      x:  Math.random() * this.c.width,
      y:  Math.random() * this.c.height,
      vx: (Math.random() - .5) * .45,
      vy: (Math.random() - .5) * .45,
      r:  Math.random() * 1.2 + .4,
      a:  Math.random() * .38 + .12,
    }));
  }
  _draw() {
    if (document.hidden) { requestAnimationFrame(() => this._draw()); return; }
    const { c, ctx, pts, mx, my, maxD } = this;
    ctx.clearRect(0, 0, c.width, c.height);

    pts.forEach(p => {
      p.x = ((p.x + p.vx) + c.width)  % c.width;
      p.y = ((p.y + p.vy) + c.height) % c.height;
      // Repel from cursor
      const dx = p.x - mx, dy = p.y - my, d = Math.hypot(dx, dy);
      if (d < 100 && d > 0) { p.x += (dx / d) * (100 - d) * .022; p.y += (dy / d) * (100 - d) * .022; }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(198,169,107,${p.a})`;
      ctx.fill();
    });

    for (let i = 0; i < pts.length - 1; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = Math.hypot(dx, dy);
        if (d < maxD) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(198,169,107,${.1 * (1 - d / maxD)})`;
          ctx.lineWidth = .5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(() => this._draw());
  }
}

// ─── SCROLL REVEAL ────────────────────────────────────────
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.reveal, .reveal-l, .reveal-r').forEach(el => revealObserver.observe(el));

// ─── COUNTUP ──────────────────────────────────────────────
new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const dur = 1800;
    const start = performance.now();
    const isFloat = String(el.dataset.count).includes('.');
    const tick = now => {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 4);
      el.textContent = (isFloat ? (target * ease).toFixed(1) : Math.round(target * ease)) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    entry.target._counted = true;
  });
}, { threshold: 0.6 }).observe
  && document.querySelectorAll('[data-count]').forEach(el => {
    new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !el._counted) {
          el._counted = true;
          const target = parseFloat(el.dataset.count);
          const suffix = el.dataset.suffix || '';
          const dur = 1800;
          const start = performance.now();
          const isF = String(el.dataset.count).includes('.');
          const tick = now => {
            const t = Math.min((now - start) / dur, 1);
            const ease = 1 - Math.pow(1 - t, 4);
            el.textContent = (isF ? (target * ease).toFixed(1) : Math.round(target * ease)) + suffix;
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.6 }).observe(el);
  });

// ─── 3D TILT CARDS ────────────────────────────────────────
if (window.innerWidth > 900) {
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - .5;
      const y = (e.clientY - r.top)  / r.height - .5;
      card.style.transform = `perspective(800px) rotateX(${-y * 9}deg) rotateY(${x * 9}deg) translateZ(8px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.6s ease';
      card.style.transform  = '';
      setTimeout(() => card.style.transition = '', 600);
    });
  });
}

// ─── MAGNETIC BUTTONS ─────────────────────────────────────
if (window.innerWidth > 900) {
  document.querySelectorAll('[data-magnetic]').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r  = btn.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) * .28;
      const dy = (e.clientY - r.top  - r.height / 2) * .28;
      btn.style.transform = `translate(${dx}px,${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform 0.5s var(--ease)';
      btn.style.transform  = '';
      setTimeout(() => btn.style.transition = '', 500);
    });
  });
}

// ─── PARALLAX ────────────────────────────────────────────
if (window.innerWidth > 900) {
  const parallaxEls = [...document.querySelectorAll('[data-parallax]')];
  if (parallaxEls.length) {
    window.addEventListener('scroll', () => {
      parallaxEls.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || .25;
        const sect  = el.closest('section') || el.parentElement;
        const cy = sect.getBoundingClientRect().top + sect.offsetHeight / 2 - window.innerHeight / 2;
        el.style.transform = `translateY(${cy * speed}px)`;
      });
    }, { passive: true });
  }
}

// ─── ACCORDION ────────────────────────────────────────────
document.querySelectorAll('.accordion-item').forEach(item => {
  const btn  = item.querySelector('.accordion-btn');
  const body = item.querySelector('.accordion-body');
  if (!btn || !body) return;
  btn.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.accordion-item.open').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.accordion-body').style.maxHeight = '0';
    });
    if (!isOpen) {
      item.classList.add('open');
      body.style.maxHeight = body.scrollHeight + 'px';
    }
  });
});

// ─── TEXT SPLIT HERO ──────────────────────────────────────
document.querySelectorAll('.split-hero').forEach(el => {
  const html = el.innerHTML;
  // Only split text nodes, preserve inner tags (em etc.)
  el.style.opacity = '1';
  el.style.transform = 'none';
  el.style.animation = 'none';
  // Wrap each word in a span for staggered reveal
  el.querySelectorAll('.char-word').forEach((word, i) => {
    word.style.cssText = `opacity:0;transform:translateY(20px);display:inline-block;
      transition:opacity 0.5s ease ${i * 0.05 + 0.5}s, transform 0.5s ease ${i * 0.05 + 0.5}s`;
    setTimeout(() => { word.style.opacity = '1'; word.style.transform = 'none'; }, 10);
  });
});

// ─── INIT PARTICLES ───────────────────────────────────────
document.querySelectorAll('.hero-canvas').forEach(c => new Particles(c));
