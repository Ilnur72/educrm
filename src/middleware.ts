import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path  = req.nextUrl.pathname;

    // Portal — faqat TALABA roli
    if (path.startsWith("/portal") && path !== "/portal/login") {
      if (token?.role !== "TALABA") {
        return NextResponse.redirect(new URL("/portal/login", req.url));
      }
    }

    // Dashboard — TALABA kira olmaydi
    if (path.startsWith("/dashboard") && token?.role === "TALABA") {
      return NextResponse.redirect(new URL("/portal", req.url));
    }

    // Faqat DIREKTOR ko'rishi mumkin bo'lgan sahifalar
    if (path.startsWith("/dashboard/filiallar") && token?.role !== "DIREKTOR") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // ADMIN va DIREKTOR ko'rishi mumkin bo'lgan sahifalar
    const adminOnly = ["/dashboard/oqituvchilar", "/dashboard/hisobotlar", "/hisobotlar", "/davomat-hisoboti"];
    if (
      adminOnly.some((p) => path.startsWith(p)) &&
      token?.role !== "ADMIN" &&
      token?.role !== "DIREKTOR"
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // O'qituvchi faqat o'z kabineti va davomatga kirishi mumkin
    if (token?.role === "OQITUVCHI") {
      const allowed = ["/dashboard/oqituvchi", "/dashboard/davomat", "/dashboard/guruhlar", "/dashboard/jadval", "/dashboard"];
      if (!allowed.some((p) => path === p || path.startsWith(p + "/"))) {
        return NextResponse.redirect(new URL("/dashboard/oqituvchi", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        // Portal sahifalari — authorized callbackdan o'tkazamiz,
        // middleware funksiyasi o'zi redirect qiladi
        if (path.startsWith("/portal")) return true;
        // Boshqa himoyalangan sahifalar token talab qiladi
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/hisobotlar",
    "/davomat-hisoboti",
    "/portal",
    "/portal/:path*",
  ],
};
