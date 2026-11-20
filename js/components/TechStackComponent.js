/**
 * TechStackComponent.js
 * Encapsulates the Tech Stack Keychains Wall Rack:
 * Kinetic drag & touch-scrollable with infinite wrapping,
 * interactive pendulum swing animations, and spring-mass jiggle physics.
 */

export class TechStackComponent {
  constructor() {
    this.viewport = document.getElementById('marqueeViewport');
    this.track = document.getElementById('keychainsTrack');
    if (!this.track || !this.viewport) return;

    this.initRack();
  }

  initRack() {
    const items = this.track.querySelectorAll('.keychain-item');
    const group1 = this.track.querySelector('.marquee-group');

    let loopWidth = group1 ? group1.offsetWidth : 1200;
    const updateLoopWidth = () => {
      if (group1 && group1.offsetWidth > 100) {
        loopWidth = group1.offsetWidth;
      }
    };
    window.addEventListener('resize', updateLoopWidth);
    setTimeout(updateLoopWidth, 120);

    const triggerSwing = (item) => {
      item.classList.remove('is-swinging');
      void item.offsetWidth;
      item.classList.add('is-swinging');
      clearTimeout(item._swingTimer);
      item._swingTimer = setTimeout(() => {
        item.classList.remove('is-swinging');
      }, 2500);
    };

    let currentX = 0;
    let targetVelocity = 0;
    const autoSpeed = -0.75;
    let isAutoPaused = false;
    let autoResumeTimer = null;

    const pauseAutoScroll = () => {
      isAutoPaused = true;
      clearTimeout(autoResumeTimer);
    };

    const scheduleAutoResume = (delay = 2000) => {
      clearTimeout(autoResumeTimer);
      autoResumeTimer = setTimeout(() => {
        isAutoPaused = false;
      }, delay);
    };

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastTime = performance.now();
    let dragDeltaTotal = 0;
    let isHorizontalGesture = null;

    this.viewport.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button, a')) return;

      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      lastX = e.clientX;
      lastTime = performance.now();
      dragDeltaTotal = 0;
      targetVelocity = 0;
      isHorizontalGesture = null;

      pauseAutoScroll();
      this.viewport.classList.add('is-dragging');
      try { this.viewport.setPointerCapture(e.pointerId); } catch (_) { }
    });

    this.viewport.addEventListener('pointermove', (e) => {
      if (!isDragging) return;

      const totalDx = e.clientX - startX;
      const totalDy = e.clientY - startY;

      if (isHorizontalGesture === null) {
        if (Math.abs(totalDx) > 7 || Math.abs(totalDy) > 7) {
          if (Math.abs(totalDx) >= Math.abs(totalDy)) {
            isHorizontalGesture = true;
          } else {
            isHorizontalGesture = false;
            isDragging = false;
            this.viewport.classList.remove('is-dragging');
            try { this.viewport.releasePointerCapture(e.pointerId); } catch (_) { }
            scheduleAutoResume(1000);
            return;
          }
        }
      }

      if (isHorizontalGesture === false) return;

      const dx = e.clientX - lastX;
      const now = performance.now();
      const dt = Math.max(8, now - lastTime);

      dragDeltaTotal += Math.abs(dx);
      currentX += dx;

      targetVelocity = (dx / dt) * 16.6;

      lastX = e.clientX;
      lastTime = now;
    });

    const endDrag = (e) => {
      if (!isDragging) return;
      isDragging = false;
      this.viewport.classList.remove('is-dragging');
      if (e && e.pointerId) {
        try { this.viewport.releasePointerCapture(e.pointerId); } catch (_) { }
      }

      targetVelocity = Math.max(-28, Math.min(28, targetVelocity));
      scheduleAutoResume(2000);
    };

    this.viewport.addEventListener('pointerup', endDrag);
    this.viewport.addEventListener('pointercancel', endDrag);

    this.viewport.addEventListener(
      'wheel',
      (e) => {
        const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
        const delta = isHorizontal ? e.deltaX : e.deltaY;

        if (isHorizontal || e.shiftKey || Math.abs(delta) > 0) {
          e.preventDefault();
          pauseAutoScroll();
          currentX -= delta * 0.95;
          targetVelocity = -delta * 0.12;
          scheduleAutoResume(1800);
        }
      },
      { passive: false }
    );

    this.viewport.addEventListener('mouseenter', () => {
      pauseAutoScroll();
    });

    this.viewport.addEventListener('mouseleave', () => {
      if (!isDragging) {
        scheduleAutoResume(1200);
      }
    });

    const prevBtn = document.getElementById('rackPrevBtn');
    const nextBtn = document.getElementById('rackNextBtn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        pauseAutoScroll();
        targetVelocity += 16;
        scheduleAutoResume(2400);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        pauseAutoScroll();
        targetVelocity -= 16;
        scheduleAutoResume(2400);
      });
    }

    items.forEach((item) => {
      item.addEventListener('click', (e) => {
        if (dragDeltaTotal > 7) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        triggerSwing(item);
      });
    });

    let isNearSkills = false;
    const skillsSec = document.getElementById('skills');
    if (skillsSec && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          isNearSkills = entries[0].isIntersecting;
        },
        { rootMargin: '350px 0px' }
      );
      observer.observe(skillsSec);
    } else {
      isNearSkills = true;
    }

    let lastFrameTime = performance.now();
    const animateTrack = () => {
      requestAnimationFrame(animateTrack);

      if (!isNearSkills) {
        lastFrameTime = performance.now();
        return;
      }

      const now = performance.now();
      const deltaMs = Math.min(32, now - lastFrameTime);
      lastFrameTime = now;
      const timeScale = deltaMs / 16.66;

      if (!isDragging) {
        if (Math.abs(targetVelocity) > 0.05) {
          currentX += targetVelocity * timeScale;
          targetVelocity *= Math.pow(0.92, timeScale);
        } else {
          targetVelocity = 0;
          if (!isAutoPaused) {
            currentX += autoSpeed * timeScale;
          }
        }
      }

      if (loopWidth > 50) {
        while (currentX <= -loopWidth) {
          currentX += loopWidth;
        }
        while (currentX > 0) {
          currentX -= loopWidth;
        }
      }

      this.track.style.transform = `translate3d(${currentX.toFixed(2)}px, 0, 0)`;
    };
    requestAnimationFrame(animateTrack);

    // Keychain vertical jiggle physics
    const jiggleWraps = Array.from(this.track.querySelectorAll('.keychain-jiggle-wrap'));
    if (jiggleWraps.length > 0) {
      const springs = jiggleWraps.map((el, i) => ({
        el,
        angle: 0,
        velocity: 0,
        stiffness: 0.125 + (i % 4) * 0.015,
        damping: 0.815 + (i % 3) * 0.012,
      }));

      let lastScrollY = window.scrollY;
      let lastTimeSpring = performance.now();
      let animFrameId = null;

      const updateSprings = () => {
        let isMoving = false;

        for (let i = 0; i < springs.length; i++) {
          const s = springs[i];
          const force = -s.stiffness * s.angle;
          s.velocity = (s.velocity + force) * s.damping;
          s.angle += s.velocity;

          if (s.angle > 26) s.angle = 26;
          if (s.angle < -26) s.angle = -26;

          if (Math.abs(s.angle) > 0.05 || Math.abs(s.velocity) > 0.05) {
            isMoving = true;
            s.el.style.transform = `rotate(${s.angle.toFixed(2)}deg)`;
          } else if (s.angle !== 0) {
            s.angle = 0;
            s.velocity = 0;
            s.el.style.transform = '';
          }
        }

        if (isMoving) {
          animFrameId = requestAnimationFrame(updateSprings);
        } else {
          animFrameId = null;
        }
      };

      window.addEventListener(
        'scroll',
        () => {
          const now = performance.now();
          const currentY = window.scrollY;
          const dt = Math.max(now - lastTimeSpring, 8);
          const dy = currentY - lastScrollY;

          lastScrollY = currentY;
          lastTimeSpring = now;

          if (!isNearSkills) return;

          const v = (dy / dt) * 16;
          if (Math.abs(v) < 0.6) return;

          const impulse = Math.max(Math.min(v * 0.42, 14), -14);

          for (let i = 0; i < springs.length; i++) {
            const s = springs[i];
            const factor = 0.85 + (i % 5) * 0.07;
            s.velocity += impulse * factor;
            if (s.velocity > 28) s.velocity = 28;
            if (s.velocity < -28) s.velocity = -28;
          }

          if (!animFrameId) {
            animFrameId = requestAnimationFrame(updateSprings);
          }
        },
        { passive: true }
      );
    }
  }
}
