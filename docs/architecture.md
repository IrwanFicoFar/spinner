# Spinora — Architecture Decision

## Keputusan

Gunakan **Next.js App Router + TypeScript** untuk aplikasi utama.

Vite sangat baik untuk prototipe antarmuka, tetapi Spinora membutuhkan autentikasi, isolasi data per company, API, validasi hasil di server, dan sinkronisasi event lintas browser. Next.js memungkinkan halaman dan endpoint server berada dalam satu codebase serta memberi jalur deployment yang lebih sederhana.

## Struktur aplikasi

```text
web/
  app/
    (auth)/
    admin/
    spinner/
    api/
  components/
  features/
    auth/
    prizes/
    participants/
    draw/
  lib/
  types/
docs/
prototype/
```

Mock HTML saat ini tetap dipertahankan sebagai referensi perilaku selama migrasi.

## Rencana teknologi

- Next.js App Router dan TypeScript.
- Bun sebagai package manager dan script runner.
- React Server Components untuk halaman dan data awal.
- Client Components hanya untuk roda, audio, dialog, sheet, dan interaksi real-time.
- PostgreSQL untuk company, user, hadiah, peserta, aturan, hasil, dan event putaran.
- Drizzle ORM untuk schema dan migration.
- Auth.js atau autentikasi kredensial dengan session cookie aman.
- Server-Sent Events sebagai pilihan awal sinkronisasi LIVE/OFF, peserta, dan event putaran. WebSocket dapat ditambahkan jika kontrol dua arah berfrekuensi tinggi dibutuhkan.
- Zod untuk validasi input dan payload event.

## Model data awal

```text
Company
User -> Company
SpinnerSettings -> Company
Prize -> Company
Participant -> Company
ParticipantPrizeRule -> Participant + Prize
DrawEvent -> Company + Prize + optional Participant
```

Semua query wajib membawa `companyId` dari session server. `companyId` tidak dipercaya dari body request.

## Transaksi undian

1. Client meminta putaran dengan peserta terpilih.
2. Server memeriksa status LIVE, tipe spinner, peserta, stok, dan aturan hadiah.
3. Server memilih hadiah yang valid dan membuat event `spinning` dengan waktu mulai serta target roda.
4. Semua layar menerima event yang sama dan menghitung posisi animasi dari timestamp server.
5. Server menyelesaikan event dalam transaksi, mengurangi stok satu kali, dan menulis riwayat.
6. Pada mode manual, `selectedParticipantId` dikosongkan dalam transaksi yang sama.

## Tahapan migrasi

1. Fondasi Next.js, design tokens, layout, dan navigasi.
2. Schema database dan autentikasi company.
3. CRUD hadiah dan peserta.
4. Mesin undian server-side.
5. Sinkronisasi real-time serta preview admin.
6. Audio, animasi, accessibility, dan hardening.

