"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

type NavItem = {
  href: string;
  icon: string;
  label: string;
  roles?: Role[];
};

const navItems: NavItem[] = [
  { href: "/dashboard",                    icon: "▦", label: "Dashboard",         roles: ["ADMIN","RECEPTION"] },
  { href: "/dashboard/oqituvchi",          icon: "▦", label: "Dashboard",         roles: ["OQITUVCHI"] },
  { href: "/dashboard/lidlar",             icon: "◎", label: "Lidlar",            roles: ["ADMIN","RECEPTION"] },
  { href: "/dashboard/talabalar",          icon: "◉", label: "Talabalar",         roles: ["ADMIN","RECEPTION"] },
  { href: "/dashboard/kurslar",            icon: "▤", label: "Kurslar",           roles: ["ADMIN","RECEPTION"] },
  { href: "/dashboard/davomat",            icon: "▣", label: "Davomat" },
  { href: "/dashboard/tolovlar",           icon: "◈", label: "To'lovlar",         roles: ["ADMIN","RECEPTION"] },
  { href: "/dashboard/qarzdorlar",         icon: "◌", label: "Qarzdorlar",         roles: ["ADMIN","RECEPTION"] },
  { href: "/dashboard/oqituvchilar",       icon: "◍", label: "O'qituvchilar",     roles: ["ADMIN"] },
  { href: "/dashboard/hisobotlar",         icon: "◫", label: "Hisobotlar",        roles: ["ADMIN"] },
  { href: "/dashboard/xonalar",            icon: "▭", label: "Xonalar",           roles: ["ADMIN"] },
  { href: "/dashboard/foydalanuvchilar",   icon: "◬", label: "Foydalanuvchilar",  roles: ["ADMIN"] },
];

const roleLabel: Record<Role, string> = {
  ADMIN:     "Administrator",
  OQITUVCHI: "O'qituvchi",
  RECEPTION: "Resepshn",
};

const roleColor: Record<Role, string> = {
  ADMIN:     "bg-purple-100 text-purple-700",
  OQITUVCHI: "bg-teal-100 text-teal-700",
  RECEPTION: "bg-blue-100 text-blue-700",
};

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role as Role | undefined;

  const visible = navItems.filter(
    (item) => !item.roles || (role && item.roles.includes(role))
  );

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-gray-100 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">E</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">EduCRM</p>
            <p className="text-xs text-gray-400">O'quv markaz</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
        {visible.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
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
        {role && (
          <div className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mb-3", roleColor[role])}>
            {roleLabel[role]}
          </div>
        )}
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-xs font-medium text-brand-700 flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-700 truncate">{session?.user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <span>→</span>
          Chiqish
        </button>
      </div>
    </aside>
  );
}
