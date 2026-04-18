-- CreateTable
CREATE TABLE "xonalar" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "sigim" INTEGER,
    "izoh" TEXT,
    "faol" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xonalar_pkey" PRIMARY KEY ("id")
);
