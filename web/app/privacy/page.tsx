import Link from 'next/link';
import { Logo } from '@/components/logo';

export const metadata = { title: 'Kebijakan Privasi — Spinora' };

export default function Privacy() {
  return <main className="legal-page">
    <nav className="public-nav"><Link href="/"><Logo/></Link><Link href="/">Kembali ke beranda</Link></nav>
    <article>
      <p className="eyebrow"><i/>TERAKHIR DIPERBARUI 16 OKTOBER 2026</p>
      <h1>Kebijakan Privasi</h1>
      <p>Spinora menggunakan informasi seperlunya untuk menyediakan akun dan menjalankan undian hadiah.</p>
      <h2>Informasi yang kami proses</h2>
      <p>Saat Anda masuk dengan Google, kami menerima pengenal akun Google, alamat email, dan informasi profil dasar yang disetujui pada layar login. Kami juga menyimpan data workspace yang Anda masukkan, seperti nama perusahaan, hadiah, peserta, aturan hadiah, status undian, dan riwayat pemenang.</p>
      <h2>Cara informasi digunakan</h2>
      <p>Informasi tersebut digunakan untuk mengautentikasi pengguna, memisahkan data setiap akun, menyinkronkan halaman admin dan spinner, menentukan hasil sesuai aturan, serta menampilkan riwayat undian.</p>
      <h2>Penyimpanan dan penyedia layanan</h2>
      <p>Aplikasi dijalankan melalui Vercel dan data aplikasi disimpan pada Neon PostgreSQL. Login diproses melalui Google OAuth. Penyedia tersebut dapat memproses data teknis sesuai kebijakan mereka untuk menjalankan layanannya.</p>
      <h2>Pembagian dan penjualan data</h2>
      <p>Kami tidak menjual data pribadi. Data hanya dibagikan kepada penyedia layanan yang diperlukan untuk menjalankan aplikasi atau ketika diwajibkan oleh hukum.</p>
      <h2>Retensi dan pilihan pengguna</h2>
      <p>Data disimpan selama workspace digunakan. Anda dapat meminta penghapusan data akun dan workspace dengan menghubungi pengelola melalui alamat email dukungan yang tercantum pada layar persetujuan Google.</p>
      <h2>Keamanan</h2>
      <p>Kami menggunakan autentikasi Google, koneksi terenkripsi, dan pemisahan workspace berdasarkan identitas akun. Tidak ada sistem yang dapat menjamin keamanan mutlak, sehingga akses akun Google tetap perlu dijaga oleh pengguna.</p>
      <h2>Perubahan kebijakan</h2>
      <p>Kebijakan ini dapat diperbarui ketika layanan atau cara pemrosesan data berubah. Tanggal pembaruan terbaru akan ditampilkan pada halaman ini.</p>
      <p className="legal-links"><Link href="/terms">Baca Ketentuan Layanan</Link><Link href="/login">Masuk ke Spinora</Link></p>
    </article>
  </main>;
}
