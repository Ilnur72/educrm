import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path  = req.nextUrl.pathname;

    // Faqat ADMIN ko'rishi mumkin bo'lgan sahifalar
    const adminOnly = ["/dashboard/oqituvchilar", "/dashboard/hisobotlar"];
    if (adminOnly.some((p) => path.startsWith(p)) && token?.role !== "ADMIN") {
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
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
