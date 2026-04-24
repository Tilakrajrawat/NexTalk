import UserAvatar from "./UserAvatar";
import StatusBadge from "./StatusBadge";
import SidebarItem from "./SidebarItem";
import { formatRelativeTime } from "../../lib/utils";

export default function ConversationListItem({
  type = "dm",
  active = false,
  user = null,
  room = null,
  lastMessage = null,
  onClick
}) {
  if (type === "room" && room) {
    const roomPreview =
      lastMessage?.content?.trim() ||
      (lastMessage?.fileUrl ? "Attachment" : "") ||
      room.description ||
      `${room.members?.length || 0} members`;

    return (
      <SidebarItem
        active={active}
        onClick={onClick}
        icon={
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/10 text-sm font-semibold text-cyan-300">
            {room.name?.slice(0, 2)?.toUpperCase() || "RM"}
          </div>
        }
        title={room.name}
        subtitle={roomPreview}
        rightNode={
          <span className="text-[11px] text-white/35">
            {lastMessage?.createdAt ? formatRelativeTime(lastMessage.createdAt) : ""}
          </span>
        }
      />
    );
  }

  if (user) {
    const preview =
      lastMessage?.content?.trim() ||
      (lastMessage?.fileUrl ? "Attachment" : "") ||
      `@${user.username}`;

    return (
      <SidebarItem
        active={active}
        onClick={onClick}
        icon={<UserAvatar user={user} size="sm" />}
        title={user.name}
        subtitle={preview}
        rightNode={
          <div className="flex flex-col items-end gap-1">
            {lastMessage?.createdAt ? (
              <span className="text-[11px] text-white/35">
                {formatRelativeTime(lastMessage.createdAt)}
              </span>
            ) : null}
            <StatusBadge isOnline={user.isOnline} showLabel={false} />
          </div>
        }
      />
    );
  }

  return null;
}