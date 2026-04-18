# EduCRM — O'quv markaz boshqaruv tizimi

Next.js 14 + Prisma + PostgreSQL asosida qurilgan professional CRM.

## Modullar

| Modul | Tavsif |
|-------|--------|
| Lidlar | Yangi murojaatlar, sotish funeli |
| Talabalar | Ro'yxat, profil, tarix |
| Kurslar | Kurs va guruh boshqaruvi |
| Davomat | Kunlik davomat, foiz hisob |
| To'lovlar | Oylik to'lovlar, qarzdorlar |
| O'qituvchilar | Ish haqi, dars soatlari |
| Xabarlar | SMS, Telegram bildirishnomalar |
| Hisobotlar | Statistika, grafik tahlil |

## O'rnatish

```bash
# 1. Loyihani clone qiling
git clone <repo-url>
cd educrm

# 2. Paketlarni o'rnating
npm install

# 3. .env faylini sozlang
cp .env.example .env
# .env faylini tahrirlang

# 4. Ma'lumotlar bazasini yarating
npm run db:push

# 5. Test ma'lumotlarini yuklang
npm run db:seed

# 6. Serverni ishga tushiring
npm run dev
```

## Login (seed dan keyin)

- **Admin:** admin@educrm.uz / admin123
- **O'qituvchi:** kamola@educrm.uz / oqituvchi123

## Texnologiyalar

- **Framework:** Next.js 14 (App Router)
- **ORM:** Prisma
- **DB:** PostgreSQL
- **Auth:** NextAuth.js v5
- **UI:** Tailwind CSS
- **Grafiklar:** Recharts
- **Forma:** React Hook Form + Zod
- **SMS:** Eskiz.uz API

## API Routelar

```
GET/POST   /api/lidlar
PATCH/DEL  /api/lidlar/[id]

GET/POST   /api/talabalar
GET/PATCH  /api/talabalar/[id]

GET/POST   /api/kurslar
GET/POST   /api/guruhlar

GET/POST   /api/davomat

GET/POST   /api/tolovlar

GET        /api/dashboard
```

## Papka strukturasi

```
src/
├── app/
│   ├── api/          ← Backend API routes
│   ├── dashboard/    ← Asosiy panel
│   ├── lidlar/       ← Lidlar moduli
│   ├── talabalar/    ← Talabalar moduli
│   ├── kurslar/      ← Kurslar moduli
│   ├── davomat/      ← Davomat moduli
│   ├── tolovlar/     ← To'lovlar moduli
│   ├── oqituvchilar/ ← O'qituvchilar moduli
│   └── hisobotlar/   ← Hisobotlar moduli
├── components/
│   ├── ui/           ← Button, Badge, Table, Card...
│   ├── layout/       ← Sidebar, Topbar
│   └── modules/      ← Har modul uchun komponentlar
├── lib/
│   ├── db/           ← Prisma client
│   └── utils.ts      ← Yordamchi funksiyalar
└── types/            ← TypeScript tiplar
```
# educrm
