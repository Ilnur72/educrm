import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string; hint?: string }
>(({ label, error, hint, className, ...props }, ref) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="text-sm font-medium text-foreground">
        {label}
      </label>
    )}
    <input
      ref={ref}
      className={cn(
        "w-full px-4 py-2.5 text-sm rounded-xl bg-background text-foreground placeholder:text-muted-foreground",
        "border-2 transition-all duration-200",
        "focus:outline-none focus:ring-0",
        error 
          ? "border-destructive focus:border-destructive" 
          : "border-border hover:border-primary/30 focus:border-primary",
        className
      )}
      {...props}
    />
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
    {hint && !error && (
      <p className="text-xs text-muted-foreground">{hint}</p>
    )}
  </div>
));
Input.displayName = "Input";
