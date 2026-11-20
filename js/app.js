/**
 * app.js
 * Editorial Cream & Crimson Magazine Portfolio
 * Features:
 * - Independent Three.js Scenes:
 *   • Hero Section: Peeking character anchored to Hero background (moves with page, zero jiggle)
 *   • About Section: Diorama bust embedded directly inside #aboutFrame (100% stuck to background, zero scroll lag/jiggle)
 *   • Education Section: Full-body character standing in center stage on lighted pedestal with dynamic outfit switch ('ipb' vs 'smk')
 * - 0% CPU/GPU Sleep Mode when sections are offscreen via IntersectionObserver
 * - True 3D raycasted cursor gaze tracking across all active characters
 * - Costume switch 360 spin animation with playful hop
 * - Kinetic drag & touch-scrollable Tech Stack Keychains Wall Rack with physics pendulum swing
 * - Full zoom protection and 100% responsive layout across mobile and desktop
 */

import * as THREE from 'three';
import { SkinGenerator } from './SkinGenerator.js';
import { MinecraftCharacter } from './MinecraftCharacter.js';

class App {
  constructor() {
    this.mouseNDC = new THREE.Vector2(0, 0);
    this.raycaster = new THREE.Raycaster();
    this.clock = new THREE.Clock();

    // Mobile device performance detection
    this.isMobileDevice = typeof window !== 'undefined' && (
      window.innerWidth <= 900 || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
    );

    // 1. Skin generator for both IPB & SMK uniforms
    this.skinGenerator = new SkinGenerator();

    // 2. Hero Peeking Intro state
    const initialScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    const heroH = typeof window !== 'undefined' ? window.innerHeight : 800;

    if (initialScrollY > heroH * 0.2) {
      this.heroPeekingIntroProgress = 1;
      this.isHeroIntroPlaying = false;
    } else {
      this.heroPeekingIntroProgress = 0;
      this.isHeroIntroPlaying = true;
      this.heroIntroDuration = 1.25;
      this.heroIntroTimer = -0.15; // 150ms delay before popping up
    }

    // 3. About Frame Emergence state
    this.aboutEntranceProgress = 0;
    this.isAboutEntrancePlaying = false;
    this.aboutEntranceDuration = 0.95;
    this.aboutEntranceTimer = 0;
    this.aboutEntranceTriggered = false;

    // 4. Education Journey Data & State
    this.currentEduIndex = 0;
    this.eduData = [
      {
        id: 'ipb',
        levelTag: 'Perguruan Tinggi Negeri • Vokasi',
        schoolName: 'IPB University',
        major: 'D4 Teknologi Rekayasa Perangkat Lunak',
        period: '2024 — 2028 (Aktif)',
        summary: 'Fokus mendalam pada rekayasa perangkat lunak modern, arsitektur aplikasi web terdistribusi, visual 3D interaktif, dan kepemimpinan kreatif.',
        location: 'Bogor, Jawa Barat',
        costumeLabel: 'Kostum: Jas Almamater IPB',
        achieveTitle: 'Pengalaman & Organisasi',
        achievements: [
          { title: 'Ketua Umum Obscura Photography Club', sub: 'Periode 2025/2026 • Kepemimpinan & Manajemen Organisasi' },
          { title: 'Wakil Ketua Pelaksana Hunting Akbar 2025', sub: 'Diselenggarakan oleh Obscura Photography Club' },
          { title: 'Juara 2 Short Movie Competition di Portal 8', sub: 'BEM Sekolah Vokasi IPB University' },
          { title: 'Juara 2 Short Movie Competition di IT-CAS', sub: 'Amikom Surakarta • Tingkat Nasional' }
        ]
      },
      {
        id: 'smk',
        levelTag: 'Sekolah Menengah Kejuruan Negeri',
        schoolName: 'SMKN 5 Kota Bekasi',
        major: 'Rekayasa Perangkat Lunak (RPL)',
        period: '2021 — 2024 (Lulus)',
        summary: 'Mempelajari fondasi logika rekayasa perangkat lunak, algoritma pemrograman, perancangan basis data, dan pengembangan aplikasi web.',
        location: 'Kota Bekasi, Jawa Barat',
        costumeLabel: 'Kostum: Seragam Putih-Abu SMK',
        achieveTitle: 'Prestasi & Pengalaman',
        achievements: [
          { title: 'Lulusan Terbaik Program Studi Rekayasa Perangkat Lunak', sub: 'Angkatan 2023/2024 • Prestasi Akademik Tertinggi' },
          { title: 'Divisi Humas Pentas Seni Algorithm of Creativity', sub: 'Humas, Komunikasi & Publikasi Acara Kreatif' }
        ]
      }
    ];

    // Visibility flags for 0% GPU sleep mode
    this.isHeroVisible = true;
    this.isAboutVisible = false;
    this.isEduVisible = false;

    // Initialize scenes
    this.initHeroScene();
    this.initAboutScene();
    this.initEduScene();
    this.initVisibilityObservers();
    this.initEventListeners();
    this.initKeychainsRack();
    this.initZoomProtection();

    // Populate initial Education data
    this.switchEducation(0, false);

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  // ========================================================
  // 1. HERO SCENE (Anchored inside .hero-section)
  // ========================================================
  initHeroScene() {
    const container = document.getElementById('heroCanvasContainer');
    if (!container) return;

    this.heroScene = new THREE.Scene();
    this.heroCamera = new THREE.PerspectiveCamera(
      36,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.heroCamera.position.set(0, 0, 4.2);

    const dpr = this.isMobileDevice ? Math.min(window.devicePixelRatio, 1.25) : Math.min(window.devicePixelRatio, 2);

    this.heroRenderer = new THREE.WebGLRenderer({
      antialias: !this.isMobileDevice,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.heroRenderer.setSize(window.innerWidth, window.innerHeight);
    this.heroRenderer.setPixelRatio(dpr);
    this.heroRenderer.setClearColor(0x000000, 0);
    this.heroRenderer.shadowMap.enabled = true;
    this.heroRenderer.shadowMap.type = this.isMobileDevice ? THREE.BasicShadowMap : THREE.PCFSoftShadowMap;
    this.heroRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.heroRenderer.toneMappingExposure = 1.15;
    container.appendChild(this.heroRenderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight('#ffffff', 1.7);
    this.heroScene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight('#fffaf0', 2.3);
    keyLight.position.set(2.5, 4.0, 3.5);
    keyLight.castShadow = true;
    const shadowMapRes = this.isMobileDevice ? 512 : 2048;
    keyLight.shadow.mapSize.width = shadowMapRes;
    keyLight.shadow.mapSize.height = shadowMapRes;
    keyLight.shadow.bias = -0.0004;
    this.heroScene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#ffffff', 1.4);
    rimLight.position.set(-2.5, 3.5, -2.5);
    this.heroScene.add(rimLight);

    const fillLight = new THREE.DirectionalLight('#fef3c7', 1.0);
    fillLight.position.set(-2, 0, 3);
    this.heroScene.add(fillLight);

    // Hero Character (IPB outfit)
    this.heroCharacter = new MinecraftCharacter({
      skinCanvas: this.skinGenerator.getCanvas('ipb'),
      scale: 0.11
    });
    this.heroScene.add(this.heroCharacter.group);
    this.updateHeroTransform();
  }

  updateHeroTransform() {
    if (!this.heroCharacter || !this.heroCamera) return;
    const isMobile = window.innerWidth <= 900;
    const camZ = this.heroCamera.position.z;
    const halfH = camZ * Math.tan(THREE.MathUtils.degToRad(this.heroCamera.fov / 2));
    const bottomWorldY = -halfH;

    const scaleHero = isMobile ? 0.088 : 0.11;
    const Y_hero_peeked = bottomWorldY - (21.5 * scaleHero);
    const Y_hero_submerged = bottomWorldY - (48.0 * scaleHero);
    const currentHeroY = THREE.MathUtils.lerp(Y_hero_submerged, Y_hero_peeked, this.heroPeekingIntroProgress);

    this.heroCharacter.group.position.set(0, currentHeroY, 0);
    this.heroCharacter.group.scale.set(scaleHero, scaleHero, scaleHero);
    this.heroCharacter.group.rotation.set(0, 0, 0);
    this.heroCharacter.setHalfBodyMode(false);
  }

  // ========================================================
  // 2. ABOUT SCENE (Embedded directly inside #aboutFrame)
  // Physically moves with the background - ZERO scroll lag/jiggle!
  // ========================================================
  initAboutScene() {
    const canvas = document.getElementById('aboutCanvas');
    const frameEl = document.getElementById('aboutFrame');
    if (!canvas || !frameEl) return;

    this.aboutScene = new THREE.Scene();

    const w = frameEl.clientWidth || 300;
    const h = frameEl.clientHeight || 400;

    this.aboutCamera = new THREE.PerspectiveCamera(36, w / h, 0.1, 100);
    this.aboutCamera.position.set(0, 0, 3.8);

    const dpr = this.isMobileDevice ? Math.min(window.devicePixelRatio, 1.25) : Math.min(window.devicePixelRatio, 2);

    this.aboutRenderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: !this.isMobileDevice,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.aboutRenderer.setSize(w, h);
    this.aboutRenderer.setPixelRatio(dpr);
    this.aboutRenderer.setClearColor(0x000000, 0);
    this.aboutRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.aboutRenderer.toneMappingExposure = 1.15;

    // Lighting
    const ambientLight = new THREE.AmbientLight('#ffffff', 1.6);
    this.aboutScene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight('#fffaf0', 2.0);
    keyLight.position.set(2, 4.5, 3.5);
    this.aboutScene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#ffffff', 1.2);
    rimLight.position.set(-2, 3.0, -2);
    this.aboutScene.add(rimLight);

    const fillLight = new THREE.DirectionalLight('#fef3c7', 0.9);
    fillLight.position.set(-2, 0, 3);
    this.aboutScene.add(fillLight);

    // About Character
    this.aboutCharacter = new MinecraftCharacter({
      skinCanvas: this.skinGenerator.getCanvas('ipb'),
      scale: 0.088
    });
    this.aboutScene.add(this.aboutCharacter.group);
    this.updateAboutTransform();
  }

  updateAboutTransform() {
    if (!this.aboutCharacter || !this.aboutCamera) return;
    const isMobile = window.innerWidth <= 900;
    const halfH = this.aboutCamera.position.z * Math.tan(THREE.MathUtils.degToRad(this.aboutCamera.fov / 2));

    const targetRatio = isMobile ? 0.82 : 0.78;
    const desiredWorldH = (2 * halfH) * targetRatio;
    const scaleAbout = desiredWorldH / 23.0;

    const Y_standing = -halfH - (10.5 * scaleAbout);
    const Y_submerged = -halfH - (35.0 * scaleAbout);

    const currentY = THREE.MathUtils.lerp(Y_submerged, Y_standing, this.aboutEntranceProgress);

    this.aboutCharacter.group.position.set(0, currentY, 0);
    this.aboutCharacter.group.scale.set(scaleAbout, scaleAbout, scaleAbout);
    this.aboutCharacter.group.rotation.set(0, -0.22, 0);
    this.aboutCharacter.setHalfBodyMode(false);
  }

  // ========================================================
  // 3. EDUCATION SCENE (Full-body Character on Center Stage)
  // Dynamic Costume Switch between IPB & SMK uniforms!
  // ========================================================
  initEduScene() {
    const canvas = document.getElementById('eduCanvas');
    const wrapper = document.getElementById('eduCanvasWrapper');
    if (!canvas || !wrapper) return;

    this.eduScene = new THREE.Scene();

    const w = wrapper.clientWidth || 360;
    const h = wrapper.clientHeight || 480;

    this.eduCamera = new THREE.PerspectiveCamera(36, w / h, 0.1, 100);
    this.eduCamera.position.set(0, 0, 4.4);

    const dpr = this.isMobileDevice ? Math.min(window.devicePixelRatio, 1.25) : Math.min(window.devicePixelRatio, 2);

    this.eduRenderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: !this.isMobileDevice,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.eduRenderer.setSize(w, h);
    this.eduRenderer.setPixelRatio(dpr);
    this.eduRenderer.setClearColor(0x000000, 0);
    this.eduRenderer.shadowMap.enabled = true;
    this.eduRenderer.shadowMap.type = this.isMobileDevice ? THREE.BasicShadowMap : THREE.PCFSoftShadowMap;
    this.eduRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.eduRenderer.toneMappingExposure = 1.15;

    // Lighting
    const ambientLight = new THREE.AmbientLight('#ffffff', 1.7);
    this.eduScene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight('#fffaf0', 2.3);
    keyLight.position.set(2.5, 4.5, 3.5);
    keyLight.castShadow = true;
    const shadowMapRes = this.isMobileDevice ? 512 : 1024;
    keyLight.shadow.mapSize.width = shadowMapRes;
    keyLight.shadow.mapSize.height = shadowMapRes;
    keyLight.shadow.bias = -0.0004;
    this.eduScene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#ffffff', 1.5);
    rimLight.position.set(-2.5, 3.5, -2.5);
    this.eduScene.add(rimLight);

    const fillLight = new THREE.DirectionalLight('#fef3c7', 1.0);
    fillLight.position.set(-2, 0, 3);
    this.eduScene.add(fillLight);

    // Full-body Character
    this.eduCharacter = new MinecraftCharacter({
      skinCanvas: this.skinGenerator.getCanvas('ipb'),
      scale: 0.088
    });
    this.eduScene.add(this.eduCharacter.group);
    this.updateEduTransform();
  }

  updateEduTransform() {
    if (!this.eduCharacter || !this.eduCamera) return;
    const isMobile = window.innerWidth <= 900;
    const halfH = this.eduCamera.position.z * Math.tan(THREE.MathUtils.degToRad(this.eduCamera.fov / 2));

    // Full-body height: 33.5 units (feet at y=0 to hair at y=33.5)
    const targetRatio = isMobile ? 0.78 : 0.82;
    const desiredWorldH = (2 * halfH) * targetRatio;
    const scaleEdu = desiredWorldH / 33.5;

    // Center character vertically on the illuminated stage podium
    const Y_standing = -(desiredWorldH / 2) + (1.2 * scaleEdu);

    this.eduCharacter.group.position.set(0, Y_standing, 0);
    this.eduCharacter.group.scale.set(scaleEdu, scaleEdu, scaleEdu);
    this.eduCharacter.group.rotation.set(0, 0, 0);
    this.eduCharacter.setHalfBodyMode(false);
  }

  /**
   * Switch Education slide, costume skin, and info cards
   */
  switchEducation(index, playSpin = true) {
    this.currentEduIndex = index;
    const data = this.eduData[index];

    // 1. Update 3D Character Outfit & Spin Animation
    if (this.eduCharacter) {
      const outfitCanvas = this.skinGenerator.getCanvas(data.id);
      this.eduCharacter.setOutfit(outfitCanvas, data.id);
      if (playSpin) {
        this.eduCharacter.triggerSpin();
      }
    }

    // 2. Update Tabs Active State
    const tabIPB = document.getElementById('eduTabIPB');
    const tabSMK = document.getElementById('eduTabSMK');
    if (tabIPB && tabSMK) {
      if (data.id === 'ipb') {
        tabIPB.classList.add('active');
        tabIPB.setAttribute('aria-selected', 'true');
        tabSMK.classList.remove('active');
        tabSMK.setAttribute('aria-selected', 'false');
      } else {
        tabSMK.classList.add('active');
        tabSMK.setAttribute('aria-selected', 'true');
        tabIPB.classList.remove('active');
        tabIPB.setAttribute('aria-selected', 'false');
      }
    }

    // 3. Smooth Fade Update for Unified Card
    const unifiedCard = document.getElementById('eduUnifiedCard');
    if (unifiedCard) unifiedCard.classList.add('is-updating');

    setTimeout(() => {
      const schoolName = document.getElementById('eduSchoolName');
      const majorTitle = document.getElementById('eduMajorTitle');
      const periodText = document.getElementById('eduPeriodText');
      const summaryDesc = document.getElementById('eduSummaryDesc');
      const locationText = document.getElementById('eduLocationText');
      const tabPengalamanText = document.getElementById('eduTabPengalamanText');
      const achieveList = document.getElementById('eduAchieveList');

      if (schoolName) schoolName.textContent = data.schoolName;
      if (majorTitle) majorTitle.textContent = data.major;
      if (periodText) periodText.textContent = data.period;
      if (summaryDesc) summaryDesc.textContent = data.summary;
      if (locationText) locationText.textContent = data.location;
      if (tabPengalamanText) tabPengalamanText.textContent = data.achieveTitle;

      const itemsHtml = data.achievements.map((item) => `
        <li class="achieve-item">
          <span class="achieve-item-title">${item.title}</span>
          <span class="achieve-item-sub">${item.sub}</span>
        </li>
      `).join('');

      if (achieveList) {
        achieveList.innerHTML = itemsHtml;
      }

      if (unifiedCard) unifiedCard.classList.remove('is-updating');
    }, 180);
  }

  // ========================================================
  // 4. VISIBILITY OBSERVERS (0% GPU Sleep Mode)
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
        if (entries[0].isIntersecting && !this.aboutEntranceTriggered) {
          this.aboutEntranceTriggered = true;
          this.isAboutEntrancePlaying = true;
          this.aboutEntranceTimer = 0;
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
  }

  // ========================================================
  // 5. EVENT LISTENERS
  // ========================================================
  initEventListeners() {
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

        // Resize Hero
        if (this.heroRenderer && this.heroCamera) {
          this.heroCamera.aspect = newW / newH;
          this.heroCamera.updateProjectionMatrix();
          this.heroRenderer.setSize(newW, newH);
          this.updateHeroTransform();
        }

        // Resize About
        const frameEl = document.getElementById('aboutFrame');
        if (frameEl && this.aboutRenderer && this.aboutCamera) {
          const fw = frameEl.clientWidth || 300;
          const fh = frameEl.clientHeight || 400;
          this.aboutCamera.aspect = fw / fh;
          this.aboutCamera.updateProjectionMatrix();
          this.aboutRenderer.setSize(fw, fh);
          this.updateAboutTransform();
        }

        // Resize Education
        const eduWrapper = document.getElementById('eduCanvasWrapper');
        if (eduWrapper && this.eduRenderer && this.eduCamera) {
          const ew = eduWrapper.clientWidth || 360;
          const eh = eduWrapper.clientHeight || 480;
          this.eduCamera.aspect = ew / eh;
          this.eduCamera.updateProjectionMatrix();
          this.eduRenderer.setSize(ew, eh);
          this.updateEduTransform();
        }
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

    // Scroll listener: reset emergence when visiting top
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY < 120) {
        this.aboutEntranceTriggered = false;
        this.aboutEntranceProgress = 0;
        this.isAboutEntrancePlaying = false;
      }
    }, { passive: true });

    // Click anywhere in Hero section waves Hero character
    const heroEl = document.querySelector('.hero-section');
    if (heroEl) {
      heroEl.addEventListener('click', (e) => {
        if (!e.target.closest('a, button')) {
          if (this.heroCharacter) this.heroCharacter.triggerWave();
        }
      });
    }

    // Click anywhere in About section or frame waves About character
    const aboutEl = document.getElementById('about');
    if (aboutEl) {
      aboutEl.addEventListener('click', (e) => {
        if (!e.target.closest('a, button')) {
          if (this.aboutCharacter) this.aboutCharacter.triggerWave();
        }
      });
    }

    // Education Navigation Controls
    const eduPrevBtn = document.getElementById('eduPrevBtn');
    const eduNextBtn = document.getElementById('eduNextBtn');
    if (eduPrevBtn) {
      eduPrevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const nextIdx = (this.currentEduIndex - 1 + this.eduData.length) % this.eduData.length;
        this.switchEducation(nextIdx);
      });
    }
    if (eduNextBtn) {
      eduNextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const nextIdx = (this.currentEduIndex + 1) % this.eduData.length;
        this.switchEducation(nextIdx);
      });
    }

    // Education Pill Tabs
    const eduTabIPB = document.getElementById('eduTabIPB');
    const eduTabSMK = document.getElementById('eduTabSMK');
    if (eduTabIPB) {
      eduTabIPB.addEventListener('click', () => this.switchEducation(0));
    }
    if (eduTabSMK) {
      eduTabSMK.addEventListener('click', () => this.switchEducation(1));
    }

    // Education Stage Click & Touch Swipe
    const eduStageWrapper = document.getElementById('eduStageWrapper');
    if (eduStageWrapper) {
      eduStageWrapper.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
          const nextIdx = (this.currentEduIndex + 1) % this.eduData.length;
          this.switchEducation(nextIdx);
        }
      });

      let touchStartX = 0;
      let touchStartY = 0;
      eduStageWrapper.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        }
      }, { passive: true });

      eduStageWrapper.addEventListener('touchend', (e) => {
        if (e.changedTouches.length > 0) {
          const dx = e.changedTouches[0].clientX - touchStartX;
          const dy = e.changedTouches[0].clientY - touchStartY;
          if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy)) {
            if (dx < 0) {
              const nextIdx = (this.currentEduIndex + 1) % this.eduData.length;
              this.switchEducation(nextIdx);
            } else {
              const nextIdx = (this.currentEduIndex - 1 + this.eduData.length) % this.eduData.length;
              this.switchEducation(nextIdx);
            }
          }
        }
      }, { passive: true });
    }

    // Education Card Tab Switcher: Rincian vs Pengalaman & Organisasi
    // Ensures strictly ONE panel is visible at a time (occupying 100% full width)
    const tabRincian = document.getElementById('eduTabRincian');
    const tabPengalaman = document.getElementById('eduTabPengalaman');
    const panelInfo = document.getElementById('eduPanelInfo');
    const panelAchieve = document.getElementById('eduPanelAchieve');
    const cardBody = document.getElementById('eduCardBody');

    const switchEduTab = (tabName) => {
      if (!tabRincian || !tabPengalaman || !panelInfo || !panelAchieve) return;
      if (tabName === 'info') {
        tabRincian.classList.add('active');
        tabRincian.setAttribute('aria-selected', 'true');
        tabPengalaman.classList.remove('active');
        tabPengalaman.setAttribute('aria-selected', 'false');

        panelInfo.classList.add('active');
        panelAchieve.classList.remove('active');
      } else {
        tabPengalaman.classList.add('active');
        tabPengalaman.setAttribute('aria-selected', 'true');
        tabRincian.classList.remove('active');
        tabRincian.setAttribute('aria-selected', 'false');

        panelAchieve.classList.add('active');
        panelInfo.classList.remove('active');
      }
    };

    if (tabRincian) {
      tabRincian.addEventListener('click', () => switchEduTab('info'));
    }
    if (tabPengalaman) {
      tabPengalaman.addEventListener('click', () => switchEduTab('achieve'));
    }

    if (cardBody) {
      let touchStartX = 0;
      let touchStartY = 0;
      let isHorizontalSwipe = false;

      cardBody.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          isHorizontalSwipe = false;
        }
      }, { passive: true });

      cardBody.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
          const dx = e.touches[0].clientX - touchStartX;
          const dy = e.touches[0].clientY - touchStartY;
          if (!isHorizontalSwipe && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
            isHorizontalSwipe = true;
          }
        }
      }, { passive: true });

      cardBody.addEventListener('touchend', (e) => {
        if (isHorizontalSwipe && e.changedTouches.length > 0) {
          const dx = e.changedTouches[0].clientX - touchStartX;
          if (dx < -35) {
            switchEduTab('achieve'); // Swipe left -> Pengalaman
          } else if (dx > 35) {
            switchEduTab('info');    // Swipe right -> Rincian
          }
        }
      }, { passive: true });
    }
  }

  easeOutBack(x) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  }

  // ========================================================
  // 6. TECH STACK KEYCHAINS WALL RACK
  // Kinetic drag & touch-scrollable with infinite wrapping
  // ========================================================
  initKeychainsRack() {
    const viewport = document.getElementById('marqueeViewport');
    const track = document.getElementById('keychainsTrack');
    if (!track || !viewport) return;

    const items = track.querySelectorAll('.keychain-item');
    const group1 = track.querySelector('.marquee-group');

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

    viewport.addEventListener('pointerdown', (e) => {
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
      viewport.classList.add('is-dragging');
      try { viewport.setPointerCapture(e.pointerId); } catch (_) { }
    });

    viewport.addEventListener('pointermove', (e) => {
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
            viewport.classList.remove('is-dragging');
            try { viewport.releasePointerCapture(e.pointerId); } catch (_) { }
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
      viewport.classList.remove('is-dragging');
      if (e && e.pointerId) {
        try { viewport.releasePointerCapture(e.pointerId); } catch (_) { }
      }

      targetVelocity = Math.max(-28, Math.min(28, targetVelocity));
      scheduleAutoResume(2000);
    };

    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);

    viewport.addEventListener(
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

    viewport.addEventListener('mouseenter', () => {
      pauseAutoScroll();
    });

    viewport.addEventListener('mouseleave', () => {
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

      track.style.transform = `translate3d(${currentX.toFixed(2)}px, 0, 0)`;
    };
    requestAnimationFrame(animateTrack);

    // Keychain vertical jiggle physics
    const jiggleWraps = Array.from(track.querySelectorAll('.keychain-jiggle-wrap'));
    if (jiggleWraps.length > 0) {
      const springs = jiggleWraps.map((el, i) => ({
        el,
        angle: 0,
        velocity: 0,
        stiffness: 0.125 + (i % 4) * 0.015,
        damping: 0.815 + (i % 3) * 0.012,
      }));

      let lastScrollY = window.scrollY;
      let lastTime = performance.now();
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
          const dt = Math.max(now - lastTime, 8);
          const dy = currentY - lastScrollY;

          lastScrollY = currentY;
          lastTime = now;

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

  animate() {
    requestAnimationFrame(this.animate);
    if (document.hidden) return;

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    // 1. Hero Peeking Animation
    if (this.isHeroIntroPlaying) {
      this.heroIntroTimer += delta;
      if (this.heroIntroTimer > 0) {
        const t = Math.min(1, this.heroIntroTimer / this.heroIntroDuration);
        this.heroPeekingIntroProgress = this.easeOutBack(t);
        if (t >= 1) {
          this.isHeroIntroPlaying = false;
          this.heroPeekingIntroProgress = 1;
        }
      } else {
        this.heroPeekingIntroProgress = 0;
      }
      this.updateHeroTransform();
    }

    // 2. About Frame Emergence Animation
    if (this.isAboutEntrancePlaying) {
      this.aboutEntranceTimer += delta;
      const t = Math.min(1, this.aboutEntranceTimer / this.aboutEntranceDuration);
      this.aboutEntranceProgress = this.easeOutBack(t);
      if (t >= 1) {
        this.isAboutEntrancePlaying = false;
        this.aboutEntranceProgress = 1;
      }
      this.updateAboutTransform();
    }

    // 3. Render Hero Scene (only when Hero is visible)
    if (this.isHeroVisible && this.heroCharacter && this.heroRenderer) {
      this.raycaster.setFromCamera(this.mouseNDC, this.heroCamera);
      const camDir = new THREE.Vector3();
      this.heroCamera.getWorldDirection(camDir);

      const headWorld = new THREE.Vector3();
      this.heroCharacter.headGroup.getWorldPosition(headWorld);
      const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(
        camDir,
        headWorld.clone().addScaledVector(camDir, -2.5)
      );
      const targetWorld = new THREE.Vector3();
      this.raycaster.ray.intersectPlane(plane, targetWorld);
      if (targetWorld) {
        this.heroCharacter.lookAtWorldPoint(targetWorld);
      }

      this.heroCharacter.update(delta, time);
      this.heroRenderer.render(this.heroScene, this.heroCamera);
    }

    // 4. Render About Scene (only when About is visible)
    if (this.isAboutVisible && this.aboutCharacter && this.aboutRenderer) {
      this.raycaster.setFromCamera(this.mouseNDC, this.aboutCamera);
      const camDir = new THREE.Vector3();
      this.aboutCamera.getWorldDirection(camDir);

      const headWorld = new THREE.Vector3();
      this.aboutCharacter.headGroup.getWorldPosition(headWorld);
      const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(
        camDir,
        headWorld.clone().addScaledVector(camDir, -2.5)
      );
      const targetWorld = new THREE.Vector3();
      this.raycaster.ray.intersectPlane(plane, targetWorld);
      if (targetWorld) {
        this.aboutCharacter.lookAtWorldPoint(targetWorld);
      }

      this.aboutCharacter.update(delta, time);
      this.aboutRenderer.render(this.aboutScene, this.aboutCamera);
    }

    // 5. Render Education Scene (Full-body on center stage with gaze tracking)
    if (this.isEduVisible && this.eduCharacter && this.eduRenderer) {
      this.raycaster.setFromCamera(this.mouseNDC, this.eduCamera);
      const camDir = new THREE.Vector3();
      this.eduCamera.getWorldDirection(camDir);

      const headWorld = new THREE.Vector3();
      this.eduCharacter.headGroup.getWorldPosition(headWorld);
      const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(
        camDir,
        headWorld.clone().addScaledVector(camDir, -2.5)
      );
      const targetWorld = new THREE.Vector3();
      this.raycaster.ray.intersectPlane(plane, targetWorld);
      if (targetWorld) {
        this.eduCharacter.lookAtWorldPoint(targetWorld);
      }

      this.eduCharacter.update(delta, time);
      this.eduRenderer.render(this.eduScene, this.eduCamera);
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new App();
});
