import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }
>(({ label, error, className, ...props }, ref) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-xs font-medium text-gray-600">{label}</label>}
    <input
      ref={ref}
      className={cn(
        "w-full px-3 py-2 text-sm border rounded-lg bg-white text-gray-900 placeholder:text-gray-400",
        "focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent",
        error ? "border-red-300" : "border-gray-200",
        className
      )}
      {...props}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
));
Input.displayName = "Input";
