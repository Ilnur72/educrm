import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";

const styles: Record<Variant, string> = {
  primary: "gradient-primary text-white shadow-soft hover:shadow-soft-lg hover:scale-[1.02] active:scale-[0.98]",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border",
  outline: "bg-transparent text-foreground border border-border hover:bg-accent hover:border-primary/30",
  ghost: "bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent",
  danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-soft",
};

export function Button({
  children,
  variant = "secondary",
  className,
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-sm gap-2",
  };
  
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2",
        styles[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
