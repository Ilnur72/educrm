"use client";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  width = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  width?: string;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handler);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div
        className={cn(
          "relative bg-card rounded-2xl shadow-premium-lg w-full animate-scale-in",
          width
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground tracking-tight">{title}</h2>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 -m-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}
