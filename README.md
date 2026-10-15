# Spinora

Aplikasi Next.js + Bun dengan Google login dan Neon berada di [`web`](web). Ikuti [panduan setup layanan nyata](docs/production-setup.md).

Bagian berikut mendokumentasikan prototipe HTML lama.

Mock undian hadiah multi-company dengan halaman spinner dan portal admin yang tersinkron melalui server lokal.

## Menjalankan aplikasi

```sh
node server.js
```

Buka `http://127.0.0.1:4173/admin.html` untuk portal admin atau `http://127.0.0.1:4173/index.html` untuk layar spinner.

Akun demo:

- Email: `admin@spinora.local`
- Password: `spinora123`

Kedua halaman wajib login. Browser atau perangkat berbeda yang memakai akun company yang sama akan membaca dan memperbarui data company yang sama. Perubahan dipantau otomatis setiap 1,5 detik. Data server disimpan dalam `.spinora-data.json` dan file ini diabaikan Git.

## Tipe spinner

Saat membuat akun company, admin memilih salah satu tipe:

- **Spinner hadiah:** roda hanya memakai daftar hadiah.
- **Hadiah + peserta:** roda memakai hadiah, peserta, dan aturan hadiah per peserta.

Perubahan tipe sesudah onboarding menampilkan peringatan karena mengubah alur undian. Hadiah, peserta, dan riwayat tetap disimpan.

Untuk mode hadiah + peserta, admin dapat menentukan apakah pemilihan peserta tampil pada halaman spinner atau hanya tersedia di pusat kontrol admin. Halaman mirror di dashboard selalu menampilkan nama peserta pada modal hasil agar admin dapat memantau hasil lengkap.

## Fitur

- 100 seed hadiah dan 80 seed peserta.
- Pencarian hadiah, peserta, dan aturan hadiah.
- Preset jumlah data sedikit, sedang, dan banyak.
- Animasi roda, suara, konfeti, serta riwayat pemenang.
- Dashboard utama dengan pengaturan tiga langkah dan live preview spinner.
- Login serta data terpisah per company.
- Sinkronisasi lintas browser melalui REST API lokal.

Server ini ditujukan sebagai mock yang dapat diuji secara lokal. Untuk produksi, pindahkan penyimpanan JSON dan sesi memori ke database serta session store yang sesuai dengan lingkungan deployment.
