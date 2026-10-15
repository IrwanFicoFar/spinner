import Link from 'next/link';
import { Logo } from '@/components/logo';

export const metadata = { title: 'Ketentuan Layanan — Spinora' };

export default function Terms() {
  return <main className="legal-page">
    <nav className="public-nav"><Logo/><Link href="/">Kembali ke beranda</Link></nav>
    <article>
      <p className="eyebrow"><i/>TERAKHIR DIPERBARUI 16 OKTOBER 2026</p>
      <h1>Ketentuan Layanan</h1>
      <p>Dengan menggunakan Spinora, Anda menyetujui ketentuan berikut.</p>
      <h2>Penggunaan layanan</h2>
      <p>Anda bertanggung jawab atas data hadiah dan peserta, aturan undian, izin untuk memproses data peserta, serta pelaksanaan acara sesuai hukum yang berlaku.</p>
      <h2>Akun dan akses</h2>
      <p>Akses menggunakan akun Google. Anda bertanggung jawab menjaga keamanan akun dan aktivitas yang dilakukan melalui workspace Anda.</p>
      <h2>Hasil undian</h2>
      <p>Spinora membantu memilih hadiah secara acak dari hadiah yang memenuhi stok dan aturan peserta. Pengelola acara tetap bertanggung jawab memeriksa konfigurasi sebelum mengaktifkan spinner.</p>
      <h2>Ketersediaan</h2>
      <p>Layanan disediakan sebagaimana tersedia. Pemeliharaan, gangguan jaringan, atau layanan pihak ketiga dapat memengaruhi akses dan sinkronisasi.</p>
      <h2>Perubahan</h2>
      <p>Fitur dan ketentuan dapat diperbarui untuk meningkatkan layanan atau memenuhi kewajiban hukum. Penggunaan setelah pembaruan berarti Anda menerima ketentuan terbaru.</p>
      <p className="legal-links"><Link href="/privacy">Baca Kebijakan Privasi</Link><Link href="/login">Masuk ke Spinora</Link></p>
    </article>
  </main>;
}
