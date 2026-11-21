/**
 * ProjectsComponent.js
 * Encapsulates the Featured Projects section:
 * - 3D Pixelated Rotating Coin Showcase (Three.js WebGL with NearestFilter & MeshBasicMaterial for pure colors)
 * - 3D Turntable Carousel Coverflow Selector (Orbital coverflow with 4 projects)
 * - 2-Mode View System: Selection Mode -> Detail Hub Mode
 * - 3 Sub-tabs: Deskripsi (scrollable), Foto & Galeri (scrollable), Tech Stack & Tim (scrollable)
 * - Keychains for primary stack + Badges for secondary technologies
 * - Touch swipe guard for keychain rack and full keyboard accessibility.
 */

import * as THREE from 'three';
import { createExtrudedLogoGeometry } from '../utils/logoData.js';

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
    this.isDetailOpen = false;

    this.projectsData = [
      {
        id: 'darkim',
        title: 'DARKIM',
        shape: 'rect',
        subtitle: 'Deteksi Barcode Pada Makanan Minuman Kemasan untuk Analisis Resiko Kandungan pada Penderita Hipertensi dan Diabetes',
        logoTexture: 'assets/projects/darkim_pixel.png',
        logoRaw: 'assets/projects/darkim_raw.png',
        themeColor: '#00d084',
        accentColor: '#00d084',
        rimColor: 0x18181b,
        description: 'Aplikasi inovatif pemindai barcode produk makanan dan minuman kemasan untuk menganalisis risiko kandungan gizi (gula, garam, lemak/natrium) bagi penderita hipertensi dan diabetes secara instan, akurat, dan mudah dipahami.',
        highlights: [
          'Deteksi instan barcode kemasan via kamera dengan ekstraksi data nutrisi presisi',
          'Penilaian risiko kesehatan otomatis yang disesuaikan untuk penderita hipertensi & diabetes',
          'Rekomendasi alternatif konsumsi yang lebih sehat berdasarkan profil nutrisi produk'
        ],
        liveUrl: null,
        repoUrl: '#',
        photos: [
          { title: 'Pemindai Barcode Kemasan', tag: 'Barcode Scanner', color: '#005f3b' },
          { title: 'Laporan Analisis Risiko Nutrisi', tag: 'Risk Assessment', color: '#00874e' },
          { title: 'Rekomendasi Makanan Sehat', tag: 'Healthy Alternative', color: '#00aa64' }
        ],
        techStack: ['nextjs', 'tailwind', 'sql', 'python'],
        otherTech: ['FastAPI', 'OpenFoodFacts API'],
        team: [
          { name: 'Muhammad Prima Yudhistira', role: 'Project Manager & Frontend Developer' },
          { name: 'Naufal Fakhrie', role: 'Frontend Developer' },
          { name: 'Arya Prasetya Putra Albani', role: 'ML Engineer' }
        ]
      },
      {
        id: 'medigo',
        title: 'MediGo',
        shape: 'circle',
        subtitle: 'Portal Informasi Fasilitas Kesehatan dan Forum Diskusi Publik untuk sekitar Jabodetabek',
        logoTexture: 'assets/projects/medigo_pixel.png',
        logoRaw: 'assets/projects/medigo_raw.png',
        themeColor: '#0c5c84',
        accentColor: '#179bb8',
        rimColor: 0x179bb8,
        description: 'Portal informasi digital dan forum interaktif publik yang menghadirkan direktori fasilitas kesehatan (faskes) terpadu di wilayah Jabodetabek, rute navigasi cepat menuju faskes terdekat, serta ruang diskusi terbuka bagi masyarakat.',
        highlights: [
          'Direktori faskes se-Jabodetabek dengan pemetaan interaktif Leaflet JS & navigasi rute',
          'Forum diskusi publik interaktif untuk bertukar pengalaman dan informasi layanan medis',
          'Integrasi asisten cerdas Gemini API untuk konsultasi dan pencarian rujukan cepat'
        ],
        liveUrl: 'https://medigo.free.nf',
        repoUrl: '#',
        photos: [
          { title: 'Landing Page MediGo', image: 'assets/project-ui/medigo/landing-page.png', color: '#0c5c84' },
          { title: 'Beranda Utama & Dashboard', image: 'assets/project-ui/medigo/beranda.png', color: '#0c4a6e' },
          { title: 'Peta Interaktif Sebaran Faskes', image: 'assets/project-ui/medigo/peta-faskes.png', color: '#0284c7' },
          { title: 'Pencarian & Filter Faskes Terdekat', image: 'assets/project-ui/medigo/pencarian.png', color: '#0369a1' },
          { title: 'Detail Fasilitas Kesehatan & Layanan', image: 'assets/project-ui/medigo/detail-faskes.png', color: '#075985' },
          { title: 'Forum Komunitas Publik', image: 'assets/project-ui/medigo/forum.png', color: '#0369a1' },
          { title: 'Detail Percakapan Utas Forum', image: 'assets/project-ui/medigo/detail-forum.png', color: '#0284c7' },
          { title: 'Asisten Virtual AI MediBot', image: 'assets/project-ui/medigo/medibot-ai-chatbot.png', color: '#0ea5e9' }
        ],
        techStack: ['laravel', 'bootstrap', 'sql'],
        otherTech: ['Gemini API', 'Leaflet js'],
        team: [
          { name: 'Muhammad Prima Yudhistira', role: 'Project Manager & Frontend Developer' },
          { name: 'Raden Mas Galih Pradityo', role: 'Backend Developer' },
          { name: 'Misael Feodora Pranata Dauhan', role: 'UI/UX Designer' },
          { name: 'Osanna Patricia Limbong', role: 'Data Engineer & Quality Assurance' }
        ]
      },
      {
        id: 'beabot',
        title: 'Beabot',
        shape: 'circle',
        subtitle: 'Asisten Suara AI Cerdas & Platform Komunikasi Terpadu',
        logoTexture: 'assets/projects/purple_app_pixel.png',
        logoRaw: 'assets/projects/purple_app_raw.png',
        themeColor: '#6b21a8',
        accentColor: '#9333ea',
        rimColor: 0x9333ea,
        description: 'Platform asisten suara berbasis kecerdasan buatan (Voice AI Agent) yang dirancang untuk melakukan interaksi percakapan natural secara real-time, mengotomasi alur komunikasi, dan merespons kebutuhan pengguna dengan latensi rendah.',
        highlights: [
          'Interaksi percakapan suara natural berlatensi rendah ditenagai VAPI AI Voice Agent',
          'Pemahaman konteks mendalam bertenaga model kecerdasan buatan Gemini API',
          'Arsitektur backend tangguh berbasis Express JS dan manajemen database SQL terstruktur'
        ],
        liveUrl: null,
        repoUrl: '#',
        photos: [
          { title: 'Antarmuka Percakapan Voice AI', tag: 'Voice Console', color: '#581c87' },
          { title: 'Transkripsi Percakapan Real-Time', tag: 'Live Transcript', color: '#6b21a8' },
          { title: 'Panel Konfigurasi Agen AI', tag: 'Agent Setup', color: '#7e22ce' }
        ],
        techStack: ['nextjs', 'bootstrap', 'sql'],
        otherTech: ['Express JS', 'Gemini API key', 'VAPI AI Voice Agent'],
        team: [
          { name: 'Muhammad Prima Yudhistira', role: 'Project Manager & Frontend Developer' },
          { name: 'Rafid Wahyu Aditya', role: 'Backend Developer' },
          { name: 'Rifaldi', role: 'UI/UX Designer' }
        ]
      },
      {
        id: 'luwihaja-hill',
        title: 'Website Reservasi Luwihaja Hill',
        shape: 'circle',
        subtitle: 'Sistem Reservasi & Informasi Pariwisata Luwihaja Hill',
        logoTexture: 'assets/projects/villa_air_pixel.png',
        logoRaw: 'assets/projects/villa_air_raw.png',
        themeColor: '#2b5834',
        accentColor: '#38a169',
        rimColor: 0xe2a03f,
        description: 'Platform web komprehensif yang dirancang untuk mempermudah calon wisatawan menjelajahi keindahan Luwihaja Hill serta melakukan reservasi akomodasi Villa Air secara instan dengan kalender ketersediaan interaktif dan konfirmasi otomatis.',
        highlights: [
          'Sistem reservasi kamar & kalkulasi tarif real-time berbasis tanggal menginap',
          'Antarmuka ramah mobile dengan visualisasi katalog tipe villa dan fasilitas lengkap',
          'Integrasi rute lokasi dan panduan wisata terintegrasi di kawasan Luwihaja Hill'
        ],
        liveUrl: null,
        repoUrl: '#',
        photos: [
          { title: 'Beranda Luwihaja Hill', tag: 'Landing Page', color: '#1f4325' },
          { title: 'Katalog Tipe Villa', tag: 'Accommodations', color: '#275830' },
          { title: 'Alur Reservasi Cepat', tag: 'Booking Engine', color: '#31693a' }
        ],
        techStack: ['laravel', 'bootstrap', 'sql'],
        otherTech: [],
        team: [
          { name: 'Rafi Fakhrie Alaudin', role: 'Project Manager' },
          { name: 'Muhammad Prima Yudhistira', role: 'Frontend Developer' },
          { name: 'Aretta Dwi Hapsari', role: 'Frontend Developer' },
          { name: 'Alhamid Adriansyah', role: 'Backend Developer' }
        ]
      },
      {
        id: 'wertugo',
        title: 'Wertugo',
        shape: 'contour',
        subtitle: 'Aplikasi Rekomendasi Spot Wisata di Sekitar Anda',
        logoTexture: 'assets/projects/wertugo_pixel.png',
        logoRaw: 'assets/projects/wertugo_raw.png',
        themeColor: '#16a34a',
        accentColor: '#f97316',
        rimColor: 0xf97316,
        description: 'Aplikasi cerdas rekomendasi dan pemandu spot wisata sekitar yang membantu pelancong menemukan destinasi rekreasi menarik, fasilitas lengkap, dan rute perjalanan terbaik dengan navigasi peta interaktif.',
        highlights: [
          'Rekomendasi spot wisata berbasis lokasi geografis pengguna (geolocation)',
          'Katalog objek wisata terpadu dengan ulasan, fasilitas, dan panduan rute',
          'Sinkronisasi data real-time berbasis NoSQL MongoDB dengan backend responsif'
        ],
        liveUrl: null,
        repoUrl: '#',
        photos: [
          { title: 'Eksplorasi Spot Wisata', tag: 'Discovery UI', color: '#14532d' },
          { title: 'Peta & Rute Interaktif', tag: 'Map Route', color: '#c2410c' },
          { title: 'Detail Tempat & Fasilitas', tag: 'Spot Detail', color: '#15803d' }
        ],
        techStack: ['laravel', 'mongodb', 'bootstrap'],
        otherTech: ['Java'],
        team: [
          { name: 'Muhammad Prima Yudhistira', role: 'Web Developer & Backend Developer' },
          { name: 'Arya Prasetya Putra Albani', role: 'Web Developer & UI/UX' },
          { name: 'Ben Azaria', role: 'Mobile Developer' }
        ]
      },
      {
        id: 'bogorsehat',
        title: 'BogorSehat',
        shape: 'contour',
        subtitle: 'Portal Informasi Fasilitas Kesehatan di Kota dan Kabupaten Bogor',
        logoTexture: 'assets/projects/bogorsehat_pixel.png',
        logoRaw: 'assets/projects/bogorsehat_raw.png',
        themeColor: '#0d9488',
        accentColor: '#0284c7',
        rimColor: 0x0284c7,
        description: 'Portal informasi terpadu dan direktori fasilitas kesehatan (rumah sakit, puskesmas, klinik) di wilayah Kota dan Kabupaten Bogor untuk mempermudah masyarakat mengakses layanan medis terdekat secara cepat, akurat, dan terpercaya.',
        highlights: [
          'Direktori komprehensif faskes se-Kota & Kabupaten Bogor dengan pemetaan lokasi dan klasifikasi layanan',
          'Sistem pencarian dan filter cepat faskes terdekat berbasis lokasi pengguna (geolocation)',
          'Arsitektur web modern performa tinggi dengan Next.js & Tailwind CSS, ditenagai backend Python dan database SQL terstruktur'
        ],
        liveUrl: null,
        repoUrl: '#',
        photos: [
          { title: 'Beranda Utama BogorSehat', image: 'assets/project-ui/bogor-sehat/Beranda (1).png', color: '#0d9488' },
          { title: 'Peta Interaktif Faskes', image: 'assets/project-ui/bogor-sehat/Peta Interaktif.png', color: '#0284c7' },
          { title: 'Pencarian & Filter Faskes', image: 'assets/project-ui/bogor-sehat/Cari Faskes.png', color: '#0f766e' },
          { title: 'Detail Fasilitas Kesehatan', image: 'assets/project-ui/bogor-sehat/Detail Faskes.png', color: '#0369a1' },
          { title: 'Forum Diskusi Komunitas', image: 'assets/project-ui/bogor-sehat/Forum Diskusi.png', color: '#0284c7' }
        ],
        techStack: ['nextjs', 'tailwind', 'python', 'sql'],
        otherTech: [],
        team: [
          { name: 'Muhammad Prima Yudhistira', role: 'Project Manager' },
          { name: 'Haitsam Izzaturahman', role: 'Frontend Developer' },
          { name: 'Rafid Wahyu Aditya', role: 'Backend Developer dan Data Engineer' },
          { name: 'Cahyaning Sessa Lestari', role: 'UI/UX dan Quality Assurance' }
        ]
      }
    ];

    this.currentPhotoIndex = 0;
    this.isPhotoModalOpen = false;

    this.initScene();
    this.initEventListeners();
    this.renderProjectSelector();
    this.switchProject(0, false);
    this.updateMobileLayout();
  }

  initScene() {
    const canvas = document.getElementById('projCanvas');
    const wrapper = document.getElementById('projCanvasWrapper');
    if (!canvas || !wrapper) return;

    this.scene = new THREE.Scene();

    const w = wrapper.clientWidth || 320;
    const h = wrapper.clientHeight || 340;

    this.camera = new THREE.PerspectiveCamera(36, w / h, 0.1, 100);
    this.camera.position.set(0, 0, 3.8);

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

    // Lighting for metallic rim
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.6);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(2.5, 3.5, 3.5);
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.5);
    rimLight.position.set(-2.5, 2.5, -2.5);
    this.scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xfef3c7, 1.0);
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

    // Build exact extruded contour 3D geometries for each logo (thickness follows logo silhouette!)
    this.logoGeometries = {};
    this.projectsData.forEach(p => {
      this.logoGeometries[p.id] = createExtrudedLogoGeometry(p.id);
    });

    const initialProj = this.projectsData[0];
    this.rimMat = new THREE.MeshStandardMaterial({
      color: initialProj.rimColor,
      metalness: 0.85,
      roughness: 0.22
    });

    // Pure unbleached colors with MeshBasicMaterial (eliminates white specular glare/veil!)
    this.frontMat = new THREE.MeshBasicMaterial({
      map: this.projTextures[0],
      transparent: true,
      alphaTest: 0.05
    });
    this.backMat = new THREE.MeshBasicMaterial({
      map: this.projTextures[0],
      transparent: true,
      alphaTest: 0.05
    });

    // Mesh setup: [0: rim/edge thickness, 1: front face, 2: back face]
    const initialGeo = this.logoGeometries[initialProj.id];
    this.coin = new THREE.Mesh(initialGeo, [this.rimMat, this.frontMat, this.backMat]);
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

  updateMobileLayout() {
    const isMobile = window.innerWidth <= 900;
    const stageCard = document.querySelector('.proj-stage-card');
    const stageCol = document.querySelector('.proj-col-stage');
    const headerMain = document.querySelector('.proj-header-main');

    if (isMobile && stageCard && headerMain && stageCard.parentElement !== headerMain) {
      headerMain.prepend(stageCard);
      this.updateTransform();
    } else if (!isMobile && stageCard && stageCol && stageCard.parentElement !== stageCol) {
      stageCol.appendChild(stageCard);
      this.updateTransform();
    }
  }

  updateTransform() {
    const wrapper = document.getElementById('projCanvasWrapper');
    if (!wrapper || !this.renderer || !this.camera) return;

    const isMobile = window.innerWidth <= 900;
    const w = wrapper.clientWidth || (isMobile ? 82 : 320);
    const h = wrapper.clientHeight || (isMobile ? 72 : 340);

    this.camera.position.z = isMobile ? 4.8 : 4.4;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  renderProjectSelector() {
    const track = document.getElementById('projectSelectorTrack');
    if (!track) return;

    track.innerHTML = this.projectsData.map((p, idx) => `
      <button type="button" class="proj-selector-item" data-index="${idx}" aria-label="Lihat projek ${p.title}">
        <div class="proj-coin-3d ${p.shape === 'rect' ? 'is-rect' : ''}">
          <div class="proj-coin-spin">
            <div class="proj-coin-face" style="background-image: url('${p.logoTexture}')"></div>
          </div>
          <div class="proj-coin-shadow"></div>
        </div>
        <div class="proj-selector-info">
          <span class="proj-selector-title">${p.title}</span>
        </div>
      </button>
    `).join('');

    track.querySelectorAll('.proj-selector-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (this.suppressSelectorClick) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        if (isNaN(idx)) return;

        if (idx !== this.currentProjIndex) {
          this.switchProject(idx, true);
        } else {
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
    const total = this.projectsData.length;
    items.forEach((item, idx) => {
      item.classList.remove('pos-center', 'pos-right-behind', 'pos-left-behind', 'pos-far-behind', 'active');
      const diff = (idx - this.currentProjIndex + total) % total;
      if (diff === 0) {
        item.classList.add('pos-center', 'active');
        item.setAttribute('aria-selected', 'true');
      } else if (diff === 1) {
        item.classList.add('pos-right-behind');
        item.setAttribute('aria-selected', 'false');
      } else if (diff === total - 1) {
        item.classList.add('pos-left-behind');
        item.setAttribute('aria-selected', 'false');
      } else {
        item.classList.add('pos-far-behind');
        item.setAttribute('aria-selected', 'false');
      }
    });
  }

  openProjectDetail(index = this.currentProjIndex) {
    this.isDetailOpen = true;
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

      this.updateMobileLayout();

      void detView.offsetWidth;

      detView.style.opacity = '1';
      detView.style.transform = 'translateY(0)';

      this.updateTransform();
      this.spinVelocity = 0.35;
    }, 240);
  }

  closeProjectDetail() {
    this.isDetailOpen = false;
    this.closePhotoModal();
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

  openPhotoModal(photoIdx) {
    const project = this.projectsData[this.currentProjIndex];
    if (!project || !project.photos || project.photos.length === 0) return;

    this.currentPhotoIndex = Math.max(0, Math.min(photoIdx, project.photos.length - 1));
    this.isPhotoModalOpen = true;

    const modal = document.getElementById('projPhotoModal');
    if (modal) {
      modal.style.display = 'flex';
      modal.setAttribute('aria-hidden', 'false');
    }
    document.body.style.overflow = 'hidden';

    this.renderModalPhoto();
  }

  closePhotoModal() {
    this.isPhotoModalOpen = false;
    const modal = document.getElementById('projPhotoModal');
    if (modal) {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
    }
    const slide = document.getElementById('projModalSlide');
    if (slide) {
      slide.style.transform = '';
      slide.style.opacity = '';
    }
    document.body.style.overflow = '';
  }

  nextPhoto() {
    const project = this.projectsData[this.currentProjIndex];
    if (!project || !project.photos || project.photos.length === 0) return;
    this.currentPhotoIndex = (this.currentPhotoIndex + 1) % project.photos.length;
    this.renderModalPhoto('next');
  }

  prevPhoto() {
    const project = this.projectsData[this.currentProjIndex];
    if (!project || !project.photos || project.photos.length === 0) return;
    this.currentPhotoIndex = (this.currentPhotoIndex - 1 + project.photos.length) % project.photos.length;
    this.renderModalPhoto('prev');
  }

  renderModalPhoto(direction = '') {
    const project = this.projectsData[this.currentProjIndex];
    if (!project || !project.photos || project.photos.length === 0) return;

    const photo = project.photos[this.currentPhotoIndex];
    if (!photo) return;

    const titleEl = document.getElementById('projModalTitle');
    const projNameEl = document.getElementById('projModalProjName');
    const counterEl = document.getElementById('projModalCounter');
    const slideEl = document.getElementById('projModalSlide');

    if (titleEl) titleEl.textContent = photo.title;
    if (projNameEl) projNameEl.textContent = project.title;
    if (counterEl) counterEl.textContent = `${this.currentPhotoIndex + 1} / ${project.photos.length}`;

    if (slideEl) {
      slideEl.style.transition = 'none';
      if (direction === 'next') {
        slideEl.style.transform = 'translateX(28px)';
        slideEl.style.opacity = '0.35';
      } else if (direction === 'prev') {
        slideEl.style.transform = 'translateX(-28px)';
        slideEl.style.opacity = '0.35';
      }

      if (photo.image || photo.src) {
        slideEl.innerHTML = `<img src="${photo.image || photo.src}" alt="${photo.title}" class="proj-modal-img" />`;
      } else {
        slideEl.innerHTML = `
          <div class="proj-modal-mockup" style="background: radial-gradient(circle at 30% 30%, ${photo.color || '#3b82f6'}dd, #0a0a0c)">
            <div class="proj-modal-mockup-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.95)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </div>
            <span class="proj-modal-mockup-tag">${photo.title}</span>
            <span class="proj-modal-mockup-hint">Pratinjau Antarmuka & Tangkapan Layar Fitur</span>
          </div>
        `;
      }

      requestAnimationFrame(() => {
        slideEl.style.transition = 'transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease';
        slideEl.style.transform = 'translateX(0)';
        slideEl.style.opacity = '1';
      });
    }
  }

  switchProject(index, playSpin = true) {
    this.currentProjIndex = index;
    const project = this.projectsData[index];
    if (!project) return;

    // 1. Update 3D Model Texture, Geometry & Rim Color (thickness follows logo silhouette!)
    if (this.coin && this.projTextures[index]) {
      this.frontMat.map = this.projTextures[index];
      this.backMat.map = this.projTextures[index];

      if (this.logoGeometries[project.id]) {
        this.coin.geometry = this.logoGeometries[project.id];
      }

      this.rimMat.transparent = false;
      this.rimMat.opacity = 1;
      this.rimMat.visible = true;
      this.rimMat.color.set(project.rimColor);

      this.frontMat.needsUpdate = true;
      this.backMat.needsUpdate = true;
      this.rimMat.needsUpdate = true;

      if (playSpin) {
        this.coin.rotation.y = 0;
        this.spinVelocity = 0.28;
      }
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
      const descEl = document.getElementById('projDescText');
      const liveBtn = document.getElementById('projLiveBtn');
      const repoBtn = document.getElementById('projRepoBtn');
      const highlightsEl = document.getElementById('projHighlightsList');
      const photosGrid = document.getElementById('projPhotosGrid');
      const keychainsRack = document.getElementById('projKeychainsRack');
      const teamList = document.getElementById('projTeamList');

      if (titleEl) titleEl.textContent = project.title;
      if (subtitleEl) subtitleEl.textContent = project.subtitle;
      if (descEl) descEl.textContent = project.description;

      // Action Buttons: Github/Source on Left, Live Project on Right (Only shown if active)
      if (liveBtn) {
        if (project.liveUrl && project.liveUrl !== '#' && project.liveUrl !== '') {
          liveBtn.href = project.liveUrl;
          liveBtn.style.display = 'inline-flex';
        } else {
          liveBtn.removeAttribute('href');
          liveBtn.style.display = 'none';
        }
      }
      if (repoBtn) {
        if (project.repoUrl && project.repoUrl !== '') {
          repoBtn.href = project.repoUrl;
          repoBtn.style.display = 'inline-flex';
        } else {
          repoBtn.style.display = 'none';
        }
      }

      // Highlights
      if (highlightsEl) {
        highlightsEl.innerHTML = project.highlights.map(h => `<li>${h}</li>`).join('');
      }

      // Reset scroll position on unified scroll containers
      const descScroll = document.getElementById('projDescScroll');
      if (descScroll) descScroll.scrollTop = 0;
      const techScroll = document.getElementById('projTechScroll');
      if (techScroll) techScroll.scrollTop = 0;

      // Reset photo modal on project change
      this.closePhotoModal();

      // Photos / Gallery Mockups (Clean, Clickable cards to open lightbox modal)
      if (photosGrid) {
        photosGrid.innerHTML = project.photos.map((photo, pIdx) => `
          <div class="proj-photo-card" role="button" tabindex="0" data-photo-index="${pIdx}" aria-label="Lihat gambar ${photo.title}">
            <div class="proj-photo-preview">
              ${photo.image ? `
                <img src="${photo.image}" alt="${photo.title}" class="proj-photo-thumb" loading="lazy" />
              ` : `
                <div class="proj-photo-placeholder" style="background: linear-gradient(135deg, ${photo.color || '#3b82f6'}, #111113)">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                </div>
              `}
            </div>
            <div class="proj-photo-info">
              <span class="proj-photo-title">${photo.title}</span>
            </div>
          </div>
        `).join('');

        const cards = photosGrid.querySelectorAll('.proj-photo-card');
        cards.forEach(card => {
          card.addEventListener('click', () => {
            const idx = parseInt(card.dataset.photoIndex, 10);
            this.openPhotoModal(idx);
          });
          card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              const idx = parseInt(card.dataset.photoIndex, 10);
              this.openPhotoModal(idx);
            }
          });
        });
      }

      // Primary Tech Stack Hanging Keychains (Cloned from marquee SVGs)
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

      // Auxiliary / Other Technologies (Badges saja, berlaku seterusnya)
      const otherTechSec = document.getElementById('projOtherTechSection');
      const otherTechList = document.getElementById('projOtherTechList');
      if (otherTechSec && otherTechList) {
        if (project.otherTech && project.otherTech.length > 0) {
          otherTechSec.style.display = 'flex';
          otherTechList.innerHTML = project.otherTech.map(techName => `
            <span class="proj-tech-badge">${techName}</span>
          `).join('');
        } else {
          otherTechSec.style.display = 'none';
        }
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

    // Close photo modal when switching tabs
    this.closePhotoModal();

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

    if (tabName === 'desc') {
      const descScroll = document.getElementById('projDescScroll');
      if (descScroll) descScroll.scrollTop = 0;
    }
    if (tabName === 'tech') {
      const techScroll = document.getElementById('projTechScroll');
      if (techScroll) techScroll.scrollTop = 0;
    }
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

    // Lightbox Photo Modal Controls
    const photoModal = document.getElementById('projPhotoModal');
    const modalClose = document.getElementById('projModalCloseBtn');
    const modalBottomClose = document.getElementById('projModalBottomCloseBtn');
    const modalBackdrop = document.getElementById('projModalBackdrop');
    const modalPrev = document.getElementById('projModalPrevBtn');
    const modalNext = document.getElementById('projModalNextBtn');

    const handleModalClose = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      this.closePhotoModal();
    };

    if (modalClose) {
      modalClose.addEventListener('click', handleModalClose);
      modalClose.addEventListener('touchend', handleModalClose);
    }
    if (modalBottomClose) {
      modalBottomClose.addEventListener('click', handleModalClose);
      modalBottomClose.addEventListener('touchend', handleModalClose);
    }
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', handleModalClose);
      modalBackdrop.addEventListener('touchend', handleModalClose);
    }
    if (photoModal) {
      photoModal.addEventListener('click', (e) => {
        if (e.target === photoModal || e.target === modalBackdrop) {
          handleModalClose(e);
        }
      });
      const modalContainer = photoModal.querySelector('.proj-modal-container');
      if (modalContainer) {
        modalContainer.addEventListener('click', (e) => {
          e.stopPropagation();
        });
      }
    }
    if (modalPrev) {
      modalPrev.addEventListener('click', () => this.prevPhoto());
    }
    if (modalNext) {
      modalNext.addEventListener('click', () => this.nextPhoto());
    }

    // Touch swipe & Mouse drag on Photo Modal Viewport (Swipe horizontally / Drag down to dismiss)
    const modalViewport = document.getElementById('projModalViewport');
    const modalSlide = document.getElementById('projModalSlide');

    if (modalViewport && modalSlide) {
      let isDragging = false;
      let startX = 0;
      let startY = 0;
      let currentDx = 0;
      let currentDy = 0;

      const onStart = (clientX, clientY) => {
        if (!this.isPhotoModalOpen) return;
        isDragging = true;
        startX = clientX;
        startY = clientY;
        currentDx = 0;
        currentDy = 0;
        modalSlide.style.transition = 'none';
      };

      const onMove = (clientX, clientY) => {
        if (!isDragging) return;
        currentDx = clientX - startX;
        currentDy = clientY - startY;

        // Downward drag to dismiss
        if (currentDy > 15 && Math.abs(currentDy) > Math.abs(currentDx)) {
          modalSlide.style.transform = `translateY(${currentDy * 0.8}px) scale(${Math.max(0.85, 1 - currentDy / 800)})`;
          modalSlide.style.opacity = `${Math.max(0.35, 1 - currentDy / 350)}`;
          return;
        }

        modalSlide.style.transform = `translateX(${currentDx * 0.75}px)`;
        modalSlide.style.opacity = '1';
      };

      const onEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        modalSlide.style.transition = 'transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease';

        // Downward pull to dismiss
        if (currentDy > 70 && Math.abs(currentDy) > Math.abs(currentDx)) {
          this.closePhotoModal();
          return;
        }

        if (currentDx < -45) {
          this.nextPhoto();
        } else if (currentDx > 45) {
          this.prevPhoto();
        } else {
          modalSlide.style.transform = 'translate(0, 0) scale(1)';
          modalSlide.style.opacity = '1';
        }
      };

      // Touch events (mobile / tablet swipe)
      modalViewport.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) onStart(e.touches[0].clientX, e.touches[0].clientY);
      }, { passive: true });

      modalViewport.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) onMove(e.touches[0].clientX, e.touches[0].clientY);
      }, { passive: true });

      modalViewport.addEventListener('touchend', () => onEnd(), { passive: true });
      modalViewport.addEventListener('touchcancel', () => onEnd(), { passive: true });

      // Mouse drag events (desktop flick & drag)
      modalViewport.addEventListener('mousedown', (e) => {
        onStart(e.clientX, e.clientY);
      });

      window.addEventListener('mousemove', (e) => {
        if (isDragging) onMove(e.clientX, e.clientY);
      });

      window.addEventListener('mouseup', () => {
        if (isDragging) onEnd();
      });
    }

    // Keyboard navigation (Escape, Left Arrow, Right Arrow)
    window.addEventListener('keydown', (e) => {
      const detView = document.getElementById('projDetailView');
      const isDetVisible = detView && detView.style.display !== 'none';

      if (this.isPhotoModalOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          this.closePhotoModal();
          return;
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.prevPhoto();
          return;
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          this.nextPhoto();
          return;
        }
      } else if (e.key === 'Escape') {
        if (isDetVisible) {
          this.closeProjectDetail();
        }
      }
    });

    // Touch Swipe & Mouse Drag on 3D Selector Carousel
    const selectorWrapper = document.querySelector('.project-selector-wrapper');
    const selectorTrack = document.getElementById('projectSelectorTrack');
    if (selectorWrapper && selectorTrack) {
      let startX = 0;
      let startY = 0;
      let currentDx = 0;
      let isTracking = false;
      let isHorizontalSwipe = false;
      let rafId = null;
      this.suppressSelectorClick = false;

      const updateDragVisual = () => {
        if (!isHorizontalSwipe) return;
        const dragShift = currentDx * 0.42;
        const dragTilt = currentDx * 0.08;
        selectorTrack.style.transition = 'none';
        selectorTrack.style.transform = `translateX(${dragShift}px) rotateY(${dragTilt}deg)`;
        rafId = null;
      };

      const onStart = (clientX, clientY) => {
        const selView = document.getElementById('projSelectionView');
        if (selView && (selView.style.display === 'none' || getComputedStyle(selView).display === 'none')) return;

        startX = clientX;
        startY = clientY;
        currentDx = 0;
        isTracking = true;
        isHorizontalSwipe = false;
      };

      const onMove = (clientX, clientY) => {
        if (!isTracking) return;

        const dx = clientX - startX;
        const dy = clientY - startY;

        if (!isHorizontalSwipe) {
          if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) {
            isTracking = false;
            return;
          }
          if (Math.abs(dx) > 8) {
            isHorizontalSwipe = true;
            selectorWrapper.classList.add('is-dragging');
          }
        }

        if (isHorizontalSwipe) {
          currentDx = dx;
          if (!rafId) {
            rafId = requestAnimationFrame(updateDragVisual);
          }
        }
      };

      const onEnd = () => {
        if (!isTracking) return;
        isTracking = false;
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        selectorWrapper.classList.remove('is-dragging');

        if (isHorizontalSwipe) {
          selectorTrack.style.transition = 'transform 0.38s cubic-bezier(0.2, 0.9, 0.3, 1)';
          selectorTrack.style.transform = '';

          if (Math.abs(currentDx) > 32) {
            this.suppressSelectorClick = true;
            setTimeout(() => { this.suppressSelectorClick = false; }, 200);

            if (currentDx < 0) {
              const nextIdx = (this.currentProjIndex + 1) % this.projectsData.length;
              this.switchProject(nextIdx, true);
            } else {
              const nextIdx = (this.currentProjIndex - 1 + this.projectsData.length) % this.projectsData.length;
              this.switchProject(nextIdx, true);
            }
          } else {
            this.suppressSelectorClick = true;
            setTimeout(() => { this.suppressSelectorClick = false; }, 100);
          }
        } else {
          selectorTrack.style.transform = '';
        }
      };

      // Touch events (mobile & tablet)
      selectorWrapper.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) onStart(e.touches[0].clientX, e.touches[0].clientY);
      }, { passive: true });

      selectorWrapper.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) onMove(e.touches[0].clientX, e.touches[0].clientY);
      }, { passive: true });

      selectorWrapper.addEventListener('touchend', () => onEnd(), { passive: true });
      selectorWrapper.addEventListener('touchcancel', () => onEnd(), { passive: true });

      // Mouse drag events (desktop)
      selectorWrapper.addEventListener('mousedown', (e) => {
        if (e.target && e.target.closest && e.target.closest('.proj-nav-btn')) return;
        onStart(e.clientX, e.clientY);
      });

      window.addEventListener('mousemove', (e) => {
        if (isTracking) onMove(e.clientX, e.clientY);
      });

      window.addEventListener('mouseup', () => {
        if (isTracking) onEnd();
      });
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
          // If touching inside keychains rack or photo viewer, do not trigger tab swipe
          if (e.target && e.target.closest && (e.target.closest('.proj-keychains-rack') || e.target.closest('.proj-photo-viewer'))) {
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
          if (e.target && e.target.closest && (e.target.closest('.proj-keychains-rack') || e.target.closest('.proj-photo-viewer'))) {
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

    // Window resize handler to maintain mobile / desktop layout
    window.addEventListener('resize', () => {
      this.updateMobileLayout();
      this.updateTransform();
    });
  }

  resize() {
    this.updateMobileLayout();
    this.updateTransform();
  }

  render(delta, time, isVisible = true) {
    if (!this.isDetailOpen) return;
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
