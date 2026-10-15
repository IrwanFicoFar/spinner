# Spinora Web

Aplikasi Next.js + Bun dengan login Google, penyimpanan Neon PostgreSQL, dan undian di server.

Ikuti [panduan konfigurasi Google, Neon, dan migrasi](../docs/production-setup.md) sebelum menjalankan:

```sh
bun install
bun run db:migrate
bun run dev
```

Buka http://localhost:3000. Route `/login` untuk login Google, `/admin` untuk pengaturan dan mirror, `/spinner` untuk panggung undian.

```sh
bun run test
bun run lint
bun run build
```

Prototype HTML tetap berada di root repository. Batasan implementasi dan status verifikasi tercatat dalam panduan setup.
