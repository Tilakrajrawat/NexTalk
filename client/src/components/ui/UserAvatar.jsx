import { cn, getInitials } from "../../lib/utils";

export default function UserAvatar({ user, size = "md", className = "" }) {
  const sizes = {
    sm: "h-9 w-9 text-xs",
    md: "h-11 w-11 text-sm",
    lg: "h-14 w-14 text-base"
  };

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user?.name || "User"}
        className={cn(
          "rounded-2xl border border-white/10 object-cover shadow-inner-glass",
          sizes[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-2xl border border-cyan-400/15 bg-gradient-to-br from-cyan-400/15 via-white/[0.03] to-transparent font-semibold text-cyan-300 shadow-glow",
        sizes[size],
        className
      )}
    >
      {getInitials(user?.name || user?.username || "NexTalk")}
    </div>
  );
}