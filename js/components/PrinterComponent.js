/**
 * PrinterComponent.js
 * High-angle Top-Down POV 3D CV Dispenser / Printer matching user reference image.
 * Features:
 * - Sleek chrome/white capsule bar dispenser mounted at the top.
 * - Left red asterisk icon, center glowing paper exit slit, right LED status dot.
 * - CV paper emerges downwards with natural curved paper drape & soft drop shadow.
 * - High-resolution canvas texture with stats grid, experience, and red starburst badge.
 * - Interactive raycasting: click to trigger realistic 2-second dispensing animation.
 * - Auto-triggers /CV_Portofolio.pdf download upon print completion.
 * - Seamless handoff to restore lanyard after download.
 */

import * as THREE from 'three';

export class PrinterComponent {
  constructor(options = {}) {
    this.container = options.container || document.getElementById('printerCanvasWrapper');
    this.canvas = options.canvas || document.getElementById('printerCanvas');
    this.onPrintComplete = options.onPrintComplete || null;
    this.onDismiss = options.onDismiss || null;

    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Groups & Meshes
    this.mainGroup = null;
    this.dispenserGroup = null;
    this.paperMesh = null;
    this.shadowMesh = null;
    this.ledMesh = null;
    this.ledMaterial = null;
    this.slitGlowMesh = null;
    this.slitLight = null;

    // Interactive Raycasting
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-999, -999);
    this.interactiveObjects = [];
    this.isHovered = false;

    // Animation & State
    this.isActive = false;
    this.isPrinting = false;
    this.isPrinted = false;
    this.printStartTime = 0;
    this.printDuration = 2000; // 2 seconds
    this.printProgress = 0;

    // Paper Y Positions (Dispensing downwards from top slot)
    // Slot is at Y = 1.32. Paper height is 3.3.
    // At start: tucked inside, only bottom ~0.25 peeking out
    this.paperStartY = 2.75;
    // At end: fully dispensed down
    this.paperEndY = -0.42;

    this.baseGroupY = 0;
    this.baseGroupX = 0;

    this.init();
  }

  init() {
    if (!this.canvas) return;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera (POV from above / top-down perspective, looking slightly down at dispenser & paper)
    const width = this.container ? this.container.clientWidth : 480;
    const height = this.container ? this.container.clientHeight : 440;
    this.camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 50);
    this.camera.position.set(0, 0.45, 5.2);
    this.camera.lookAt(0, 0.35, 0);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // 4. Lighting (Clean high-fashion studio lighting)
    this.setupLighting();

    // 5. Build Capsule Dispenser & CV Paper
    this.buildDispenserScene();

    // 6. Interactive Listeners
    this.initInteractionListeners();
  }

  setupLighting() {
    // Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    this.scene.add(ambientLight);

    // Top Key Light (Highlights the metallic capsule top rim)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(1.5, 4.0, 3.5);
    this.scene.add(keyLight);

    // Front Soft Fill Light
    const fillLight = new THREE.DirectionalLight(0xfef2f2, 0.6);
    fillLight.position.set(-2.0, 1.0, 3.0);
    this.scene.add(fillLight);

    // Bottom Rim Glow Light (Under the dispenser slit)
    this.slitLight = new THREE.PointLight(0xff3b30, 0.8, 3.0);
    this.slitLight.position.set(0, 1.25, 0.2);
    this.scene.add(this.slitLight);
  }

  createCVTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1420;
    const ctx = canvas.getContext('2d');

    // Clean White Paper Sheet
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle edge border
    ctx.strokeStyle = '#F1F5F9';
    ctx.lineWidth = 3;
    ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);

    // --- TOP SLOGAN / HEADER ---
    ctx.fillStyle = '#D11A2A';
    ctx.font = '800 16px "Space Grotesk", sans-serif';
    ctx.fillText('PORTFOLIO & CURRICULUM VITAE • 2026', 64, 75);

    ctx.fillStyle = '#0F172A';
    ctx.font = '900 36px "Space Grotesk", sans-serif';
    ctx.fillText('MUHAMMAD PRIMA YUDHISTIRA', 64, 125);

    ctx.fillStyle = '#475569';
    ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Software Engineer & Project Manager — IPB University', 64, 160);

    // Abstract graphic curve header accent (as in reference image)
    ctx.strokeStyle = 'rgba(209, 26, 42, 0.18)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(canvas.width - 120, 110, 70, 0, Math.PI * 1.6);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(209, 26, 42, 0.35)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(canvas.width - 120, 110, 50, 0.2, Math.PI * 1.8);
    ctx.stroke();

    // --- METRIC STATS ROW (4 Columns, exactly matching reference image!) ---
    let statY = 245;
    const stats = [
      { val: '2024-28', label: 'SV IPB Univ', sub: 'Rekayasa Perangkat Lunak' },
      { val: '10+', label: 'Featured Projects', sub: 'Web, Mobile, & UI/UX' },
      { val: '100%', label: 'Commitment Rate', sub: 'Agile & Team Leadership' },
      { val: '1st', label: 'Juara 1 LKS Kota', sub: 'Web Technologies' }
    ];

    const colWidth = (canvas.width - 128) / 4;
    stats.forEach((s, idx) => {
      const colX = 64 + idx * colWidth;
      ctx.fillStyle = '#0F172A';
      ctx.font = '900 32px "Space Grotesk", sans-serif';
      ctx.fillText(s.val, colX, statY);

      ctx.fillStyle = '#D11A2A';
      ctx.font = '700 13px "Space Grotesk", sans-serif';
      ctx.fillText(s.label, colX, statY + 22);

      ctx.fillStyle = '#64748B';
      ctx.font = '500 11.5px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(s.sub, colX, statY + 38);
    });

    // Divider Line
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(64, statY + 65);
    ctx.lineTo(canvas.width - 64, statY + 65);
    ctx.stroke();

    // --- EXPERIENCE / RIWAYAT PROJEK SECTION ---
    let expY = 360;
    ctx.fillStyle = '#0F172A';
    ctx.font = '900 24px "Space Grotesk", sans-serif';
    ctx.fillText('Experience & Key Highlights', 64, expY);
    expY += 36;

    const experiences = [
      {
        role: 'Full-Stack Web Developer & Team Lead',
        inst: 'MediGo Healthcare Platform',
        period: '2025 — Sekarang',
        desc: 'Merancang arsitektur telemedicine terintegrasi dengan reservasi faskes, rekam medis digital, dan real-time queue management.'
      },
      {
        role: 'Lead Frontend & Interactive 3D Designer',
        inst: 'WertuGo Tourism System',
        period: '2024 — 2025',
        desc: 'Membangun aplikasi pariwisata interaktif berbasis React, Tailwind, dan modul Three.js dengan optimasi performa tinggi.'
      },
      {
        role: 'Software Engineering Scholar',
        inst: 'IPB University (Sekolah Vokasi)',
        period: '2024 — 2028',
        desc: 'Fokus pada Software Engineering, Project Management, Agile Framework, arsitektur basis data, dan kepemimpinan tim.'
      },
      {
        role: 'Juara 1 Web Technologies & Ketua IT Club',
        inst: 'SMKN 5 Kota Bekasi',
        period: '2021 — 2024',
        desc: 'Mengembangkan sistem manajemen sekolah dan menjuarai Lomba Kompetensi Siswa (LKS) tingkat Kota Bekasi.'
      }
    ];

    experiences.forEach(e => {
      ctx.fillStyle = '#94A3B8';
      ctx.font = '700 13px "Space Grotesk", sans-serif';
      ctx.fillText(e.period, 64, expY);

      ctx.fillStyle = '#0F172A';
      ctx.font = '800 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(e.role, 240, expY);

      ctx.fillStyle = '#D11A2A';
      ctx.font = '700 14px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(` • ${e.inst}`, 240 + ctx.measureText(e.role).width + 6, expY);

      ctx.fillStyle = '#475569';
      ctx.font = '500 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(e.desc, 240, expY + 22);

      expY += 68;
    });

    // Divider Line
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(64, expY + 10);
    ctx.lineTo(canvas.width - 64, expY + 10);
    ctx.stroke();
    expY += 45;

    // --- TECH STACK BADGES ---
    ctx.fillStyle = '#0F172A';
    ctx.font = '900 20px "Space Grotesk", sans-serif';
    ctx.fillText('Core Technologies', 64, expY);
    expY += 28;

    const techPills = ['React', 'Next.js', 'Laravel', 'Tailwind CSS', 'Python', 'Three.js', 'MySQL', 'MongoDB', 'Git', 'Agile'];
    let pillX = 64;
    techPills.forEach(tech => {
      ctx.font = '700 12.5px "Space Grotesk", sans-serif';
      const tw = ctx.measureText(tech).width;
      ctx.fillStyle = '#F8FAFC';
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(pillX, expY - 16, tw + 20, 24, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#0F172A';
      ctx.fillText(tech, pillX + 10, expY);
      pillX += tw + 30;
      if (pillX > canvas.width - 240) {
        pillX = 64;
        expY += 34;
      }
    });

    // --- OFFICIAL RED STARBURST BADGE (Bottom Right, matching reference image!) ---
    const starCenterX = canvas.width - 145;
    const starCenterY = canvas.height - 140;
    const outerRadius = 52;
    const innerRadius = 38;
    const points = 16;

    ctx.save();
    ctx.fillStyle = '#D11A2A';
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const radius = (i % 2 === 0) ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points;
      const x = starCenterX + Math.cos(angle) * radius;
      const y = starCenterY + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Badge Text inside starburst
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 10.5px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('OFFICIAL', starCenterX, starCenterY - 10);
    ctx.font = '900 11.5px "Space Grotesk", sans-serif';
    ctx.fillText('PORTFOLIO', starCenterX, starCenterY + 4);
    ctx.font = '800 10px "Space Grotesk", sans-serif';
    ctx.fillText('2026', starCenterX, starCenterY + 18);
    ctx.restore();

    // Bottom Footer Doc Details
    ctx.fillStyle = '#94A3B8';
    ctx.font = '600 12px "Space Grotesk", sans-serif';
    ctx.fillText('DOC-ID: PRIMA-YUDHISTIRA-CV-2026-VERIFIED', 64, canvas.height - 110);
    ctx.fillText('IPB University • SV Rekayasa Perangkat Lunak', 64, canvas.height - 88);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }

  buildDispenserScene() {
    this.mainGroup = new THREE.Group();
    this.scene.add(this.mainGroup);

    // ========================================================
    // 1. THE CAPSULE PRINTER BAR (Top Horizontal Pill)
    // ========================================================
    this.dispenserGroup = new THREE.Group();
    this.dispenserGroup.position.set(0, 1.48, 0.05);
    this.mainGroup.add(this.dispenserGroup);

    // Materials
    // Metallic Chrome / Glossy Silver-White Body (matching reference image)
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xEEEEEE,
      metalness: 0.82,
      roughness: 0.16
    });

    const innerRimMat = new THREE.MeshStandardMaterial({
      color: 0xCCCCCC,
      metalness: 0.9,
      roughness: 0.1
    });

    const frontWhiteFaceMat = new THREE.MeshStandardMaterial({
      color: 0xFAFAFA,
      metalness: 0.25,
      roughness: 0.35
    });

    const darkSlotMat = new THREE.MeshStandardMaterial({
      color: 0x111113,
      roughness: 0.6,
      metalness: 0.2
    });

    const crimsonMat = new THREE.MeshStandardMaterial({
      color: 0xD11A2A,
      roughness: 0.3,
      metalness: 0.15
    });

    // Create Capsule Geometry using ExtrudeGeometry with rounded corners
    const shape = new THREE.Shape();
    const w = 3.3;
    const h = 0.54;
    const r = 0.26;
    const x = -w / 2;
    const y = -h / 2;

    shape.moveTo(x + r, y);
    shape.lineTo(x + w - r, y);
    shape.quadraticCurveTo(x + w, y, x + w, y + r);
    shape.lineTo(x + w, y + h - r);
    shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    shape.lineTo(x + r, y + h);
    shape.quadraticCurveTo(x, y + h, x, y + h - r);
    shape.lineTo(x, y + r);
    shape.quadraticCurveTo(x, y, x + r, y);

    const extrudeSettings = {
      steps: 1,
      depth: 0.36,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.06,
      bevelSegments: 8
    };

    const capsuleGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    capsuleGeo.center();
    const capsuleMesh = new THREE.Mesh(capsuleGeo, chromeMat);
    this.dispenserGroup.add(capsuleMesh);
    this.interactiveObjects.push(capsuleMesh);

    // Front Recessed White Plate
    const frontPlateGeo = new THREE.PlaneGeometry(3.08, 0.44);
    const frontPlate = new THREE.Mesh(frontPlateGeo, frontWhiteFaceMat);
    frontPlate.position.set(0, 0, 0.245);
    this.dispenserGroup.add(frontPlate);
    this.interactiveObjects.push(frontPlate);

    // Left Red Asterisk Icon (matching reference image)
    const asteriskGroup = new THREE.Group();
    asteriskGroup.position.set(-1.26, 0.01, 0.255);
    for (let a = 0; a < 3; a++) {
      const armGeo = new THREE.BoxGeometry(0.24, 0.07, 0.02);
      const arm = new THREE.Mesh(armGeo, crimsonMat);
      arm.rotation.z = (a * Math.PI) / 3;
      asteriskGroup.add(arm);
    }
    this.dispenserGroup.add(asteriskGroup);

    // Right Status LED Dot (red in standby, bright green when printing)
    const ledGeo = new THREE.CircleGeometry(0.055, 24);
    this.ledMaterial = new THREE.MeshBasicMaterial({
      color: 0xEF4444
    });
    this.ledMesh = new THREE.Mesh(ledGeo, this.ledMaterial);
    this.ledMesh.position.set(1.28, 0.02, 0.255);
    this.dispenserGroup.add(this.ledMesh);
    this.interactiveObjects.push(this.ledMesh);

    // Bottom Output Slit (Where paper emerges downwards)
    const slitGeo = new THREE.BoxGeometry(2.65, 0.06, 0.22);
    const slitMesh = new THREE.Mesh(slitGeo, darkSlotMat);
    slitMesh.position.set(0, -0.26, 0.02);
    this.dispenserGroup.add(slitMesh);

    // Bottom Slit Laser Glow Line (Glowing red streak as in reference image)
    const glowGeo = new THREE.PlaneGeometry(2.55, 0.035);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xFF3B30,
      transparent: true,
      opacity: 0.95
    });
    this.slitGlowMesh = new THREE.Mesh(glowGeo, glowMat);
    this.slitGlowMesh.position.set(0, -0.27, 0.16);
    this.dispenserGroup.add(this.slitGlowMesh);

    // Dispenser Soft Ambient Drop Shadow on the wall behind
    const dispShadowCanvas = document.createElement('canvas');
    dispShadowCanvas.width = 256;
    dispShadowCanvas.height = 128;
    const sctx = dispShadowCanvas.getContext('2d');
    sctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    sctx.filter = 'blur(16px)';
    sctx.beginPath();
    sctx.roundRect(16, 20, 224, 88, 30);
    sctx.fill();

    const dispShadowTex = new THREE.CanvasTexture(dispShadowCanvas);
    const dispShadowGeo = new THREE.PlaneGeometry(3.9, 1.2);
    const dispShadowMat = new THREE.MeshBasicMaterial({
      map: dispShadowTex,
      transparent: true,
      opacity: 0.75,
      depthWrite: false
    });
    const dispShadow = new THREE.Mesh(dispShadowGeo, dispShadowMat);
    dispShadow.position.set(0, -0.1, -0.15);
    this.dispenserGroup.add(dispShadow);

    // ========================================================
    // 2. THE CV PAPER SHEET (Dispensing downwards from top slot)
    // ========================================================
    const cvTexture = this.createCVTexture();
    const paperWidth = 2.45;
    const paperHeight = 3.32;
    const paperGeo = new THREE.PlaneGeometry(paperWidth, paperHeight, 16, 32);

    // Apply natural forward curve / wave along Y axis (as in reference image)
    const pos = paperGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const py = pos.getY(i);
      const ny = (paperHeight / 2 - py) / paperHeight; // 0 at top, 1 at bottom
      // Gentle forward arch: bulges slightly forward in upper half, drapes down
      const zWave = Math.sin(ny * Math.PI) * 0.12 + Math.pow(ny, 2.2) * 0.08;
      pos.setZ(i, zWave);
    }
    paperGeo.computeVertexNormals();

    const paperMat = new THREE.MeshStandardMaterial({
      map: cvTexture,
      roughness: 0.45,
      metalness: 0.02,
      side: THREE.DoubleSide
    });

    this.paperMesh = new THREE.Mesh(paperGeo, paperMat);
    // Initial position: tucked inside dispenser, only bottom ~0.25 peeking out
    this.paperMesh.position.set(0, this.paperStartY, -0.02);
    this.mainGroup.add(this.paperMesh);
    this.interactiveObjects.push(this.paperMesh);

    // Paper Drop Shadow behind the sheet
    const paperShadowGeo = new THREE.PlaneGeometry(paperWidth + 0.35, paperHeight + 0.3);
    const paperShadowCanvas = document.createElement('canvas');
    paperShadowCanvas.width = 256;
    paperShadowCanvas.height = 340;
    const psCtx = paperShadowCanvas.getContext('2d');
    psCtx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    psCtx.filter = 'blur(18px)';
    psCtx.beginPath();
    psCtx.roundRect(18, 18, 220, 304, 16);
    psCtx.fill();

    const paperShadowTex = new THREE.CanvasTexture(paperShadowCanvas);
    const paperShadowMat = new THREE.MeshBasicMaterial({
      map: paperShadowTex,
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });
    this.shadowMesh = new THREE.Mesh(paperShadowGeo, paperShadowMat);
    this.shadowMesh.position.set(0.04, this.paperStartY - 0.06, -0.16);
    this.mainGroup.add(this.shadowMesh);

    this.baseGroupX = this.mainGroup.position.x;
    this.baseGroupY = this.mainGroup.position.y;
  }

  initInteractionListeners() {
    if (!this.canvas) return;

    const onPointerMove = (e) => {
      if (!this.isActive || this.isPrinting) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      this.mouse.x = x * 2 - 1;
      this.mouse.y = -(y * 2) + 1;
    };

    const onClick = (e) => {
      if (!this.isActive || this.isPrinting) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      this.mouse.x = x * 2 - 1;
      this.mouse.y = -(y * 2) + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);

      if (intersects.length > 0 || e.type === 'click') {
        this.triggerPrintSequence();
      }
    };

    this.canvas.addEventListener('mousemove', onPointerMove, { passive: true });
    this.canvas.addEventListener('click', onClick);

    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) onPointerMove(e.touches[0]);
    }, { passive: true });

    this.canvas.addEventListener('touchend', (e) => {
      if (e.changedTouches.length > 0) onClick(e.changedTouches[0]);
    });
  }

  show() {
    this.isActive = true;
    this.isPrinting = false;
    this.isPrinted = false;
    this.printProgress = 0;

    // Reset paper to top tucked position
    if (this.paperMesh) {
      this.paperMesh.position.set(0, this.paperStartY, -0.02);
    }
    if (this.shadowMesh) {
      this.shadowMesh.position.set(0.04, this.paperStartY - 0.06, -0.16);
      this.shadowMesh.material.opacity = 0.45;
    }

    // Reset LED to Standby Red
    if (this.ledMaterial) {
      this.ledMaterial.color.setHex(0xEF4444);
    }
    if (this.slitLight) {
      this.slitLight.color.setHex(0xFF3B30);
      this.slitLight.intensity = 0.8;
    }
    if (this.slitGlowMesh) {
      this.slitGlowMesh.material.color.setHex(0xFF3B30);
      this.slitGlowMesh.material.opacity = 0.95;
    }

    this.updateStatusText('Klik printer untuk mencetak CV', 'standby');
    this.resize();
  }

  hide() {
    this.isActive = false;
  }

  triggerPrintSequence() {
    if (this.isPrinting) return;

    this.isPrinting = true;
    this.printStartTime = performance.now();
    this.printProgress = 0;

    // 1. Switch LED & Laser Slit Light to Glowing Neon Green
    if (this.ledMaterial) {
      this.ledMaterial.color.setHex(0x10B981);
    }
    if (this.slitLight) {
      this.slitLight.color.setHex(0x10B981);
      this.slitLight.intensity = 1.6;
    }
    if (this.slitGlowMesh) {
      this.slitGlowMesh.material.color.setHex(0x10B981);
      this.slitGlowMesh.material.opacity = 1.0;
    }

    this.updateStatusText('Sedang mencetak CV...', 'printing');
  }

  completePrintSequence() {
    this.isPrinting = false;
    this.isPrinted = true;

    // Steady green
    if (this.ledMaterial) {
      this.ledMaterial.color.setHex(0x10B981);
    }
    if (this.slitLight) {
      this.slitLight.intensity = 0.9;
    }

    this.updateStatusText('CV Selesai Dicetak! Mengunduh...', 'success');

    // Trigger Download of /CV_Portofolio.pdf
    this.downloadCVFile();

    // After 2.0 seconds, notify parent to restore lanyard smoothly
    setTimeout(() => {
      if (typeof this.onPrintComplete === 'function') {
        this.onPrintComplete();
      }
    }, 2000);
  }

  downloadCVFile() {
    try {
      const link = document.createElement('a');
      link.href = '/CV_Portofolio.pdf';
      link.download = 'CV_Muhammad_Prima_Yudhistira.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
      window.open('/CV_Portofolio.pdf', '_blank');
    }
  }

  updateStatusText(msg, state = 'standby') {
    const textEl = document.getElementById('printerTooltipText');
    const dotEl = document.querySelector('.printer-status-dot');
    if (textEl) {
      textEl.textContent = msg;
    }
    if (dotEl) {
      dotEl.className = `printer-status-dot is-${state}`;
    }
  }

  resize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const w = this.container.clientWidth || 480;
    const h = this.container.clientHeight || 440;

    this.camera.aspect = w / h;
    // Adapt FOV slightly on narrower screens so paper is never cut off
    if (w < 440) {
      this.camera.fov = 42;
    } else {
      this.camera.fov = 35;
    }
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  render(delta, time) {
    if (!this.isActive || !this.renderer || !this.scene || !this.camera) return;

    // Raycast hover check
    if (!this.isPrinting && this.mouse.x !== -999) {
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);
      const hovering = intersects.length > 0;

      if (hovering !== this.isHovered) {
        this.isHovered = hovering;
        this.canvas.style.cursor = hovering ? 'pointer' : 'default';
      }

      // Subtle hover reaction
      const targetScale = hovering ? 1.02 : 1.0;
      this.dispenserGroup.scale.lerp(new THREE.Vector3(targetScale, targetScale, 1.0), 0.1);
    }

    // 2-Second Printing Animation: Paper slides DOWNWARDS
    if (this.isPrinting) {
      const elapsed = performance.now() - this.printStartTime;
      this.printProgress = Math.min(1.0, elapsed / this.printDuration);

      // Smooth ease-out cubic curve
      const t = 1 - Math.pow(1 - this.printProgress, 3);

      // Slide paper downward
      const currentY = THREE.MathUtils.lerp(this.paperStartY, this.paperEndY, t);
      if (this.paperMesh) {
        this.paperMesh.position.y = currentY;
      }
      if (this.shadowMesh) {
        this.shadowMesh.position.y = currentY - 0.06;
        this.shadowMesh.material.opacity = THREE.MathUtils.lerp(0.45, 0.85, t);
      }

      // Micro-vibration haptic jitter on dispenser bar while printing
      const jitterX = Math.sin(time * 78) * 0.01 * (1 - this.printProgress * 0.2);
      const jitterY = Math.cos(time * 62) * 0.006;
      this.dispenserGroup.position.x = jitterX;
      this.dispenserGroup.position.y = 1.48 + jitterY;

      // LED & Slit Pulse
      if (this.slitLight) {
        this.slitLight.intensity = 1.3 + Math.sin(time * 24) * 0.5;
      }

      if (this.printProgress >= 1.0) {
        this.dispenserGroup.position.set(0, 1.48, 0.05);
        this.completePrintSequence();
      }
    } else {
      // Gentle floating breath
      this.mainGroup.position.y = this.baseGroupY + Math.sin(time * 1.6) * 0.015;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
