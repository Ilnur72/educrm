import { cn } from "@/lib/utils";
import { SelectHTMLAttributes, forwardRef } from "react";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string }
>(({ label, error, className, children, ...props }, ref) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="text-sm font-medium text-foreground">
        {label}
      </label>
    )}
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "w-full px-4 py-2.5 text-sm rounded-xl bg-background text-foreground appearance-none cursor-pointer",
          "border-2 transition-all duration-200",
          "focus:outline-none focus:ring-0",
          error 
            ? "border-destructive focus:border-destructive" 
            : "border-border hover:border-primary/30 focus:border-primary",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6,9 12,15 18,9"/>
        </svg>
      </div>
    </div>
    {error && (
      <p className="text-xs text-destructive flex items-center gap-1">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {error}
      </p>
    )}
  </div>
));
Select.displayName = "Select";
