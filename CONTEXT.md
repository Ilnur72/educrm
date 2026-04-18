# EduCRM — Loyiha konteksti (Claude Code uchun)

## Loyiha haqida
O'quv markaz uchun professional CRM tizimi.
Stack: Next.js 14 (App Router) + Prisma + PostgreSQL + NextAuth.js + Tailwind CSS

## Hozir tayyor bo'lgan narsalar

### Ma'lumotlar bazasi (prisma/schema.prisma)
Barcha jadvallar yozilgan:
- `User` — foydalanuvchilar (3 rol: ADMIN, OQITUVCHI, RECEPTION)
- `Lid` — yangi murojaatlar, sotish funeli
- `Kurs` + `Guruh` — kurslar va guruhlar
- `Oqituvchi` — o'qituvchi profili, ish haqi turi
- `Talaba` + `TalabaGuruh` — talabalar va guruhga biriktirish
- `Dars` + `Davomat` — kunlik davomat
- `Tolov` — oylik to'lovlar
- `IshHaq` — o'qituvchi ish haqi
- `Xabar` — SMS log

### Auth tizimi
- `src/lib/auth.ts` — NextAuth config, JWT ichida role va id
- `src/middleware.ts` — barcha /dashboard/* himoyalangan
- Rol asosida yo'naltirish:
  - OQITUVCHI → faqat /dashboard/davomat
  - RECEPTION → lidlar, talabalar, tolovlar, kurslar
  - ADMIN → hamma joyga + oqituvchilar + hisobotlar + foydalanuvchilar

### API Routelar (src/app/api/)
- `/api/auth/[...nextauth]` — NextAuth handler
- `/api/dashboard` — parallel statistika so'rovlar
- `/api/lidlar` + `/api/lidlar/[id]` — CRUD, filter, qidiruv
- `/api/talabalar` + `/api/talabalar/[id]` — CRUD, guruh bilan
- `/api/kurslar` — ro'yxat + yaratish
- `/api/guruhlar` — ro'yxat + yaratish
- `/api/davomat` — dars yaratish + davomatlar + avtomatik SMS log
- `/api/tolovlar` — oylik to'lovlar
- `/api/foydalanuvchilar` + `/api/foydalanuvchilar/[id]` — faqat ADMIN
- `/api/oqituvchilar` + `/api/oqituvchilar/[id]` — yozilgan, sahifa yozilmagan

### UI Komponentlar (src/components/)
- `ui/`: Button, Badge, Card, Table, Input, Select, Modal, StatCard
- `layout/`: Sidebar (rol asosida nav filtri, logout), Topbar
- `providers/SessionProvider.tsx`

### Sahifalar (src/app/dashboard/)
- `page.tsx` — Dashboard: server component, statistika, bugungi darslar
- `lidlar/page.tsx` — Funnel kartalar, jadval, holat o'zgartirish, modal
- `talabalar/page.tsx` — Jadval, avatar, to'lov holati, yangi talaba modal
- `kurslar/page.tsx` — Server component, guruhlar bilan
- `davomat/page.tsx` — Guruh tanlash, K/X/KK/S tugmalar, live statistika
- `tolovlar/page.tsx` — Oy filtri, talaba qidiruv, to'lov modal
- `hisobotlar/page.tsx` — Server component, konversiya, manba grafik, kurslar reytingi
- `foydalanuvchilar/page.tsx` — ADMIN only, foydalanuvchi CRUD, rol badge
- `login/page.tsx` — Login sahifasi, test login tugmalari

### Yordamchi fayllar
- `src/lib/utils.ts` — formatSum, formatSana, oyNomi
- `src/lib/hooks.ts` — useCurrentUser(), useHasRole()
- `src/types/index.ts` — barcha Prisma typelar re-export
- `src/app/globals.css` — Tailwind + scrollbar

## Qolgan vazifalar (shu tartibda qil)

### 1. O'qituvchilar sahifasi
- `src/app/dashboard/oqituvchilar/page.tsx`
- Jadval: ism, mutaxassislik, guruhlar, dars soati, ish haqi, holat
- Ish haqi hisob-kitobi: foiz (guruh daromadidan) yoki soatlik
- Ish haqi to'lash modal
- `src/app/api/ish-haqi/route.ts` — oylik ish haqi hisoblash endpoint

### 2. SMS tizimi (Eskiz.uz)
- `src/lib/sms.ts` — Eskiz.uz API wrapper
- Avtomatik SMS: davomat → ota-onaga, qarzdorlar → oyda bir eslatma
- `src/app/api/sms/route.ts` — manual SMS yuborish
- `src/app/dashboard/xabarlar/page.tsx` — SMS tarixi va yuborish

### 3. Talaba profil sahifasi
- `src/app/dashboard/talabalar/[id]/page.tsx`
- To'liq profil: shaxsiy ma'lumot, guruhlar, to'lovlar tarixi, davomat grafigi

### 4. Deploy
- `vercel.json` — Vercel config
- `.github/workflows/deploy.yml` — GitHub Actions CI/CD
- Supabase PostgreSQL ulash yo'riqnomasi
- README.md yangilash (deploy bo'limi)

## Muhim qarorlar
- Barcha server componentlar Prisma ni to'g'ridan-to'g'ri chaqiradi (API orqali emas)
- Client componentlar fetch() bilan API routelarni chaqiradi
- brand-600 = #534AB7 (asosiy rang)
- Tailwind config da brand: { 50, 100, 400, 600, 800, 900 } ranglari bor
- O'zbek tilida: label, placeholder, xabarlar hammasi o'zbekcha

## Ishga tushirish
```bash
npm install
cp .env.example .env   # to'ldiring
npm run db:push
npm run db:seed        # test ma'lumotlar
npm run dev            # http://localhost:3000
```
Login: admin@educrm.uz / admin123
