/**
 * app.js
 * Editorial Cream Magazine Hero Section.
 * Features:
 * - 3D character peeks up from the bottom edge ("nongol dari bawah")
 * - Sits gracefully right below the giant "MY portfoliO" editorial masthead
 * - Fixed camera (Orbit controls rotation/zoom/pan disabled)
 * - True 3D raycasted cursor gaze tracking (looks up towards the title & mouse)
 * - Click anywhere to wave friendly hand wave
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SkinGenerator } from './SkinGenerator.js';
import { MinecraftCharacter } from './MinecraftCharacter.js';

class App {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.mouseNDC = new THREE.Vector2(0, 0);
    this.raycaster = new THREE.Raycaster();
    this.clock = new THREE.Clock();

    this.initScene();
    this.initLights();
    this.initCharacter();
    this.initControls();
    this.initEventListeners();

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = null; // Transparent canvas for seamless cream poster background

    this.camera = new THREE.PerspectiveCamera(
      36,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    // Camera looking straight at the scene center
    this.camera.position.set(0, 0, 4.2);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);
  }

  initLights() {
    // Soft high-fashion ambient light
    const ambientLight = new THREE.AmbientLight('#ffffff', 1.7);
    this.scene.add(ambientLight);

    // Main Key Light from top-front shining down onto face & curls
    this.keyLight = new THREE.DirectionalLight('#fffaf0', 2.3);
    this.keyLight.position.set(2.5, 4.0, 3.5);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 2048;
    this.keyLight.shadow.mapSize.height = 2048;
    this.keyLight.shadow.camera.near = 0.5;
    this.keyLight.shadow.camera.far = 20;
    this.keyLight.shadow.camera.left = -3;
    this.keyLight.shadow.camera.right = 3;
    this.keyLight.shadow.camera.top = 4;
    this.keyLight.shadow.camera.bottom = -4;
    this.keyLight.shadow.bias = -0.0004;
    this.scene.add(this.keyLight);

    // Soft rim light to highlight hair ringlets and shoulders
    const rimLight = new THREE.DirectionalLight('#ffffff', 1.4);
    rimLight.position.set(-2.5, 3.5, -2.5);
    this.scene.add(rimLight);

    // Front warm fill light for blazer and face
    const fillLight = new THREE.DirectionalLight('#fef3c7', 1.0);
    fillLight.position.set(-2, 0, 3);
    this.scene.add(fillLight);
  }

  initCharacter() {
    this.skinGenerator = new SkinGenerator();
    const canvas = this.skinGenerator.generate();

    // Scale calibrated for elegant magazine bust peeking from bottom
    this.character = new MinecraftCharacter({
      skinCanvas: canvas,
      scale: 0.11
    });

    this.updateCharacterPosition();
    this.scene.add(this.character.group);
  }

  updateCharacterPosition() {
    if (!this.character) return;
    // Calculate the exact bottom of the viewport in 3D world space
    const halfH = this.camera.position.z * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const bottomWorldY = this.camera.position.y - halfH;

    // Anchor collar/upper chest (local y = 21.5) right at the bottom edge of the screen!
    // Feet, legs, and lower torso remain completely submerged off-screen below.
    // Head, face, and curly hair peek up gracefully into the lower half.
    this.character.group.position.set(0, bottomWorldY - (21.5 * this.character.scale), 0);
  }

  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // Fixed camera framing - no rotation or zoom
    this.controls.enableRotate = false;
    this.controls.enablePan = false;
    this.controls.enableZoom = false;
    this.controls.target.set(0, 0, 0);
  }

  initEventListeners() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.updateCharacterPosition();
    });

    // Mouse tracking
    window.addEventListener('mousemove', (e) => {
      this.mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        this.mouseNDC.x = (touch.clientX / window.innerWidth) * 2 - 1;
        this.mouseNDC.y = -(touch.clientY / window.innerHeight) * 2 + 1;
      }
    });

    // Click to wave (active in hero area, avoids triggering when clicking links/buttons)
    window.addEventListener('click', (e) => {
      if (window.scrollY < window.innerHeight * 0.8 && !e.target.closest('a, button')) {
        if (this.character) {
          this.character.triggerWave();
        }
      }
    });

    // Scroll listener: optimize and cleanly hide 3D character when completely scrolled past hero
    window.addEventListener('scroll', () => {
      if (this.character) {
        const isHeroVisible = window.scrollY < window.innerHeight;
        this.character.group.visible = isHeroVisible;
      }
    });
  }

  animate() {
    requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    if (this.character && this.character.group.visible) {
      // 3D Raycasting gaze tracking:
      // Character looks up from below towards mouse cursor across the screen
      this.raycaster.setFromCamera(this.mouseNDC, this.camera);

      const headWorld = new THREE.Vector3();
      this.character.headGroup.getWorldPosition(headWorld);

      const camDir = new THREE.Vector3();
      this.camera.getWorldDirection(camDir);

      const planePoint = headWorld.clone().addScaledVector(camDir, -2.5);
      const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(camDir, planePoint);

      const targetWorld = new THREE.Vector3();
      this.raycaster.ray.intersectPlane(plane, targetWorld);

      if (targetWorld) {
        this.character.lookAtWorldPoint(targetWorld);
      }

      this.character.update(delta, time);
    }

    if (!this.character || this.character.group.visible) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new App();
});
