"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/portal",          label: "Bosh sahifa", icon: "▦" },
  { href: "/portal/davomat",  label: "Davomat",     icon: "◉" },
  { href: "/portal/jadval",   label: "Jadval",      icon: "▣" },
  { href: "/portal/tolovlar", label: "To'lovlar",   icon: "◈" },
  { href: "/portal/profil",   label: "Profil",      icon: "◍" },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Desktop sidebar ─────────────────────────────────── */}
      <aside className="hidden lg:flex w-56 min-h-screen bg-white border-r border-gray-100 flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">E</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">EduCRM</p>
              <p className="text-xs text-gray-400">O'quvchi kabineti</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => {
            const isActive = item.href === "/portal"
              ? pathname === "/portal"
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-brand-50 text-brand-800 font-medium"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                )}
              >
                <span className={cn("text-base w-4 text-center", isActive ? "text-brand-600" : "text-gray-400")}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-gray-100">
          <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mb-3 bg-teal-100 text-teal-700">
            O'quvchi
          </div>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-xs font-medium text-brand-700 flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-700 truncate">{session?.user?.name}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/portal/login" })}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <span>→</span>
            Chiqish
          </button>
        </div>
      </aside>

      {/* ── Content ─────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto pb-20 lg:pb-0">
        {/* Mobile topbar */}
        <div className="lg:hidden sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-brand-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">E</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">EduCRM</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-xs font-medium text-brand-700">
              {initials}
            </div>
          </div>
        </div>

        {children}
      </main>

      {/* ── Mobile bottom navigation ─────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-100">
        <div className="flex items-stretch">
          {navItems.map((item) => {
            const isActive = item.href === "/portal"
              ? pathname === "/portal"
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors",
                  isActive ? "text-brand-600" : "text-gray-400"
                )}
              >
                <span className="text-lg leading-none">{item.icon}</span>
                <span className="text-[10px] font-medium leading-tight">{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 w-8 h-0.5 bg-brand-600 rounded-t-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

    </div>
  );
}
