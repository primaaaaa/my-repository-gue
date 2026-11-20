/**
 * ProjectsComponent.js
 * Encapsulates the Featured Projects section:
 * - 3D Pixelated Rotating Coin Showcase (Three.js WebGL with NearestFilter)
 * - 3D Turntable Carousel Coverflow Selector (Only logos in 3D orbit)
 * - 2-Mode View System: Selection Mode -> Detail Hub Mode
 * - 3 Sub-tabs: Deskripsi (scrollable), Foto & Galeri (scrollable), Tech Stack & Tim (scrollable)
 * - Touch swipe guard for keychain rack and full keyboard accessibility.
 */

import * as THREE from 'three';

export class ProjectsComponent {
  constructor(isMobileDevice = false) {
    this.isMobileDevice = isMobileDevice;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.coin = null;
    this.frontMat = null;
    this.backMat = null;
    this.rimMat = null;

    this.currentProjIndex = 0;
    this.isDragging = false;
    this.spinVelocity = 0;

    this.projectsData = [
      {
        id: 'villa-air',
        title: 'Villa Air Luwihaja Hill',
        subtitle: 'Sistem Reservasi & Informasi Pariwisata Luwihaja Hill',
        category: 'Fullstack Web App • Resort Booking',
        year: '2024',
        logoTexture: 'assets/projects/villa_air_pixel.png',
        logoRaw: 'assets/projects/villa_air_raw.png',
        themeColor: '#2b5834',
        accentColor: '#38a169',
        rimColor: 0xe2a03f, // Warm Gold
        description: 'Platform web komprehensif yang dirancang untuk mempermudah calon wisatawan menjelajahi keindahan Luwihaja Hill serta melakukan reservasi akomodasi Villa Air secara instan. Dilengkapi dengan kalender ketersediaan interaktif, katalog tipe villa dengan visualisasi detail, dan sistem konfirmasi pemesanan otomatis.',
        highlights: [
          'Sistem booking & kalkulasi tarif real-time berbasis tanggal menginap',
          'Antarmuka responsif ramah mobile dengan performa loading cepat & ringan',
          'Integrasi galeri fasilitas panorama alam dan rute panduan interaktif'
        ],
        liveUrl: '#',
        repoUrl: '#',
        photos: [
          { title: 'Beranda Luwihaja Hill', tag: 'Landing Page', color: '#1f4325' },
          { title: 'Katalog Tipe Villa', tag: 'Accommodations', color: '#275830' },
          { title: 'Alur Reservasi Cepat', tag: 'Booking Engine', color: '#31693a' }
        ],
        techStack: ['html', 'css', 'javascript', 'tailwind', 'git'],
        team: [
          { name: 'Muhammad Prima Yudhistira', role: 'Project Manager & Frontend Developer' },
          { name: 'Tim Luwihaja Hill', role: 'Business Owner & Content Integration' }
        ]
      },
      {
        id: 'beo-creative',
        title: 'Beo Creative Hub',
        subtitle: 'Platform Komunitas & Portofolio Kolaboratif Kreatif',
        category: 'Interactive Web Platform • Creative Community',
        year: '2025',
        logoTexture: 'assets/projects/purple_app_pixel.png',
        logoRaw: 'assets/projects/purple_app_raw.png',
        themeColor: '#6b21a8',
        accentColor: '#9333ea',
        rimColor: 0xc084fc, // Violet Glow
        description: 'Aplikasi kolaborasi karya digital yang dirancang untuk mempertemukan para kreator, desainer grafis, dan programmer dalam satu ekosistem terpadu. Memungkinkan kurasi portofolio interaktif, apresiasi karya visual, dan manajemen proyek kreatif secara terstruktur.',
        highlights: [
          'Showcase karya portofolio interaktif dengan interaksi mikro responsif',
          'Sistem feedback dan kolaborasi antar anggota tim secara real-time',
          'Arsitektur modular dengan komponen UI kustom yang fleksibel'
        ],
        liveUrl: '#',
        repoUrl: '#',
        photos: [
          { title: 'Dashboard Komunitas Kreatif', tag: 'Overview UI', color: '#581c87' },
          { title: 'Katalog Proyek & Kolaborasi', tag: 'Project Feed', color: '#6b21a8' },
          { title: 'Detail Portofolio Kreator', tag: 'Work Detail', color: '#7e22ce' }
        ],
        techStack: ['next', 'bootstrap', 'react',],
        team: [
          { name: 'Muhammad Prima Yudhistira', role: 'Lead Frontend Developer' },
          { name: 'Tim Desain', role: 'UI/UX & Visual Asset Designer' }
        ]
      }
    ];

    this.initScene();
    this.initEventListeners();
    this.renderProjectSelector();
    this.switchProject(0, false);
  }

  initScene() {
    const canvas = document.getElementById('projCanvas');
    const wrapper = document.getElementById('projCanvasWrapper');
    if (!canvas || !wrapper) return;

    this.scene = new THREE.Scene();

    const w = wrapper.clientWidth || 320;
    const h = wrapper.clientHeight || 340;

    this.camera = new THREE.PerspectiveCamera(36, w / h, 0.1, 100);
    this.camera.position.set(0, 0, 4.4);

    const dpr = this.isMobileDevice
      ? Math.min(window.devicePixelRatio, 1.25)
      : Math.min(window.devicePixelRatio, 2);

    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: !this.isMobileDevice,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(2.5, 3.5, 3.5);
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.6);
    rimLight.position.set(-2.5, 2.5, -2.5);
    this.scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xfef3c7, 1.1);
    fillLight.position.set(0, -2.5, 2.5);
    this.scene.add(fillLight);

    // Preload textures with NearestFilter for authentic crisp pixel-art!
    const loader = new THREE.TextureLoader();
    this.projTextures = this.projectsData.map(p => {
      const tex = loader.load(p.logoTexture);
      tex.magFilter = THREE.NearestFilter;
      tex.minFilter = THREE.NearestFilter;
      tex.generateMipmaps = false;
      return tex;
    });

    this.projBackTextures = this.projectsData.map(p => {
      const tex = loader.load(p.logoTexture);
      tex.magFilter = THREE.NearestFilter;
      tex.minFilter = THREE.NearestFilter;
      tex.generateMipmaps = false;
      tex.center.set(0.5, 0.5);
      tex.rotation = Math.PI;
      return tex;
    });

    // 3D Coin Cylinder Geometry (thickness 0.20, radius 1.15 - sized comfortably)
    const coinGeo = new THREE.CylinderGeometry(1.15, 1.15, 0.20, 64);
    coinGeo.rotateX(Math.PI / 2); // Orient front face towards +Z
    coinGeo.rotateZ(Math.PI / 2); // Rotate 90 deg counter-clockwise so logo is upright!

    const initialProj = this.projectsData[0];
    this.rimMat = new THREE.MeshStandardMaterial({
      color: initialProj.rimColor,
      metalness: 0.85,
      roughness: 0.22
    });
    this.frontMat = new THREE.MeshStandardMaterial({
      map: this.projTextures[0],
      roughness: 0.38,
      metalness: 0.1,
      transparent: true,
      alphaTest: 0.05
    });
    this.backMat = new THREE.MeshStandardMaterial({
      map: this.projBackTextures[0],
      roughness: 0.38,
      metalness: 0.1,
      transparent: true,
      alphaTest: 0.05
    });

    // Materials order: [0: rim, 1: front face, 2: back face]
    this.coin = new THREE.Mesh(coinGeo, [this.rimMat, this.frontMat, this.backMat]);
    this.scene.add(this.coin);

    this.updateTransform();

    // 360° Drag Interaction on Canvas
    let isDown = false;
    let prevX = 0;
    let prevY = 0;

    const onPointerDown = (clientX, clientY) => {
      isDown = true;
      this.isDragging = true;
      prevX = clientX;
      prevY = clientY;
    };

    const onPointerMove = (clientX, clientY) => {
      if (!isDown || !this.coin) return;
      const dx = clientX - prevX;
      const dy = clientY - prevY;
      prevX = clientX;
      prevY = clientY;

      this.coin.rotation.y += dx * 0.015;
      this.coin.rotation.x += dy * 0.01;
      this.coin.rotation.x = Math.max(-0.6, Math.min(0.6, this.coin.rotation.x));
    };

    const onPointerUp = () => {
      if (isDown) {
        isDown = false;
        this.isDragging = false;
        if (this.coin) {
          const resetX = () => {
            if (!this.isDragging && Math.abs(this.coin.rotation.x) > 0.01) {
              this.coin.rotation.x *= 0.85;
              requestAnimationFrame(resetX);
            } else if (!this.isDragging) {
              this.coin.rotation.x = 0;
            }
          };
          resetX();
        }
      }
    };

    canvas.addEventListener('mousedown', (e) => onPointerDown(e.clientX, e.clientY));
    window.addEventListener('mousemove', (e) => onPointerMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', onPointerUp);

    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    window.addEventListener('touchend', onPointerUp);
  }

  updateTransform() {
    const wrapper = document.getElementById('projCanvasWrapper');
    if (!wrapper || !this.renderer || !this.camera) return;

    const w = wrapper.clientWidth || 320;
    const h = wrapper.clientHeight || 340;

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  renderProjectSelector() {
    const track = document.getElementById('projectSelectorTrack');
    if (!track) return;

    track.innerHTML = this.projectsData.map((p, idx) => `
      <button type="button" class="proj-selector-item" data-index="${idx}" aria-label="Lihat projek ${p.title}">
        <div class="proj-coin-3d">
          <div class="proj-coin-spin">
            <div class="proj-coin-face proj-coin-front" style="background-image: url('${p.logoTexture}')"></div>
            <div class="proj-coin-face proj-coin-back" style="background-image: url('${p.logoTexture}')"></div>
          </div>
        </div>
        <div class="proj-selector-info">
          <span class="proj-selector-title">${p.title}</span>
          <span class="proj-selector-tag">${p.year} • ${p.category.split('•')[0].trim()}</span>
        </div>
      </button>
    `).join('');

    track.querySelectorAll('.proj-selector-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        if (!isNaN(idx)) {
          this.openProjectDetail(idx);
        }
      });
    });

    this.updateSelectorPositions();
  }

  updateSelectorPositions() {
    const track = document.getElementById('projectSelectorTrack');
    if (!track) return;

    const items = track.querySelectorAll('.proj-selector-item');
    items.forEach((item, idx) => {
      item.classList.remove('pos-center', 'pos-right-behind', 'pos-left-behind', 'active');
      if (idx === this.currentProjIndex) {
        item.classList.add('pos-center', 'active');
        item.setAttribute('aria-selected', 'true');
      } else {
        item.setAttribute('aria-selected', 'false');
        if (this.currentProjIndex === 0) {
          item.classList.add('pos-right-behind');
        } else {
          item.classList.add('pos-left-behind');
        }
      }
    });
  }

  openProjectDetail(index = this.currentProjIndex) {
    this.switchProject(index, true);

    const selView = document.getElementById('projSelectionView');
    const detView = document.getElementById('projDetailView');
    if (!selView || !detView) return;

    selView.style.opacity = '0';
    selView.style.transform = 'scale(0.96)';
    selView.style.transition = 'opacity 0.28s ease, transform 0.28s ease';

    setTimeout(() => {
      selView.style.display = 'none';

      detView.style.display = 'flex';
      detView.style.opacity = '0';
      detView.style.transform = 'translateY(16px)';
      detView.style.transition = 'opacity 0.32s ease, transform 0.32s ease';

      void detView.offsetWidth;

      detView.style.opacity = '1';
      detView.style.transform = 'translateY(0)';

      this.updateTransform();
      this.spinVelocity = 0.35;
    }, 240);
  }

  closeProjectDetail() {
    const selView = document.getElementById('projSelectionView');
    const detView = document.getElementById('projDetailView');
    if (!selView || !detView) return;

    detView.style.opacity = '0';
    detView.style.transform = 'translateY(16px)';
    detView.style.transition = 'opacity 0.24s ease, transform 0.24s ease';

    setTimeout(() => {
      detView.style.display = 'none';

      selView.style.display = 'flex';
      selView.style.opacity = '0';
      selView.style.transform = 'scale(0.96)';
      selView.style.transition = 'opacity 0.28s ease, transform 0.28s ease';

      void selView.offsetWidth;

      selView.style.opacity = '1';
      selView.style.transform = 'scale(1)';

      this.updateSelectorPositions();
    }, 220);
  }

  switchProject(index, playSpin = true) {
    this.currentProjIndex = index;
    const project = this.projectsData[index];
    if (!project) return;

    // 1. Update 3D Coin Model Texture & Rim Color
    if (this.coin && this.projTextures[index]) {
      this.frontMat.map = this.projTextures[index];
      this.backMat.map = this.projBackTextures ? this.projBackTextures[index] : this.projTextures[index];

      if (project.id === 'beo-creative') {
        this.rimMat.transparent = true;
        this.rimMat.opacity = 0;
        this.rimMat.visible = false;
      } else {
        this.rimMat.transparent = false;
        this.rimMat.opacity = 1;
        this.rimMat.visible = true;
        this.rimMat.color.set(project.rimColor);
      }

      this.frontMat.needsUpdate = true;
      this.backMat.needsUpdate = true;
      this.rimMat.needsUpdate = true;

      if (playSpin) {
        this.spinVelocity = 0.38;
      }
    }

    // Update Podium Ring glow
    const podiumRing = document.getElementById('projPodiumRing');
    if (podiumRing) {
      podiumRing.style.borderColor = project.accentColor;
      podiumRing.style.boxShadow = `0 0 24px ${project.accentColor}55`;
    }

    // 2. Update 3D Turntable Carousel Positions
    this.updateSelectorPositions();

    // Update indicator
    const navInd = document.getElementById('projNavIndicator');
    if (navInd) {
      navInd.textContent = `${index + 1} / ${this.projectsData.length}`;
    }

    // 3. Smooth Fade Transition on Detail Card
    const card = document.getElementById('projDetailCard');
    if (card) card.classList.add('is-updating');

    setTimeout(() => {
      const titleEl = document.getElementById('projTitle');
      const subtitleEl = document.getElementById('projSubtitle');
      const catEl = document.getElementById('projCategoryBadge');
      const yearEl = document.getElementById('projYearPill');
      const descEl = document.getElementById('projDescText');
      const liveBtn = document.getElementById('projLiveBtn');
      const repoBtn = document.getElementById('projRepoBtn');
      const highlightsEl = document.getElementById('projHighlightsList');
      const photosGrid = document.getElementById('projPhotosGrid');
      const keychainsRack = document.getElementById('projKeychainsRack');
      const teamList = document.getElementById('projTeamList');

      if (titleEl) titleEl.textContent = project.title;
      if (subtitleEl) subtitleEl.textContent = project.subtitle;
      if (catEl) catEl.textContent = project.category;
      if (yearEl) yearEl.textContent = project.year;
      if (descEl) descEl.textContent = project.description;
      if (liveBtn) liveBtn.href = project.liveUrl;
      if (repoBtn) repoBtn.href = project.repoUrl;

      // Highlights
      if (highlightsEl) {
        highlightsEl.innerHTML = project.highlights.map(h => `<li>${h}</li>`).join('');
      }

      // Photos / Gallery Mockups
      if (photosGrid) {
        photosGrid.innerHTML = project.photos.map(photo => `
          <div class="proj-photo-card">
            <div class="proj-photo-preview" style="background: linear-gradient(135deg, ${photo.color}, #111113)">
              <span>${photo.tag}</span>
            </div>
            <div class="proj-photo-info">
              <span class="proj-photo-title">${photo.title}</span>
              <span class="proj-photo-tag">${project.title}</span>
            </div>
          </div>
        `).join('');
      }

      // Tech Stack Hanging Keychains (Cloned from marquee SVGs)
      if (keychainsRack) {
        keychainsRack.innerHTML = '';
        project.techStack.forEach(tech => {
          const original = document.querySelector(`.marquee-track .keychain-item[data-tech="${tech}"]`);
          if (original) {
            const clone = original.cloneNode(true);
            clone.classList.remove('is-swinging');
            keychainsRack.appendChild(clone);
          }
        });
      }

      // Team Members
      if (teamList) {
        teamList.innerHTML = project.team.map(member => `
          <div class="proj-team-card">
            <div class="proj-team-avatar">
              ${member.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div class="proj-team-info">
              <span class="proj-team-name">${member.name}</span>
              <span class="proj-team-role">${member.role}</span>
            </div>
          </div>
        `).join('');
      }

      if (card) card.classList.remove('is-updating');
    }, 180);
  }

  switchProjectTab(tabName) {
    const tabDesc = document.getElementById('projTabDesc');
    const tabPhotos = document.getElementById('projTabPhotos');
    const tabTech = document.getElementById('projTabTech');

    const panelDesc = document.getElementById('projPanelDesc');
    const panelPhotos = document.getElementById('projPanelPhotos');
    const panelTech = document.getElementById('projPanelTech');

    const tabs = [tabDesc, tabPhotos, tabTech];

    tabs.forEach(t => {
      if (!t) return;
      const isTarget = t.getAttribute('data-tab') === tabName;
      t.classList.toggle('active', isTarget);
      t.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });

    if (panelDesc) panelDesc.classList.toggle('active', tabName === 'desc');
    if (panelPhotos) panelPhotos.classList.toggle('active', tabName === 'photos');
    if (panelTech) panelTech.classList.toggle('active', tabName === 'tech');
  }

  initEventListeners() {
    // 3D Selector Prev / Next Arrows
    const prevBtn = document.getElementById('projPrevBtn');
    const nextBtn = document.getElementById('projNextBtn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        const nextIdx = (this.currentProjIndex - 1 + this.projectsData.length) % this.projectsData.length;
        this.switchProject(nextIdx, true);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const nextIdx = (this.currentProjIndex + 1) % this.projectsData.length;
        this.switchProject(nextIdx, true);
      });
    }

    // Sub-tabs Click Listeners
    const tabDesc = document.getElementById('projTabDesc');
    const tabPhotos = document.getElementById('projTabPhotos');
    const tabTech = document.getElementById('projTabTech');

    if (tabDesc) tabDesc.addEventListener('click', () => this.switchProjectTab('desc'));
    if (tabPhotos) tabPhotos.addEventListener('click', () => this.switchProjectTab('photos'));
    if (tabTech) tabTech.addEventListener('click', () => this.switchProjectTab('tech'));

    // Back button in Detail View
    const backBtn = document.getElementById('projBackBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => this.closeProjectDetail());
    }

    // Selection View Hint Button (Open detail)
    const hintBtn = document.getElementById('projSelectionHint');
    if (hintBtn) {
      hintBtn.addEventListener('click', () => this.openProjectDetail(this.currentProjIndex));
    }

    // Detail View Prev & Next Switcher
    const detPrev = document.getElementById('projDetailPrevBtn');
    const detNext = document.getElementById('projDetailNextBtn');

    if (detPrev) {
      detPrev.addEventListener('click', () => {
        const nextIdx = (this.currentProjIndex - 1 + this.projectsData.length) % this.projectsData.length;
        this.switchProject(nextIdx, true);
      });
    }

    if (detNext) {
      detNext.addEventListener('click', () => {
        const nextIdx = (this.currentProjIndex + 1) % this.projectsData.length;
        this.switchProject(nextIdx, true);
      });
    }

    // Escape key closes detail view
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const detView = document.getElementById('projDetailView');
        if (detView && detView.style.display !== 'none') {
          this.closeProjectDetail();
        }
      }
    });

    // Touch Swipe on 3D Selector Carousel Track
    const selectorTrack = document.getElementById('projectSelectorTrack');
    if (selectorTrack) {
      let touchStartX = 0;
      selectorTrack.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) touchStartX = e.touches[0].clientX;
      }, { passive: true });
      selectorTrack.addEventListener('touchend', (e) => {
        if (e.changedTouches.length > 0) {
          const dx = e.changedTouches[0].clientX - touchStartX;
          if (Math.abs(dx) > 35) {
            const nextIdx = (this.currentProjIndex + 1) % this.projectsData.length;
            this.switchProject(nextIdx, true);
          }
        }
      }, { passive: true });
    }

    // Touch Swipe on Detail Card Body to switch tabs
    const cardBody = document.getElementById('projCardBody');
    if (cardBody) {
      let touchStartX = 0;
      let touchStartY = 0;
      let isHorizontalSwipe = false;
      const tabOrder = ['desc', 'photos', 'tech'];

      cardBody.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
          // If touching inside horizontally scrollable keychains rack, do not trigger tab swipe
          if (e.target && e.target.closest && e.target.closest('.proj-keychains-rack')) {
            isHorizontalSwipe = false;
            return;
          }
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          isHorizontalSwipe = false;
        }
      }, { passive: true });

      cardBody.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
          if (e.target && e.target.closest && e.target.closest('.proj-keychains-rack')) {
            return;
          }
          const dx = e.touches[0].clientX - touchStartX;
          const dy = e.touches[0].clientY - touchStartY;
          if (!isHorizontalSwipe && Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)) {
            isHorizontalSwipe = true;
          }
        }
      }, { passive: true });

      cardBody.addEventListener('touchend', (e) => {
        if (isHorizontalSwipe && e.changedTouches.length > 0) {
          const dx = e.changedTouches[0].clientX - touchStartX;
          const currentTabEl = document.querySelector('.proj-tab-btn.active');
          const currentTab = currentTabEl ? currentTabEl.getAttribute('data-tab') : 'desc';
          const curIdx = tabOrder.indexOf(currentTab);

          if (dx < -35 && curIdx < tabOrder.length - 1) {
            this.switchProjectTab(tabOrder[curIdx + 1]);
          } else if (dx > 35 && curIdx > 0) {
            this.switchProjectTab(tabOrder[curIdx - 1]);
          }
        }
      }, { passive: true });
    }
  }

  resize() {
    this.updateTransform();
  }

  render(delta, time, isVisible = true) {
    if (isVisible && this.scene && this.camera && this.renderer && this.coin) {
      if (!this.isDragging) {
        this.coin.rotation.y += 0.012 + this.spinVelocity;
        this.spinVelocity *= 0.92;
        this.coin.position.y = Math.sin(time * 0.0022) * 0.08;
      }
      this.renderer.render(this.scene, this.camera);
    }
  }
}
