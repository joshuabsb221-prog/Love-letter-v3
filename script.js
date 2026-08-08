document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. CANVAS STARFIELD ANIMATION
     ========================================================================== */
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');

  let stars = [];
  let width = 0;
  let height = 0;

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    initStars();
  }

  function initStars() {
    stars = [];
    // Calculate star count based on screen area density
    const area = width * height;
    const count = Math.floor(area / 3200);

    for (let i = 0; i < count; i++) {
      const isGold = Math.random() < 0.2; // 20% warm gold stars
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.4 + 0.4,
        color: isGold ? '#e5c158' : '#ffffff',
        baseAlpha: Math.random() * 0.6 + 0.2,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.008
      });
    }
  }

  function animateStars() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < stars.length; i++) {
      const star = stars[i];
      star.phase += star.speed;
      // Twinkle calculation
      const alpha = star.baseAlpha + Math.sin(star.phase) * 0.25;
      const clampedAlpha = Math.max(0.05, Math.min(1, alpha));

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = star.color;
      ctx.globalAlpha = clampedAlpha;
      ctx.fill();
    }

    requestAnimationFrame(animateStars);
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Check reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion) {
    animateStars();
  } else {
    // Single static render for reduced motion
    ctx.clearRect(0, 0, width, height);
    stars.forEach(star => {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = star.color;
      ctx.globalAlpha = star.baseAlpha;
      ctx.fill();
    });
  }


  /* ==========================================================================
     2. INTERSECTION OBSERVER FOR SCROLL REVEALS
     ========================================================================== */
  const revealElements = document.querySelectorAll('.reveal');

  if (prefersReducedMotion) {
    revealElements.forEach(el => el.classList.add('visible'));
  } else {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.12
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach(el => revealObserver.observe(el));
  }


  /* ==========================================================================
     3. SCROLL HINT FADE OUT
     ========================================================================== */
  const scrollHint = document.getElementById('scrollHint');
  if (scrollHint) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 80) {
        scrollHint.style.opacity = '0';
      } else {
        scrollHint.style.opacity = '0.75';
      }
    }, { passive: true });
  }


  /* ==========================================================================
     4. SURPRISE BUTTON INTERACTION & PARTICLES
     ========================================================================== */
  const surpriseBtn = document.getElementById('surpriseBtn');
  const surpriseMessage = document.getElementById('surpriseMessage');

  if (surpriseBtn && surpriseMessage) {
    surpriseBtn.addEventListener('click', () => {
      // Fade out button
      surpriseBtn.classList.add('fade-out');

      setTimeout(() => {
        surpriseBtn.style.display = 'none';
        surpriseMessage.classList.remove('hidden');
        // Trigger reflow
        void surpriseMessage.offsetWidth;
        surpriseMessage.classList.add('visible-msg');
      }, 400);

      // Trigger particle burst if motion is allowed
      if (!prefersReducedMotion) {
        spawnSurpriseParticles();
      }
    });
  }

  function spawnSurpriseParticles() {
    const particleSymbols = ['✨', '⭐', '🌸', '💫', '✦', '💖', '🌿'];
    const particleColors = ['#e5c158', '#cbb4e3', '#e8b4b8', '#9eb89e', '#f4efe6'];
    const count = 32;

    const btnRect = surpriseBtn.getBoundingClientRect();
    const startX = btnRect.left + btnRect.width / 2;
    const startY = btnRect.top + btnRect.height / 2;

    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      // Select random symbol or small star
      const symbol = particleSymbols[Math.floor(Math.random() * particleSymbols.length)];
      particle.textContent = symbol;

      // Randomize position across window width near bottom
      const posX = startX + (Math.random() * 240 - 120);
      const posY = startY + (Math.random() * 40 - 20);

      // Custom CSS properties for randomized animation trajectory
      const sway = (Math.random() * 120 - 60) + 'px';
      const distance = (Math.random() * 220 + 150) + 'px';
      const duration = (Math.random() * 1.5 + 2.0) + 's';
      const color = particleColors[Math.floor(Math.random() * particleColors.length)];

      particle.style.left = posX + 'px';
      particle.style.top = posY + 'px';
      particle.style.color = color;
      particle.style.setProperty('--sway', sway);
      particle.style.setProperty('--distance', distance);
      particle.style.setProperty('--duration', duration);

      document.body.appendChild(particle);

      // Clean up particle DOM element after animation completes
      setTimeout(() => {
        if (particle && particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 3500);
    }
  }

});
