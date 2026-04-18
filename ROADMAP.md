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

---

## Keyingi rejadagi ishlar

### 🤖 AI / Tahlil
- [ ] **Guruh tavsiyasi** — yangi lid qo'shilganda unga mos guruhni avtomatik taklif qilish
- [ ] **O'qituvchi samaradorligi hisoboti** — guruhidagi davomiylik, to'lov foizi, talabalar dinamikasi

### 📊 Hisobotlar
- [ ] **Oylik PDF hisobot** — admin uchun: tushum, davomat, yangi/chiqib ketgan talabalar
- [ ] **Kassa hisoboti** — kunlik/oylik to'lovlar, qaysi o'qituvchi qaysi guruh bo'yicha

### 💬 Ota-ona portal (Telegram orqali)
- [ ] Ota-ona `to'lov qildim` tugmasini bosadi → admin tasdiqlaydi
- [ ] Ota-ona farzandining dars jadvalini `/jadval` buyrug'i bilan ko'radi
- [ ] Telegram orqali dars bekor qilinsa — barcha ota-onalarga avtomatik xabar

### 🎯 Gamifikatsiya
- [ ] Talabaga "30 kun uzluksiz keldi" badge
- [ ] Guruh ichida davomiylik reytingi

### 📅 Aqlli jadval
- [ ] Dars jadvali kalendar ko'rinishida (haftalik/oylik view)
- [ ] O'qituvchi dam olish kunini belgilasa — dars avtomatik o'chiriladi

### 💰 Onlayn to'lov
- [ ] Click/Payme webhook — to'lov avtomatik bazaga tushadi
- [ ] To'lov tasdiqlanganda ota-onaga Telegram xabar

### 🚀 Deploy
- [ ] Vercel ga chiqarish
- [ ] `.env` o'zgaruvchilarini Vercel dashboard da sozlash
- [ ] `TELEGRAM_ADMIN_CHAT_ID` ni to'ldirish
- [ ] Telegram webhook ni production URL ga o'rnatish
- [ ] `NEXTAUTH_URL` ni production URL ga yangilash
