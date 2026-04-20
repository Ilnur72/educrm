import { cn } from "@/lib/utils";

type Variant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "purple"
  | "outline";

// Also support legacy variants for backward compatibility
type LegacyVariant = "green" | "amber" | "red" | "blue" | "gray" | "teal";

const variantStyles: Record<Variant | LegacyVariant, string> = {
  default: "bg-muted text-muted-foreground border-border",
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  danger: "bg-destructive/10 text-destructive border-destructive/20",
  info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  purple: "bg-primary/10 text-primary border-primary/20",
  outline: "bg-transparent text-foreground border-border",
  // Legacy mappings
  green: "bg-success/10 text-success border-success/20",
  amber: "bg-warning/10 text-warning border-warning/20",
  red: "bg-destructive/10 text-destructive border-destructive/20",
  blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  gray: "bg-muted text-muted-foreground border-border",
  teal: "bg-teal-500/10 text-teal-400 border-teal-500/20",
};

type Size = "sm" | "md" | "lg";

const sizeStyles: Record<Size, string> = {
  sm: "px-1.5 py-0.5 text-[10px]",
  md: "px-2 py-0.5 text-xs",
  lg: "px-2.5 py-1 text-xs",
};

export function Badge({
  children,
  variant = "default",
  size = "md",
  dot = false,
  className,
}: {
  children: React.ReactNode;
  variant?: Variant | LegacyVariant;
  size?: Size;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md font-medium border",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            variant === "success" || variant === "green"
              ? "bg-success"
              : variant === "warning" || variant === "amber"
                ? "bg-warning"
                : variant === "danger" || variant === "red"
                  ? "bg-destructive"
                  : variant === "info" || variant === "blue"
                    ? "bg-blue-400"
                    : variant === "purple"
                      ? "bg-primary"
                      : "bg-muted-foreground"
          )}
        />
      )}
      {children}
    </span>
  );
}
