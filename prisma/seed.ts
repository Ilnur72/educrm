import {
  PrismaClient,
  LidHolat, LidManba,
  DavomatHolat, TolovTur,
  IshHaqiTuri,
} from "@prisma/client";

type XarajatTur = "IJARA" | "KOMMUNAL" | "REKLAMA" | "MAOSH" | "JIHOZLAR" | "BOSHQA";
// ─── ──────────────────────────────────────────────────────────────────────
import bcrypt from "bcryptjs";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient() as any;

// ─── Yordamchi funksiyalar ─────────────────────────────────────────────────

function sana(yil: number, oy: number, kun: number) {
  return new Date(yil, oy - 1, kun);
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seed boshlandi...\n");

  // Avval mavjud demo datalarni tozalash
  await prisma.davomat.deleteMany({});
  await prisma.dars.deleteMany({});
  await prisma.tolov.deleteMany({});
  await prisma.ishHaq.deleteMany({});
  await prisma.xarajat.deleteMany({});
  await prisma.xabar.deleteMany({});
  await prisma.lid.deleteMany({});
  await prisma.talabaGuruh.deleteMany({});
  await prisma.talaba.deleteMany({});
  await prisma.guruh.deleteMany({});
  await prisma.oqituvchi.deleteMany({});
  await prisma.kurs.deleteMany({});
  await prisma.xona.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.filial.deleteMany({});
  console.log("🧹 Eski ma'lumotlar tozalandi\n");

  // ─── DIREKTOR ────────────────────────────────────────────────────────────

  await prisma.user.create({
    data: {
      email:    "direktor@educrm.uz",
      name:     "Alisher Nazarov",
      password: await bcrypt.hash("direktor123", 10),
      role:     "DIREKTOR",
    },
  });
  console.log("👑 Direktor yaratildi");

  // ─── FILIALLAR ───────────────────────────────────────────────────────────

  const chilonzor = await prisma.filial.create({
    data: {
      nom:     "Chilonzor filiali",
      manzil:  "Toshkent, Chilonzor tumani, 9-kvartal",
      telefon: "+998712345678",
    },
  });

  const yunusobod = await prisma.filial.create({
    data: {
      nom:     "Yunusobod filiali",
      manzil:  "Toshkent, Yunusobod tumani, 19-kvartal",
      telefon: "+998713456789",
    },
  });

  console.log("🏢 2 ta filial yaratildi");

  // ─── KURSLAR (umumiy) ─────────────────────────────────────────────────

  const kIelts = await prisma.kurs.create({
    data: {
      id: "kurs-ielts",
      nom: "IELTS Intensive",
      tavsif: "IELTS imtihoniga 3 oylik intensiv tayyorgarlik",
      davomiyligi: 3,
      narxi: 850000,
      maxTalaba: 12,
    },
  });

  const kPython = await prisma.kurs.create({
    data: {
      id: "kurs-python",
      nom: "Python dasturlash",
      tavsif: "Noldan Python dasturlash tili",
      davomiyligi: 4,
      narxi: 900000,
      maxTalaba: 10,
    },
  });

  const kIngliz = await prisma.kurs.create({
    data: {
      id: "kurs-ingliz",
      nom: "Ingliz tili (A1-B2)",
      tavsif: "Boshlang'ichdan B2 darajasiga",
      davomiyligi: 6,
      narxi: 650000,
      maxTalaba: 14,
    },
  });

  const kMatematika = await prisma.kurs.create({
    data: {
      id: "kurs-matematika",
      nom: "Matematika (DTM)",
      tavsif: "DTM va olimpiadaga tayyorlov",
      davomiyligi: 5,
      narxi: 700000,
      maxTalaba: 12,
    },
  });

  console.log("📚 4 ta kurs yaratildi");

  // ─── FILIAL YARATISH HELPER ───────────────────────────────────────────

  async function filialSeed(filial: { id: string; nom: string }, prefix: string) {
    const fId = filial.id;

    // --- Xodimlar ---
    const admin = await prisma.user.create({
      data: {
        email:    `admin.${prefix}@educrm.uz`,
        name:     prefix === "ch" ? "Sarvinoz Umarova" : "Behruz Qodirov",
        password: await bcrypt.hash("admin123", 10),
        role:     "ADMIN",
        filialId: fId,
      },
    });

    await prisma.user.create({
      data: {
        email:    `reception.${prefix}@educrm.uz`,
        name:     prefix === "ch" ? "Nilufar Xasanova" : "Diyora Tursunova",
        password: await bcrypt.hash("reception123", 10),
        role:     "RECEPTION",
        filialId: fId,
      },
    });

    // O'qituvchilar
    const oq1 = await prisma.user.create({
      data: {
        email:    `teacher1.${prefix}@educrm.uz`,
        name:     prefix === "ch" ? "Kamola Mirzayeva" : "Hulkar Rahimova",
        password: await bcrypt.hash("oqituvchi123", 10),
        role:     "OQITUVCHI",
        filialId: fId,
        oqituvchi: {
          create: {
            telefon:       prefix === "ch" ? "+998901000001" : "+998901000003",
            mutaxassislik: ["IELTS", "Ingliz tili"],
            ishHaqiTuri:   IshHaqiTuri.FOIZ,
            foiz:          20,
          },
        },
      },
    });

    const oq2 = await prisma.user.create({
      data: {
        email:    `teacher2.${prefix}@educrm.uz`,
        name:     prefix === "ch" ? "Sardor Toshmatov" : "Javlon Yusupov",
        password: await bcrypt.hash("oqituvchi123", 10),
        role:     "OQITUVCHI",
        filialId: fId,
        oqituvchi: {
          create: {
            telefon:       prefix === "ch" ? "+998901000002" : "+998901000004",
            mutaxassislik: prefix === "ch" ? ["Python", "JavaScript"] : ["Matematika", "Fizika"],
            ishHaqiTuri:   IshHaqiTuri.FOIZ,
            foiz:          25,
          },
        },
      },
    });

    const oq1prof = await prisma.oqituvchi.findUnique({ where: { userId: oq1.id } });
    const oq2prof = await prisma.oqituvchi.findUnique({ where: { userId: oq2.id } });

    // --- Xonalar ---
    await prisma.xona.createMany({
      data: [
        { nom: "A-1", sigim: 12, filialId: fId },
        { nom: "A-2", sigim: 14, filialId: fId },
        { nom: "Lab",  sigim: 10, filialId: fId },
      ],
    });

    // --- Guruhlar (4 ta) ---
    const g1 = await prisma.guruh.create({
      data: {
        id:          `guruh-${prefix}-ielts-1`,
        nom:         `IELTS ${prefix.toUpperCase()}-1`,
        kursId:      kIelts.id,
        oqituvchiId: oq1prof!.id,
        xona:        "A-1",
        kunlar:      ["DU", "CH", "JU"],
        vaqt:        "09:00",
        boshlanish:  sana(2025, 2, 1),
        filialId:    fId,
      },
    });

    const g2 = await prisma.guruh.create({
      data: {
        id:          `guruh-${prefix}-ielts-2`,
        nom:         `IELTS ${prefix.toUpperCase()}-2`,
        kursId:      kIelts.id,
        oqituvchiId: oq1prof!.id,
        xona:        "A-2",
        kunlar:      ["SE", "CH", "PA"],
        vaqt:        "14:00",
        boshlanish:  sana(2025, 2, 15),
        filialId:    fId,
      },
    });

    const g3 = await prisma.guruh.create({
      data: {
        id:          `guruh-${prefix}-tech`,
        nom:         prefix === "ch" ? `Python ${prefix.toUpperCase()}-1` : `Matematika ${prefix.toUpperCase()}-1`,
        kursId:      prefix === "ch" ? kPython.id : kMatematika.id,
        oqituvchiId: oq2prof!.id,
        xona:        "Lab",
        kunlar:      ["SE", "PA"],
        vaqt:        "11:00",
        boshlanish:  sana(2025, 1, 15),
        filialId:    fId,
      },
    });

    const g4 = await prisma.guruh.create({
      data: {
        id:          `guruh-${prefix}-ingliz`,
        nom:         `Ingliz tili ${prefix.toUpperCase()}-1`,
        kursId:      kIngliz.id,
        oqituvchiId: oq1prof!.id,
        xona:        "A-1",
        kunlar:      ["DU", "CH", "JU"],
        vaqt:        "16:00",
        boshlanish:  sana(2025, 3, 1),
        filialId:    fId,
      },
    });

    console.log(`  📁 ${filial.nom}: 4 ta guruh yaratildi`);

    // --- Talabalar ---
    const ismlar = prefix === "ch"
      ? [
          { ism: "Aziza",   familiya: "Rahimova",   t: "+998901100001", ot: "+998901100011" },
          { ism: "Bobur",   familiya: "Toshmatov",  t: "+998901100002", ot: "+998901100012" },
          { ism: "Dilnoza", familiya: "Yusupova",   t: "+998901100003", ot: "+998901100013" },
          { ism: "Jasur",   familiya: "Karimov",    t: "+998901100004", ot: "+998901100014" },
          { ism: "Malika",  familiya: "Nazarova",   t: "+998901100005", ot: "+998901100015" },
          { ism: "Sherzod", familiya: "Mirzayev",   t: "+998901100006", ot: "+998901100016" },
          { ism: "Feruza",  familiya: "Qodirov",    t: "+998901100007", ot: "+998901100017" },
          { ism: "Ulugbek", familiya: "Abdullayev", t: "+998901100008", ot: "+998901100018" },
          { ism: "Kamola",  familiya: "Ergasheva",  t: "+998901100009", ot: "+998901100019" },
          { ism: "Sanjar",  familiya: "Xolmatov",   t: "+998901100010", ot: "+998901100020" },
        ]
      : [
          { ism: "Zulfiya",   familiya: "Sobirov",    t: "+998902200001", ot: "+998902200011" },
          { ism: "Temur",     familiya: "Hasanov",    t: "+998902200002", ot: "+998902200012" },
          { ism: "Shahlo",    familiya: "Umarova",    t: "+998902200003", ot: "+998902200013" },
          { ism: "Akbar",     familiya: "Rахimov",    t: "+998902200004", ot: "+998902200014" },
          { ism: "Madina",    familiya: "Jurayeva",   t: "+998902200005", ot: "+998902200015" },
          { ism: "Otabek",    familiya: "Normatov",   t: "+998902200006", ot: "+998902200016" },
          { ism: "Nafisa",    familiya: "Tursunov",   t: "+998902200007", ot: "+998902200017" },
          { ism: "Humoyun",   familiya: "Baxtiyorov", t: "+998902200008", ot: "+998902200018" },
          { ism: "Iroda",     familiya: "Xoliqov",    t: "+998902200009", ot: "+998902200019" },
          { ism: "Mansur",    familiya: "Qosimov",    t: "+998902200010", ot: "+998902200020" },
        ];

    // Talabalarni guruhlarga taqsimlash
    const guruhTaqsim = [g1, g1, g1, g2, g2, g2, g3, g3, g4, g4];

    const talabaIds: string[] = [];
    for (let i = 0; i < ismlar.length; i++) {
      const m = ismlar[i];
      const kun = sana(1990 + randomInt(0, 10), randomInt(1, 12), randomInt(1, 28));
      const talaba = await prisma.talaba.create({
        data: {
          id:          `talaba-${prefix}-${i + 1}`,
          ism:         m.ism,
          familiya:    m.familiya,
          telefon:     m.t,
          otaTelefon:  m.ot,
          tugilganKun: kun,
          manzil:      `Toshkent, ${filial.nom.split(" ")[0]} tumani`,
          filialId:    fId,
          login:       m.t,
          parolHash:   await bcrypt.hash("talaba123", 10),
          guruhlar: {
            create: { guruhId: guruhTaqsim[i].id },
          },
        },
      });
      talabaIds.push(talaba.id);
    }

    console.log(`  👨‍🎓 ${filial.nom}: 10 ta talaba yaratildi`);

    // --- To'lovlar (3 oy: fevral, mart, aprel 2025) ---
    const KURS_NARX: Record<string, number> = {
      [g1.id]: kIelts.narxi,
      [g2.id]: kIelts.narxi,
      [g3.id]: prefix === "ch" ? kPython.narxi : kMatematika.narxi,
      [g4.id]: kIngliz.narxi,
    };

    const guruhOfTalaba = [g1, g1, g1, g2, g2, g2, g3, g3, g4, g4];

    for (const [oy, yil] of [[2, 2025], [3, 2025], [4, 2025]]) {
      for (let i = 0; i < talabaIds.length; i++) {
        const narx = KURS_NARX[guruhOfTalaba[i].id];
        // 8 ta to'liq, 1 ta qisman, 1 ta qarzdor (aprel uchun)
        if (i === 9 && oy === 4) continue;          // Qarzdor — to'lamagan
        const summa = (i === 8 && oy === 4) ? Math.floor(narx * 0.5) : narx;
        await prisma.tolov.create({
          data: {
            talabaId:    talabaIds[i],
            summa,
            tur:         pick([TolovTur.NAQD, TolovTur.KARTA, TolovTur.CLICK]),
            oy,
            yil,
            qabulQildi:  admin.name,
          },
        });
      }
    }

    console.log(`  💰 ${filial.nom}: 3 oylik to'lovlar kiritildi`);

    // --- Davomat (fevral + mart 2025) ---
    // Har guruh uchun haftada 3 marta dars, 2 oyda ~24 dars
    const guruhlar = [g1, g2, g3, g4];

    for (const guruh of guruhlar) {
      // Kunlar: haftada 3 marta uchun darslarni simulatsiya qilish
      const darsKunlari: Date[] = [];
      for (let hafta = 0; hafta < 8; hafta++) {
        for (let kun = 0; kun < 3; kun++) {
          const d = new Date(2025, 1, 3 + hafta * 7 + kun * 2); // Fevral 3 dan
          if (d.getMonth() <= 2) darsKunlari.push(d);           // Fevral va mart
        }
      }

      // Shu guruhga biriktirilgan talabalarni topish
      const guruhTalabalar = await prisma.talabaGuruh.findMany({
        where: { guruhId: guruh.id, faol: true },
        select: { talabaId: true },
      });
      const guruhTalabaIds = guruhTalabalar.map((tg: { talabaId: string }) => tg.talabaId);

      for (const darsKun of darsKunlari) {
        const dars = await prisma.dars.create({
          data: {
            guruhId: guruh.id,
            sana:    darsKun,
            mavzu:   pick([
              "Yangi mavzu", "Takrorlash", "Test", "Amaliy mashg'ulot",
              "Leksika", "Grammatika", "Tinglash", "Gapirish",
            ]),
          },
        });

        for (const tId of guruhTalabaIds) {
          // 85% keldi, 10% kelmadi, 5% kech keldi
          const rnd = Math.random();
          const holat: DavomatHolat =
            rnd < 0.80 ? "KELDI" :
            rnd < 0.92 ? "KELMADI" :
            rnd < 0.97 ? "KECH_KELDI" : "SABABLI";

          await prisma.davomat.create({
            data: {
              talabaId: tId,
              guruhId:  guruh.id,
              darsId:   dars.id,
              holat,
              baho:     holat === "KELDI" ? randomInt(6, 10) : null,
            },
          });
        }
      }
    }

    console.log(`  📋 ${filial.nom}: davomat ma'lumotlari kiritildi`);

    // --- Xarajatlar (3 oy) ---
    const xarajatTurlar: [XarajatTur, number, number][] = [
      ["IJARA",    3500000, 4000000],
      ["KOMMUNAL",  200000,  350000],
      ["REKLAMA",   300000,  700000],
      ["JIHOZLAR",      0,  500000],
      ["BOSHQA",    50000,  200000],
    ];

    for (const [oy, yil] of [[2, 2025], [3, 2025], [4, 2025]]) {
      for (const [tur, min, max] of xarajatTurlar) {
        if (tur === "JIHOZLAR" && Math.random() < 0.5) continue;
        await prisma.xarajat.create({
          data: {
            tur,
            summa:    randomInt(min, max),
            sana:     sana(yil, oy, randomInt(1, 28)),
            filialId: fId,
            izoh:     null,
          },
        });
      }
    }

    console.log(`  📊 ${filial.nom}: xarajatlar kiritildi`);

    // --- Lidlar ---
    const lidManbalar: LidManba[] = [
      LidManba.INSTAGRAM, LidManba.TELEGRAM,
      LidManba.GOOGLE, LidManba.DOST_TAVSIYASI, LidManba.BOSHQA,
    ];
    const kursNomlar = ["IELTS", "Python", "Ingliz tili", "Matematika"];

    const lidData = prefix === "ch"
      ? [
          { ism: "Hamid Toshev",       telefon: "+998903001001", holat: LidHolat.YANGI            },
          { ism: "Lobar Karimova",      telefon: "+998903001002", holat: LidHolat.QONGIROQ_QILINDI },
          { ism: "Nodir Xolmatov",      telefon: "+998903001003", holat: LidHolat.SINOV_DARSI,
            sinovSanasi: sana(2025, 4, 26) },
          { ism: "Gulnora Sobirov",     telefon: "+998903001004", holat: LidHolat.YOZILDI          },
          { ism: "Bahrom Ergashev",     telefon: "+998903001005", holat: LidHolat.RAD_ETDI          },
          { ism: "Dilorom Baxtiyorova", telefon: "+998903001006", holat: LidHolat.YANGI             },
        ]
      : [
          { ism: "Sarvar Jurayev",    telefon: "+998904001001", holat: LidHolat.YANGI            },
          { ism: "Mohira Yunusova",   telefon: "+998904001002", holat: LidHolat.QONGIROQ_QILINDI },
          { ism: "Eldor Normatov",    telefon: "+998904001003", holat: LidHolat.SINOV_DARSI,
            sinovSanasi: sana(2025, 4, 27) },
          { ism: "Shahnoza Qosimova", telefon: "+998904001004", holat: LidHolat.YOZILDI          },
          { ism: "Muzaffar Rашidov",  telefon: "+998904001005", holat: LidHolat.RAD_ETDI          },
        ];

    for (const l of lidData) {
      await prisma.lid.create({
        data: {
          ...l,
          kurs:     pick(kursNomlar),
          manba:    pick(lidManbalar),
          filialId: fId,
        },
      });
    }

    console.log(`  🎯 ${filial.nom}: lidlar kiritildi\n`);
  }

  // ─── FILIALLARNI SEED QILISH ─────────────────────────────────────────────

  await filialSeed(chilonzor, "ch");
  await filialSeed(yunusobod, "yu");

  // ─── XULOSA ──────────────────────────────────────────────────────────────

  console.log("━".repeat(50));
  console.log("✅ Seed muvaffaqiyatli yakunlandi!\n");
  console.log("🔑 Login ma'lumotlari:");
  console.log("  Direktor:   direktor@educrm.uz   / direktor123");
  console.log("  Admin (Ch): admin.ch@educrm.uz   / admin123");
  console.log("  Admin (Yu): admin.yu@educrm.uz   / admin123");
  console.log("  Reception:  reception.ch@educrm.uz / reception123");
  console.log("  O'qituvchi: teacher1.ch@educrm.uz / oqituvchi123");
  console.log("  Talaba:     +998901100001         / talaba123");
  console.log("━".repeat(50));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
