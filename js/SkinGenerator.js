/**
 * SkinGenerator.js
 * Generates clean, modern, non-pixelated 1024x1024 character textures.
 * Outfits supported:
 * 1. 'ipb' : Jas Almamater IPB University (Midnight Navy #262f53, golden buttons, IPB badge, charcoal pants, white sneakers)
 * 2. 'smk' : Seragam Putih-Abu SMKN 5 Kota Bekasi (Kemeja putih lengan pendek, dasi abu-abu, bendera merah putih, logo OSIS SMK, nametag, sabuk hitam, celana abu tua, sepatu hitam)
 */

export class SkinGenerator {
  constructor(options = {}) {
    this.size = 1024;
    this.cachedCanvases = {};

    // Calibrated color palettes
    this.palette = {
      hair: {
        base: '#1b1715',
        highlight: '#342923',
        coilShine: '#45352c',
        shadow: '#110e0d',
        fadeMid: '#3a2b23',
        fadeLow: '#5d4436',
        skinTone: '#cb8e67'
      },
      skin: {
        base: '#cb8e67',
        highlight: '#d89d75',
        shadow: '#b7754f',
        blush: 'rgba(198, 125, 88, 0.45)',
        eyesPupil: '#1b1716',
        eyebrow: '#1b1716'
      },
      ipb: {
        blazer: {
          base: '#262f53',
          highlight: '#384576',
          shadow: '#1c233e',
          crease: '#13182b',
          lapelEdge: '#3f4e85',
          button: '#f59e0b',
          buttonBorder: '#b45309',
          emblemWhite: '#ffffff',
          emblemCyan: '#38bdf8',
          emblemBlue: '#1d4ed8'
        },
        shirt: {
          base: '#486b92',
          collar: '#ffffff',
          shadow: '#365272'
        },
        pants: {
          base: '#202127',
          highlight: '#2a2b34',
          shadow: '#14151a'
        },
        shoes: {
          base: '#ffffff',
          shadow: '#e2e8f0',
          sole: '#cbd5e1',
          greenAccent: '#16a34a'
        }
      },
      smk: {
        shirt: {
          base: '#ffffff',
          shadow: '#f1f5f9',
          crease: '#cbd5e1',
          seam: '#94a3b8'
        },
        tie: {
          base: '#475569',
          shadow: '#334155',
          emblem: '#f59e0b'
        },
        badge: {
          flagRed: '#ef4444',
          flagWhite: '#ffffff',
          flagBorder: '#64748b',
          osisGold: '#854d0e',
          osisYellow: '#facc15',
          osisBlue: '#2563eb',
          nametagBg: '#ffffff',
          nametagBorder: '#1e293b',
          nametagText: '#0f172a'
        },
        belt: {
          leather: '#1e293b',
          buckle: '#cbd5e1',
          buckleInner: '#475569'
        },
        pants: {
          base: '#475569',
          highlight: '#566375',
          shadow: '#334155',
          crease: '#1e293b'
        },
        socks: {
          base: '#ffffff',
          shadow: '#e2e8f0'
        },
        shoes: {
          base: '#18181b',
          highlight: '#27272a',
          shadow: '#09090b',
          laces: '#f8fafc'
        }
      }
    };
  }

  getCanvas(outfit = 'ipb') {
    if (!this.cachedCanvases[outfit]) {
      const cvs = document.createElement('canvas');
      cvs.width = this.size;
      cvs.height = this.size;
      const ctx = cvs.getContext('2d');
      this.drawFullSkin(ctx, outfit);
      this.cachedCanvases[outfit] = cvs;
    }
    return this.cachedCanvases[outfit];
  }

  generate(outfit = 'ipb') {
    return this.getCanvas(outfit);
  }

  drawFullSkin(ctx, outfit) {
    ctx.clearRect(0, 0, this.size, this.size);

    // 1. Draw universal Head, Curly Ringlets & Face
    this.drawHead(ctx);

    // 2. Draw Body, Arms, and Legs according to selected outfit
    if (outfit === 'smk') {
      this.drawBodySMK(ctx);
    } else {
      this.drawBodyIPB(ctx);
    }
  }

  /* ========================================================
   * 1. UNIVERSAL HEAD & HAIR
   * ======================================================== */
  drawHead(ctx) {
    const { hair, skin } = this.palette;

    // Top of head (Curly ringlets)
    ctx.fillStyle = hair.base;
    ctx.fillRect(128, 0, 128, 128);

    const topRinglets = [
      [150, 30, 14], [182, 34, 16], [216, 28, 15],
      [142, 64, 16], [176, 62, 18], [214, 68, 16],
      [154, 98, 15], [190, 96, 17], [224, 100, 15]
    ];
    ctx.fillStyle = hair.highlight;
    for (const [rx, ry, r] of topRinglets) {
      ctx.beginPath();
      ctx.arc(rx, ry, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = hair.coilShine;
    ctx.lineWidth = 2.0;
    for (const [rx, ry, r] of topRinglets) {
      ctx.beginPath();
      ctx.arc(rx - 1, ry - 1, r - 3, 0.3, Math.PI * 1.4);
      ctx.stroke();
    }

    // Bottom of head (Jaw & Neck)
    ctx.fillStyle = skin.base;
    ctx.fillRect(256, 0, 128, 128);
    ctx.fillStyle = skin.shadow;
    ctx.fillRect(256, 96, 128, 32);

    // Right Side of Head (Right Profile with Taper Fade)
    ctx.fillStyle = skin.base;
    ctx.fillRect(0, 128, 128, 128);
    ctx.fillStyle = hair.base;
    ctx.fillRect(0, 128, 128, 50);

    const rGrad = ctx.createLinearGradient(0, 178, 0, 256);
    rGrad.addColorStop(0, hair.base);
    rGrad.addColorStop(0.3, hair.fadeMid);
    rGrad.addColorStop(0.65, hair.fadeLow);
    rGrad.addColorStop(1, skin.base);
    ctx.fillStyle = rGrad;
    ctx.fillRect(0, 178, 128, 78);

    const rightSideCoils = [
      [20, 140, 13], [54, 136, 14], [88, 140, 13],
      [36, 162, 12], [72, 160, 13], [105, 152, 11]
    ];
    ctx.fillStyle = hair.highlight;
    for (const [cx, cy, r] of rightSideCoils) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Left Side of Head (Left Profile with Taper Fade)
    ctx.fillStyle = skin.base;
    ctx.fillRect(256, 128, 128, 128);
    ctx.fillStyle = hair.base;
    ctx.fillRect(256, 128, 128, 50);

    const lGrad = ctx.createLinearGradient(0, 178, 0, 256);
    lGrad.addColorStop(0, hair.base);
    lGrad.addColorStop(0.3, hair.fadeMid);
    lGrad.addColorStop(0.65, hair.fadeLow);
    lGrad.addColorStop(1, skin.base);
    ctx.fillStyle = lGrad;
    ctx.fillRect(256, 178, 128, 78);

    const leftSideCoils = [
      [276, 140, 13], [310, 136, 14], [344, 140, 13],
      [292, 162, 12], [328, 160, 13], [360, 152, 11]
    ];
    ctx.fillStyle = hair.highlight;
    for (const [cx, cy, r] of leftSideCoils) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Back of Head
    ctx.fillStyle = skin.base;
    ctx.fillRect(384, 128, 128, 128);
    ctx.fillStyle = hair.base;
    ctx.fillRect(384, 128, 128, 60);

    const bGrad = ctx.createLinearGradient(0, 188, 0, 256);
    bGrad.addColorStop(0, hair.base);
    bGrad.addColorStop(0.4, hair.fadeMid);
    bGrad.addColorStop(0.75, hair.fadeLow);
    bGrad.addColorStop(1, skin.base);
    ctx.fillStyle = bGrad;
    ctx.fillRect(384, 188, 128, 68);

    const backCoils = [
      [404, 145, 14], [438, 140, 15], [472, 145, 14],
      [420, 172, 13], [456, 170, 14], [488, 172, 12]
    ];
    ctx.fillStyle = hair.highlight;
    for (const [cx, cy, r] of backCoils) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Front of Head (Face)
    ctx.fillStyle = skin.base;
    ctx.fillRect(128, 128, 128, 128);

    ctx.fillStyle = hair.base;
    ctx.beginPath();
    ctx.moveTo(128, 128);
    ctx.lineTo(256, 128);
    ctx.lineTo(256, 165);
    ctx.bezierCurveTo(240, 174, 224, 172, 212, 166);
    ctx.bezierCurveTo(202, 175, 186, 174, 174, 165);
    ctx.bezierCurveTo(162, 175, 146, 174, 136, 166);
    ctx.lineTo(128, 165);
    ctx.closePath();
    ctx.fill();

    const fringeCoils = [
      [140, 166, 8], [154, 170, 9], [172, 168, 9],
      [194, 170, 9], [212, 168, 8], [230, 169, 8], [244, 165, 7]
    ];
    ctx.fillStyle = hair.base;
    for (const [cx, cy, r] of fringeCoils) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Signature loose ringlet coil over left brow
    ctx.fillStyle = hair.base;
    ctx.beginPath();
    ctx.arc(170, 178, 7.5, 0, Math.PI * 2);
    ctx.arc(168, 188, 6.0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = hair.coilShine;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(169, 177, 5.5, 0.5, Math.PI * 1.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(167, 187, 4.2, 0.5, Math.PI * 1.3);
    ctx.stroke();

    for (const [cx, cy, r] of fringeCoils) {
      ctx.beginPath();
      ctx.arc(cx - 1, cy - 1, r - 2, 0.4, Math.PI * 1.3);
      ctx.stroke();
    }

    // Eyebrows
    ctx.fillStyle = skin.eyebrow;
    ctx.beginPath();
    ctx.roundRect(144, 180, 28, 5, 2);
    ctx.roundRect(212, 180, 28, 5, 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = skin.eyesPupil;
    ctx.beginPath();
    ctx.roundRect(148, 193, 20, 20, 3);
    ctx.roundRect(216, 193, 20, 20, 3);
    ctx.fill();

    // Cheeks
    ctx.fillStyle = skin.blush;
    ctx.beginPath();
    ctx.roundRect(138, 220, 18, 8, 4);
    ctx.roundRect(228, 220, 18, 8, 4);
    ctx.fill();

    // Friendly Smile
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(186, 230);
    ctx.lineTo(204, 230);
    ctx.lineTo(195, 237);
    ctx.closePath();
    ctx.fill();
  }

  /* ========================================================
   * 2. IPB UNIVERSITY OUTFIT (Jas Almamater Navy #262f53)
   * ======================================================== */
  drawBodyIPB(ctx) {
    const { skin } = this.palette;
    const { blazer, shirt, pants, shoes } = this.palette.ipb;

    // Torso Top / Bottom
    ctx.fillStyle = blazer.base;
    ctx.fillRect(320, 256, 128, 64);
    ctx.fillStyle = shirt.base;
    ctx.fillRect(360, 280, 48, 40);

    ctx.fillStyle = blazer.shadow;
    ctx.fillRect(448, 256, 128, 64);

    // Torso Sides & Back
    ctx.fillStyle = blazer.base;
    ctx.fillRect(256, 320, 64, 192);
    ctx.fillRect(448, 320, 64, 192);
    ctx.fillRect(512, 320, 128, 192);

    ctx.strokeStyle = blazer.shadow;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(576, 320);
    ctx.lineTo(576, 512);
    ctx.stroke();

    // Torso Front
    ctx.fillStyle = blazer.base;
    ctx.fillRect(320, 320, 128, 192);

    // Inner V-neck
    ctx.fillStyle = shirt.base;
    ctx.beginPath();
    ctx.moveTo(364, 320);
    ctx.lineTo(404, 320);
    ctx.lineTo(384, 396);
    ctx.closePath();
    ctx.fill();

    // White Shirt Collar
    ctx.fillStyle = shirt.collar;
    ctx.beginPath();
    ctx.moveTo(366, 320);
    ctx.lineTo(378, 344);
    ctx.lineTo(384, 320);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(402, 320);
    ctx.lineTo(390, 344);
    ctx.lineTo(384, 320);
    ctx.closePath();
    ctx.fill();

    // Blazer Lapels
    ctx.fillStyle = blazer.lapelEdge;
    ctx.beginPath();
    ctx.moveTo(350, 320);
    ctx.lineTo(366, 320);
    ctx.lineTo(384, 396);
    ctx.lineTo(370, 402);
    ctx.lineTo(344, 360);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(418, 320);
    ctx.lineTo(402, 320);
    ctx.lineTo(384, 396);
    ctx.lineTo(398, 402);
    ctx.lineTo(424, 360);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = blazer.crease;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(366, 320);
    ctx.lineTo(384, 396);
    ctx.lineTo(402, 320);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(384, 396);
    ctx.lineTo(384, 512);
    ctx.stroke();

    // Golden Buttons
    ctx.fillStyle = blazer.button;
    ctx.strokeStyle = blazer.buttonBorder;
    ctx.lineWidth = 1.5;
    for (const by of [415, 455]) {
      ctx.beginPath();
      ctx.arc(384, by, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // IPB Emblem Badge
    ctx.fillStyle = blazer.emblemWhite;
    ctx.beginPath();
    ctx.arc(414, 372, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = blazer.emblemCyan;
    ctx.beginPath();
    ctx.arc(414, 372, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = blazer.emblemBlue;
    ctx.beginPath();
    ctx.arc(414, 372, 4, 0, Math.PI * 2);
    ctx.fill();

    // Pockets
    ctx.fillStyle = blazer.highlight;
    ctx.strokeStyle = blazer.crease;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(336, 468, 30, 8, 2);
    ctx.roundRect(402, 468, 30, 8, 2);
    ctx.fill();
    ctx.stroke();

    // Right Arm (Long blazer sleeve)
    ctx.fillStyle = blazer.base;
    ctx.fillRect(704, 256, 64, 64);
    ctx.fillStyle = skin.shadow;
    ctx.fillRect(768, 256, 64, 64);

    for (let f = 0; f < 4; f++) {
      const fx = 640 + f * 64;
      ctx.fillStyle = blazer.base;
      ctx.fillRect(fx, 320, 64, 136);

      ctx.strokeStyle = blazer.crease;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(fx, 456);
      ctx.lineTo(fx + 64, 456);
      ctx.stroke();

      ctx.fillStyle = skin.base;
      ctx.fillRect(fx, 456, 64, 56);
    }
    ctx.fillStyle = blazer.button;
    ctx.beginPath();
    ctx.arc(672, 440, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Left Arm (Long blazer sleeve)
    ctx.fillStyle = blazer.base;
    ctx.fillRect(576, 768, 64, 64);
    ctx.fillStyle = skin.shadow;
    ctx.fillRect(640, 768, 64, 64);

    for (let f = 0; f < 4; f++) {
      const fx = 512 + f * 64;
      ctx.fillStyle = blazer.base;
      ctx.fillRect(fx, 832, 64, 136);

      ctx.strokeStyle = blazer.crease;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(fx, 968);
      ctx.lineTo(fx + 64, 968);
      ctx.stroke();

      ctx.fillStyle = skin.base;
      ctx.fillRect(fx, 968, 64, 56);
    }
    ctx.fillStyle = blazer.button;
    ctx.beginPath();
    ctx.arc(672, 952, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Right Leg (Charcoal formal pants + white sneakers)
    ctx.fillStyle = pants.base;
    ctx.fillRect(64, 256, 64, 64);
    ctx.fillStyle = shoes.sole;
    ctx.fillRect(128, 256, 64, 64);

    for (let f = 0; f < 4; f++) {
      const fx = f * 64;
      ctx.fillStyle = pants.base;
      ctx.fillRect(fx, 320, 64, 144);

      ctx.strokeStyle = pants.shadow;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(fx, 464);
      ctx.lineTo(fx + 64, 464);
      ctx.stroke();

      ctx.fillStyle = shoes.base;
      ctx.fillRect(fx, 464, 64, 48);

      ctx.fillStyle = shoes.shadow;
      ctx.fillRect(fx, 502, 64, 10);
    }
    ctx.fillStyle = shoes.greenAccent;
    ctx.fillRect(204, 466, 40, 12);

    // Left Leg
    ctx.fillStyle = pants.base;
    ctx.fillRect(320, 768, 64, 64);
    ctx.fillStyle = shoes.sole;
    ctx.fillRect(384, 768, 64, 64);

    for (let f = 0; f < 4; f++) {
      const fx = 256 + f * 64;
      ctx.fillStyle = pants.base;
      ctx.fillRect(fx, 832, 64, 144);

      ctx.strokeStyle = pants.shadow;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(fx, 976);
      ctx.lineTo(fx + 64, 976);
      ctx.stroke();

      ctx.fillStyle = shoes.base;
      ctx.fillRect(fx, 976, 64, 48);

      ctx.fillStyle = shoes.shadow;
      ctx.fillRect(fx, 1014, 64, 10);
    }
    ctx.fillStyle = shoes.greenAccent;
    ctx.fillRect(460, 978, 40, 12);
  }

  /* ========================================================
   * 3. SMKN 5 KOTA BEKASI OUTFIT (Seragam Putih-Abu SMK)
   * Authentic detail from photo reference:
   * - Kemeja putih lengan pendek
   * - Dasi abu tua dengan emblem
   * - Bendera merah putih di atas saku kiri
   * - Logo OSIS SMK di saku kiri
   * - Nametag siswa di dada kanan
   * - Sabuk hitam dengan gesper perak
   * - Celana abu tua khas SMK
   * - Kaus kaki putih & sepatu hitam
   * ======================================================== */
  drawBodySMK(ctx) {
    const { skin } = this.palette;
    const { shirt, tie, badge, belt, pants, socks, shoes } = this.palette.smk;

    // Torso Top (White shirt shoulders)
    ctx.fillStyle = shirt.base;
    ctx.fillRect(320, 256, 128, 64);
    ctx.fillStyle = shirt.shadow;
    ctx.fillRect(350, 280, 68, 40);

    // Torso Bottom (Dark grey pants crotch)
    ctx.fillStyle = pants.base;
    ctx.fillRect(448, 256, 128, 64);

    // Torso Sides (x=256 and x=448)
    for (const sx of [256, 448]) {
      // White shirt
      ctx.fillStyle = shirt.base;
      ctx.fillRect(sx, 320, 64, 166);
      ctx.fillStyle = shirt.shadow;
      ctx.fillRect(sx, 320, 10, 166);

      // Black belt
      ctx.fillStyle = belt.leather;
      ctx.fillRect(sx, 486, 64, 22);

      // Pants waist
      ctx.fillStyle = pants.base;
      ctx.fillRect(sx, 508, 64, 4);
    }

    // Torso Back (x=512)
    ctx.fillStyle = shirt.base;
    ctx.fillRect(512, 320, 128, 166);
    ctx.strokeStyle = shirt.crease;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(576, 320);
    ctx.lineTo(576, 486);
    ctx.stroke();

    // Black belt back
    ctx.fillStyle = belt.leather;
    ctx.fillRect(512, 486, 128, 22);

    // Pants waist back
    ctx.fillStyle = pants.base;
    ctx.fillRect(512, 508, 128, 4);

    // ----------------------------------------------------
    // TORSO FRONT (x=320, y=320, w=128, h=192)
    // ----------------------------------------------------
    // White shirt base
    ctx.fillStyle = shirt.base;
    ctx.fillRect(320, 320, 128, 166);

    // Subtle side shadows
    ctx.fillStyle = shirt.shadow;
    ctx.fillRect(320, 320, 12, 166);
    ctx.fillRect(436, 320, 12, 166);

    // Collar V & tips
    ctx.fillStyle = shirt.base;
    ctx.strokeStyle = shirt.crease;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(358, 320);
    ctx.lineTo(374, 345);
    ctx.lineTo(384, 332);
    ctx.lineTo(394, 345);
    ctx.lineTo(410, 320);
    ctx.fill();
    ctx.stroke();

    // Tie Knot (Dasi Abu Tua)
    ctx.fillStyle = tie.base;
    ctx.strokeStyle = tie.shadow;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(376, 332);
    ctx.lineTo(392, 332);
    ctx.lineTo(389, 348);
    ctx.lineTo(379, 348);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Tie Body
    ctx.beginPath();
    ctx.moveTo(378, 348);
    ctx.lineTo(390, 348);
    ctx.lineTo(392, 436);
    ctx.lineTo(384, 448); // Pointed tip
    ctx.lineTo(376, 436);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Golden Pin Emblem on tie
    ctx.fillStyle = tie.emblem;
    ctx.beginPath();
    ctx.arc(384, 392, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Shirt button placket below tie
    ctx.strokeStyle = shirt.crease;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(384, 448);
    ctx.lineTo(384, 486);
    ctx.stroke();

    // White button
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(384, 466, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // LEFT CHEST: Saku (Pocket) + Bendera Merah Putih + Logo OSIS SMK (Viewer's Right)
    // Saku outline
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = shirt.crease;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(402, 370, 26, 32, [0, 0, 5, 5]);
    ctx.fill();
    ctx.stroke();

    // Bendera Merah Putih di atas saku
    ctx.fillStyle = badge.flagRed;
    ctx.fillRect(404, 360, 22, 5);
    ctx.fillStyle = badge.flagWhite;
    ctx.fillRect(404, 365, 22, 5);
    ctx.strokeStyle = badge.flagBorder;
    ctx.lineWidth = 1;
    ctx.strokeRect(404, 360, 22, 10);

    // Logo OSIS SMK di tengah saku
    ctx.fillStyle = badge.osisGold;
    ctx.beginPath();
    ctx.arc(415, 386, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = badge.osisYellow;
    ctx.beginPath();
    ctx.arc(415, 386, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = badge.osisBlue;
    ctx.beginPath();
    ctx.arc(415, 386, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // RIGHT CHEST: Nametag Peserta Didik (Viewer's Left)
    ctx.fillStyle = badge.nametagBg;
    ctx.strokeStyle = badge.nametagBorder;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(334, 368, 32, 12, 1);
    ctx.fill();
    ctx.stroke();

    // Text strokes inside nametag representing name
    ctx.fillStyle = badge.nametagText;
    ctx.fillRect(337, 372, 26, 2);
    ctx.fillRect(339, 376, 20, 1.5);

    // BLACK LEATHER BELT with SILVER BUCKLE (Ikat Pinggang Hitam)
    ctx.fillStyle = belt.leather;
    ctx.fillRect(320, 486, 128, 22);

    // Silver metallic buckle
    ctx.fillStyle = belt.buckle;
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(372, 488, 24, 18, 2);
    ctx.fill();
    ctx.stroke();

    // Inner slot of buckle
    ctx.fillStyle = belt.buckleInner;
    ctx.fillRect(378, 492, 12, 10);

    // Pants top front
    ctx.fillStyle = pants.base;
    ctx.fillRect(320, 508, 128, 4);

    // ----------------------------------------------------
    // ARMS: SHORT SLEEVES (Kemeja Lengan Pendek Putih)
    // ----------------------------------------------------
    // RIGHT ARM: Short white sleeve on top, tan skin below
    ctx.fillStyle = shirt.base;
    ctx.fillRect(704, 256, 64, 64); // Shoulder top
    ctx.fillStyle = skin.shadow;
    ctx.fillRect(768, 256, 64, 64); // Hand bottom

    for (let f = 0; f < 4; f++) {
      const fx = 640 + f * 64;
      // White short sleeve (upper 64px)
      ctx.fillStyle = shirt.base;
      ctx.fillRect(fx, 320, 64, 64);

      // Sleeve hem line
      ctx.strokeStyle = shirt.crease;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(fx, 384);
      ctx.lineTo(fx + 64, 384);
      ctx.stroke();

      // Bare arm & hand (lower 128px)
      ctx.fillStyle = skin.base;
      ctx.fillRect(fx, 384, 64, 128);

      // Wrist shadow
      ctx.fillStyle = skin.shadow;
      ctx.fillRect(fx, 470, 64, 6);
    }
    // Logo Pendidikan on right sleeve (badge at x=656, y=345)
    ctx.fillStyle = badge.osisGold;
    ctx.beginPath();
    ctx.arc(672, 350, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = badge.osisBlue;
    ctx.beginPath();
    ctx.arc(672, 350, 4, 0, Math.PI * 2);
    ctx.fill();

    // LEFT ARM: Short white sleeve on top, tan skin below
    ctx.fillStyle = shirt.base;
    ctx.fillRect(576, 768, 64, 64); // Shoulder top
    ctx.fillStyle = skin.shadow;
    ctx.fillRect(640, 768, 64, 64); // Hand bottom

    for (let f = 0; f < 4; f++) {
      const fx = 512 + f * 64;
      // White short sleeve (upper 64px)
      ctx.fillStyle = shirt.base;
      ctx.fillRect(fx, 832, 64, 64);

      // Sleeve hem line
      ctx.strokeStyle = shirt.crease;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(fx, 896);
      ctx.lineTo(fx + 64, 896);
      ctx.stroke();

      // Bare arm & hand (lower 128px)
      ctx.fillStyle = skin.base;
      ctx.fillRect(fx, 896, 64, 128);

      // Wrist shadow
      ctx.fillStyle = skin.shadow;
      ctx.fillRect(fx, 982, 64, 6);
    }

    // ----------------------------------------------------
    // LEGS: CELANA PANJANG ABU TUA + KAUS KAKI PUTIH + SEPATU HITAM
    // ----------------------------------------------------
    // RIGHT LEG
    ctx.fillStyle = pants.base;
    ctx.fillRect(64, 256, 64, 64);
    ctx.fillStyle = shoes.shadow;
    ctx.fillRect(128, 256, 64, 64);

    for (let f = 0; f < 4; f++) {
      const fx = f * 64;

      // Dark grey school trousers
      ctx.fillStyle = pants.base;
      ctx.fillRect(fx, 320, 64, 140);

      // Trouser side crease
      ctx.strokeStyle = pants.shadow;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fx + 32, 320);
      ctx.lineTo(fx + 32, 460);
      ctx.stroke();

      // Trouser cuff seam
      ctx.strokeStyle = pants.crease;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(fx, 460);
      ctx.lineTo(fx + 64, 460);
      ctx.stroke();

      // White socks
      ctx.fillStyle = socks.base;
      ctx.fillRect(fx, 460, 64, 12);
      ctx.fillStyle = socks.shadow;
      ctx.fillRect(fx, 468, 64, 4);

      // Black school shoes
      ctx.fillStyle = shoes.base;
      ctx.fillRect(fx, 472, 64, 40);

      // Shoe sole
      ctx.fillStyle = shoes.shadow;
      ctx.fillRect(fx, 504, 64, 8);

      // White shoelace stitches on front face (f = 2)
      if (f === 2) {
        ctx.fillStyle = shoes.laces;
        ctx.fillRect(fx + 20, 478, 24, 2.5);
        ctx.fillRect(fx + 22, 484, 20, 2.5);
        ctx.fillRect(fx + 24, 490, 16, 2.5);
      }
    }

    // LEFT LEG
    ctx.fillStyle = pants.base;
    ctx.fillRect(320, 768, 64, 64);
    ctx.fillStyle = shoes.shadow;
    ctx.fillRect(384, 768, 64, 64);

    for (let f = 0; f < 4; f++) {
      const fx = 256 + f * 64;

      // Dark grey school trousers
      ctx.fillStyle = pants.base;
      ctx.fillRect(fx, 832, 64, 140);

      // Trouser crease
      ctx.strokeStyle = pants.shadow;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fx + 32, 832);
      ctx.lineTo(fx + 32, 972);
      ctx.stroke();

      // Trouser cuff seam
      ctx.strokeStyle = pants.crease;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(fx, 972);
      ctx.lineTo(fx + 64, 972);
      ctx.stroke();

      // White socks
      ctx.fillStyle = socks.base;
      ctx.fillRect(fx, 972, 64, 12);
      ctx.fillStyle = socks.shadow;
      ctx.fillRect(fx, 980, 64, 4);

      // Black school shoes
      ctx.fillStyle = shoes.base;
      ctx.fillRect(fx, 984, 64, 40);

      // Shoe sole
      ctx.fillStyle = shoes.shadow;
      ctx.fillRect(fx, 1016, 64, 8);

      // White shoelace stitches on front face (f = 2)
      if (f === 2) {
        ctx.fillStyle = shoes.laces;
        ctx.fillRect(fx + 20, 990, 24, 2.5);
        ctx.fillRect(fx + 22, 996, 20, 2.5);
        ctx.fillRect(fx + 24, 1002, 16, 2.5);
      }
    }
  }
}
