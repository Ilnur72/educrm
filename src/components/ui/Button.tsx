import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const styles: Record<Variant, string> = {
  primary:   "bg-brand-600 text-white hover:bg-brand-800 border-brand-600",
  secondary: "bg-white text-gray-700 hover:bg-gray-50 border-gray-200",
  ghost:     "bg-transparent text-gray-600 hover:bg-gray-100 border-transparent",
  danger:    "bg-red-500 text-white hover:bg-red-600 border-red-500",
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
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-5 py-2.5 text-sm" };
  return (
    <button
      className={cn(
        "inline-flex items-center gap-1.5 font-medium border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
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
