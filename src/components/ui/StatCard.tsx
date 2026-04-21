import { cn } from "@/lib/utils";

type Trend = "up" | "down" | "neutral";

const trendStyles: Record<Trend, { icon: React.ReactNode; text: string; bg: string }> = {
  up: {
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
        <polyline points="17,6 23,6 23,12"/>
      </svg>
    ),
    text: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  down: {
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="23,18 13.5,8.5 8.5,13.5 1,6"/>
        <polyline points="17,18 23,18 23,12"/>
      </svg>
    ),
    text: "text-red-500",
    bg: "bg-red-50",
  },
  neutral: {
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    ),
    text: "text-muted-foreground",
    bg: "bg-muted",
  },
};

export function StatCard({
  label,
  value,
  sub,
  subColor = "gray",
  icon,
  trend,
}: {
  label: string;
  value: string | number;
  sub?: string;
  subColor?: "gray" | "green" | "red";
  icon?: React.ReactNode;
  trend?: Trend;
}) {
  const trendType: Trend = trend ?? (subColor === "green" ? "up" : subColor === "red" ? "down" : "neutral");
  const trendStyle = trendStyles[trendType];

  return (
    <div className="group relative bg-card border border-border rounded-2xl p-5 transition-all duration-300 hover:shadow-soft hover:border-primary/20">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {icon && (
            <div className="p-2 bg-muted rounded-xl text-muted-foreground">
              {icon}
            </div>
          )}
        </div>
        
        <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
        
        {sub && (
          <div className={cn(
            "inline-flex items-center gap-1.5 mt-2 px-2 py-1 rounded-lg text-xs font-medium",
            trendStyle.bg, trendStyle.text
          )}>
            {trendStyle.icon}
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}
