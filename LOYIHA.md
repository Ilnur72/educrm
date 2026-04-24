# EduCRM — Loyiha hisoboti

> **Sana:** 2026-04-24
> **Holat:** ✅ Production ga tayyor
> **Versiya:** V2.1

**Texnologiyalar:** Next.js 14 · Prisma ORM · PostgreSQL (Neon) · NextAuth.js · Tailwind CSS · Telegram Bot API · Recharts · SheetJS

---

## Demo kirish ma'lumotlari

> ⚠️ Quyidagi loginlar demo muhit uchun. Production da o'zgartirilsin.

### Tizim xodimlari (Dashboard)

| Rol | Email | Parol | Tavsif |
|-----|-------|-------|--------|
| **Direktor** | `direktor@educrm.uz` | `direktor123` | Barcha filiallarni ko'radi |
| **Admin (Chilonzor)** | `admin.ch@educrm.uz` | `admin123` | Chilonzor filiali to'liq boshqaruvi |
| **Admin (Yunusobod)** | `admin.yu@educrm.uz` | `admin123` | Yunusobod filiali to'liq boshqaruvi |
| **Resepshn** | `reception.ch@educrm.uz` | `reception123` | Lid, talaba, to'lov |
| **O'qituvchi** | `teacher1.ch@educrm.uz` | `oqituvchi123` | Davomat, o'z guruhlari |

**Kirish URL:** `/login`

### O'quvchi kabineti (Portal)

| Telefon (login) | Parol | Tavsif |
|----------------|-------|--------|
| `+998901100001` | `talaba123` | Chilonzor filiali talabasi |
| `+998902200001` | `talaba123` | Yunusobod filiali talabasi |

**Kirish URL:** `/portal/login`

---

## Demo ma'lumotlar (Seed)

| Ko'rsatkich | Miqdor |
|------------|--------|
| Filiallar | 2 (Chilonzor, Yunusobod) |
| Kurslar | 4 (IELTS, Python, Ingliz tili, Matematika) |
| Guruhlar | 8 (har filialda 4 ta) |
| Talabalar | 20 (har filialda 10 ta) |
| To'lovlar | ~60 ta (3 oy: Fevral–Aprel 2025) |
| Davomat yozuvlari | ~480 ta (Fevral–Mart 2025) |
| Lidlar | 11 ta (turli holatlarda) |
| Xarajatlar | ~30 ta (3 oy) |

**Demo seed ishga tushirish:** `npm run db:seed`

---

## Foydalanuvchi rollari

| Rol | Kirish huquqi |
|-----|---------------|
| **DIREKTOR** | Barcha filiallarni ko'rish, filial yaratish/boshqarish, umumiy hisobotlar |
| **ADMIN** | Faqat o'z filiali — barcha sahifalar va funksiyalar |
| **RECEPTION** | Lidlar, talabalar, kurslar, davomat, to'lovlar, qarzdorlar |
| **OQITUVCHI** | Faqat o'z guruhlari, davomat, ish haqi tarixi |
| **TALABA** | O'quvchi portali — davomat, to'lovlar, jadval, profil |

---

## Qurilgan modullar

### 1. Ko'p filial tizimi *(yangi)*

**Sahifalar:** `/dashboard/direktor` · `/dashboard/filiallar`

Bir nechta filiali bo'lgan o'quv markazlar uchun:
- **Direktor** — barcha filiallarni bitta oynada ko'radi
- Har filialning oylik statistikasi: talabalar, daromad, xarajat, foyda
- Yangi filial yaratish, tahrirlash, yopish
- Har bir xodim, talaba, guruh, lid o'z fililiga biriktiriladi
- Admin faqat o'z filiali ma'lumotlarini ko'radi

---

### 2. Dashboard (Bosh sahifa)

**Sahifa:** `/dashboard`

- Jami talabalar, oylik tushum, faol kurslar, yangi lidlar
- Bugungi sinov darslar (binafsha blok)
- Xavfli talabalar widget (churn prediction)
- Bugungi darslar jadvali
- Oylik daromad grafigi (BarChart, 12 oy)
- Talabalar o'sishi grafigi (AreaChart)

---

### 3. Lidlar (Sotish funeli)

**Sahifa:** `/dashboard/lidlar`

```
YANGI → QONGIROQ_QILINDI → SINOV_DARSI → YOZILDI
                                        ↘ RAD_ETDI
```

- Funnel statistika kartalari
- Oy/yil filtri
- Sinov darsi sanasi + guruh tanlash
- Talabaga o'tkazish (guruh tavsiyasi algoritmi bilan)
- Manba: Instagram, Telegram, Google, Do'st tavsiyasi, Boshqa

---

### 4. Talabalar

**Sahifa:** `/dashboard/talabalar`

- To'lov holati badge (To'langan / Qisman / Qarzdor)
- Xavf belgilari (🔴 Xavfli / 🟡 Diqqat)
- Guruhga biriktirish modali
- Arxivlash
- **Excel import** (xlsx fayl yuklash)
- **Excel export** (talabalar ro'yxati)

**Talaba profili** (`/dashboard/talabalar/[id]`):
- To'liq shaxsiy ma'lumot, tahrirlash
- Guruhlar jadvali
- Davomat statistikasi + trend grafigi (AreaChart)
- To'lovlar tarixi
- Davomat tarixi
- **O'quvchi kabineti**: login ko'rsatish, nusxa olish, parol yangilash
- Telegram bot ulash linki

---

### 5. Kurslar va Guruhlar

**Sahifalar:** `/dashboard/kurslar` · `/dashboard/guruhlar/[id]`

- Guruh to'lganlik ogohlantirish (🟡 80%+ · 🔴 100%)
- Xona vaqt konflikti tekshiruvi (409 xato + qaysi guruh bilan to'qnashgani)
- Guruhga talaba qo'shish/chiqarish
- Dars jadvali

---

### 6. Davomat

**Sahifa:** `/dashboard/davomat`

- Admin/Resepshn: barcha guruhlar · O'qituvchi: faqat o'z guruhlari
- Holat: Keldi / Kech keldi / Kelmadi / Sababli
- Ball kiritish (1–10)
- Mavjud darsni qayta ochib tahrirlash imkoniyati
- **Telegram avtoxabar:** Kelmadi/Kech keldi → ota-onaga zudlik bilan xabar

---

### 7. To'lovlar

**Sahifa:** `/dashboard/tolovlar`

- Oy/yil filtri
- **Guruh bo'yicha filter** *(yangi)*
- To'lov turlari: Naqd, Karta, Click, Payme
- **Qayta to'lov ogohlantirishi** *(yangi)* — bir oy uchun 2-to'lov qo'shilganda tasdiqlash so'raladi
- Excel export
- To'lov o'chirish

---

### 8. Qarzdorlar

**Sahifa:** `/dashboard/qarzdorlar`

- Joriy oy to'lovini to'lamagan talabalar
- Telegram bor/yo'q ko'rsatkich
- Tanlangan barcha qarzdorlarga bulk Telegram xabar
- Alohida xabar yuborish

---

### 9. O'qituvchilar va Ish haqi

**Sahifalar:** `/dashboard/oqituvchilar` · `/dashboard/oqituvchilar/ish-haqi` · `/dashboard/oqituvchilar/samaradorlik`

**Ish haqi turlari:**
| Tur | Hisoblash |
|-----|-----------|
| FOIZ | Guruh tushimidan % |
| SOATLIK | Dars soati × narxi |
| OYLIK | Belgilangan oylik |

**Samaradorlik hisoboti:**
- Davomat % (so'nggi 30 kun)
- To'lov foizi (guruh bo'yicha)
- Samaradorlik ball (davomat×0.6 + to'lov×0.4)
- 🥇🥈🥉 reyting

---

### 10. O'qituvchi shaxsiy kabineti

**Sahifa:** `/dashboard/oqituvchi`

- Guruhlar soni, jami o'quvchilar
- Ish haqi (so'nggi va joriy oy)
- Bugungi darslar
- Guruhlar jadvali
- Ish haqi tarixi (12 oy)

---

### 11. Moliya (Xarajatlar + Hisobot)

**Sahifalar:** `/dashboard/xarajatlar` · `/hisobotlar`

**Xarajat turlari:** Ijara, Kommunal, Reklama, Maosh, Jihozlar, Boshqa

**Hisobot sahifasida P&L:**
- Daromad (to'lovlar jami)
- Xarajat (xarajatlar jami)
- **Foyda = Daromad − Xarajat**
- Xarajat turlari bo'yicha taqsimot jadvali

---

### 12. Xavf tahlili (Churn Prediction)

**Har kuni 20:00 da avtomatik ishlaydi**

| Mezon | Ball |
|-------|------|
| Davomat < 70% (so'nggi 4 hafta) | −2 |
| Joriy oy to'lovi yo'q | −2 |
| Davomat trenddagi pasayish > 20% | −1 |

- 🔴 XAVFLI (ball ≤ −3) — adminga + ota-onaga Telegram xabar
- 🟡 DIQQAT (ball −1, −2) — dashboard da belgi

---

### 13. O'quvchi portali

**Sahifalar:** `/portal` · `/portal/davomat` · `/portal/jadval` · `/portal/tolovlar` · `/portal/profil`

- Talaba o'z telefon raqami va parol bilan kiradi
- **Parol ko'rsatish/yashirish tugmasi** (ko'z ikonka) *(yangi)*
- Davomat tarixi (oyma-oy)
- To'lovlar tarixi
- Dars jadvali
- Profil tahrirlash va parol o'zgartirish

**Admin tomonidan portal boshqarish:**
- Talaba profilidan login ko'rish + nusxa olish tugmasi *(yangi)*
- Parol yaratish yoki yangilash

---

### 14. Telegram Bot va Cron

**Bot:** `@Eeduaicrm_bot`

| Hodisa | Vaqt | Xabar |
|--------|------|-------|
| Davomat (kelmadi/kech) | Darhol | Ota-onaga xabar |
| To'lov eslatmasi | Har oyning 1-si, 09:00 | Qarzdor ota-onalarga |
| Xavf tahlili xulosasi | Har kuni 20:00 | Adminga xulosa + ota-onalarga |
| Sinov darsi eslatmasi | Har kuni 18:00 | Ertaga sinov darsi bor lidlar |
| Tug'ilgan kun tabrigi | Har kuni 08:00 | Talaba va ota-onaga tabrik |

---

### 15. Import / Export

- **Excel export:** Talabalar, to'lovlar, davomat hisoboti
- **Excel import:** Talabalar ro'yxati (xlsx fayl)
- **PDF hisobot:** Brauzer print orqali (`/hisobotlar`)

---

### 16. Xonalar va Foydalanuvchilar

- `/dashboard/xonalar` — xona CRUD, sig'im
- `/dashboard/foydalanuvchilar` — xodim CRUD, rol tayinlash, filialga biriktirish

---

## Avtomatik jarayonlar (Vercel Cron)

| Endpoint | Jadval |
|----------|--------|
| `/api/cron/tolov-eslatma` | Har oyning 1-si, 09:00 |
| `/api/cron/xavf-tahlil` | Har kuni 20:00 |
| `/api/cron/sinov-eslatma` | Har kuni 18:00 |
| `/api/cron/tugrilgan-kun` | Har kuni 08:00 |

---

## Ma'lumotlar bazasi modellari

```
Filial        — filial (nom, manzil, telefon)
User          — xodimlar (DIREKTOR, ADMIN, RECEPTION, OQITUVCHI)
Oqituvchi     — o'qituvchi profili
Kurs          — kurs (nom, narxi, davomiyligi)
Guruh         — guruh (kurs, o'qituvchi, xona, kunlar, vaqt, filial)
Talaba        — talaba (ism, telefon, login, parolHash, filial)
TalabaGuruh   — talaba↔guruh bog'lanishi
Lid           — potentsial o'quvchi (holat, manba, sinov, filial)
Dars          — bitta dars (guruh, sana, mavzu)
Davomat       — dars uchun talaba davomati (holat, baho)
Tolov         — to'lov (talaba, summa, oy/yil, tur)
IshHaq        — o'qituvchi ish haqi
Xarajat       — xarajat (tur, summa, sana, filial)
Xona          — o'quv xonasi (nom, sig'im, filial)
Xabar         — SMS/Telegram xabar logi
```

---

## Environment variables (`.env`)

```env
DATABASE_URL=           # Neon PostgreSQL connection string
NEXTAUTH_SECRET=        # openssl rand -base64 32
NEXTAUTH_URL=           # https://yourdomain.vercel.app
TELEGRAM_BOT_TOKEN=     # BotFather dan olingan token
TELEGRAM_CHAT_ID=       # Admin Telegram chat ID
CRON_SECRET=            # Cron himoyasi uchun maxfiy kalit
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=  # Bot username (@siz_bot)
```

---

## Deploy (Vercel)

```bash
# 1. GitHub ga push
git push origin main

# 2. Vercel dashboard da:
#    - GitHub repo ulash
#    - Environment variables kiritish
#    - Deploy bosish

# 3. DB migration
npx prisma db push

# 4. Demo ma'lumotlar
npm run db:seed
```

**Vercel cron:** `vercel.json` da sozlangan, Pro plan talab qilinadi.

---

## Git tarixi

| Commit | Tavsif |
|--------|--------|
| `e4f78c7` | Ko'p filial tizimi + demo seed |
| `fd1b047` | Backlog va V2 modullar (to'liq) |
| `032c109` | O'quvchi portal (V2) |
| `1a03970` | V2.0 rejalari |
| `6741baf` | Davomat, ish haqi, to'lovlar yaxshilanishi |
