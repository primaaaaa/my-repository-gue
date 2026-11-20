/**
 * HeroComponent.js
 * Encapsulates the Hero section 3D peeking character scene,
 * entrance pop-up animation, gaze tracking, and wave interactions.
 */

import * as THREE from 'three';
import { MinecraftCharacter } from '../MinecraftCharacter.js';
import { easeOutBack } from '../utils/math.js';

export class HeroComponent {
  constructor(skinGenerator, isMobileDevice = false) {
    this.skinGenerator = skinGenerator;
    this.isMobileDevice = isMobileDevice;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.character = null;

    // Intro Animation State
    const initialScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    const heroH = typeof window !== 'undefined' ? window.innerHeight : 800;

    if (initialScrollY > heroH * 0.2) {
      this.introProgress = 1;
      this.isIntroPlaying = false;
    } else {
      this.introProgress = 0;
      this.isIntroPlaying = true;
      this.introDuration = 1.25;
      this.introTimer = -0.15; // 150ms delay before popping up
    }

    this.initScene();
    this.initEventListeners();
  }

  initScene() {
    const container = document.getElementById('heroCanvasContainer');
    if (!container) return;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      36,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 4.2);

    const dpr = this.isMobileDevice
      ? Math.min(window.devicePixelRatio, 1.25)
      : Math.min(window.devicePixelRatio, 2);

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isMobileDevice,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = this.isMobileDevice ? THREE.BasicShadowMap : THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    container.appendChild(this.renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight('#ffffff', 1.7);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight('#fffaf0', 2.3);
    keyLight.position.set(2.5, 4.0, 3.5);
    keyLight.castShadow = true;
    const shadowMapRes = this.isMobileDevice ? 512 : 2048;
    keyLight.shadow.mapSize.width = shadowMapRes;
    keyLight.shadow.mapSize.height = shadowMapRes;
    keyLight.shadow.bias = -0.0004;
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#ffffff', 1.4);
    rimLight.position.set(-2.5, 3.5, -2.5);
    this.scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight('#fef3c7', 1.0);
    fillLight.position.set(-2, 0, 3);
    this.scene.add(fillLight);

    // Character (IPB uniform)
    this.character = new MinecraftCharacter({
      skinCanvas: this.skinGenerator.getCanvas('ipb'),
      scale: 0.11
    });
    this.scene.add(this.character.group);
    this.updateTransform();
  }

  updateTransform() {
    if (!this.character || !this.camera) return;
    const isMobile = window.innerWidth <= 900;
    const camZ = this.camera.position.z;
    const halfH = camZ * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const bottomWorldY = -halfH;

    const scaleHero = isMobile ? 0.088 : 0.11;
    const Y_hero_peeked = bottomWorldY - (21.5 * scaleHero);
    const Y_hero_submerged = bottomWorldY - (48.0 * scaleHero);
    const currentHeroY = THREE.MathUtils.lerp(Y_hero_submerged, Y_hero_peeked, this.introProgress);

    this.character.group.position.set(0, currentHeroY, 0);
    this.character.group.scale.set(scaleHero, scaleHero, scaleHero);
    this.character.group.rotation.set(0, 0, 0);
    this.character.setHalfBodyMode(false);
  }

  initEventListeners() {
    const heroEl = document.querySelector('.hero-section');
    if (heroEl) {
      heroEl.addEventListener('click', (e) => {
        if (!e.target.closest('a, button')) {
          if (this.character) this.character.triggerWave();
        }
      });
    }
  }

  resize(newW, newH) {
    if (!this.renderer || !this.camera) return;
    this.camera.aspect = newW / newH;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(newW, newH);
    this.updateTransform();
  }

  render(delta, time, mouseNDC, raycaster, isVisible = true) {
    // 1. Advance Intro Animation
    if (this.isIntroPlaying) {
      this.introTimer += delta;
      if (this.introTimer > 0) {
        const t = Math.min(1, this.introTimer / this.introDuration);
        this.introProgress = easeOutBack(t);
        if (t >= 1) {
          this.isIntroPlaying = false;
          this.introProgress = 1;
        }
      } else {
        this.introProgress = 0;
      }
      this.updateTransform();
    }

    // 2. Render Scene if visible (0% GPU when offscreen)
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
