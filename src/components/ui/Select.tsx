import { cn } from "@/lib/utils";
import { SelectHTMLAttributes, forwardRef } from "react";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string }
>(({ label, error, className, children, ...props }, ref) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-xs font-medium text-gray-600">{label}</label>}
    <select
      ref={ref}
      className={cn(
        "w-full px-3 py-2 text-sm border rounded-lg bg-white text-gray-900",
        "focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent",
        error ? "border-red-300" : "border-gray-200",
        className
      )}
      {...props}
    >
      {children}
    </select>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
));
Select.displayName = "Select";
