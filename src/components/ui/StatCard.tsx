import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  subColor?: "default" | "success" | "danger" | "warning" | "gray" | "green" | "red";
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const subColors = {
  default: "text-muted-foreground",
  success: "text-success",
  danger: "text-destructive",
  warning: "text-warning",
  // Legacy support
  gray: "text-muted-foreground",
  green: "text-success",
  red: "text-destructive",
};

export function StatCard({
  label,
  value,
  sub,
  subColor = "default",
  icon,
  trend,
}: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 card-hover">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            {label}
          </p>
          <p className="text-2xl font-semibold text-foreground tracking-tight">
            {value}
          </p>
          {sub && (
            <p className={cn("text-xs mt-1.5", subColors[subColor])}>{sub}</p>
          )}
          {trend && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs mt-2",
                trend.isPositive ? "text-success" : "text-destructive"
              )}
            >
              <svg
                className={cn("w-3.5 h-3.5", !trend.isPositive && "rotate-180")}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
              <span className="font-medium">{Math.abs(trend.value)}%</span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-5 animate-pulse">
      <div className="h-3 bg-muted rounded w-24 mb-3" />
      <div className="h-8 bg-muted rounded w-32 mb-2" />
      <div className="h-3 bg-muted rounded w-20" />
    </div>
  );
}
