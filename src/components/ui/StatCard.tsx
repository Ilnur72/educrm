import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  sub,
  subColor = "gray",
}: {
  label: string;
  value: string | number;
  sub?: string;
  subColor?: "gray" | "green" | "red";
}) {
  const subColors = {
    gray:  "text-gray-400",
    green: "text-green-600",
    red:   "text-red-500",
  };
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-medium text-gray-900">{value}</p>
      {sub && <p className={cn("text-xs mt-0.5", subColors[subColor])}>{sub}</p>}
    </div>
  );
}
