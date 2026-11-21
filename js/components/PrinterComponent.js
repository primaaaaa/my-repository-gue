/**
 * PrinterComponent.js
 * High-angle Top-Down POV 3D CV Dispenser / Printer matching user reference image.
 * Features:
 * - Sleek chrome/white capsule bar dispenser mounted at the top.
 * - Left red asterisk icon, center glowing paper exit slit, right LED status dot.
 * - CV paper emerges downwards with natural curved paper drape & soft drop shadow.
 * - High-resolution canvas texture with stats grid, experience, and red starburst badge.
 * - Interactive raycasting: click to trigger realistic 1.5-second dispensing animation.
 * - Auto-triggers Muhammad Prima Yudhistira-resume.pdf download upon print completion.
 * - Seamless handoff to restore lanyard after download.
 */

import * as THREE from 'three';

export class PrinterComponent {
  constructor(options = {}) {
    this.container = options.container || document.getElementById('printerCanvasWrapper');
    this.canvas = options.canvas || document.getElementById('printerCanvas');
    this.isMobileDevice = options.isMobileDevice || (typeof window !== 'undefined' && window.innerWidth <= 900);
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
    this.isLocked = false;
    this.printStartTime = 0;
    this.printDuration = 1500; // 1.5 seconds
    this.printProgress = 0;

    // Paper Y Positions (Dispensing downwards from top slot)
    // Slot is at Y = 1.22. Paper height is 3.32.
    // At start: tucked inside, flush with slot
    this.paperStartY = 2.88;
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
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    this.camera.position.set(0, 0.52, 6.0);
    this.camera.lookAt(0, 0.28, 0);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    const dpr = this.isMobileDevice
      ? Math.min(window.devicePixelRatio || 1, 1.25)
      : Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.setPixelRatio(dpr);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.localClippingEnabled = true;

    // Horizontal clipping plane at the output slit (Y = 1.22): Discards any geometry above slot
    this.clipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 1.22);

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

    // 1. Clean Paper Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Pixel Border (Outer bold, inner subtle)
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 4;
    ctx.strokeRect(14, 14, canvas.width - 28, canvas.height - 28);

    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // 3. Continuous Printer Tractor-Feed Perforated Holes (Left & Right Margins)
    for (let py = 32; py < canvas.height - 32; py += 28) {
      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(5, py, 6, 9);
      ctx.fillStyle = '#94A3B8';
      ctx.fillRect(6, py + 1, 4, 7);

      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(canvas.width - 11, py, 6, 9);
      ctx.fillStyle = '#94A3B8';
      ctx.fillRect(canvas.width - 10, py + 1, 4, 7);
    }

    // Helper: Pixel Divider Line
    const drawPixelDivider = (yPos) => {
      for (let x = 54; x < canvas.width - 54; x += 12) {
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(x, yPos, 7, 3);
        ctx.fillStyle = '#CBD5E1';
        ctx.fillRect(x + 7, yPos, 5, 3);
      }
    };

    // Helper: Pixel Bullet Point
    const drawBullet = (x, yPos) => {
      ctx.fillStyle = '#D11A2A';
      ctx.fillRect(x, yPos - 10, 6, 6);
      ctx.fillStyle = '#FECACA';
      ctx.fillRect(x + 1, yPos - 9, 2, 2);
    };

    // --- TOP SLOGAN & HEADER ---
    ctx.fillStyle = '#0F172A';
    ctx.font = '900 36px "Space Grotesk", sans-serif';
    ctx.fillText('MUHAMMAD PRIMA YUDHISTIRA', 54, 72);

    ctx.fillStyle = '#475569';
    ctx.font = '600 13.5px "Space Grotesk", monospace, sans-serif';
    ctx.fillText('+62 895-2960-9749  |  primayudhistira040@gmail.com  |  linkedin.com/in/prima-yudhistira  |  primayudhistira.vercel.app', 54, 102);

    ctx.fillStyle = '#64748B';
    ctx.font = '700 13px "Space Grotesk", sans-serif';
    ctx.fillText('Bekasi, Jawa Barat', 54, 124);

    // Summary Box with Pixel Accent
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(54, 145, canvas.width - 108, 90);
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(54, 145, canvas.width - 108, 90);

    // Red left accent bar
    ctx.fillStyle = '#D11A2A';
    ctx.fillRect(54, 145, 6, 90);

    ctx.fillStyle = '#334155';
    ctx.font = '500 13.5px "Plus Jakarta Sans", sans-serif';
    const summaryLines = [
      'Mahasiswa Teknologi Rekayasa Perangkat Lunak Sekolah Vokasi IPB University yang berfokus pada Web Development dan',
      'Project Management. Terampil membangun aplikasi web interaktif dan mengelola alur kerja tim berbasis Agile. Adaptif terhadap',
      'teknologi baru serta memiliki kemampuan komunikasi, kepemimpinan, dan eksekusi proyek secara end-to-end untuk solusi digital yang efektif.'
    ];
    summaryLines.forEach((line, idx) => {
      ctx.fillText(line, 74, 172 + idx * 22);
    });

    const drawSectionHdr = (secY, title) => {
      ctx.fillStyle = '#D11A2A';
      ctx.font = '900 19px "Space Grotesk", sans-serif';
      ctx.fillText(`[ ${title} ]`, 54, secY);
      drawPixelDivider(secY + 10);
      return secY + 36;
    };

    // --- 1. PENGALAMAN KERJA ---
    let y = drawSectionHdr(275, 'PENGALAMAN KERJA');

    ctx.fillStyle = '#0F172A';
    ctx.font = '800 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('PT NeoKrenov — Tambun Selatan, Bekasi Utara', 54, y);

    ctx.fillStyle = '#64748B';
    ctx.font = '700 13.5px "Space Grotesk", sans-serif';
    ctx.fillText('Jul 2022 – Oct 2022', canvas.width - 200, y);
    y += 24;

    ctx.fillStyle = '#D11A2A';
    ctx.font = '700 14.5px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Digital Marketing Internship', 54, y);
    y += 22;

    const workPts = [
      'Merancang dan membuat konten digital untuk kebutuhan media sosial perusahaan',
      'Melakukan optimisasi SEO untuk meningkatkan visibilitas di mesin pencari',
      'Bekerja sama dengan tim dalam merencanakan strategi konten harian dan optimasi konversi penjualan'
    ];
    ctx.fillStyle = '#334155';
    ctx.font = '500 14px "Plus Jakarta Sans", sans-serif';
    workPts.forEach(pt => {
      drawBullet(54, y);
      ctx.fillText(pt, 70, y);
      y += 22;
    });
    y += 18;

    // --- 2. PENDIDIKAN ---
    y = drawSectionHdr(y, 'PENDIDIKAN');

    // IPB University
    ctx.fillStyle = '#0F172A';
    ctx.font = '800 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('IPB University — Bogor, Jawa Barat', 54, y);

    ctx.fillStyle = '#64748B';
    ctx.font = '700 13.5px "Space Grotesk", sans-serif';
    ctx.fillText('Jul 2024 – Aug 2028 (Expected)', canvas.width - 270, y);
    y += 24;

    ctx.fillStyle = '#0F172A';
    ctx.font = '700 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('D4 Teknologi Rekayasa Perangkat Lunak  •  IPK: 3.62 / 4.00', 54, y);
    y += 22;

    const ipbAwards = [
      'Juara 2 Short Movie Competition Portal 8 (BEM Sekolah Vokasi IPB University)',
      'Juara 2 Short Movie Competition IT-CAS (diselenggarakan oleh Amikom Surakarta)'
    ];
    ctx.fillStyle = '#334155';
    ctx.font = '500 14px "Plus Jakarta Sans", sans-serif';
    ipbAwards.forEach(pt => {
      drawBullet(54, y);
      ctx.fillText(pt, 70, y);
      y += 22;
    });
    y += 14;

    // SMKN 5 Kota Bekasi
    ctx.fillStyle = '#0F172A';
    ctx.font = '800 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('SMKN 5 Kota Bekasi — Bekasi, Jawa Barat', 54, y);

    ctx.fillStyle = '#64748B';
    ctx.font = '700 13.5px "Space Grotesk", sans-serif';
    ctx.fillText('Jun 2021 – Mar 2024', canvas.width - 200, y);
    y += 24;

    ctx.fillStyle = '#0F172A';
    ctx.font = '700 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Rekayasa Perangkat Lunak  •  Nilai Rata-rata: 86.50 / 100.00', 54, y);
    y += 22;

    drawBullet(54, y);
    ctx.fillStyle = '#334155';
    ctx.font = '500 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Lulusan Terbaik Program Studi Rekayasa Perangkat Lunak Angkatan 2023/2024', 70, y);
    y += 36;

    // --- 3. PENGALAMAN ORGANISASI ---
    y = drawSectionHdr(y, 'PENGALAMAN ORGANISASI');

    ctx.fillStyle = '#0F172A';
    ctx.font = '800 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Obscura Photography Club — Bogor, Jawa Barat', 54, y);
    ctx.fillStyle = '#64748B';
    ctx.font = '700 13.5px "Space Grotesk", sans-serif';
    ctx.fillText('Dec 2025 – Dec 2026', canvas.width - 200, y);
    y += 24;

    drawBullet(54, y);
    ctx.fillStyle = '#D11A2A';
    ctx.font = '700 14.5px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Ketua Umum Periode 2025/2026', 70, y);
    y += 26;

    ctx.fillStyle = '#0F172A';
    ctx.font = '800 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Obscura Photography Club — Bogor, Jawa Barat', 54, y);
    ctx.fillStyle = '#64748B';
    ctx.font = '700 13.5px "Space Grotesk", sans-serif';
    ctx.fillText('Feb 2025 – May 2025', canvas.width - 200, y);
    y += 24;

    drawBullet(54, y);
    ctx.fillStyle = '#334155';
    ctx.font = '500 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Wakil Ketua Pelaksana Hunting Akbar 2025', 70, y);
    y += 36;

    // --- 4. PROYEK ---
    y = drawSectionHdr(y, 'PROYEK UNGGULAN');

    const projs = [
      { name: 'Beabot', desc: 'Platform AI Latihan Wawancara & Review Esai Beasiswa', stack: 'Next.js, PostgreSQL, Express.js, Bootstrap' },
      { name: 'Website Reservasi Luwihaja Hill (2025)', desc: 'Sistem Reservasi & Review Kamar Pelanggan', stack: 'Laravel, PostgreSQL, Bootstrap CSS' },
      { name: 'Wertugo Mobile (2026)', desc: 'Aplikasi Rekomendasi Spot Wisata di Sekitar Anda', stack: 'Laravel, MongoDB, Java, Bootstrap' },
      { name: 'MediGO (2026)', desc: 'Portal Informasi Fasilitas Kesehatan Se-Jabodetabek', stack: 'Laravel, MySQL, Leaflet JS, Python' },
      { name: 'DARKIM (2026)', desc: 'Analisis Kemasan Makanan/Minuman Pasien Diabetes', stack: 'Python, Next.js, TailwindCSS' }
    ];

    projs.forEach(p => {
      drawBullet(54, y);
      ctx.fillStyle = '#0F172A';
      ctx.font = '800 14.5px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`${p.name} — ${p.desc}`, 70, y);

      ctx.fillStyle = '#64748B';
      ctx.font = '600 12.5px "Space Grotesk", monospace, sans-serif';
      ctx.fillText(`Stack: [ ${p.stack} ]`, 70, y + 19);
      y += 40;
    });

    // --- FOOTER: BARCODE & OFFICIAL PIXEL SEAL ---
    const barY = canvas.height - 95;
    ctx.fillStyle = '#64748B';
    ctx.font = '700 12px "Space Grotesk", monospace, sans-serif';
    ctx.fillText('DOC-ID: MUHAMMAD-PRIMA-YUDHISTIRA-RESUME-2026', 54, barY - 14);

    // 1D Barcode Pattern
    const barWidths = [3, 2, 5, 2, 4, 3, 2, 4, 2, 5, 3, 2, 4, 5, 2, 3, 2, 4, 3, 5, 2, 4, 2, 3, 5, 2, 4, 3, 2, 5, 3, 2, 4];
    let bx = 54;
    barWidths.forEach((bw, i) => {
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(bx, barY, bw, 26);
      bx += bw + (i % 3 === 0 ? 4 : 2);
    });

    // Pixel Stamp Seal on bottom right
    const stampX = canvas.width - 310;
    const stampY = canvas.height - 105;
    ctx.strokeStyle = '#D11A2A';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(stampX, stampY, 255, 56);
    ctx.lineWidth = 1;
    ctx.strokeRect(stampX + 4, stampY + 4, 247, 48);

    ctx.fillStyle = '#D11A2A';
    ctx.font = '900 13px "Space Grotesk", sans-serif';
    ctx.fillText('[★] VERIFIED RESUME', stampX + 22, stampY + 24);
    ctx.font = '700 11.5px "Space Grotesk", sans-serif';
    ctx.fillText('IPB UNIVERSITY • 2026', stampX + 22, stampY + 42);

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

    // 1. Left Delicate Lily Flower Sticker (Tilted slightly left)
    const lilyTexture = new THREE.TextureLoader().load('assets/printer/lily.png', () => {
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    });
    lilyTexture.colorSpace = THREE.SRGBColorSpace;
    const lilyGeo = new THREE.PlaneGeometry(0.28, 0.28);
    const lilyMat = new THREE.MeshBasicMaterial({
      map: lilyTexture,
      transparent: true,
      alphaTest: 0.05
    });
    const lilyMesh = new THREE.Mesh(lilyGeo, lilyMat);
    lilyMesh.position.set(-1.18, 0.015, 0.254);
    lilyMesh.rotation.z = -0.08; // Casual ~ -4.5 deg tilt
    this.dispenserGroup.add(lilyMesh);
    this.interactiveObjects.push(lilyMesh);

    // 2. Pixelated Lavender Flower Sticker (Right next to Lily, snug organic cluster)
    const lavenderTexture = new THREE.TextureLoader().load('assets/printer/lavender_sticker.png', () => {
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    });
    lavenderTexture.colorSpace = THREE.SRGBColorSpace;
    lavenderTexture.magFilter = THREE.NearestFilter;
    lavenderTexture.minFilter = THREE.NearestFilter;
    const lavenderGeo = new THREE.PlaneGeometry(0.22, 0.35);
    const lavenderMat = new THREE.MeshBasicMaterial({
      map: lavenderTexture,
      transparent: true,
      alphaTest: 0.05
    });
    const lavenderMesh = new THREE.Mesh(lavenderGeo, lavenderMat);
    lavenderMesh.position.set(-0.89, 0.02, 0.256);
    lavenderMesh.rotation.z = 0.12; // Casual ~ +7 deg tilt
    this.dispenserGroup.add(lavenderMesh);
    this.interactiveObjects.push(lavenderMesh);

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
      side: THREE.DoubleSide,
      clippingPlanes: [this.clipPlane],
      clipShadows: true
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
      depthWrite: false,
      clippingPlanes: [this.clipPlane]
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
      if (!this.isActive || this.isPrinting || this.isLocked) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      this.mouse.x = x * 2 - 1;
      this.mouse.y = -(y * 2) + 1;
    };

    const onClick = (e) => {
      if (!this.isActive || this.isPrinting || this.isPrinted || this.isLocked) return;
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

    const tooltipEl = document.getElementById('printerTooltip');
    if (tooltipEl) {
      tooltipEl.addEventListener('click', () => {
        if (!this.isActive || this.isPrinting || this.isPrinted || this.isLocked) return;
        this.triggerPrintSequence();
      });
    }
  }

  show() {
    this.isActive = true;
    this.isPrinting = false;
    this.isPrinted = false;
    this.isLocked = false;
    this.printProgress = 0;

    if (this.canvas) {
      this.canvas.style.pointerEvents = 'auto';
      this.canvas.style.cursor = 'default';
    }
    const tooltipEl = document.getElementById('printerTooltip');
    if (tooltipEl) {
      tooltipEl.style.pointerEvents = 'auto';
    }

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
    requestAnimationFrame(() => this.resize());
  }

  hide() {
    this.isActive = false;
  }

  triggerPrintSequence() {
    if (this.isPrinting || this.isPrinted || this.isLocked) return;

    this.isPrinting = true;
    this.isLocked = true;
    this.printStartTime = performance.now();
    this.printProgress = 0;

    // Immediately disable pointer events to prevent re-triggering
    if (this.canvas) {
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.cursor = 'default';
    }
    const tooltipEl = document.getElementById('printerTooltip');
    if (tooltipEl) {
      tooltipEl.style.pointerEvents = 'none';
    }
    this.isHovered = false;
    if (this.dispenserGroup) {
      this.dispenserGroup.scale.set(1, 1, 1);
    }

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
    // this.isLocked remains true so animation cannot be restarted

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

    // After 1.5 seconds, notify parent to restore lanyard smoothly
    setTimeout(() => {
      if (typeof this.onPrintComplete === 'function') {
        this.onPrintComplete();
      }
    }, 1500);
  }

  downloadCVFile() {
    try {
      const fileName = 'Muhammad Prima Yudhistira-resume.pdf';
      const fileUrl = '/' + encodeURIComponent(fileName);
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
      window.open('/' + encodeURIComponent('Muhammad Prima Yudhistira-resume.pdf'), '_blank');
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
    // Calculate required FOV so printer capsule (width ~3.5 units) has at least 25% horizontal margin on any screen
    const dist = this.camera.position.z || 5.8;
    const targetWidth = 4.8;
    const reqTan = targetWidth / (2 * dist * this.camera.aspect);
    const calculatedFov = 2 * Math.atan(reqTan) * (180 / Math.PI);
    this.camera.fov = Math.max(38, Math.min(56, calculatedFov));
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  render(delta, time) {
    if (!this.isActive || !this.renderer || !this.scene || !this.camera) return;

    // Raycast hover check
    if (!this.isPrinting && !this.isLocked && this.mouse.x !== -999) {
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

    if (this.clipPlane) {
      this.clipPlane.constant = 1.22 + this.mainGroup.position.y;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
