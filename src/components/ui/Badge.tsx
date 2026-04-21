import { cn } from "@/lib/utils";

type Variant = "green" | "amber" | "red" | "blue" | "purple" | "gray" | "teal";

const styles: Record<Variant, string> = {
  green:  "bg-emerald-50 text-emerald-700 border-emerald-200/60 before:bg-emerald-500",
  amber:  "bg-amber-50 text-amber-700 border-amber-200/60 before:bg-amber-500",
  red:    "bg-red-50 text-red-700 border-red-200/60 before:bg-red-500",
  blue:   "bg-blue-50 text-blue-700 border-blue-200/60 before:bg-blue-500",
  purple: "bg-violet-50 text-violet-700 border-violet-200/60 before:bg-violet-500",
  gray:   "bg-muted text-muted-foreground border-border before:bg-muted-foreground",
  teal:   "bg-teal-50 text-teal-700 border-teal-200/60 before:bg-teal-500",
};

export function Badge({
  children,
  variant = "gray",
  className,
  dot = true,
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border",
        dot && "before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:flex-shrink-0",
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
