# 🏪 QRIS H2H Dashboard - Market Phone NanoJS

Dashboard transaksi QRIS terintegrasi dengan SMP Payment (solusimediapulsa.com).

---

## 📁 Struktur File

```
qris-app/
├── src/app/
│   ├── api/
│   │   ├── callback-qris/[secret]/route.ts  ← Terima notif dari SMP
│   │   └── h2h/trx/route.ts                 ← Kirim transaksi ke SMP
│   ├── dashboard/page.tsx                   ← Halaman dashboard
│   └── layout.tsx
├── .env.example   ← Template konfigurasi
└── package.json
```

---

## 🚀 Cara Deploy ke Vercel

### Langkah 1: Upload ke GitHub

1. Buat akun di [github.com](https://github.com) (gratis)
2. Buat repository baru, nama: `qris-dashboard`
3. Upload semua file ini ke repository tersebut

### Langkah 2: Deploy di Vercel

1. Buka [vercel.com](https://vercel.com) → Login dengan GitHub
2. Klik **"Add New Project"**
3. Pilih repository `qris-dashboard`
4. Klik **Deploy**

### Langkah 3: Atur Environment Variables

Di Vercel → Settings → **Environment Variables**, tambahkan:

| Key | Value | Keterangan |
|-----|-------|-----------|
| `QRIS_CALLBACK_SECRET` | `kata_rahasia_unik` | Bebas, tapi sulit ditebak |
| `SMP_USERNAME` | `rafaeloffc` | Username SMP Payment Anda |
| `H2H_ID` | `H2H00001` | ID H2H dari SMP |
| `H2H_PIN` | `1234` | PIN H2H Anda |
| `H2H_PASS` | `password_anda` | Password H2H Anda |

### Langkah 4: Daftarkan Callback di SMP Payment

Setelah deploy, URL Anda:
```
https://nama-project.vercel.app/api/callback-qris/KATA_RAHASIA_ANDA
```

Masukkan URL ini ke pengaturan H2H di SMP Payment:
- Login ke solusimediapulsa.com
- Menu: Akun Saya → Pengaturan H2H
- Isi **Report URL** dengan URL callback di atas
- Isi **IP Report** dengan: `103.129.149.208`
- Klik **Simpan**

### Langkah 5: Hubungkan Domain Anda

Di Vercel → Settings → **Domains**:
- Tambahkan domain Anda (misal: `qris.namaanda.com`)
- Ikuti instruksi DNS yang diberikan Vercel

---

## 🖥️ Akses Dashboard

Buka browser → `https://domain-anda.com/dashboard`

Masukkan secret key yang sama dengan `QRIS_CALLBACK_SECRET`.

---

## 📱 Test Transaksi

1. Scan QR Code QRIS (gambar yang sudah ada)
2. Bayar nominal berapa saja
3. Notifikasi masuk ke server otomatis
4. Lihat di dashboard dalam ~10 detik

---

## 📲 Notifikasi Telegram (Opsional)

Untuk dapat notif Telegram setiap ada pembayaran:

1. Chat `@BotFather` di Telegram → `/newbot`
2. Simpan token yang diberikan
3. Tambahkan Environment Variable:
   - `TELEGRAM_BOT_TOKEN` = token dari BotFather
   - `TELEGRAM_CHAT_ID` = ID chat Anda (dari @userinfobot)

---

## ⚠️ Catatan Penting

- Data transaksi saat ini tersimpan di **memory** (hilang saat server restart)
- Untuk production, gunakan database: **Vercel Postgres**, **Supabase**, atau **PlanetScale**
- Pastikan `QRIS_CALLBACK_SECRET` tidak mudah ditebak
- Whitelist IP `103.129.149.208` di firewall/Cloudflare Anda

---

## 🆘 Troubleshooting

**Callback tidak masuk?**
- Cek Report URL di SMP Payment sudah benar
- Pastikan secret key sama di URL dan env variable
- Cek Vercel Logs untuk error

**Dashboard tidak bisa login?**
- Pastikan `QRIS_CALLBACK_SECRET` sudah di-set di Vercel
- Gunakan secret yang sama saat login

© 2026 Market Phone NanoJS
