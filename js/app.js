/**
 * app.js
 * Editorial Cream & Crimson Magazine Portfolio
 * Clean Modular Architecture: Orchestrates independent component modules.
 * Features:
 * - Independent Three.js Scenes & Components:
 *   • HeroComponent: Peeking character anchored to Hero background (moves with page, zero jiggle)
 *   • AboutComponent: Diorama bust embedded directly inside #aboutFrame (100% stuck to background)
 *   • EducationComponent: Full-body character on center stage with dynamic outfit switch ('ipb' vs 'smk')
 *   • TechStackComponent: Kinetic drag & touch-scrollable Keychains Wall Rack with physics pendulum swing
 *   • ProjectsComponent: 3D rotating coin turntable selector & interactive project detail hub
 * - 0% CPU/GPU Sleep Mode when sections are offscreen via IntersectionObserver
 * - True 3D raycasted cursor gaze tracking across all active characters
 * - Full zoom protection and 100% responsive layout across mobile and desktop
 */

import * as THREE from 'three';
import { SkinGenerator } from './SkinGenerator.js';
import { HeroComponent } from './components/HeroComponent.js';
import { AboutComponent } from './components/AboutComponent.js';
import { EducationComponent } from './components/EducationComponent.js';
import { TechStackComponent } from './components/TechStackComponent.js';
import { ProjectsComponent } from './components/ProjectsComponent.js';
import { ContactComponent } from './components/ContactComponent.js';

class App {
  constructor() {
    this.mouseNDC = new THREE.Vector2(0, 0);
    this.raycaster = new THREE.Raycaster();
    this.clock = new THREE.Clock();

    // Mobile device performance detection
    this.isMobileDevice = typeof window !== 'undefined' && (
      window.innerWidth <= 900 || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
    );

    // Shared procedural Skin Generator
    this.skinGenerator = new SkinGenerator();

    // Instantiate Modular Components
    this.heroComponent = new HeroComponent(this.skinGenerator, this.isMobileDevice);
    this.aboutComponent = new AboutComponent(this.skinGenerator, this.isMobileDevice);
    this.eduComponent = new EducationComponent(this.skinGenerator, this.isMobileDevice);
    this.techStackComponent = new TechStackComponent();
    this.projectsComponent = new ProjectsComponent(this.isMobileDevice);
    this.contactComponent = new ContactComponent(this.skinGenerator, this.isMobileDevice);

    // Visibility flags for 0% GPU sleep mode
    this.isHeroVisible = true;
    this.isAboutVisible = false;
    this.isEduVisible = false;
    this.isProjVisible = false;
    this.isContactVisible = false;

    // Global coordinator initialization
    this.initVisibilityObservers();
    this.initGlobalEventListeners();
    this.initZoomProtection();

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  // ========================================================
  // VISIBILITY OBSERVERS (0% GPU Sleep Mode)
  // ========================================================
  initVisibilityObservers() {
    const heroEl = document.querySelector('.hero-section');
    if (heroEl && 'IntersectionObserver' in window) {
      const heroObserver = new IntersectionObserver((entries) => {
        this.isHeroVisible = entries[0].isIntersecting;
      }, { rootMargin: '120px 0px' });
      heroObserver.observe(heroEl);
    }

    const aboutEl = document.getElementById('about');
    if (aboutEl && 'IntersectionObserver' in window) {
      const aboutObserver = new IntersectionObserver((entries) => {
        this.isAboutVisible = entries[0].isIntersecting;
        if (entries[0].isIntersecting && this.aboutComponent) {
          this.aboutComponent.triggerEntrance();
        }
      }, { rootMargin: '150px 0px' });
      aboutObserver.observe(aboutEl);
    }

    const eduEl = document.getElementById('education');
    if (eduEl && 'IntersectionObserver' in window) {
      const eduObserver = new IntersectionObserver((entries) => {
        this.isEduVisible = entries[0].isIntersecting;
      }, { rootMargin: '150px 0px' });
      eduObserver.observe(eduEl);
    }

    const projEl = document.getElementById('projects');
    if (projEl && 'IntersectionObserver' in window) {
      const projObserver = new IntersectionObserver((entries) => {
        this.isProjVisible = entries[0].isIntersecting;
      }, { rootMargin: '150px 0px' });
      projObserver.observe(projEl);
    }

    const contactEl = document.getElementById('contact');
    if (contactEl && 'IntersectionObserver' in window) {
      const contactObserver = new IntersectionObserver((entries) => {
        this.isContactVisible = entries[0].isIntersecting;
        if (entries[0].isIntersecting && this.contactComponent) {
          this.contactComponent.triggerPlaceCard();
        }
      }, { threshold: 0.2, rootMargin: '100px 0px' });
      contactObserver.observe(contactEl);
    }
  }

  // ========================================================
  // GLOBAL EVENT LISTENERS (Resize & Gaze Tracking)
  // ========================================================
  initGlobalEventListeners() {
    let lastInnerWidth = window.innerWidth;
    let lastInnerHeight = window.innerHeight;

    window.addEventListener('resize', () => {
      const newW = window.innerWidth;
      const newH = window.innerHeight;

      const isWidthChanged = Math.abs(newW - lastInnerWidth) > 6;
      const isMajorHeightChanged = Math.abs(newH - lastInnerHeight) > 120;

      if (isWidthChanged || isMajorHeightChanged) {
        lastInnerWidth = newW;
        lastInnerHeight = newH;

        // Dispatch resize to components
        if (this.heroComponent) this.heroComponent.resize(newW, newH);
        if (this.aboutComponent) this.aboutComponent.resize();
        if (this.eduComponent) this.eduComponent.resize();
        if (this.projectsComponent) this.projectsComponent.resize();
        if (this.contactComponent) this.contactComponent.resize();
      }
    });

    // Cursor / Touch gaze tracking with passive listeners
    window.addEventListener('mousemove', (e) => {
      this.mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        this.mouseNDC.x = (touch.clientX / window.innerWidth) * 2 - 1;
        this.mouseNDC.y = -(touch.clientY / window.innerHeight) * 2 + 1;
      }
    }, { passive: true });
  }

  // ========================================================
  // ZOOM PROTECTION
  // ========================================================
  initZoomProtection() {
    window.addEventListener(
      'wheel',
      (e) => {
        if (e.ctrlKey) {
          e.preventDefault();
        }
      },
      { passive: false }
    );

    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (
          e.key === '-' ||
          e.key === '_' ||
          e.key === '+' ||
          e.key === '=' ||
          e.key === '0' ||
          e.keyCode === 189 ||
          e.keyCode === 187 ||
          e.keyCode === 107 ||
          e.keyCode === 109 ||
          e.keyCode === 96 ||
          e.keyCode === 48
        ) {
          e.preventDefault();
        }
      }
    });

    document.addEventListener('gesturestart', (e) => e.preventDefault());
    document.addEventListener('gesturechange', (e) => e.preventDefault());
    document.addEventListener('gestureend', (e) => e.preventDefault());
  }

  // ========================================================
  // CENTRAL ANIMATION LOOP
  // ========================================================
  animate() {
    requestAnimationFrame(this.animate);
    if (document.hidden) return;

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    // Dispatch render to visible components
    if (this.heroComponent) {
      this.heroComponent.render(delta, time, this.mouseNDC, this.raycaster, this.isHeroVisible);
    }

    if (this.aboutComponent) {
      this.aboutComponent.render(delta, time, this.mouseNDC, this.raycaster, this.isAboutVisible);
    }

    if (this.eduComponent) {
      this.eduComponent.render(delta, time, this.mouseNDC, this.raycaster, this.isEduVisible);
    }

    if (this.projectsComponent) {
      this.projectsComponent.render(delta, time, this.isProjVisible);
    }

    if (this.contactComponent) {
      this.contactComponent.render(delta, time, this.mouseNDC, this.raycaster, this.isContactVisible);
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new App();
});
