-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'OQITUVCHI', 'RECEPTION');

-- CreateEnum
CREATE TYPE "LidManba" AS ENUM ('INSTAGRAM', 'TELEGRAM', 'GOOGLE', 'DOST_TAVSIYASI', 'BOSHQA');

-- CreateEnum
CREATE TYPE "LidHolat" AS ENUM ('YANGI', 'QONGIROQ_QILINDI', 'SINOV_DARSI', 'YOZILDI', 'RAD_ETDI');

-- CreateEnum
CREATE TYPE "IshHaqiTuri" AS ENUM ('FOIZ', 'SOATLIK', 'OYLIK');

-- CreateEnum
CREATE TYPE "DavomatHolat" AS ENUM ('KELDI', 'KELMADI', 'KECH_KELDI', 'SABABLI');

-- CreateEnum
CREATE TYPE "TolovTur" AS ENUM ('NAQD', 'KARTA', 'CLICK', 'PAYME');

-- CreateEnum
CREATE TYPE "XabarHolat" AS ENUM ('KUTILMOQDA', 'YUBORILDI', 'XATO');

-- CreateEnum
CREATE TYPE "XabarTur" AS ENUM ('DAVOMAT', 'TOLOV', 'ESLATMA', 'MARKETING', 'MANUAL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'RECEPTION',
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lidlar" (
    "id" TEXT NOT NULL,
    "ism" TEXT NOT NULL,
    "telefon" TEXT NOT NULL,
    "qoshimcha" TEXT,
    "kurs" TEXT NOT NULL,
    "manba" "LidManba" NOT NULL DEFAULT 'BOSHQA',
    "holat" "LidHolat" NOT NULL DEFAULT 'YANGI',
    "izoh" TEXT,
    "keyingiQongiroq" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lidlar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kurslar" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "tavsif" TEXT,
    "davomiyligi" INTEGER NOT NULL,
    "narxi" INTEGER NOT NULL,
    "maxTalaba" INTEGER NOT NULL DEFAULT 12,
    "faol" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kurslar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guruhlar" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "kursId" TEXT NOT NULL,
    "oqituvchiId" TEXT,
    "xona" TEXT,
    "kunlar" TEXT[],
    "vaqt" TEXT NOT NULL,
    "boshlanish" TIMESTAMP(3) NOT NULL,
    "tugash" TIMESTAMP(3),
    "faol" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guruhlar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oqituvchilar" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "telefon" TEXT,
    "mutaxassislik" TEXT[],
    "ishHaqiTuri" "IshHaqiTuri" NOT NULL DEFAULT 'FOIZ',
    "foiz" DOUBLE PRECISION,
    "soatlik" INTEGER,
    "faol" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oqituvchilar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "talabalar" (
    "id" TEXT NOT NULL,
    "ism" TEXT NOT NULL,
    "familiya" TEXT NOT NULL,
    "telefon" TEXT NOT NULL,
    "otaTelefon" TEXT,
    "email" TEXT,
    "tugilganKun" TIMESTAMP(3),
    "manzil" TEXT,
    "izoh" TEXT,
    "faol" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "talabalar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "talaba_guruh" (
    "id" TEXT NOT NULL,
    "talabaId" TEXT NOT NULL,
    "guruhId" TEXT NOT NULL,
    "kirishSana" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chiqishSana" TIMESTAMP(3),
    "faol" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "talaba_guruh_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "darslar" (
    "id" TEXT NOT NULL,
    "guruhId" TEXT NOT NULL,
    "sana" TIMESTAMP(3) NOT NULL,
    "mavzu" TEXT,
    "izoh" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "darslar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "davomatlar" (
    "id" TEXT NOT NULL,
    "talabaId" TEXT NOT NULL,
    "guruhId" TEXT NOT NULL,
    "darsId" TEXT NOT NULL,
    "holat" "DavomatHolat" NOT NULL DEFAULT 'KELDI',
    "izoh" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "davomatlar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tolovlar" (
    "id" TEXT NOT NULL,
    "talabaId" TEXT NOT NULL,
    "summa" INTEGER NOT NULL,
    "tur" "TolovTur" NOT NULL DEFAULT 'NAQD',
    "oy" INTEGER NOT NULL,
    "yil" INTEGER NOT NULL,
    "izoh" TEXT,
    "qabulQildi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tolovlar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ish_haqlar" (
    "id" TEXT NOT NULL,
    "oqituvchiId" TEXT NOT NULL,
    "summa" INTEGER NOT NULL,
    "oy" INTEGER NOT NULL,
    "yil" INTEGER NOT NULL,
    "tolanganMi" BOOLEAN NOT NULL DEFAULT false,
    "izoh" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ish_haqlar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xabarlar" (
    "id" TEXT NOT NULL,
    "telefon" TEXT NOT NULL,
    "matn" TEXT NOT NULL,
    "holat" "XabarHolat" NOT NULL DEFAULT 'KUTILMOQDA',
    "tur" "XabarTur" NOT NULL DEFAULT 'MANUAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xabarlar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "oqituvchilar_userId_key" ON "oqituvchilar"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "talaba_guruh_talabaId_guruhId_key" ON "talaba_guruh"("talabaId", "guruhId");

-- CreateIndex
CREATE UNIQUE INDEX "davomatlar_talabaId_darsId_key" ON "davomatlar"("talabaId", "darsId");

-- AddForeignKey
ALTER TABLE "guruhlar" ADD CONSTRAINT "guruhlar_kursId_fkey" FOREIGN KEY ("kursId") REFERENCES "kurslar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guruhlar" ADD CONSTRAINT "guruhlar_oqituvchiId_fkey" FOREIGN KEY ("oqituvchiId") REFERENCES "oqituvchilar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oqituvchilar" ADD CONSTRAINT "oqituvchilar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "talaba_guruh" ADD CONSTRAINT "talaba_guruh_talabaId_fkey" FOREIGN KEY ("talabaId") REFERENCES "talabalar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "talaba_guruh" ADD CONSTRAINT "talaba_guruh_guruhId_fkey" FOREIGN KEY ("guruhId") REFERENCES "guruhlar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "darslar" ADD CONSTRAINT "darslar_guruhId_fkey" FOREIGN KEY ("guruhId") REFERENCES "guruhlar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "davomatlar" ADD CONSTRAINT "davomatlar_talabaId_fkey" FOREIGN KEY ("talabaId") REFERENCES "talabalar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "davomatlar" ADD CONSTRAINT "davomatlar_guruhId_fkey" FOREIGN KEY ("guruhId") REFERENCES "guruhlar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "davomatlar" ADD CONSTRAINT "davomatlar_darsId_fkey" FOREIGN KEY ("darsId") REFERENCES "darslar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tolovlar" ADD CONSTRAINT "tolovlar_talabaId_fkey" FOREIGN KEY ("talabaId") REFERENCES "talabalar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ish_haqlar" ADD CONSTRAINT "ish_haqlar_oqituvchiId_fkey" FOREIGN KEY ("oqituvchiId") REFERENCES "oqituvchilar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
