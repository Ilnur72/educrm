"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

type NavItem = {
  href: string;
  icon: React.ReactNode;
  label: string;
  roles?: Role[];
};

// Modern SVG Icons
const icons = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1"/>
      <rect x="14" y="3" width="7" height="5" rx="1"/>
      <rect x="14" y="12" width="7" height="9" rx="1"/>
      <rect x="3" y="16" width="7" height="5" rx="1"/>
    </svg>
  ),
  leads: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>
      <path d="m4.93 4.93 2.83 2.83m8.48 8.48 2.83 2.83m-2.83-14.14 2.83 2.83M4.93 19.07l2.83-2.83"/>
    </svg>
  ),
  students: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  courses: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
      <path d="M8 7h6M8 11h8"/>
    </svg>
  ),
  attendance: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v4m8-4v4"/>
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <path d="M3 10h18"/>
      <path d="m9 16 2 2 4-4"/>
    </svg>
  ),
  payments: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <path d="M2 10h20"/>
    </svg>
  ),
  schedule: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12,6 12,12 16,14"/>
    </svg>
  ),
  debtors: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  messages: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      <path d="M8 10h8M8 14h4"/>
    </svg>
  ),
  teachers: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  reports: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18"/>
      <path d="m19 9-5 5-4-4-3 3"/>
    </svg>
  ),
  rooms: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9,22 9,12 15,12 15,22"/>
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  logout: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16,17 21,12 16,7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
};

const navItems: NavItem[] = [
  { href: "/dashboard",                    icon: icons.dashboard, label: "Dashboard",         roles: ["ADMIN","RECEPTION"] },
  { href: "/dashboard/oqituvchi",          icon: icons.dashboard, label: "Dashboard",         roles: ["OQITUVCHI"] },
  { href: "/dashboard/lidlar",             icon: icons.leads,     label: "Lidlar",            roles: ["ADMIN","RECEPTION"] },
  { href: "/dashboard/talabalar",          icon: icons.students,  label: "Talabalar",         roles: ["ADMIN","RECEPTION"] },
  { href: "/dashboard/kurslar",            icon: icons.courses,   label: "Kurslar",           roles: ["ADMIN","RECEPTION"] },
  { href: "/dashboard/davomat",            icon: icons.attendance,label: "Davomat" },
  { href: "/dashboard/tolovlar",           icon: icons.payments,  label: "To'lovlar",         roles: ["ADMIN","RECEPTION"] },
  { href: "/dashboard/jadval",             icon: icons.schedule,  label: "Dars jadvali" },
  { href: "/dashboard/qarzdorlar",         icon: icons.debtors,   label: "Qarzdorlar",        roles: ["ADMIN","RECEPTION"] },
  { href: "/dashboard/xabarlar",           icon: icons.messages,  label: "Xabarlar",          roles: ["ADMIN","RECEPTION"] },
  { href: "/dashboard/oqituvchilar",       icon: icons.teachers,  label: "O'qituvchilar",     roles: ["ADMIN"] },
  { href: "/dashboard/hisobotlar",         icon: icons.reports,   label: "Hisobotlar",        roles: ["ADMIN"] },
  { href: "/dashboard/hisobotlar/davomat", icon: icons.attendance,label: "Davomat hisoboti",  roles: ["ADMIN"] },
  { href: "/dashboard/xonalar",            icon: icons.rooms,     label: "Xonalar",           roles: ["ADMIN"] },
  { href: "/dashboard/foydalanuvchilar",   icon: icons.users,     label: "Foydalanuvchilar",  roles: ["ADMIN"] },
];

const roleLabel: Record<Role, string> = {
  ADMIN:     "Administrator",
  OQITUVCHI: "O'qituvchi",
  RECEPTION: "Resepshn",
};

const roleStyles: Record<Role, { bg: string; text: string; dot: string }> = {
  ADMIN:     { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  OQITUVCHI: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  RECEPTION: { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500" },
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
    <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-soft">
            <span className="text-white text-sm font-bold tracking-tight">E</span>
          </div>
          <div>
            <p className="text-base font-semibold text-foreground tracking-tight">EduCRM</p>
            <p className="text-xs text-muted-foreground">O'quv markaz tizimi</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {visible.map((item, index) => {
          const isActive =
            item.href === "/dashboard" || item.href === "/dashboard/oqituvchi"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{ animationDelay: `${index * 30}ms` }}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 animate-slide-in group",
                isActive
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <span className={cn(
                "flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
                isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
              )}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-border bg-muted/30">
        {role && (
          <div className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-3",
            roleStyles[role].bg, roleStyles[role].text
          )}>
            <span className={cn("w-1.5 h-1.5 rounded-full", roleStyles[role].dot)} />
            {roleLabel[role]}
          </div>
        )}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-sm font-semibold text-primary flex-shrink-0 ring-2 ring-primary/10">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{session?.user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all duration-200"
        >
          {icons.logout}
          Chiqish
        </button>
      </div>
    </aside>
  );
}
