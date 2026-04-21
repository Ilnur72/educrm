import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(
      "bg-card border border-border rounded-2xl overflow-hidden shadow-soft transition-shadow duration-300 hover:shadow-soft-lg",
      className
    )}>
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(
      "px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30",
      className
    )}>
      {children}
    </div>
  );
}

export function CardTitle({ 
  children, 
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn(
      "text-sm font-semibold text-foreground tracking-tight flex items-center gap-2",
      className
    )}>
      {children}
    </h3>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("p-6", className)}>
      {children}
    </div>
  );
}

export function CardDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </p>
  );
}
