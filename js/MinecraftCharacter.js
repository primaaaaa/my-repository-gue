/**
 * MinecraftCharacter.js
 * 3D Stylized Blocky Character Component built with Three.js.
 * Features:
 * - Full-coverage 3D curly haircut (completely wraps the skull: top, back, sides, and wavy bangs)
 * - Accurate 3D ray-traced cursor tracking (character's gaze points exactly at the mouse pointer)
 * - Stands firmly in place (zero vertical bobbing)
 * - Waving animation triggers only when clicked
 */

import * as THREE from 'three';

export class MinecraftCharacter {
  constructor(options = {}) {
    this.skinCanvas = options.skinCanvas;
    this.scale = options.scale || 0.092;

    // Root group
    this.group = new THREE.Group();
    this.group.name = 'StylizedBlockyCharacter';

    // Tracking & Waving states
    this.isHeadTracking = true;
    this.isWaving = false;
    this.waveTimer = 0;
    this.waveDuration = 2.4; // Seconds to complete wave cycle

    // Head tracking angles (interpolated)
    this.targetYaw = 0;
    this.targetPitch = 0;
    this.currentYaw = 0;
    this.currentPitch = 0;

    this.parts = {};

    this.setupMaterials();
    this.buildModel();

    this.group.scale.set(this.scale, this.scale, this.scale);
  }

  setupMaterials() {
    this.texture = new THREE.CanvasTexture(this.skinCanvas);
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.minFilter = THREE.LinearMipmapLinearFilter;
    this.texture.generateMipmaps = true;

    this.bodyMaterial = new THREE.MeshLambertMaterial({
      map: this.texture,
      side: THREE.FrontSide
    });

    this.skinMaterial = new THREE.MeshLambertMaterial({
      color: '#cb8e67' // Tan skin from photo
    });

    this.hairMaterial = new THREE.MeshLambertMaterial({
      color: '#221d1b' // Dark brown-black curly hair
    });

    this.shoeMaterial = new THREE.MeshLambertMaterial({
      color: '#ffffff'
    });
  }

  createBoxGeometry(w, h, d, ox, oy, textureW = 1024, textureH = 1024) {
    const S = 16;
    const geometry = new THREE.BoxGeometry(w, h, d);

    const px = ox * S;
    const py = oy * S;
    const pw = w * S;
    const ph = h * S;
    const pd = d * S;

    const u0 = px / textureW;
    const u1 = (px + pd) / textureW;
    const u2 = (px + pd + pw) / textureW;
    const u3 = (px + 2 * pd + pw) / textureW;
    const u4 = (px + 2 * pd + 2 * pw) / textureW;

    const v0 = 1.0 - py / textureH;
    const v1 = 1.0 - (py + pd) / textureH;
    const v2 = 1.0 - (py + pd + ph) / textureH;

    const uvs = [
      // 0: +X (Left side of character)
      u2, v1,
      u3, v1,
      u2, v2,
      u3, v2,

      // 1: -X (Right side of character)
      u0, v1,
      u1, v1,
      u0, v2,
      u1, v2,

      // 2: +Y (Top)
      u1, v0,
      u2, v0,
      u1, v1,
      u2, v1,

      // 3: -Y (Bottom)
      u2, v0,
      u3, v0,
      u2, v1,
      u3, v1,

      // 4: +Z (Front)
      u1, v1,
      u2, v1,
      u1, v2,
      u2, v2,

      // 5: -Z (Back)
      u3, v1,
      u4, v1,
      u3, v2,
      u4, v2
    ];

    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.computeVertexNormals();
    return geometry;
  }

  buildModel() {
    // ------------------------------------------------------------------
    // TORSO / BODY (Jas Almamater: 8 wide, 12 tall, 4.5 deep)
    // ------------------------------------------------------------------
    this.torsoGroup = new THREE.Group();
    this.torsoGroup.position.set(0, 12, 0); // Pivot at hips
    this.group.add(this.torsoGroup);
    this.parts.torso = this.torsoGroup;

    const torsoGeo = this.createBoxGeometry(8, 12, 4.5, 16, 16);
    const torsoMesh = new THREE.Mesh(torsoGeo, this.bodyMaterial);
    torsoMesh.position.set(0, 6, 0);
    torsoMesh.castShadow = true;
    torsoMesh.receiveShadow = true;
    this.torsoGroup.add(torsoMesh);

    // ------------------------------------------------------------------
    // HEAD (8 x 8 x 8, with full-coverage curly hair & ears)
    // ------------------------------------------------------------------
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 12, 0); // At top of torso (y=24 relative to character)
    this.torsoGroup.add(this.headGroup);
    this.parts.head = this.headGroup;

    const headGeo = this.createBoxGeometry(8, 8, 8, 0, 0);
    const headMesh = new THREE.Mesh(headGeo, this.bodyMaterial);
    headMesh.position.set(0, 4, 0);
    headMesh.castShadow = true;
    headMesh.receiveShadow = true;
    this.headGroup.add(headMesh);

    // 3D Blocky Ears
    const earGeo = new THREE.BoxGeometry(0.55, 1.5, 1.1);
    const rightEar = new THREE.Mesh(earGeo, this.skinMaterial);
    rightEar.position.set(-4.27, 3.8, -0.4);
    rightEar.castShadow = true;
    this.headGroup.add(rightEar);

    const leftEar = new THREE.Mesh(earGeo, this.skinMaterial);
    leftEar.position.set(4.27, 3.8, -0.4);
    leftEar.castShadow = true;
    this.headGroup.add(leftEar);

    // ------------------------------------------------------------------
    // FULL-COVERAGE 3D CURLY HAIRCUT (Wraps skull 100%: top, back, sides, bangs)
    // ------------------------------------------------------------------
    this.buildFullCurlyHair();

    // ------------------------------------------------------------------
    // RIGHT ARM (Pivot at shoulder: x=-6, y=10 inside torsoGroup)
    // ------------------------------------------------------------------
    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(-6, 10, 0);
    this.torsoGroup.add(this.rightArmGroup);
    this.parts.rightArm = this.rightArmGroup;

    const rightArmGeo = this.createBoxGeometry(4, 12, 4, 40, 16);
    const rightArmMesh = new THREE.Mesh(rightArmGeo, this.bodyMaterial);
    rightArmMesh.position.set(0, -5, 0);
    rightArmMesh.castShadow = true;
    rightArmMesh.receiveShadow = true;
    this.rightArmGroup.add(rightArmMesh);

    // ------------------------------------------------------------------
    // LEFT ARM (Pivot at shoulder: x=+6, y=10 inside torsoGroup)
    // ------------------------------------------------------------------
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(6, 10, 0);
    this.torsoGroup.add(this.leftArmGroup);
    this.parts.leftArm = this.leftArmGroup;

    const leftArmGeo = this.createBoxGeometry(4, 12, 4, 32, 48);
    const leftArmMesh = new THREE.Mesh(leftArmGeo, this.bodyMaterial);
    leftArmMesh.position.set(0, -5, 0);
    leftArmMesh.castShadow = true;
    leftArmMesh.receiveShadow = true;
    this.leftArmGroup.add(leftArmMesh);

    // ------------------------------------------------------------------
    // RIGHT LEG & SNEAKER (Hip at x=-2.1, y=12)
    // ------------------------------------------------------------------
    this.rightLegGroup = new THREE.Group();
    this.rightLegGroup.position.set(-2.1, 12, 0);
    this.group.add(this.rightLegGroup);
    this.parts.rightLeg = this.rightLegGroup;

    const rightLegGeo = this.createBoxGeometry(4, 12, 4, 0, 16);
    const rightLegMesh = new THREE.Mesh(rightLegGeo, this.bodyMaterial);
    rightLegMesh.position.set(0, -6, 0);
    rightLegMesh.castShadow = true;
    rightLegMesh.receiveShadow = true;
    this.rightLegGroup.add(rightLegMesh);

    const toeGeo = new THREE.BoxGeometry(3.96, 2.0, 1.8);
    const rightToe = new THREE.Mesh(toeGeo, this.shoeMaterial);
    rightToe.position.set(0, -11, 1.7);
    rightToe.castShadow = true;
    this.rightLegGroup.add(rightToe);

    // ------------------------------------------------------------------
    // LEFT LEG & SNEAKER (Hip at x=+2.1, y=12)
    // ------------------------------------------------------------------
    this.leftLegGroup = new THREE.Group();
    this.leftLegGroup.position.set(2.1, 12, 0);
    this.group.add(this.leftLegGroup);
    this.parts.leftLeg = this.leftLegGroup;

    const leftLegGeo = this.createBoxGeometry(4, 12, 4, 16, 48);
    const leftLegMesh = new THREE.Mesh(leftLegGeo, this.bodyMaterial);
    leftLegMesh.position.set(0, -6, 0);
    leftLegMesh.castShadow = true;
    leftLegMesh.receiveShadow = true;
    this.leftLegGroup.add(leftLegMesh);

    const leftToe = new THREE.Mesh(toeGeo, this.shoeMaterial);
    leftToe.position.set(0, -11, 1.7);
    leftToe.castShadow = true;
    this.leftLegGroup.add(leftToe);

    // Resting arm poses
    this.rightArmGroup.rotation.set(0, 0, -0.08);
    this.leftArmGroup.rotation.set(0, 0, 0.08);
  }

  buildFullCurlyHair() {
    const hair = new THREE.Group();
    this.headGroup.add(hair);

    // ------------------------------------------------------------------
    // CURLY LOW-TAPER FADE (Matching latest reference photo):
    // 1. Natural curly ringlet volume on crown & top
    // 2. Clean low taper fade around ears & nape
    // 3. Signature loose ringlet coil dangling in front over the forehead!
    // 4. Textured spiral curl clusters forming a bouncy curly dome
    // ------------------------------------------------------------------

    // 1. MAIN CURLY HAIR MASS (Wraps top & upper back from y=5.2 upwards)
    const curlyCap = new THREE.Mesh(new THREE.BoxGeometry(8.8, 3.4, 8.8), this.hairMaterial);
    curlyCap.position.set(0, 7.1, 0.1);
    curlyCap.castShadow = true;
    hair.add(curlyCap);

    // 2. TAPER TRANSITION (Upper back of head blends down to nape: y=3.8 to 5.6)
    const upperNape = new THREE.Mesh(new THREE.BoxGeometry(8.6, 2.0, 1.2), this.hairMaterial);
    upperNape.position.set(0, 4.6, -3.9);
    upperNape.castShadow = true;
    hair.add(upperNape);

    // 3. FRONT CURLY FRINGE & SIGNATURE DANGLING RINGLET
    // Base horizontal fringe shelf across the top of forehead
    const fringeBase = new THREE.Mesh(new THREE.BoxGeometry(7.8, 1.4, 1.2), this.hairMaterial);
    fringeBase.position.set(0, 6.4, 4.3);
    fringeBase.castShadow = true;
    hair.add(fringeBase);

    // Left curl cluster
    const curlL = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 1.0), this.hairMaterial);
    curlL.position.set(-2.4, 5.5, 4.35);
    curlL.castShadow = true;
    hair.add(curlL);

    // SIGNATURE DANGLING CURL RINGLET (Dangles down over forehead like in the photo!)
    // Upper ringlet segment
    const ringletUpper = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 1.0), this.hairMaterial);
    ringletUpper.position.set(-0.9, 5.2, 4.45);
    ringletUpper.castShadow = true;
    hair.add(ringletUpper);

    // Dangling ringlet coil tip (hangs down lower over left brow)
    const ringletTip = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 0.95), this.hairMaterial);
    ringletTip.position.set(-0.6, 4.35, 4.55);
    ringletTip.rotation.z = -0.22;
    ringletTip.rotation.x = 0.18;
    ringletTip.castShadow = true;
    hair.add(ringletTip);

    // Center-right curl cluster
    const curlCR = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.3, 1.0), this.hairMaterial);
    curlCR.position.set(0.8, 5.3, 4.4);
    curlCR.castShadow = true;
    hair.add(curlCR);

    // Right curl cluster
    const curlR = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.1, 0.9), this.hairMaterial);
    curlR.position.set(2.3, 5.5, 4.35);
    curlR.castShadow = true;
    hair.add(curlR);

    // 4. DEFINED BOUNCY RINGLET COIL CLUSTERS ON CROWN & TOP
    // Mid dome
    const midDome = new THREE.Mesh(new THREE.BoxGeometry(7.8, 1.2, 7.8), this.hairMaterial);
    midDome.position.set(0, 8.8, 0.0);
    midDome.castShadow = true;
    hair.add(midDome);

    // Individual bouncy curl coil ridges
    const coilFront = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.0, 3.0), this.hairMaterial);
    coilFront.position.set(-0.4, 9.6, 1.4);
    coilFront.rotation.y = 0.1;
    coilFront.castShadow = true;
    hair.add(coilFront);

    const coilFrontR = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.9, 2.8), this.hairMaterial);
    coilFrontR.position.set(2.0, 9.4, 1.2);
    coilFrontR.rotation.y = -0.15;
    coilFrontR.castShadow = true;
    hair.add(coilFrontR);

    const coilCrownL = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.9, 3.2), this.hairMaterial);
    coilCrownL.position.set(-1.8, 9.5, -0.4);
    coilCrownL.rotation.y = 0.12;
    coilCrownL.castShadow = true;
    hair.add(coilCrownL);

    const coilCrownC = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.1, 3.2), this.hairMaterial);
    coilCrownC.position.set(0.4, 9.7, -0.2);
    coilCrownC.rotation.y = -0.1;
    coilCrownC.castShadow = true;
    hair.add(coilCrownC);

    const coilCrownR = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.9, 3.0), this.hairMaterial);
    coilCrownR.position.set(1.9, 9.5, -0.6);
    coilCrownR.rotation.y = 0.15;
    coilCrownR.castShadow = true;
    hair.add(coilCrownR);

    const coilBack = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.9, 3.0), this.hairMaterial);
    coilBack.position.set(0.0, 9.3, -1.8);
    coilBack.castShadow = true;
    hair.add(coilBack);
  }

  /**
   * Set target point in 3D world space for mathematically exact cursor lookAt
   */
  lookAtWorldPoint(worldPoint) {
    if (!this.isHeadTracking) return;

    // Transform world point into character's local coordinates
    const localTarget = this.group.worldToLocal(worldPoint.clone());

    // Head is centered at (0, 24, 0) in character local coordinates
    const headLocalPos = new THREE.Vector3(0, 24, 0);
    const dir = localTarget.clone().sub(headLocalPos);

    // Calculate exact yaw and pitch
    const yaw = Math.atan2(dir.x, dir.z);
    const distH = Math.hypot(dir.x, dir.z);
    const pitch = -Math.atan2(dir.y, distH);

    // Clamp angles to natural human neck limits (generous upward tilt to gaze up at title & mouse)
    this.targetYaw = Math.max(-1.15, Math.min(1.15, yaw));
    this.targetPitch = Math.max(-0.85, Math.min(0.35, pitch));
  }

  /**
   * Trigger waving animation on user click
   */
  triggerWave() {
    this.isWaving = true;
    this.waveTimer = 0;
  }

  update(delta, time) {
    // ------------------------------------------------------------------
    // 1. POSITION STABLE (Torso locked at hips, no idle bobbing)
    // ------------------------------------------------------------------
    this.torsoGroup.position.y = 12;

    // ------------------------------------------------------------------
    // 2. ACCURATE HEAD TRACKING (Smoothly follows 3D ray target)
    // ------------------------------------------------------------------
    if (this.isHeadTracking) {
      const lerpSpeed = 0.12;
      this.currentYaw += (this.targetYaw - this.currentYaw) * lerpSpeed;
      this.currentPitch += (this.targetPitch - this.currentPitch) * lerpSpeed;

      // Combined rotation: head (82%) + torso (18%) = 100% exact gaze direction
      this.headGroup.rotation.y = this.currentYaw * 0.82;
      this.headGroup.rotation.x = this.currentPitch * 0.85;

      this.torsoGroup.rotation.y = this.currentYaw * 0.18;
      this.torsoGroup.rotation.x = this.currentPitch * 0.15;
    }

    // ------------------------------------------------------------------
    // 3. ARMS ANIMATION (Waving ONLY on click)
    // ------------------------------------------------------------------
    this.leftArmGroup.rotation.set(0, 0, 0.08);

    if (this.isWaving) {
      this.waveTimer += delta;
      const progress = this.waveTimer / this.waveDuration;

      if (progress >= 1.0) {
        this.isWaving = false;
        this.waveTimer = 0;
        this.rightArmGroup.rotation.set(0, 0, -0.08);
      } else {
        const inTime = 0.35;
        const outTime = 0.35;
        let env = 1.0;

        if (this.waveTimer < inTime) {
          env = this.waveTimer / inTime;
          env = env * env * (3 - 2 * env);
        } else if (this.waveTimer > this.waveDuration - outTime) {
          env = (this.waveDuration - this.waveTimer) / outTime;
          env = env * env * (3 - 2 * env);
        }

        const waveAngle = Math.sin(this.waveTimer * 11) * 0.32;
        const targetZ = -2.35 + waveAngle;
        const targetX = -0.22;
        const targetY = 0.35;

        this.rightArmGroup.rotation.z = -0.08 + (targetZ - (-0.08)) * env;
        this.rightArmGroup.rotation.x = 0 + (targetX - 0) * env;
        this.rightArmGroup.rotation.y = 0 + (targetY - 0) * env;
      }
    } else {
      this.rightArmGroup.rotation.set(0, 0, -0.08);
    }

    this.rightLegGroup.rotation.set(0, 0, 0);
    this.leftLegGroup.rotation.set(0, 0, 0);
  }
}
