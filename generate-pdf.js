import fs from 'fs';

// A valid, clean, professional single-page PDF for Muhammad Prima Yudhistira
const streamContent = `BT
/F1 20 Tf
50 780 Td
(MUHAMMAD PRIMA YUDHISTIRA) Tj
0 -24 Td
/F2 11 Tf
(Software Engineer & Project Manager | Mahasiswa Rekayasa Perangkat Lunak IPB) Tj
0 -18 Td
(Email: primayudhistira040@gmail.com | Lokasi: Bekasi, Jawa Barat) Tj
0 -30 Td
/F1 13 Tf
(RINGKASAN PROFIL) Tj
0 -18 Td
/F2 10 Tf
(Mahasiswa Teknologi Rekayasa Perangkat Lunak di Sekolah Vokasi IPB University dengan minat) Tj
0 -14 Td
(mendalam pada Web Development dan Project Management. Berpengalaman merancang dan) Tj
0 -14 Td
(membangun aplikasi web responsif menggunakan teknologi modern.) Tj
0 -28 Td
/F1 13 Tf
(RIWAYAT PENDIDIKAN) Tj
0 -18 Td
/F1 10.5 Tf
(IPB University - Rekayasa Perangkat Lunak (2024 - 2028)) Tj
0 -14 Td
/F2 9.5 Tf
(Fokus pada pengembangan aplikasi, manajemen proyek perangkat lunak, dan kepemimpinan tim.) Tj
0 -18 Td
/F1 10.5 Tf
(SMKN 5 Kota Bekasi - Rekayasa Perangkat Lunak (2021 - 2024)) Tj
0 -14 Td
/F2 9.5 Tf
(Juara 1 LKS Kota Bekasi Web Technologies, Ketua Ekstrakurikuler IT Club.) Tj
0 -28 Td
/F1 13 Tf
(KEAHLIAN & TEKNOLOGI) Tj
0 -18 Td
/F2 10 Tf
(Frontend: React, Next.js, Tailwind CSS, JavaScript ES6+, HTML5, CSS3) Tj
0 -15 Td
(Backend: Laravel, Node.js, Python, MySQL, MongoDB, RESTful API) Tj
0 -15 Td
(Tools & Manajemen: Git, GitHub, Trello, Agile/Scrum, Figma, Three.js) Tj
0 -28 Td
/F1 13 Tf
(PORTFOLIO HIGHLIGHTS) Tj
0 -18 Td
/F2 10 Tf
(- MediGo: Platform telemedicine & booking faskes modern terintegrasi) Tj
0 -15 Td
(- WertuGo: Aplikasi manajemen tur & pariwisata interaktif) Tj
0 -15 Td
(- BogorSehat & Darkim: Solusi digital kesehatan dan perizinan terintegrasi) Tj
ET`;

const streamLength = Buffer.byteLength(streamContent, 'utf-8');

const pdfParts = [
  '%PDF-1.4\n',
  '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
  '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
  '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n',
  `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj\n`,
  '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n',
  '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n'
];

let offset = 0;
const offsets = [0];
const body = pdfParts.map(part => {
  offsets.push(offset);
  offset += Buffer.byteLength(part, 'utf-8');
  return part;
}).join('');

let xref = `xref\n0 7\n0000000000 65535 f \n`;
for (let i = 1; i <= 6; i++) {
  const offStr = String(offsets[i]).padStart(10, '0');
  xref += `${offStr} 00000 n \n`;
}

const trailer = `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${offset}\n%%EOF\n`;
const fullPdf = body + xref + trailer;

fs.mkdirSync('public', { recursive: true });
fs.writeFileSync('public/CV_Portofolio.pdf', fullPdf, 'binary');
fs.writeFileSync('CV_Portofolio.pdf', fullPdf, 'binary');
console.log('CV_Portofolio.pdf successfully generated in public/ and root!');
