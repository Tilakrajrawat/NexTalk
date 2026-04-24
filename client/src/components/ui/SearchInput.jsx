import { Search } from "lucide-react";
import { cn } from "../../lib/utils";

export default function SearchInput({ className = "", ...props }) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
      <input className="glass-input pl-11" {...props} />
    </div>
  );
}