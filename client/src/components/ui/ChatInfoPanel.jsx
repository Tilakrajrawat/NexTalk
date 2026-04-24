import { Settings2, Users } from "lucide-react";
import GlassCard from "./GlassCard";
import UserAvatar from "./UserAvatar";
import StatusBadge from "./StatusBadge";

export default function ChatInfoPanel({
  activeChat,
  currentUser,
  onOpenRoomSettings,
  onOpenProfileSettings
}) {
  return (
    <GlassCard className="hidden min-h-[500px] flex-col p-4 xl:flex">
      {!activeChat ? (
        <div className="flex h-full flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl border border-cyan-400/15 bg-cyan-400/10">
            <Users className="h-6 w-6 text-cyan-300" />
          </div>
          <h3 className="text-sm font-semibold text-white">Conversation Insights</h3>
          <p className="mt-2 max-w-[220px] text-xs leading-6 text-white/45">
            Select a direct message or room to view details, members, and management tools.
          </p>

          <button onClick={onOpenProfileSettings} className="glass-btn mt-5 !w-auto px-4 py-3">
            <Settings2 className="h-4 w-4" />
            Open Profile
          </button>
        </div>
      ) : activeChat.type === "dm" ? (
        <div className="flex h-full flex-col">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Direct Message</h3>
            <button onClick={onOpenProfileSettings} className="rounded-2xl border border-white/8 bg-white/[0.03] p-2 text-white/60 transition hover:text-cyan-300">
              <Settings2 className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/[0.02] p-5">
            <div className="flex flex-col items-center text-center">
              <UserAvatar user={activeChat.user} size="lg" />
              <p className="mt-4 text-sm font-semibold text-white">{activeChat.user?.name}</p>
              <p className="mt-1 text-xs text-white/40">@{activeChat.user?.username}</p>
              <div className="mt-3">
                <StatusBadge
                  isOnline={activeChat.user?.isOnline}
                  lastSeen={activeChat.user?.lastSeen}
                  showLabel
                />
              </div>
              {activeChat.user?.bio ? (
                <p className="mt-4 text-xs leading-6 text-white/45">{activeChat.user.bio}</p>
              ) : null}
            </div>
          </div>

          <div className="mt-auto pt-4">
            <button onClick={onOpenProfileSettings} className="glass-btn !w-full">
              <Settings2 className="h-4 w-4" />
              My Profile Settings
            </button>
          </div>
        </div>
      ) : (
        <div className="flex h-full flex-col">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Room Details</h3>
            <button
              onClick={onOpenRoomSettings}
              className="rounded-2xl border border-white/8 bg-white/[0.03] p-2 text-white/60 transition hover:text-cyan-300"
            >
              <Settings2 className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/[0.02] p-5">
            <p className="text-sm font-semibold text-white">{activeChat.room?.name}</p>
            <p className="mt-2 text-xs leading-6 text-white/45">
              {activeChat.room?.description || "No description added yet."}
            </p>

            <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3 text-xs text-white/50">
              {activeChat.room?.members?.length || 0} members
            </div>
          </div>

          <div className="mt-5 flex-1 overflow-y-auto">
            <div className="space-y-3">
              {(activeChat.room?.members || []).map((member) => (
                <div
                  key={member._id}
                  className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.02] px-3 py-3"
                >
                  <UserAvatar user={member} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{member.name}</p>
                    <p className="truncate text-xs text-white/40">@{member.username}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button onClick={onOpenRoomSettings} className="glass-btn !w-full">
              <Settings2 className="h-4 w-4" />
              Manage Room
            </button>
          </div>
        </div>
      )}
    </GlassCard>
  );
}