# Menjalankan Spinora dengan Google dan Neon

Implementasi aplikasi ada di `web/`: Next.js, Bun, Auth.js Google, Drizzle, PostgreSQL. File HTML di root tetap merupakan prototipe terpisah, bukan aplikasi dengan autentikasi Google.

## 1. Konfigurasi akun layanan

1. Buat project PostgreSQL di Neon. Salin connection string pooled dengan SSL dari dashboard.
2. Di Google Cloud, siapkan OAuth consent screen dan OAuth client bertipe Web application. Selama aplikasi berstatus Testing, tambahkan akun yang akan mencoba sebagai test user.
3. Tambahkan authorized redirect URI persis `http://localhost:3000/api/auth/callback/google`. Untuk hosting, tambahkan `https://DOMAIN_ANDA/api/auth/callback/google`.
4. Di folder `web`, salin `.env.example` menjadi `.env.local`. Isi `DATABASE_URL`, `AUTH_GOOGLE_ID`, dan `AUTH_GOOGLE_SECRET`. Isi `AUTH_SECRET` menggunakan hasil `openssl rand -base64 32`. Set `AUTH_URL` sesuai alamat aplikasi.

Simpan kredensial hanya di environment lokal/hosting, jangan di commit atau dikirim lewat chat. `.env.local` diabaikan Git.

## 2. Instalasi dan migrasi

Dari folder project:

```sh
cd web
bun install
bun run db:migrate
bun run dev
```

Buka http://localhost:3000. Login Google membuka onboarding. Workspace baru di Production dimulai kosong. Development lokal menyediakan 100 hadiah dan 80 peserta contoh. Data prototipe lama tidak diimpor otomatis.

Jalankan `bun run test`, `bun run lint`, dan `bun run build` untuk validasi. Untuk produksi gunakan `bun run build` kemudian `bun run start` pada hosting yang mendukung Next.js server; static hosting saja tidak cukup. Atur semua environment sebelum build/start.

## 3. Alur penggunaan

- Login Google hanya di dashboard admin. Klik **Hubungkan layar → Buat kode layar**, buka `/spinner` pada browser/perangkat acara, lalu masukkan kode. Layar spinner tidak membutuhkan login Google dan tidak memiliki akses pengaturan admin.
- Akun Google berbeda memperoleh workspace terpisah. Versi ini belum mendukung beberapa akun staf dalam satu company, undangan, atau role anggota.
- Pilih tipe hadiah saja atau hadiah + peserta pada onboarding. Penggantian tipe menampilkan konfirmasi.
- Admin mengatur LIVE/OFF, hadiah, peserta, aturan hadiah, lokasi pemilihan peserta, dan manual/otomatis. Admin hanya menampilkan mirror roda.
- Mode manual: peserta kosong setelah undian dan setelah konfirmasi. Pilih peserta secara eksplisit sebelum memutar berikutnya.
- Mode otomatis: peserta berikutnya dipilih setelah konfirmasi; roda tetap harus diklik untuk berputar.
- Jika pemilihan peserta khusus admin, halaman spinner menyembunyikan pilihan, nama pemenang, dan riwayat peserta; admin tetap melihatnya.

## Penyimpanan dan sinkronisasi

Identitas workspace berasal dari Google subject yang diverifikasi sesi server, bukan ID kiriman browser. Satu workspace disimpan sebagai snapshot JSONB di PostgreSQL. Ini menyederhanakan transaksi awal; normalisasi tabel, audit log terpisah, dan membership company belum diimplementasikan.

Browser membaca server setiap satu detik. Ini sinkronisasi polling, bukan WebSocket: mirror dapat terlambat sekitar satu detik dan mengikuti waktu mulai putaran yang disimpan server. Jam perangkat sebaiknya tersinkronisasi. Pertimbangkan beban polling dan batas paket Neon sebelum acara besar.

Server menentukan hasil menggunakan random kriptografis berdasarkan stok dan aturan peserta. Semua hadiah dengan stok tersedia tetap ada pada roda, termasuk hadiah yang dilarang bagi peserta terpilih. Hasil dan pengurangan stok disimpan saat putaran dimulai, sehingga refresh tidak mengundi ulang. Konfirmasi menutup putaran. ID permintaan mencegah pengurangan stok dua kali, dan transaksi dengan row lock melindungi undian bersamaan pada workspace yang sama.

## Status verifikasi dan batasan

Tes unit mencakup mode manual/otomatis, aturan boleh/tidak boleh, OFF, peserta yang berubah, permintaan ulang, penguncian perubahan selama putaran, dan mode hadiah saja. Build serta lint diperiksa terpisah.

Login Google, migrasi ke Neon, isolasi dua akun nyata, dan transaksi dua browser belum dapat diverifikasi tanpa kredensial layanan. Uji keempatnya sebelum acara produksi. Autentikasi memakai Auth.js v5 beta; lockfile mengunci versi instalasi.

Dashboard menggunakan komponen Radix untuk dropdown, dialog, sheet, dan checkbox. Hadiah serta peserta mendukung pencarian, pagination, edit melalui form, dan penghapusan massal dengan konfirmasi. Pemilihan peserta secara acak dilengkapi animasi.

Suara putaran memakai ketukan mekanis dan drum roll, diikuti fanfare sintetis dan rekaman tepuk tangan kerumunan CC0 yang di-host lokal (lihat `web/public/audio/ATTRIBUTION.md`). Browser memerlukan interaksi pengguna untuk membuka audio; tombol suara mematikan semua efek. Konfeti bertahap muncul di depan modal selama delapan detik. Preferensi reduced motion menonaktifkan konfeti dan animasi dekoratif. Pemilihan dua tema dan preset ukuran seed prototipe belum dipindahkan. Prototipe root tetap tersedia sebagai referensi.

## Akses layar spinner

- Kode pairing acak 12 karakter (60 bit), kedaluwarsa setelah 10 menit, hanya dapat ditukar sekali. Database menyimpan hash, bukan kode asli.
- Penukaran kode memberikan cookie HttpOnly, SameSite Strict, Secure pada production, khusus path `/api/screen`, berlaku 12 jam. Token acak 256 bit disimpan sebagai hash di workspace. Data pairing disimpan di JSONB yang sudah ada: tidak membutuhkan migrasi tabel atau environment baru.
- Satu akses layar aktif per workspace. Pairing layar baru mengganti token lama. **Cabut akses layar & kode** langsung membatalkan sesi dan kode yang belum digunakan; layar akan kembali ke formulir pairing saat polling berikutnya.
- API layar hanya mengizinkan spin/konfirmasi serta pemilihan peserta jika admin mengizinkan pemilihan dari layar. LIVE/OFF, edit, hapus dan pengaturan tetap memerlukan login admin. API admin menolak spin dan konfirmasi.
- Payload layar tidak berisi aturan hadiah atau kredensial pairing. Pada kontrol khusus admin, daftar peserta, riwayat, dan nama di hasil juga tidak dikirim. Server menentukan kelayakan; semua hadiah dengan stok tetap tampil di roda.
- Jika perangkat layar pernah dipakai login Google sebagai admin, keluar dari akun itu terlebih dahulu atau gunakan profil browser terpisah. Pairing tidak mencabut sesi Google yang sebelumnya sudah login di perangkat tersebut.
- Roda memakai lingkaran terbesar yang muat di viewport. Tombol layar penuh meminta fullscreen browser jika didukung; kontrol berada di tepi. Di editor peserta, aturan hadiah tersembunyi sampai opsi **Atur hadiah untuk peserta ini** dicentang. Menonaktifkannya lalu menyimpan mengembalikan peserta ke semua hadiah.
- Kurva putaran memakai percepatan, kecepatan puncak, lalu perlambatan gesekan hingga berhenti tanpa memantul. Posisi roda dan ketukan audio memakai fungsi waktu yang sama pada layar dan mirror. Panah berporos merespons batas segmen dengan pegas teredam, lalu diam saat selesai. Palet roda memakai warna tegas dengan pilihan teks terang/gelap; tes memastikan kontras setiap kombinasi teks roda minimal 4.5:1.
- Tes otomatis memeriksa token salah/kedaluwarsa/dicabut, isolasi workspace, penyaringan data layar, pembatasan perintah, serta mode manual. Uji pairing admin + layar pada deployment dengan Neon asli sebelum acara; pengujian browser lokal menggunakan data simulasi.
