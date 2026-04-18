# EduCRM — Kelajak rejalari

## Bajarilgan ishlar ✅

### Asosiy funksiyalar
- [x] Lidlar + funnel (YANGI → YOZILDI)
- [x] Liddan talabaga o'tkazish (guruh tanlash bilan)
- [x] Talabalar CRUD + profil sahifasi + edit
- [x] Kurslar + guruhlar CRUD
- [x] Davomat belgilash
- [x] To'lovlar
- [x] O'qituvchilar + ish haqi
- [x] Xonalar CRUD
- [x] Xona vaqt konflikti tekshiruvi

### Qo'shimcha funksiyalar
- [x] Qarzdorlar jadvali (bir tugmada Telegram xabar)
- [x] Telegram bot (ota-ona ulash, davomat + to'lov xabarnomasi)
- [x] To'lov eslatmasi — har oyning 1-si cron (Vercel)
- [x] Sinov darsi treker — lid statusida sana, dashboard reminder
- [x] Davomat trend grafigi — talaba profilida 12 haftalik grafik (Recharts)
- [x] Guruh to'ldirish ogohlantirish — 80%+ sariq, to'lgan qizil
- [x] O'qituvchi shaxsiy kabineti — faqat o'z guruhlari, ish haqi tarixi
- [x] Talaba xavf tahlili (churn prediction) — dashboard widget + talabalar jadvalida belgi + Telegram ogohlantirish
- [x] Guruh tavsiyasi — lid kursiga mos guruhlar avtomatik taklif (ball tizimi)
- [x] O'qituvchi samaradorligi hisoboti — davomat %, to'lov foizi, reyting
- [x] Oylik PDF hisobot — tushum, davomat, lidlar, guruhlar; oy/yil filtri + print
- [x] Loyiha hujjati (LOYIHA.md) — proyekt menejeri uchun

---

## Qolgan ishlar

### 💬 Ota-ona portal — Telegram orqali (O'rta muhimlik)
- [x] Ota-ona `/jadval` buyrug'i → farzandining haftalik dars jadvali
- [x] Dars bekor qilinsa → barcha ota-onalarga avtomatik Telegram xabar
- [x] Ota-ona `To'lov qildim` tugmasi → admin tasdiqlaydi → bazaga tushadi

### 📅 Aqlli jadval (O'rta muhimlik)
- [ ] Dars jadvali kalendar ko'rinishida (haftalik/oylik view)
- [ ] O'qituvchi ta'til kunini belgilasa — o'sha kun dars avtomatik o'tkaziladi

### 🎯 Gamifikatsiya (Past muhimlik)
- [ ] Talabaga "30 kun uzluksiz keldi" badge
- [ ] Guruh ichida davomiylik reytingi (top 3 talaba)

### 💰 Onlayn to'lov (Keyinchalik)
- [ ] Click/Payme webhook — to'lov avtomatik bazaga tushadi
- [ ] To'lov tasdiqlanganda ota-onaga Telegram xabar

### 🚀 Deploy (Loyiha tayyor bo'lgach)
- [ ] Vercel ga chiqarish
- [ ] `.env` o'zgaruvchilarini Vercel dashboard da sozlash
- [ ] `TELEGRAM_ADMIN_CHAT_ID` ni to'ldirish
- [ ] Telegram webhook ni production URL ga o'rnatish
- [ ] `NEXTAUTH_URL` ni production URL ga yangilash
