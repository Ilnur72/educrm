import { PrismaClient, LidHolat, LidManba, DavomatHolat, TolovTur } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seed boshlandi...");

  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@educrm.uz" },
    update: {},
    create: {
      email: "admin@educrm.uz",
      name: "Admin",
      password: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
    },
  });

  // O'qituvchilar
  const kamola = await prisma.user.upsert({
    where: { email: "kamola@educrm.uz" },
    update: {},
    create: {
      email: "kamola@educrm.uz",
      name: "Kamola Mirzayeva",
      password: await bcrypt.hash("oqituvchi123", 10),
      role: "OQITUVCHI",
      oqituvchi: {
        create: {
          telefon: "+998901234567",
          mutaxassislik: ["IELTS", "Speaking", "Writing"],
          ishHaqiTuri: "FOIZ",
          foiz: 20,
        },
      },
    },
  });

  const sardor = await prisma.user.upsert({
    where: { email: "sardor@educrm.uz" },
    update: {},
    create: {
      email: "sardor@educrm.uz",
      name: "Sardor Toshmatov",
      password: await bcrypt.hash("oqituvchi123", 10),
      role: "OQITUVCHI",
      oqituvchi: {
        create: {
          telefon: "+998912345678",
          mutaxassislik: ["Python", "JavaScript", "IT"],
          ishHaqiTuri: "FOIZ",
          foiz: 25,
        },
      },
    },
  });

  // Kurslar
  const ielts = await prisma.kurs.upsert({
    where: { id: "kurs-ielts" },
    update: {},
    create: {
      id: "kurs-ielts",
      nom: "IELTS Intensive",
      tavsif: "IELTS imtihoniga 3 oylik intensiv tayyorgarlik",
      davomiyligi: 3,
      narxi: 850000,
      maxTalaba: 12,
    },
  });

  const python = await prisma.kurs.upsert({
    where: { id: "kurs-python" },
    update: {},
    create: {
      id: "kurs-python",
      nom: "Python dasturlash",
      tavsif: "Noldan Python dasturlash tili",
      davomiyligi: 4,
      narxi: 850000,
      maxTalaba: 10,
    },
  });

  const ingliz = await prisma.kurs.upsert({
    where: { id: "kurs-ingliz" },
    update: {},
    create: {
      id: "kurs-ingliz",
      nom: "Ingliz tili B1",
      tavsif: "B1 darajasiga qadar ingliz tili",
      davomiyligi: 6,
      narxi: 600000,
      maxTalaba: 14,
    },
  });

  // Guruhlar
  const kamolaPrisma = await prisma.oqituvchi.findUnique({ where: { userId: kamola.id } });
  const sardorPrisma = await prisma.oqituvchi.findUnique({ where: { userId: sardor.id } });

  const guruhG7 = await prisma.guruh.upsert({
    where: { id: "guruh-g7" },
    update: {},
    create: {
      id: "guruh-g7",
      nom: "IELTS G-7",
      kursId: ielts.id,
      oqituvchiId: kamolaPrisma!.id,
      xona: "A-1",
      kunlar: ["DU", "CH", "JU"],
      vaqt: "09:00",
      boshlanish: new Date("2025-02-01"),
    },
  });

  const guruhG3 = await prisma.guruh.upsert({
    where: { id: "guruh-g3" },
    update: {},
    create: {
      id: "guruh-g3",
      nom: "Python G-3",
      kursId: python.id,
      oqituvchiId: sardorPrisma!.id,
      xona: "Lab-1",
      kunlar: ["SE", "PA"],
      vaqt: "11:00",
      boshlanish: new Date("2025-01-15"),
    },
  });

  // Talabalar
  const talabalar = [
    { ism: "Aziza", familiya: "Rahimova", telefon: "+998901234567", otaTelefon: "+998901234500", guruhId: guruhG7.id },
    { ism: "Bobur", familiya: "Toshmatov", telefon: "+998912345678", otaTelefon: "+998912345600", guruhId: guruhG3.id },
    { ism: "Dilnoza", familiya: "Yusupova", telefon: "+998933456789", otaTelefon: "+998933456700", guruhId: guruhG7.id },
    { ism: "Jasur", familiya: "Karimov", telefon: "+998944567890", otaTelefon: "+998944567800", guruhId: guruhG7.id },
    { ism: "Malika", familiya: "Nazarova", telefon: "+998955678901", otaTelefon: "+998955678900", guruhId: guruhG3.id },
  ];

  for (const t of talabalar) {
    const { guruhId, ...data } = t;
    await prisma.talaba.upsert({
      where: { id: `talaba-${data.ism.toLowerCase()}` },
      update: {},
      create: {
        id: `talaba-${data.ism.toLowerCase()}`,
        ...data,
        guruhlar: { create: { guruhId } },
      },
    });
  }

  // Lidlar
  const lidlar = [
    { ism: "Shahlo Umarova", telefon: "+998901111111", kurs: "IELTS", manba: LidManba.INSTAGRAM, holat: LidHolat.YANGI },
    { ism: "Temur Hasanov", telefon: "+998902222222", kurs: "Python", manba: LidManba.TELEGRAM, holat: LidHolat.QONGIROQ_QILINDI },
    { ism: "Zulfiya Qodirova", telefon: "+998903333333", kurs: "Ingliz tili", manba: LidManba.DOST_TAVSIYASI, holat: LidHolat.SINOV_DARSI },
    { ism: "Akbar Rахimov", telefon: "+998904444444", kurs: "IELTS", manba: LidManba.GOOGLE, holat: LidHolat.YOZILDI },
    { ism: "Madina Sobirov", telefon: "+998905555555", kurs: "Python", manba: LidManba.INSTAGRAM, holat: LidHolat.RAD_ETDI },
  ];

  for (const l of lidlar) {
    await prisma.lid.create({ data: l });
  }

  // To'lovlar (aprel uchun)
  const talabaList = await prisma.talaba.findMany({ take: 5 });
  for (let i = 0; i < talabaList.length; i++) {
    const t = talabaList[i];
    if (i !== 3) { // Jasur qarzdor
      await prisma.tolov.create({
        data: {
          talabaId: t.id,
          summa: i === 2 ? 300000 : 850000,
          tur: TolovTur.NAQD,
          oy: 4,
          yil: 2025,
          qabulQildi: admin.name,
        },
      });
    }
  }

  console.log("Seed muvaffaqiyatli yakunlandi!");
  console.log("Admin login: admin@educrm.uz / admin123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
