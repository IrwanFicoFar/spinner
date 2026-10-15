# Spinora — Product Requirements

## Tujuan

Spinora adalah platform lucky draw multi-company. Setiap company memiliki akun, hadiah, peserta, aturan undian, riwayat, dan layar spinner yang tersinkron meskipun admin dan layar acara dibuka dari browser berbeda.

## Peran

### Admin

- Login menggunakan akun company.
- Mengatur tipe spinner, status acara, hadiah, peserta, aturan hadiah, dan riwayat.
- Melihat preview spinner secara langsung tanpa dapat memutar roda dari preview.
- Memilih peserta melalui searchable bottom sheet atau memilih peserta secara acak.
- Menentukan apakah pemilihan peserta tersedia di layar spinner atau hanya di dashboard admin.

### Operator spinner

- Login ke company yang sama.
- Menjalankan undian hanya ketika status acara LIVE.
- Memutar roda dengan mengklik roda.
- Tidak dapat mengubah data administratif.

## Tipe spinner

### Hadiah saja

- Roda berisi seluruh hadiah aktif.
- Tidak membutuhkan peserta.
- Hasil mencatat hadiah dan waktu undian.

### Hadiah + peserta

- Roda tetap menampilkan seluruh hadiah aktif agar aturan peserta tidak terlihat oleh penonton.
- Hasil hanya boleh berhenti pada hadiah yang memenuhi aturan peserta terpilih.
- Admin dapat menentukan hadiah yang boleh atau tidak boleh diterima setiap peserta.
- Peserta yang sudah menang tidak dapat dipilih kembali.

## Alur peserta

- **Manual:** setelah hasil disimpan, peserta terpilih langsung dikosongkan. Spinner terkunci sampai peserta baru dipilih.
- **Otomatis:** setelah hasil dikonfirmasi, sistem menyiapkan peserta berikutnya. Roda tetap tidak berputar otomatis.
- Pergantian dari otomatis ke manual selalu mengosongkan peserta lama.
- Pemilihan peserta tidak pernah memulai putaran.

## Kontrol peserta

- **Tampil di spinner:** layar spinner menampilkan sheet peserta, pencarian, pagination, dan pilihan acak.
- **Admin saja:** halaman spinner menyembunyikan pemilihan peserta dan riwayat pemenang. Pemilihan dilakukan dari dashboard admin.
- Modal hasil di dashboard admin selalu menampilkan nama peserta.
- Modal hasil di layar spinner mengikuti konfigurasi visibilitas peserta.

## LIVE / OFF

- Admin memiliki kontrol utama untuk mengubah status acara menjadi LIVE atau OFF.
- Saat OFF, semua layar spinner tetap dapat dibuka tetapi roda terkunci.
- Dashboard menampilkan overlay besar di atas preview ketika spinner OFF.
- Preview admin hanya mencerminkan animasi, posisi akhir, hadiah, dan pemenang dari layar spinner.
- Preview admin tidak dapat memulai putaran.

## Hadiah

- Hadiah memiliki nama, ikon, dan stok.
- Admin dapat menambah, mengubah, mencari, dan menghapus hadiah.
- Tersedia preset jumlah hadiah sedikit, sedang, dan banyak.
- Label roda menyesuaikan ukuran teks berdasarkan jumlah hadiah.

## Peserta

- Admin dapat menambah, mengubah, mencari, dan menghapus peserta.
- Aturan peserta dapat berupa daftar hadiah yang diperbolehkan atau dilarang.
- Tersedia preset jumlah peserta sedikit, sedang, dan banyak.
- Pemilihan peserta menggunakan sheet dengan pencarian dan pagination.

## Riwayat

- Menyimpan peserta, hadiah, ikon, dan waktu hasil.
- Tersedia di dashboard admin dan dapat diekspor sebagai CSV.
- Dapat ditampilkan di spinner hanya ketika kontrol peserta tersedia di spinner.

## Pengalaman visual

- Cerah, meriah, penuh warna, dan tidak menggunakan tema gelap sebagai tampilan utama.
- Roda memakai area layar semaksimal mungkin.
- Animasi putaran memiliki akselerasi dan perlambatan alami.
- Pointer bereaksi selama putaran dan berhenti setelah roda selesai.
- Perayaan berada di lapisan terdepan dengan confetti, fanfare, tepuk tangan, dan efek suara.
- Tersedia tema Festival dan Carnival.

## Data awal

- 100 hadiah contoh.
- 80 peserta contoh.

## Kriteria keamanan alur

- Putaran tidak boleh dimulai tanpa peserta pada mode Hadiah + Peserta.
- Putaran tidak boleh dimulai ketika status OFF.
- Satu hasil hanya boleh mengurangi stok satu kali.
- Aturan hadiah dievaluasi di server sebelum hasil ditetapkan.
- Company hanya dapat membaca dan mengubah datanya sendiri.

