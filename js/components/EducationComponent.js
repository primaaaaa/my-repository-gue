/**
 * EducationComponent.js
 * Encapsulates the Education section 3D standing character scene,
 * dynamic costume/uniform switching (IPB vs SMK), 360 spin animation,
 * interactive card tabs (Rincian vs Pengalaman & Organisasi), and gaze tracking.
 */

import * as THREE from 'three';
import { MinecraftCharacter } from '../MinecraftCharacter.js';

export class EducationComponent {
  constructor(skinGenerator, isMobileDevice = false) {
    this.skinGenerator = skinGenerator;
    this.isMobileDevice = isMobileDevice;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.character = null;

    this.currentEduIndex = 0;
    this.eduData = [
      {
        id: 'ipb',
        levelTag: 'Perguruan Tinggi Negeri • Vokasi',
        schoolName: 'IPB University',
        major: 'D4 Teknologi Rekayasa Perangkat Lunak',
        period: '2024 — 2028 (Aktif)',
        summary: 'Fokus mendalam pada rekayasa perangkat lunak modern, arsitektur aplikasi web, pemrograman mobile, machine learning dan computer visual, serta manajemen proyek teknologi informasi.',
        location: 'Bogor, Jawa Barat',
        costumeLabel: 'Kostum: Jas Almamater IPB',
        achieveTitle: 'Pengalaman & Organisasi',
        achievements: [
          { title: 'Ketua Umum Obscura Photography Club', sub: 'Periode 2025/2026' },
          { title: 'Wakil Ketua Pelaksana Hunting Akbar 2025', sub: 'Obscura Photography Club' },
          { title: 'Juara 2 Short Movie Competition di Portal 8', sub: 'Diselenggarakan oleh BEM Sekolah Vokasi IPB University' },
          { title: 'Juara 2 Short Movie Competition di IT-CAS', sub: 'Diselenggarakan oleh bolAmikom Surakarta' }
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
          { title: 'Divisi Humas Pentas Seni Algorithm of Creativity', sub: 'Humas, Komunikasi & Publikasi Acara Pentas Seni' }
        ]
      }
    ];

    this.initScene();
    this.initEventListeners();
    this.switchEducation(0, false);
  }

  initScene() {
    const canvas = document.getElementById('eduCanvas');
    const wrapper = document.getElementById('eduCanvasWrapper');
    if (!canvas || !wrapper) return;

    this.scene = new THREE.Scene();

    const w = wrapper.clientWidth || 360;
    const h = wrapper.clientHeight || 480;

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
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = this.isMobileDevice ? THREE.BasicShadowMap : THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    // Lighting
    const ambientLight = new THREE.AmbientLight('#ffffff', 1.7);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight('#fffaf0', 2.3);
    keyLight.position.set(2.5, 4.5, 3.5);
    keyLight.castShadow = true;
    const shadowMapRes = this.isMobileDevice ? 512 : 1024;
    keyLight.shadow.mapSize.width = shadowMapRes;
    keyLight.shadow.mapSize.height = shadowMapRes;
    keyLight.shadow.bias = -0.0004;
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#ffffff', 1.5);
    rimLight.position.set(-2.5, 3.5, -2.5);
    this.scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight('#fef3c7', 1.0);
    fillLight.position.set(-2, 0, 3);
    this.scene.add(fillLight);

    // Full-body Character
    this.character = new MinecraftCharacter({
      skinCanvas: this.skinGenerator.getCanvas('ipb'),
      scale: 0.088
    });
    this.scene.add(this.character.group);
    this.updateTransform();
  }

  updateTransform() {
    if (!this.character || !this.camera) return;
    const isMobile = window.innerWidth <= 900;
    const halfH = this.camera.position.z * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));

    const targetRatio = isMobile ? 0.78 : 0.82;
    const desiredWorldH = (2 * halfH) * targetRatio;
    const scaleEdu = desiredWorldH / 33.5;

    const Y_standing = -(desiredWorldH / 2) + (1.2 * scaleEdu);

    this.character.group.position.set(0, Y_standing, 0);
    this.character.group.scale.set(scaleEdu, scaleEdu, scaleEdu);
    this.character.group.rotation.set(0, 0, 0);
    this.character.setHalfBodyMode(false);
  }

  switchEducation(index, playSpin = true) {
    this.currentEduIndex = index;
    const data = this.eduData[index];
    if (!data) return;

    // 1. Update 3D Character Outfit & Spin Animation
    if (this.character) {
      const outfitCanvas = this.skinGenerator.getCanvas(data.id);
      this.character.setOutfit(outfitCanvas, data.id);
      if (playSpin) {
        this.character.triggerSpin();
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

      if (achieveList) {
        achieveList.innerHTML = data.achievements.map((item) => `
          <li class="achieve-item">
            <span class="achieve-item-title">${item.title}</span>
            <span class="achieve-item-sub">${item.sub}</span>
          </li>
        `).join('');
      }

      if (unifiedCard) unifiedCard.classList.remove('is-updating');
    }, 180);
  }

  switchEduTab(tabName) {
    const tabRincian = document.getElementById('eduTabRincian');
    const tabPengalaman = document.getElementById('eduTabPengalaman');
    const panelInfo = document.getElementById('eduPanelInfo');
    const panelAchieve = document.getElementById('eduPanelAchieve');

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
  }

  initEventListeners() {
    // Navigation Buttons
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

    // IPB / SMK Pills
    const eduTabIPB = document.getElementById('eduTabIPB');
    const eduTabSMK = document.getElementById('eduTabSMK');
    if (eduTabIPB) eduTabIPB.addEventListener('click', () => this.switchEducation(0));
    if (eduTabSMK) eduTabSMK.addEventListener('click', () => this.switchEducation(1));

    // Stage Click & Touch Swipe
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

    // Card Tabs (Rincian vs Pengalaman)
    const tabRincian = document.getElementById('eduTabRincian');
    const tabPengalaman = document.getElementById('eduTabPengalaman');
    const cardBody = document.getElementById('eduCardBody');

    if (tabRincian) tabRincian.addEventListener('click', () => this.switchEduTab('info'));
    if (tabPengalaman) tabPengalaman.addEventListener('click', () => this.switchEduTab('achieve'));

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
            this.switchEduTab('achieve');
          } else if (dx > 35) {
            this.switchEduTab('info');
          }
        }
      }, { passive: true });
    }
  }

  resize() {
    const eduWrapper = document.getElementById('eduCanvasWrapper');
    if (eduWrapper && this.renderer && this.camera) {
      const ew = eduWrapper.clientWidth || 360;
      const eh = eduWrapper.clientHeight || 480;
      this.camera.aspect = ew / eh;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(ew, eh);
      this.updateTransform();
    }
  }

  render(delta, time, mouseNDC, raycaster, isVisible = true) {
    if (isVisible && this.character && this.renderer) {
      if (raycaster && mouseNDC) {
        raycaster.setFromCamera(mouseNDC, this.camera);
        const camDir = new THREE.Vector3();
        this.camera.getWorldDirection(camDir);

        const headWorld = new THREE.Vector3();
        this.character.headGroup.getWorldPosition(headWorld);
        const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(
          camDir,
          headWorld.clone().addScaledVector(camDir, -2.5)
        );
        const targetWorld = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, targetWorld);
        if (targetWorld) {
          this.character.lookAtWorldPoint(targetWorld);
        }
      }

      this.character.update(delta, time);
      this.renderer.render(this.scene, this.camera);
    }
  }
}
