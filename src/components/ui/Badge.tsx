import { cn } from "@/lib/utils";

type Variant = "green" | "amber" | "red" | "blue" | "purple" | "gray";

const styles: Record<Variant, string> = {
  green:  "bg-green-50  text-green-800  border-green-200",
  amber:  "bg-amber-50  text-amber-800  border-amber-200",
  red:    "bg-red-50    text-red-800    border-red-200",
  blue:   "bg-blue-50   text-blue-800   border-blue-200",
  purple: "bg-purple-50 text-purple-800 border-purple-200",
  gray:   "bg-gray-100  text-gray-600   border-gray-200",
};

export function Badge({
  children,
  variant = "gray",
  className,
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
