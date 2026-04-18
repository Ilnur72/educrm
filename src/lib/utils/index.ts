import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// So'mni formatlash: 850000 → "850 000 so'm"
export function formatSum(summa: number): string {
  return new Intl.NumberFormat("uz-UZ").format(Math.round(summa)) + " so'm";
}

// Sana formatlash
export function formatSana(sana: Date | string): string {
  return format(new Date(sana), "dd.MM.yyyy");
}

export function formatSanaVaqt(sana: Date | string): string {
  return format(new Date(sana), "dd.MM.yyyy HH:mm");
}

export function formatNechaPushtin(sana: Date | string): string {
  return formatDistanceToNow(new Date(sana), { addSuffix: true });
}

// Oy nomi (o'zbek)
const OYLAR = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr",
];

export function oyNomi(oy: number): string {
  return OYLAR[oy - 1] ?? "";
}

// Hozirgi oy va yil
export function hozirgiOyYil(): { oy: number; yil: number } {
  const hozir = new Date();
  return { oy: hozir.getMonth() + 1, yil: hozir.getFullYear() };
}

// Initials: "Aziza Rahimova" → "AR"
export function initials(ism: string, familiya?: string): string {
  if (familiya) return `${ism[0]}${familiya[0]}`.toUpperCase();
  const parts = ism.trim().split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return ism.slice(0, 2).toUpperCase();
}

// Telefon formatlash: 998901234567 → +998 90 123 45 67
export function formatTelefon(tel: string): string {
  const t = tel.replace(/\D/g, "");
  if (t.length === 12 && t.startsWith("998")) {
    return `+998 ${t.slice(3, 5)} ${t.slice(5, 8)} ${t.slice(8, 10)} ${t.slice(10)}`;
  }
  if (t.length === 9) {
    return `+998 ${t.slice(0, 2)} ${t.slice(2, 5)} ${t.slice(5, 7)} ${t.slice(7)}`;
  }
  return tel;
}

// Foiz hisoblash
export function foizHisobla(qism: number, jami: number): number {
  if (jami === 0) return 0;
  return Math.round((qism / jami) * 100);
}
