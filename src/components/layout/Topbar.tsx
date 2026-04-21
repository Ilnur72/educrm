import { ReactNode } from "react";

export function Topbar({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="bg-card/80 backdrop-blur-xl border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="text-lg font-semibold text-foreground tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}
