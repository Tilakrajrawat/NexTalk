import { cn } from "../../lib/utils";

export default function SidebarItem({
  icon,
  title,
  subtitle,
  active = false,
  onClick,
  rightNode,
  className = ""
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all duration-300",
        active
          ? "border-cyan-400/25 bg-cyan-400/10 shadow-glow-cyan"
          : "border-white/6 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]",
        className
      )}
    >
      <div className="shrink-0">{icon}</div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{title}</p>
        {subtitle ? <p className="truncate text-xs text-white/45">{subtitle}</p> : null}
      </div>

      {rightNode ? <div className="shrink-0">{rightNode}</div> : null}
    </button>
  );
}