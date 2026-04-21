import { cn } from "@/lib/utils";

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full text-sm", className)}>{children}</table>
    </div>
  );
}

export function Thead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-muted/50 border-b border-border">
      {children}
    </thead>
  );
}

export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={cn(
      "px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider",
      className
    )}>
      {children}
    </th>
  );
}

export function Tbody({ children }: { children: React.ReactNode }) {
  return (
    <tbody className="divide-y divide-border">
      {children}
    </tbody>
  );
}

export function Tr({ 
  children, 
  className, 
  onClick 
}: { 
  children: React.ReactNode; 
  className?: string; 
  onClick?: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        "bg-card hover:bg-muted/50 transition-colors duration-150",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </tr>
  );
}

export function Td({ 
  children, 
  className, 
  colSpan 
}: { 
  children?: React.ReactNode; 
  className?: string; 
  colSpan?: number;
}) {
  return (
    <td 
      colSpan={colSpan} 
      className={cn("px-5 py-4 text-foreground", className)}
    >
      {children}
    </td>
  );
}
