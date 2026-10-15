# Spinora — Implementation Plan

## Phase 1 — Foundation

- [x] Dokumentasikan kebutuhan dan keputusan arsitektur.
- [x] Buat aplikasi Next.js TypeScript.
- [x] Pindahkan design tokens dan shell visual dari prototype.
- [x] Siapkan route awal `/spinner` dan `/admin`.
- [ ] Siapkan route `/login` dan onboarding company.
- [ ] Tambahkan pemeriksaan type dan production build.

## Phase 2 — Data and identity

- [ ] Tambahkan PostgreSQL dan Drizzle.
- [ ] Buat schema multi-company.
- [ ] Tambahkan login, session cookie, dan onboarding company.
- [ ] Buat seed 100 hadiah dan 80 peserta.

## Phase 3 — Admin

- [ ] Dashboard dan live preview read-only.
- [ ] CRUD hadiah dengan icon picker.
- [ ] CRUD peserta dan aturan hadiah.
- [ ] Searchable participant sheet dengan pagination.
- [ ] LIVE/OFF gate dan konfigurasi spinner.
- [ ] Riwayat serta ekspor CSV.

## Phase 4 — Spinner

- [ ] Canvas wheel responsif.
- [ ] Pemilihan hasil tervalidasi server.
- [ ] Alur peserta manual dan otomatis.
- [ ] Sinkronisasi animasi lintas browser.
- [ ] Modal hasil, confetti, fanfare, dan applause.

## Phase 5 — Quality

- [ ] Uji isolasi company dan concurrency putaran.
- [ ] Uji stok tidak berkurang ganda.
- [ ] Uji responsive dan keyboard navigation.
- [ ] Audit performa dan accessibility.
- [ ] Deployment staging dan production.

