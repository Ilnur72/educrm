import type {
  User, Lid, Kurs, Guruh, Oqituvchi,
  Talaba, TalabaGuruh, Dars, Davomat,
  Tolov, IshHaq, Xabar,
  Role, LidManba, LidHolat, IshHaqiTuri,
  DavomatHolat, TolovTur, XabarHolat, XabarTur,
} from "@prisma/client";

export type {
  User, Lid, Kurs, Guruh, Oqituvchi,
  Talaba, TalabaGuruh, Dars, Davomat,
  Tolov, IshHaq, Xabar,
  Role, LidManba, LidHolat, IshHaqiTuri,
  DavomatHolat, TolovTur, XabarHolat, XabarTur,
};

export type TalabaTolov = {
  tolanganSumma: number;
  qoldiq: number;
  holat: "toliq" | "qisman" | "qarzdor";
};

export type DashboardStats = {
  jami_talabalar: number;
  oylik_tushum: number;
  faol_kurslar: number;
  yangi_lidlar: number;
  qarzdorlar: number;
  bugungi_darslar: number;
};

export type TalabaWithGuruh = Talaba & {
  guruhlar: (TalabaGuruh & { guruh: Guruh & { kurs: Kurs } })[];
  tolovlar: Tolov[];
};

export type GuruhWithDetails = Guruh & {
  kurs: Kurs;
  oqituvchi: (Oqituvchi & { user: User }) | null;
  talabalar: (TalabaGuruh & { talaba: Talaba })[];
  _count: { talabalar: number };
};
