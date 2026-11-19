# 🎨 Editorial Crimson & Cream Portfolio — Muhammad Prima Yudhistira

Website portofolio berestetika **High-Fashion Magazine Cover** yang memadukan tipografi raksasa, karakter 3D Minecraft interaktif (*Three.js*), dan *smooth scroll section*.

---

## ✨ Fitur & Struktur Halaman

### 1. Hero Section (Sampul Majalah)
- **Latar Belakang Krim Mewah (*Warm Editorial Cream* `#f6f4f0`)**: Warna bersih, minimalis, dan elegan.
- **Tipografi Merah Menyala (*Bold Editorial Crimson Red* `#d11a2a`)**:
  - `MUHAMMAD` (Baris 1)
  - `PRIMA` (**Hero Centerpiece raksasa**, mendominasi layar)
  - `YUDHISTIRA` (Baris 3)
- **Efek Tumpuk 3D (*3D Sandwich Text-Stroke Effect*)**:
  - **Lapisan 1 (Belakang Karakter, `z-index: 2`)**: Tulisan solid merah pekat.
  - **Lapisan 2 (Tengah, `z-index: 5`)**: Karakter 3D menyembul dari bawah menimpa tulisan.
  - **Lapisan 3 (Depan Karakter, `z-index: 10`)**: Tulisan garis kawat (*outline stroke*) merah transparan.
  - **Hasil**: Setiap huruf yang menimpa tubuh karakter otomatis berubah menjadi *outline*, sedangkan di luar tubuh karakter tetap merah solid.
- **Karakter 3D Mengikuti Kursor & Melambai**:
  - Baju jas Midnight Navy **`#262f53`**, rambut ikal taper-fade dengan untaian spiral di dahi.
  - Tatapan mata & kepala menengadah mengikuti gerakan kursor mouse secara presisi 3D.
  - Klik pada hero section untuk memicu lambaian tangan kanan.

### 2. Section About Me (Transisi Halus Saat Discroll)
- **Mekanisme Tutup Badan Karakter (*Smooth Overlay on Scroll*)**:
  - Karakter 3D diposisikan *fixed* di tepi bawah layar.
  - Saat halaman discroll ke bawah, bagian **About Me** (dengan latar belakang solid *Midnight Navy* `#0b0e17` dan `z-index: 30`) bergulir naik ke atas menutupi separuh tubuh karakter.
  - Seluruh bagian pinggang, celana, dan kaki karakter yang berada di bawah tepi layar **terjaga 100% tertutup dan tidak pernah terlihat**.
- **Konten Section About Me**:
  - **Biografi**: Perkenalan sebagai mahasiswa *Software Engineering* di **IPB University**.
  - **Overview**: Institusi, jurusan, peran (*Fullstack Developer*), dan status ketersediaan.
  - **Tech Stack & Skills**:
    - *3D & Creative Frontend*: Three.js, WebGL, JavaScript (ES6+), React/Next.js, HTML5/CSS3, Tailwind CSS.
    - *Backend & Software Engineering*: Python, Node.js, RESTful APIs, SQL, Git & GitHub, Clean Code.
  - **Navigasi Balik ke Atas**: Tombol *Back to Top ↑* untuk kembali ke hero section dengan halus.

---

## 🚀 Cara Menjalankan
Server lokal aktif di port `3000`:
👉 **[http://localhost:3000](http://localhost:3000)**
