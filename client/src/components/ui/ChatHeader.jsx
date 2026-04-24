import StatusBadge from "./StatusBadge";
import UserAvatar from "./UserAvatar";

export default function ChatHeader({ title, subtitle, user = null, rightNode = null }) {
  return (
    <div className="glass-panel flex items-center justify-between px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        {user ? <UserAvatar user={user} size="md" /> : null}

        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-white">{title}</h3>
          {user ? (
            <StatusBadge isOnline={user?.isOnline} lastSeen={user?.lastSeen} />
          ) : subtitle ? (
            <p className="truncate text-xs text-white/50">{subtitle}</p>
          ) : null}
        </div>
      </div>

      {rightNode}
    </div>
  );
}