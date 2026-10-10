/**
 * ==========================================================================
 * JAYANT PATMASE — CLIENT ENGINE
 * Ultra-clean, high-performance vanilla JavaScript:
 * - Interactive ambient particle mesh canvas
 * - Smooth scrollspy for floating left dock
 * - Mobile responsive slide-out drawer
 * - Hero typewriter animation
 * - Live contact form handler & toast engine
 * - Live Maharashtra (IST) clock
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initParticleCanvas();
  initNavigationScroll();
  initScrollspy();
  initMobileDrawer();
  initTypewriter();
  initLiveClock();
});

/* ==========================================================================
   1. AMBIENT INTERACTIVE PARTICLE CANVAS
   ========================================================================== */
function initParticleCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const mouse = { x: null, y: null, radius: 140 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  const particleCount = Math.min(65, Math.floor((width * height) / 18000));
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      radius: Math.random() * 1.6 + 0.8,
      hue: Math.random() > 0.5 ? 275 : 190 // Purple or Cyan
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      // Mouse gentle repulsion
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          p.x -= (dx / dist) * force * 1.5;
          p.y -= (dy / dist) * force * 1.5;
        }
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 85%, 65%, 0.35)`;
      ctx.fill();

      // Connect nearby particles with subtle glowing lines
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 130) {
          const alpha = (1 - dist / 130) * 0.12;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `hsla(${p.hue}, 80%, 70%, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(render);
  }

  render();
}

/* ==========================================================================
   2. PIXEL-PERFECT NAVIGATION SCROLLER & SCROLLSPY
   ========================================================================== */
function initNavigationScroll() {
  const navAnchors = document.querySelectorAll('a[href^="#"]');

  navAnchors.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#' || href === '#!') return;

      const targetEl = document.querySelector(href);
      if (!targetEl) return;

      e.preventDefault();

      // Close mobile menu drawer if open
      const drawer = document.getElementById('mobile-drawer');
      const overlay = document.getElementById('mobile-drawer-overlay');
      const menuBtn = document.getElementById('mobile-menu-btn');
      if (drawer && drawer.classList.contains('active')) {
        drawer.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        if (menuBtn) menuBtn.classList.remove('open');
      }

      // If scrolling to hero, land cleanly at the very top (0)
      if (href === '#hero') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (history.pushState) history.pushState(null, null, '#hero');
        return;
      }

      // Desktop: dock on left, optimal optical top margin = 28px
      // Mobile (< 1024px): 64px fixed header + 16px buffer = 80px
      const isMobile = window.innerWidth < 1024;
      const topOffset = isMobile ? 78 : 28;

      const elementTop = targetEl.getBoundingClientRect().top + window.pageYOffset;
      const destination = Math.max(0, elementTop - topOffset);

      window.scrollTo({
        top: destination,
        behavior: 'smooth'
      });

      if (history.pushState) {
        history.pushState(null, null, href);
      }
    });
  });
}

function initScrollspy() {
  const sections = document.querySelectorAll('section[id]');
  const dockItems = document.querySelectorAll('.dock-item[data-nav]');
  const mobileLinks = document.querySelectorAll('.mobile-drawer-link[data-mobile-nav]');

  function updateActiveState() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;

    // When scrolled to the bottom of the page, activate 'contact'
    if (scrollY + windowHeight >= docHeight - 70) {
      setActive('contact');
      return;
    }

    // When scrolled to the top, activate 'hero'
    if (scrollY < 180) {
      setActive('hero');
      return;
    }

    const isMobile = window.innerWidth < 1024;
    const probeOffset = isMobile ? 120 : 90;
    let activeId = '';

    sections.forEach((section) => {
      const top = section.getBoundingClientRect().top + scrollY - probeOffset;
      const height = section.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        activeId = section.getAttribute('id');
      }
    });

    if (activeId) {
      setActive(activeId);
    }
  }

  function setActive(id) {
    dockItems.forEach((item) => {
      if (item.getAttribute('data-nav') === id) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    mobileLinks.forEach((link) => {
      if (link.getAttribute('data-mobile-nav') === id) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveState, { passive: true });
  updateActiveState();
}

/* ==========================================================================
   3. MOBILE DRAWER NAVIGATION
   ========================================================================== */
function initMobileDrawer() {
  const btn = document.getElementById('mobile-menu-btn');
  const drawer = document.getElementById('mobile-drawer');
  const overlay = document.getElementById('mobile-drawer-overlay');
  const links = document.querySelectorAll('.mobile-drawer-link');

  if (!btn || !drawer || !overlay) return;

  function toggleMenu() {
    btn.classList.toggle('open');
    drawer.classList.toggle('active');
    overlay.classList.toggle('active');
  }

  function closeMenu() {
    btn.classList.remove('open');
    drawer.classList.remove('active');
    overlay.classList.remove('active');
  }

  btn.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', closeMenu);
  links.forEach((l) => l.addEventListener('click', closeMenu));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}



/* ==========================================================================
   5. HERO DYNAMIC TYPEWRITER EFFECT
   ========================================================================== */
function initTypewriter() {
  const el = document.getElementById('hero-typewriter');
  if (!el) return;

  const phrases = [
      'Software Developer.',
      ' Python Developer.',
      'Java Developer.',
      'Android Developer.',
      'Problem Solver.'
  ];

  let phraseIdx = 0;
  let charIdx = 0;
  let isDeleting = false;

  function type() {
    const current = phrases[phraseIdx];
    if (isDeleting) {
      el.textContent = current.substring(0, charIdx - 1);
      charIdx--;
    } else {
      el.textContent = current.substring(0, charIdx + 1);
      charIdx++;
    }

    let delay = isDeleting ? 45 : 90;

    if (!isDeleting && charIdx === current.length) {
      delay = 2000;
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      delay = 400;
    }

    setTimeout(type, delay);
  }

  setTimeout(type, 1000);
}

/* ==========================================================================
   6. LIVE MAHARASHTRA CLOCK (IST)
   ========================================================================== */
function initLiveClock() {
  const textEl = document.getElementById('ist-time-text');
  if (!textEl) return;

  function update() {
    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      textEl.textContent = timeStr;
    } catch (e) {
      textEl.textContent = new Date().toLocaleTimeString();
    }
  }

  update();
  setInterval(update, 1000);
}

/* ==========================================================================
   9. TOAST NOTIFICATION ENGINE
   ========================================================================== */
function showToast(msg) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span style="color:var(--accent-purple);font-size:1.1rem;">✨</span>
    <span>${escapeHTML(msg)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(15px) scale(0.9)';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3200);
}
window.showToast = showToast;

/* Helper: Escape HTML string to prevent injection */
function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
