import { cn, formatRelativeTime } from "../../lib/utils";

export default function StatusBadge({ isOnline = false, lastSeen = null, showLabel = true, className = "" }) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "inline-block h-2.5 w-2.5 rounded-full",
          isOnline ? "bg-cyan-400 shadow-[0_0_12px_rgba(0,200,240,0.8)]" : "bg-white/25"
        )}
      />
      {showLabel ? (
        <span className="text-xs text-white/55">{isOnline ? "Online" : `Last seen ${formatRelativeTime(lastSeen)}`}</span>
      ) : null}
    </div>
  );
}