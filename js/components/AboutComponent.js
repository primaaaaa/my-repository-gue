/**
 * AboutComponent.js
 * Encapsulates the About section 3D diorama bust embedded directly
 * inside #aboutFrame, entrance emergence animation, and gaze tracking.
 */

import * as THREE from 'three';
import { MinecraftCharacter } from '../MinecraftCharacter.js';
import { easeOutBack } from '../utils/math.js';

export class AboutComponent {
  constructor(skinGenerator, isMobileDevice = false) {
    this.skinGenerator = skinGenerator;
    this.isMobileDevice = isMobileDevice;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.character = null;

    // Entrance Animation State
    this.entranceProgress = 0;
    this.isEntrancePlaying = false;
    this.entranceDuration = 0.95;
    this.entranceTimer = 0;
    this.entranceTriggered = false;

    this.initScene();
    this.initEventListeners();
  }

  initScene() {
    const canvas = document.getElementById('aboutCanvas');
    const frameEl = document.getElementById('aboutFrame');
    if (!canvas || !frameEl) return;

    this.scene = new THREE.Scene();

    const w = frameEl.clientWidth || 300;
    const h = frameEl.clientHeight || 400;

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
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    // Lighting
    const ambientLight = new THREE.AmbientLight('#ffffff', 1.6);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight('#fffaf0', 2.0);
    keyLight.position.set(2, 4.5, 3.5);
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#ffffff', 1.2);
    rimLight.position.set(-2, 3.0, -2);
    this.scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight('#fef3c7', 0.9);
    fillLight.position.set(-2, 0, 3);
    this.scene.add(fillLight);

    // About Character
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

    const targetRatio = isMobile ? 0.82 : 0.78;
    const desiredWorldH = (2 * halfH) * targetRatio;
    const scaleAbout = desiredWorldH / 23.0;

    const Y_standing = -halfH - (10.5 * scaleAbout);
    const Y_submerged = -halfH - (35.0 * scaleAbout);

    const currentY = THREE.MathUtils.lerp(Y_submerged, Y_standing, this.entranceProgress);

    this.character.group.position.set(0, currentY, 0);
    this.character.group.scale.set(scaleAbout, scaleAbout, scaleAbout);
    this.character.group.rotation.set(0, -0.22, 0);
    this.character.setHalfBodyMode(false);
  }

  initEventListeners() {
    const aboutEl = document.getElementById('about');
    if (aboutEl) {
      aboutEl.addEventListener('click', (e) => {
        if (!e.target.closest('a, button')) {
          if (this.character) this.character.triggerWave();
        }
      });
    }
  }

  triggerEntrance() {
    if (!this.entranceTriggered) {
      this.entranceTriggered = true;
      this.isEntrancePlaying = true;
      this.entranceTimer = 0;
    }
  }

  resize() {
    const frameEl = document.getElementById('aboutFrame');
    if (frameEl && this.renderer && this.camera) {
      const fw = frameEl.clientWidth || 300;
      const fh = frameEl.clientHeight || 400;
      this.camera.aspect = fw / fh;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(fw, fh);
      this.updateTransform();
    }
  }

  render(delta, time, mouseNDC, raycaster, isVisible = true) {
    // 1. Advance Entrance Animation
    if (this.isEntrancePlaying) {
      this.entranceTimer += delta;
      const t = Math.min(1, this.entranceTimer / this.entranceDuration);
      this.entranceProgress = easeOutBack(t);
      if (t >= 1) {
        this.isEntrancePlaying = false;
        this.entranceProgress = 1;
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
