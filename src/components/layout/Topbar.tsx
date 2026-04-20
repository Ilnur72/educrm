import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TopbarProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function Topbar({ title, description, actions, breadcrumbs }: TopbarProps) {
  return (
    <div className="bg-card/50 backdrop-blur-xl border-b border-border px-6 py-4 sticky top-0 z-10">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && (
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
              {crumb.href ? (
                <a
                  href={crumb.href}
                  className="hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </a>
              ) : (
                <span className="text-foreground">{crumb.label}</span>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}

export function TopbarSkeleton() {
  return (
    <div className="bg-card/50 backdrop-blur-xl border-b border-border px-6 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="animate-pulse">
          <div className="h-5 bg-muted rounded w-48 mb-1" />
          <div className="h-3 bg-muted rounded w-32" />
        </div>
        <div className="h-9 bg-muted rounded w-24 animate-pulse" />
      </div>
    </div>
  );
}
