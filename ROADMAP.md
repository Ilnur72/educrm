# EduCRM — Keyingi bosqich rejalari

> MVP 2026-04-22 da yakunlandi. Quyidagilar v2.0 uchun.

---

## ✅ MVP — Tayyor (v1.0)

| Modul | URL |
|-------|-----|
| Dashboard | `/dashboard` |
| Lidlar + sinov darsi bron | `/dashboard/lidlar` |
| Talabalar + detail | `/dashboard/talabalar` |
| Kurslar + guruhlar CRUD | `/dashboard/kurslar` |
| Guruhlar ro'yxati | `/dashboard/guruhlar` |
| Davomat belgilash + ball | `/dashboard/davomat` |
| To'lovlar + qabulQildi | `/dashboard/tolovlar` |
| Dars jadvali | `/dashboard/jadval` |
| Qarzdorlar | `/dashboard/qarzdorlar` |
| Xabarlar (Telegram) | `/dashboard/xabarlar` |
| O'qituvchilar + samaradorlik | `/dashboard/oqituvchilar` |
| Ish haqi hisoblash | `/dashboard/oqituvchilar/ish-haqi` |
| Oylik hisobot | `/hisobotlar` |
| Davomat hisoboti | `/davomat-hisoboti` |
| Xonalar | `/dashboard/xonalar` |
| Foydalanuvchilar | `/dashboard/foydalanuvchilar` |
| O'qituvchi kabineti | `/dashboard/oqituvchi` |
| Telegram bot (ota-ona portal) | `/jadval`, `/tolov` |
| Deploy: Vercel + Neon.tech | — |

---

## 🔜 V2.0 — Keyingi bosqich

### 1. Moliya moduli (Xarajatlar)
**Muhimlik: Yuqori**

Hozir faqat kirim (to'lovlar) hisoblanadi. Chiqim yo'q.

- [ ] `Xarajat` modeli: `tur` (ijara/kommunal/reklama/boshqa), `summa`, `sana`, `izoh`
- [ ] `/dashboard/xarajatlar` sahifasi — CRUD
- [ ] `/hisobotlar` ga oylik P&L: `Daromad − Xarajat = Foyda`
- [ ] Xarajat turlar diagrammasi (pie chart)

---

### 2. Dashboard grafiklari
**Muhimlik: Yuqori**

Hozir faqat raqamlar, grafik yo'q. `recharts` bilan:

- [ ] Oylik daromad — line/bar chart (12 oy)
- [ ] Talabalar soni o'sishi — area chart
- [ ] Lid konversiya funnel — stacked bar
- [ ] Davomat dinamikasi — guruh bo'yicha

---

### 3. Avtomatik Telegram xabarlar (Cron)
**Muhimlik: O'rta**

- [ ] **Sinov darsi eslatmasi** — sinov kuni −1 da ota-onaga xabar
- [ ] **To'lov eslatmasi** — har oyning 25-unda qarzdorlarga Telegram
- [ ] **Tug'ilgan kun tabriki** — `tugilganKun` maydoni bo'yicha
- [ ] Vercel Cron yoki Upstash QStash

---

### 4. O'quvchi / Ota-ona veb portal
**Muhimlik: O'rta**

Hozir Telegram bot bor. Veb portal qo'shimcha:

- [ ] `/portal` route — telefon bilan login (OTP)
- [ ] O'z davomati (oylik grid, ballar)
- [ ] To'lov holati va tarixi
- [ ] Dars jadvali

---

### 5. Import / Export
**Muhimlik: Past**

- [ ] Excel import — talabalar ro'yxatini yuklash
- [ ] Excel export — davomat hisoboti, to'lovlar
- [ ] `xlsx` kutubxonasi

---

### 6. Bildirishnomalar markazi
**Muhimlik: Past**

- [ ] In-app notification — yangi lid, to'lov o'tdi
- [ ] Bell icon + dropdown sidebar da

---

### 7. Ko'p filial (Multi-branch)
**Muhimlik: Kelajak**

- [ ] `Filial` modeli
- [ ] Har bir user bitta filialga bog'liq
- [ ] Superadmin — barcha filiallarni ko'radi

---

## 🐛 Kichik tuzatishlar

- [ ] Guruh detail da talabani guruhdan chiqarish
- [ ] To'lovni o'chirish imkoni (noto'g'ri kiritilgan)
- [ ] Lid jadvalida `sinovGuruhId` dan guruh nomini ko'rsatish
- [ ] Mobile responsive (hozir desktop uchun)

---

## 📦 Texnik qarz

- [ ] React Query / SWR — caching
- [ ] Error boundary
- [ ] Prisma migrations (`db push` o'rniga)
- [ ] Unit testlar
