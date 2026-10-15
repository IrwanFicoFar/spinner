import Link from 'next/link';
import { Logo } from '@/components/logo';

export default function Home() {
  return <main className="public-page">
    <nav className="public-nav"><Logo/><div><Link href="/privacy">Privasi</Link><Link className="public-cta small" href="/login">Masuk dengan Google</Link></div></nav>
    <section className="public-hero">
      <p className="eyebrow"><i/>UNDIAN CERIA UNTUK SETIAP ACARA</p>
      <h1>Satu roda. Banyak kejutan. <span>Semua ikut bersorak.</span></h1>
      <p>Spinora membantu perusahaan menyiapkan hadiah, peserta, aturan hadiah, dan panggung undian yang tersinkron dalam satu tempat.</p>
      <div className="public-actions"><Link className="public-cta" href="/login">Mulai dengan Google</Link><Link className="public-secondary" href="/spinner">Buka panggung spinner</Link></div>
    </section>
    <section className="public-features" aria-label="Fitur utama">
      <article><span>🎁</span><h2>Hadiah fleksibel</h2><p>Tampilkan seluruh hadiah pada roda dan terapkan aturan kelayakan saat hasil ditentukan.</p></article>
      <article><span>🎉</span><h2>Panggung meriah</h2><p>Pisahkan layar spinner dari pusat kontrol agar acara tetap bersih dan fokus.</p></article>
      <article><span>🔄</span><h2>Selalu tersinkron</h2><p>Admin dapat memantau status, peserta, hasil, dan riwayat dari browser berbeda.</p></article>
    </section>
    <footer><span>© 2026 Spinora</span><div><Link href="/privacy">Kebijakan Privasi</Link><Link href="/terms">Ketentuan Layanan</Link></div></footer>
  </main>;
}
