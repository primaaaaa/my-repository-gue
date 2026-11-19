/**
 * SkinGenerator.js
 * Generates a clean, modern, non-pixelated 1024x1024 texture.
 * Features:
 * - Curly Low-Taper Fade with defined ringlets & signature loose curl lock
 * - Blazer in color #262f53 (Midnight Navy)
 * - Inner shirt, golden buttons, university emblem
 * - Formal charcoal pants & white sneakers with green heel accent
 */

export class SkinGenerator {
  constructor(options = {}) {
    this.size = 1024;
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.size;
    this.canvas.height = this.size;
    this.ctx = this.canvas.getContext('2d');

    // Calibrated color palette
    this.palette = {
      hair: {
        base: '#1b1715', // Rich dark brown-black from reference photo
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
      blazer: {
        base: '#262f53', // User's requested clothing color #262f53
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
    };
  }

  generate() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.size, this.size);

    const { hair, skin, blazer, shirt, pants, shoes } = this.palette;

    /* ========================================================
     * 1. HEAD (Curly Ringlets & Clean Low-Taper Fade)
     * Origin: (0, 0), Size: 8x8x8 -> In 1024: w=128, h=128, d=128
     * Top: (128, 0), Bottom: (256, 0)
     * Right: (0, 128), Front: (128, 128), Left: (256, 128), Back: (384, 128)
     * ======================================================== */
    // Top of head (Defined Curly Ringlet Swirls)
    ctx.fillStyle = hair.base;
    ctx.fillRect(128, 0, 128, 128);

    // Individual curly spiral ringlets on top
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
    // Ringlet coil highlights & spiral shadows
    ctx.strokeStyle = hair.coilShine;
    ctx.lineWidth = 2.0;
    for (const [rx, ry, r] of topRinglets) {
      ctx.beginPath();
      ctx.arc(rx - 2, ry - 2, r - 3, 0.4, Math.PI * 1.3);
      ctx.stroke();
    }
    ctx.strokeStyle = hair.shadow;
    ctx.lineWidth = 2.0;
    for (const [rx, ry, r] of topRinglets) {
      ctx.beginPath();
      ctx.arc(rx + 2, ry + 2, r - 3, Math.PI * 0.9, Math.PI * 1.8);
      ctx.stroke();
    }

    // Bottom of head (Skin under chin & neck)
    ctx.fillStyle = skin.shadow;
    ctx.fillRect(256, 0, 128, 128);

    // --------------------------------------------------------
    // RIGHT SIDE (0..128, 128..256) - LOW TAPER FADE
    // --------------------------------------------------------
    ctx.fillStyle = skin.base;
    ctx.fillRect(0, 128, 128, 128);

    // Upper curly hair mass
    ctx.fillStyle = hair.base;
    ctx.fillRect(0, 128, 128, 54);

    // Mid taper transition
    ctx.fillStyle = hair.fadeMid;
    ctx.fillRect(0, 182, 128, 20);

    // Low taper fade around ear arch
    ctx.fillStyle = hair.fadeLow;
    ctx.fillRect(0, 202, 128, 16);

    // Clean skin cutout around ear & temple line
    ctx.fillStyle = skin.base;
    ctx.beginPath();
    ctx.moveTo(76, 212);
    ctx.lineTo(128, 212);
    ctx.lineTo(128, 256);
    ctx.lineTo(68, 256);
    ctx.closePath();
    ctx.fill();

    // --------------------------------------------------------
    // LEFT SIDE (256..384, 128..256) - LOW TAPER FADE
    // --------------------------------------------------------
    ctx.fillStyle = skin.base;
    ctx.fillRect(256, 128, 128, 128);

    ctx.fillStyle = hair.base;
    ctx.fillRect(256, 128, 128, 54);

    ctx.fillStyle = hair.fadeMid;
    ctx.fillRect(256, 182, 128, 20);

    ctx.fillStyle = hair.fadeLow;
    ctx.fillRect(256, 202, 128, 16);

    // Clean skin cutout around ear
    ctx.fillStyle = skin.base;
    ctx.beginPath();
    ctx.moveTo(256, 212);
    ctx.lineTo(308, 212);
    ctx.lineTo(316, 256);
    ctx.lineTo(256, 256);
    ctx.closePath();
    ctx.fill();

    // --------------------------------------------------------
    // BACK OF HEAD (384..512, 128..256) - TAPERED NAPE
    // --------------------------------------------------------
    ctx.fillStyle = hair.base;
    ctx.fillRect(384, 128, 128, 58);

    ctx.fillStyle = hair.fadeMid;
    ctx.fillRect(384, 186, 128, 24);

    ctx.fillStyle = hair.fadeLow;
    ctx.fillRect(384, 210, 128, 18);

    ctx.fillStyle = skin.shadow;
    ctx.beginPath();
    ctx.moveTo(384, 256);
    ctx.lineTo(416, 226);
    ctx.lineTo(480, 226);
    ctx.lineTo(512, 256);
    ctx.closePath();
    ctx.fill();

    // --------------------------------------------------------
    // FRONT OF FACE (128..256, 128..256) - CURLY FRINGE & SIGNATURE LOOSE RINGLET
    // --------------------------------------------------------
    ctx.fillStyle = skin.base;
    ctx.fillRect(128, 128, 128, 128);

    // Base curly fringe mass across forehead
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

    // Defined bouncy ringlet coils across the fringe
    const fringeCoils = [
      [140, 166, 8],
      [154, 170, 9],
      [172, 168, 9],
      [194, 170, 9],
      [212, 168, 8],
      [230, 169, 8],
      [244, 165, 7]
    ];
    ctx.fillStyle = hair.base;
    for (const [cx, cy, r] of fringeCoils) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // SIGNATURE LOOSE RINGLET COIL (Dangling down over left brow, matching reference photo!)
    ctx.fillStyle = hair.base;
    ctx.beginPath();
    ctx.arc(170, 178, 7.5, 0, Math.PI * 2);
    ctx.arc(168, 188, 6.0, 0, Math.PI * 2);
    ctx.fill();

    // Highlights on the loose curl ringlet
    ctx.strokeStyle = hair.coilShine;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(169, 177, 5.5, 0.5, Math.PI * 1.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(167, 187, 4.2, 0.5, Math.PI * 1.3);
    ctx.stroke();

    // Curl coils highlights across fringe
    ctx.strokeStyle = hair.coilShine;
    ctx.lineWidth = 1.8;
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


    /* ========================================================
     * 2. TORSO / BODY (Jas Almamater Suit #262f53)
     * ======================================================== */
    ctx.fillStyle = blazer.base;
    ctx.fillRect(320, 256, 128, 64);
    ctx.fillStyle = shirt.base;
    ctx.fillRect(360, 280, 48, 40);

    ctx.fillStyle = blazer.shadow;
    ctx.fillRect(448, 256, 128, 64);

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

    // Suit Lapels
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

    // Emblem Badge
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


    /* ========================================================
     * 3. RIGHT ARM
     * ======================================================== */
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


    /* ========================================================
     * 4. LEFT ARM
     * ======================================================== */
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


    /* ========================================================
     * 5. RIGHT LEG
     * ======================================================== */
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


    /* ========================================================
     * 6. LEFT LEG
     * ======================================================== */
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

    return this.canvas;
  }
}
