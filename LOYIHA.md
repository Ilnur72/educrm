# EduCRM — Loyiha hujjati

> **Maqsad:** O'quv markaz uchun to'liq CRM tizimi — lidlar, talabalar, davomat, to'lovlar, o'qituvchilar va hisobotlarni boshqarish.

**Texnologiyalar:** Next.js 14 (App Router) · Prisma ORM · PostgreSQL · NextAuth.js · Tailwind CSS · Telegram Bot API · Recharts

---

## Foydalanuvchi rollari

| Rol | Kirish huquqi |
|-----|---------------|
| **ADMIN** | Barcha sahifalar va funksiyalar |
| **RECEPTION** | Lidlar, talabalar, kurslar, davomat, to'lovlar, qarzdorlar |
| **OQITUVCHI** | Faqat o'z guruhlari va davomat, ish haqi tarixi |

---

## Modullar

### 1. Dashboard (Bosh sahifa)
**Sahifa:** `/dashboard`

Admin va resepshn uchun umumiy ko'rinish. O'qituvchi avtomatik o'z kabinetiga yo'naltiriladi.

**Ko'rsatkichlar:**
- Jami faol talabalar soni
- Oylik tushum (joriy oy to'lovlari yig'indisi)
- Faol kurslar soni
- Bu oy yangi lidlar soni

**Widgetlar:**
- **Bugungi sinov darslar** — o'sha kuni sinov darsi belgilangan lidlar ro'yxati (binafsha blok)
- **Xavfli talabalar** — chiqib ketish xavfi bor talabalar (qizil blok, to 5 ta ko'rsatadi)
- **Bugungi darslar** — jadval: vaqt, kurs, guruh, o'qituvchi, xona
- **Oxirgi lidlar** — eng yangi 5 ta lid va holati
- **Oxirgi to'lovlar** — eng yangi 5 ta to'lov

---

### 2. Lidlar (Sotish funeli)
**Sahifa:** `/dashboard/lidlar`

Potentsial o'quvchilarni boshqarish va ularni talabaga o'tkazish.

**Lid holatlari (funnel):**
```
YANGI → QONGIROQ_QILINDI → SINOV_DARSI → YOZILDI
                                        ↘ RAD_ETDI
```

**Funksiyalar:**
- Funnel statistikasi (har bir holatdagi lidlar soni)
- **Oy/yil filtri** — qaysi oyda nechta lid yozilgani
- Holat bo'yicha filtrlash (funnel tugmalariga bosib)
- Ism/telefon bo'yicha qidirish
- Yangi lid qo'shish (ism, telefon, kurs, manba, izoh)
- Holat o'zgartirish (dropdown orqali)
- **Sinov darsi sanasi** — SINOV_DARSI holatida sana picker (binafsha) paydo bo'ladi; bugungi sana avtomatik o'rnatiladi
- **Talabaga yozish** — lid talabaga o'tkazilganda:
  - Telefon tasdiqlanadi
  - **Guruh tavsiyasi** — lid qiziqgan kursga mos guruhlar avtomatik tavsiya qilinadi (ball tizimi asosida)
  - Guruh tanlash (ixtiyoriy)
  - Talaba yaratiladi, lid "YOZILDI" holatiga o'tadi

**Guruh tavsiyasi algoritmi:**
| Moslik | Ball |
|--------|------|
| Kurs nomi to'liq mos | +5 |
| Qisman mos | +4 |
| Bitta so'z mos | +2 |
| Guruh to'lgan (0 joy) | −3 |
| 1–2 joy qolgan | +1 |
| 3+ joy bor | +2 |

Top 4 guruh ko'rsatiladi. Kliklab tanlash mumkin.

**Manba turlari:** Instagram, Telegram, Google, Do'st tavsiyasi, Boshqa

---

### 3. Talabalar
**Sahifa:** `/dashboard/talabalar`

Barcha faol talabalarni boshqarish.

**Jadval ustunlari:** Ism/familiya · Telefon · Ota-ona tel. · Kurs/guruh · To'lov summasi · To'lov holati

**To'lov holati badge:**
- 🟢 To'langan — joriy oy to'liq to'langan
- 🟡 Qisman — qisman to'langan
- 🔴 Qarzdor — hech qanday to'lov yo'q

**Xavf belgilari** (avtomatik):
- 🔴 Xavfli — jiddiy e'tibor talab qiladi
- 🟡 Diqqat — kuzatib borish kerak

**Funksiyalar:**
- Ism/telefon bo'yicha qidirish
- Yangi talaba qo'shish (ism, familiya, telefon, ota-ona tel., email, manzil, izoh)
- Guruhga biriktirish/o'zgartirish
- Arxivlash (o'chirish o'rniga faolsizlashtirish)
- Talaba profiliga o'tish

---

### 4. Talaba profili
**Sahifa:** `/dashboard/talabalar/[id]`

Har bir talaba haqida to'liq ma'lumot.

**Profil kartasi:**
- Ism, familiya, telefon, ota-ona telefoni
- Email, tug'ilgan kun, manzil, izoh
- Ota-ona Telegram ulash linki (bot orqali)
- **Tahrirlash tugmasi** — barcha ma'lumotlarni o'zgartirish modali

**Davomat statistikasi (joriy oy):**
- Keldi / Kech keldi / Kelmadi / Sababli sonlar
- Davomat % (progress bar)

**Davomat trend grafigi (Recharts):**
- So'nggi 12 haftalik davomat foizi (AreaChart)
- 80% chegarasi (Reference line) — pastga tushsa ogohlantiradi
- Hover qilib har hafta tafsilotini ko'rish

**To'lovlar tarixi:**
- Har oylik to'lovlar ro'yxati (sana, summa, tur, kim qabul qildi)
- To'lov qo'shish modali (summa, oy, yil, tur, izoh)

**Davomat tarixi:**
- Barcha darslar ro'yxati (sana, mavzu, holat)

---

### 5. Kurslar va Guruhlar
**Sahifa:** `/dashboard/kurslar`

**Kurs ma'lumotlari:** Nom, tavsif, davomiyligi, narxi, max talabalar soni

**Guruh to'lganlik ogohlantirish:**
- 🟡 Sariq — guruh 80%+ to'lgan
- 🔴 Qizil — guruh to'lgan (100%)
- Kurs sarlavhasida ham umumiy to'lgan/yaqin guruhlar ko'rsatiladi

**Guruh sahifasi** (`/dashboard/guruhlar/[id]`):
- Guruh ma'lumotlari (kurs, o'qituvchi, xona, kunlar, vaqt)
- Guruh talabalari ro'yxati
- Davomat belgilash

**Xona vaqt konflikti tekshiruvi:**
Yangi guruh ochilganda yoki tahrirlanganda — xuddi shu xona, xuddi shu vaqt va ustma-ust kunlarda boshqa guruh bo'lsa, **409 xato** qaytaradi va qaysi guruh bilan to'qnashgani ko'rsatiladi.

---

### 6. Davomat
**Sahifa:** `/dashboard/davomat`

**Rol bo'yicha:**
- **Admin/Resepshn** — barcha faol guruhlar ko'rinadi
- **O'qituvchi** — faqat o'z guruhlari ko'rinadi

**Ishlash tartibi:**
1. Guruhni tanlash
2. Dars sanasini kiritish (yoki mavjud darsni tanlash)
3. Har bir talaba uchun holat belgilash: Keldi / Kech keldi / Kelmadi / Sababli

**Telegram xabarnoma:**
- Talaba Kelmadi → ota-onaga Telegram xabari avtomatik yuboriladi
- Talaba Kech keldi → ota-onaga xabar yuboriladi

---

### 7. To'lovlar
**Sahifa:** `/dashboard/tolovlar`

Barcha to'lovlar ro'yxati + oy/yil filtri.

**To'lov turlari:** Naqd, Karta, Click, Payme

**Funksiyalar:**
- Talaba bo'yicha qidirish
- Yangi to'lov qo'shish
- To'lov tarixi

---

### 8. Qarzdorlar jadvali
**Sahifa:** `/dashboard/qarzdorlar`

Joriy oy to'lovini to'lamagan talabalar ro'yxati.

**Statistika:**
- Jami qarzdorlar soni
- Ularning umumiy qarzi (so'm)
- Telegram bor/yo'q soni

**Funksiyalar:**
- Checkbox orqali birdan ko'p talaba tanlash
- **Telegram xabar yuborish** — tanlangan barcha qarzdorlarning ota-onalariga bir tugma bilan Telegram xabari
- Alohida 📨 tugma — bitta talabaga yuborish
- To'lov eslatma matni avtomatik formatlangan (ism, guruh nomi, qarz miqdori)

---

### 9. O'qituvchilar
**Sahifa:** `/dashboard/oqituvchilar`

**Ma'lumotlar:** Ism, email, telefon, mutaxassislik, ish haqi turi

**Ish haqi turlari:**
| Tur | Tushuntirish |
|-----|-------------|
| FOIZ | Guruh tushimining foizi |
| SOATLIK | Dars soati narxi × dars soatlari |
| OYLIK | Belgilangan oylik |

**Oy/yil filtri** — qaysi oy uchun hisob-kitob ko'rsatiladi

**Funksiyalar:**
- Ish haqi hisoblangan summani ko'rish
- To'lash (modal orqali summa tasdiqlanadi)
- Tahrirlash (telefon, mutaxassislik, ish haqi turi)
- Guruhlarini ko'rish modali

**Samaradorlik hisoboti** (`/dashboard/oqituvchilar/samaradorlik`):

| Ko'rsatkich | Hisoblash usuli |
|-------------|----------------|
| Davomat % | So'nggi 30 kungi davomat yozuvlari (keldi / jami) |
| To'lov foizi | Joriy oy to'liq to'lagan talabalar / jami talabalar |
| Samaradorlik balli | Davomat×0.6 + To'lov×0.4 |

- 🥇🥈🥉 reyting tartibi
- Qatorni bosib har bir guruh bo'yicha batafsil ko'rish

---

### 10. O'qituvchi shaxsiy kabineti
**Sahifa:** `/dashboard/oqituvchi`

Faqat OQITUVCHI roli uchun.

**Ko'rsatkichlar:**
- Mening guruhlarim soni
- Jami o'quvchilar (barcha guruhlari bo'yicha)
- Oxirgi oy ish haqi va holati

**Bugungi darslar** — o'sha kuni dars bor guruhlar (tugmachalar ko'rinishida)

**Tablar:**
- **Guruhlarim** — guruhlar jadvali, har birida "Batafsil" link
- **Ish haqi tarixi** — oxirgi 12 oy ish haqilari

---

### 11. Xavf tahlili (Churn Prediction)
**Sahifa:** Dashboard widget + `/dashboard/talabalar` belgisi

Har bir faol talaba uchun chiqib ketish xavfi avtomatik baholanadi.

**Baholash tizimi:**

| Mezon | Ball |
|-------|------|
| Davomat < 70% (so'nggi 4 hafta) | −2 |
| Joriy oy to'lovi yo'q | −2 |
| Davomat trenddagi pasayish > 20% | −1 |

**Daraja:**
- 🔴 **XAVFLI** — ball ≤ −3
- 🟡 **DIQQAT** — ball −1 yoki −2

**Ko'rish joylari:**
1. Dashboard — qizil blokda xavfli talabalar ro'yxati
2. Talabalar jadvalida — ism yonida rangli belgi
3. Kun oxiri Telegram — adminga va ota-onalarga xabar (cron)

---

### 12. Telegram Bot
**Bot:** `@Eeduaicrm_bot`

**Ota-onani ulash:**
1. Admin talaba profilidan "Telegram ulash" linkini nusxalaydi
2. Ota-ona botga `/start [talabaId]` buyrug'ini bosadi
3. Bot ota-onaning Telegram ID sini bazaga saqlaydi

**Bot buyruqlari:**
| Buyruq | Natija |
|--------|--------|
| `/start [talabaId]` | Ota-ona ulanadi, farzand ma'lumoti ko'rsatiladi |
| `/info` | Farzand haqida qisqacha ma'lumot |

**Avtomatik xabarlar:**
| Holat | Kim oladi | Qachon |
|-------|-----------|--------|
| Talaba kelmadi | Ota-ona | Davomat belgilananda |
| Talaba kech keldi | Ota-ona | Davomat belgilananda |
| To'lov eslatmasi | Barcha ota-onalar | Har oyning 1-sida (cron) |
| Xavfli talabalar xulosasi | Admin | Har kuni soat 20:00 (cron) |

---

### 13. Oylik PDF Hisobot
**Sahifa:** `/dashboard/hisobotlar`

**Oy/yil tanlash** — istalgan oy uchun hisobot ko'rish.

**Ko'rsatkichlar:**
- Jami tushum (so'm) + to'lovlar soni
- Yangi talabalar (+) va chiqib ketganlar (−)
- Lid → Talaba konversiya %
- Umumiy davomat % (o'sha oy)

**Jadvallar:**
- To'lov turlari (naqd/karta/click) — progress bar
- Lid manbasi tahlili — progress bar
- Top 5 to'lovchi
- Barcha guruhlar holati (to'lganlik %, oylik tushum)

**PDF chiqarish:** "PDF chiqarish" tugmasi → brauzer print dialog → "Save as PDF"

---

### 14. Xonalar
**Sahifa:** `/dashboard/xonalar`

O'quv xonalarini boshqarish.

**Ma'lumotlar:** Nom, sig'im (o'rindiq soni), izoh, faol/faol emas

**Vaqt konflikti tekshiruvi** — guruh xonaga biriktirilganda avtomatik tekshiriladi (→ Kurslar moduli)

---

### 15. Foydalanuvchilar
**Sahifa:** `/dashboard/foydalanuvchilar`

Tizim foydalanuvchilarini boshqarish (faqat ADMIN).

**Funksiyalar:**
- Yangi foydalanuvchi qo'shish (ism, email, parol, rol)
- Rol o'zgartirish
- O'chirish

---

## Avtomatik jarayonlar (Cron)

| Vazifa | Jadval | Nima qiladi |
|--------|--------|-------------|
| To'lov eslatmasi | Har oyning 1-si, soat 09:00 | Joriy oy to'lovini to'lamagan barcha talabalarning ota-onasiga Telegram xabari |
| Xavf tahlili | Har kuni soat 20:00 | Xavfli talabalarni hisoblaydi, adminga xulosa, XAVFLI talabalar ota-onasiga ogohlantirish |

---

## API endpointlar (qisqacha)

| Endpoint | Metod | Vazifasi |
|----------|-------|---------|
| `/api/lidlar` | GET, POST | Lidlar ro'yxati, yangi lid |
| `/api/lidlar/[id]` | PATCH, DELETE | Holat o'zgartirish, o'chirish |
| `/api/lidlar/[id]/yozish` | POST | Lidni talabaga o'tkazish |
| `/api/lidlar/[id]/guruh-tavsiya` | GET | Lidga mos guruhlar tavsiyasi |
| `/api/talabalar` | GET, POST | Talabalar, yangi talaba |
| `/api/talabalar/[id]` | GET, PATCH, DELETE | Profil, tahrirlash, arxivlash |
| `/api/talabalar/[id]/davomat-trend` | GET | 12 haftalik davomat grafigi |
| `/api/talabalar/[id]/guruh` | POST | Guruhga biriktirish |
| `/api/davomat` | GET, POST | Davomat belgilash |
| `/api/tolovlar` | GET, POST | To'lovlar |
| `/api/guruhlar` | GET, POST | Guruhlar, yangi guruh (konflikt tekshiruvi) |
| `/api/guruhlar/[id]` | GET, PATCH, DELETE | Guruh CRUD (konflikt tekshiruvi) |
| `/api/kurslar` | GET, POST | Kurslar |
| `/api/oqituvchilar` | GET, POST | O'qituvchilar |
| `/api/oqituvchilar/samaradorlik` | GET | Samaradorlik hisoboti |
| `/api/oqituvchi/guruhlar` | GET | O'qituvchining o'z guruhlari |
| `/api/oqituvchi/ish-haqi` | GET | O'qituvchining ish haqi tarixi |
| `/api/ish-haqi` | GET, POST | Ish haqi hisob-kitob |
| `/api/qarzdorlar` | GET | Qarzdorlar ro'yxati |
| `/api/qarzdorlar/xabar` | POST | Telegram bulk xabar |
| `/api/xavf-tahlil` | GET | Xavfli talabalar ro'yxati |
| `/api/hisobotlar/oylik` | GET | Oylik hisobot ma'lumotlari |
| `/api/xonalar` | GET, POST | Xonalar CRUD |
| `/api/telegram/webhook` | POST | Telegram bot webhook |
| `/api/cron/tolov-eslatma` | GET | To'lov eslatmasi cron |
| `/api/cron/xavf-tahlil` | GET | Xavf tahlili cron |

---

## Ma'lumotlar bazasi modellari

```
User          — tizim foydalanuvchilari (ADMIN, OQITUVCHI, RECEPTION)
Oqituvchi     — o'qituvchi profili (ish haqi turi, mutaxassislik)
Kurs          — kurs (nom, narxi, davomiyligi, max talaba soni)
Guruh         — guruh (kurs, o'qituvchi, xona, kunlar, vaqt)
Talaba        — talaba (ism, telefon, ota-ona, Telegram ID)
TalabaGuruh   — talaba-guruh bog'lanishi (ko'p-ko'p)
Lid           — potentsial o'quvchi (holat, manba, sinov sanasi)
Dars          — bitta dars (guruh, sana, mavzu)
Davomat       — bitta dars uchun talaba davomati
Tolov         — to'lov yozuvi (talaba, summa, oy/yil, tur)
IshHaq        — o'qituvchi ish haqi (oy/yil, summa, to'langanmi)
Xona          — o'quv xonasi (nom, sig'im)
Xabar         — SMS/Telegram xabar logi
```
