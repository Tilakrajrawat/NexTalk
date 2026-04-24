import { useEffect, useMemo, useState } from "react";
import { Loader2, Trash2, UserMinus, UserPlus, X } from "lucide-react";
import GlassCard from "./GlassCard";
import GlassInput from "./GlassInput";
import UserAvatar from "./UserAvatar";
import StatusBadge from "./StatusBadge";

export default function RoomSettingsModal({
  open,
  room,
  currentUser,
  searchResults = [],
  onClose,
  onSaveDetails,
  onAddMembers,
  onRemoveMember,
  onDeleteRoom,
  onLeaveRoom,
  loading = false,
  deleting = false
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (!open || !room) return;

    setName(room?.name || "");
    setDescription(room?.description || "");
    setSelectedIds([]);
  }, [open, room]);

  if (!open || !room) return null;

  const isOwner = String(room?.createdBy?._id || room?.createdBy) === String(currentUser?._id);

  const memberIds = new Set((room?.members || []).map((m) => String(m?._id || m)));

  const availableUsers = searchResults.filter((user) => !memberIds.has(String(user._id)));

  const detailsDirty =
    name !== (room?.name || "") || description !== (room?.description || "");

  const toggleUser = (userId) => {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleAddMembers = async () => {
    if (!selectedIds.length) return;
    await onAddMembers(selectedIds);
    setSelectedIds([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
      <GlassCard className="max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Room Settings</h2>
            <p className="mt-1 text-sm text-white/45">
              Manage room details, members, and permissions.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-2xl border border-white/8 bg-white/[0.03] p-2 text-white/60 transition hover:bg-white/[0.05] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/8 bg-white/[0.02] p-5">
              <h3 className="mb-4 text-sm font-semibold text-white">Room Details</h3>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.14em] text-white/35">
                    Room Name
                  </label>
                  <GlassInput
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isOwner}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.14em] text-white/35">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    disabled={!isOwner}
                    className="glass-input min-h-[120px] resize-none"
                  />
                </div>

                {isOwner ? (
                  <button
                    type="button"
                    disabled={!detailsDirty || loading}
                    onClick={() => onSaveDetails({ name, description })}
                    className="glass-btn !w-auto px-5 py-3 disabled:opacity-60"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Save Room
                  </button>
                ) : (
                  <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3 text-xs text-white/45">
                    Only the room creator can edit room details.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-white/8 bg-white/[0.02] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Members</h3>
                <span className="text-xs text-white/35">{room?.members?.length || 0} total</span>
              </div>

              <div className="space-y-3">
                {(room?.members || []).map((member) => {
                  const memberId = String(member?._id || member);
                  const isCreator =
                    memberId === String(room?.createdBy?._id || room?.createdBy);

                  return (
                    <div
                      key={memberId}
                      className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.02] px-3 py-3"
                    >
                      <UserAvatar user={member} size="sm" />

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">
                          {member?.name || "Member"}
                        </p>
                        <p className="truncate text-xs text-white/40">
                          @{member?.username || "unknown"}
                        </p>
                        <div className="mt-1">
                          <StatusBadge
                            isOnline={member?.isOnline}
                            lastSeen={member?.lastSeen}
                            showLabel
                          />
                        </div>
                      </div>

                      {isCreator ? (
                        <span className="rounded-xl border border-cyan-400/15 bg-cyan-400/10 px-3 py-2 text-[11px] text-cyan-200">
                          Owner
                        </span>
                      ) : isOwner ? (
                        <button
                          type="button"
                          onClick={() => onRemoveMember(memberId)}
                          className="rounded-xl border border-red-400/15 bg-red-400/10 p-2 text-red-200 transition hover:bg-red-400/15"
                        >
                          <UserMinus className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {isOwner ? (
              <div className="rounded-3xl border border-white/8 bg-white/[0.02] p-5">
                <div className="mb-4 flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-cyan-300" />
                  <h3 className="text-sm font-semibold text-white">Add Members</h3>
                </div>

                <div className="space-y-3">
                  {availableUsers.length === 0 ? (
                    <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3 text-xs text-white/45">
                      Search users in the sidebar to populate available members.
                    </div>
                  ) : (
                    availableUsers.slice(0, 8).map((user) => {
                      const active = selectedIds.includes(user._id);

                      return (
                        <button
                          key={user._id}
                          type="button"
                          onClick={() => toggleUser(user._id)}
                          className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                            active
                              ? "border-cyan-400/20 bg-cyan-400/10"
                              : "border-white/8 bg-white/[0.02] hover:bg-white/[0.04]"
                          }`}
                        >
                          <UserAvatar user={user} size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-white">{user.name}</p>
                            <p className="truncate text-xs text-white/40">@{user.username}</p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleAddMembers}
                  disabled={!selectedIds.length || loading}
                  className="glass-btn mt-4 !w-full disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Add Selected Members
                </button>
              </div>
            ) : null}

            <div className="rounded-3xl border border-white/8 bg-white/[0.02] p-5">
              <h3 className="mb-4 text-sm font-semibold text-white">Danger Zone</h3>

              {isOwner ? (
                <button
                  type="button"
                  onClick={onDeleteRoom}
                  disabled={deleting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-400/15 bg-red-400/10 px-4 py-3 text-sm text-red-200 transition hover:bg-red-400/15 disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  {deleting ? "Deleting Room..." : "Delete Room"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onLeaveRoom}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/80 transition hover:bg-white/[0.05]"
                >
                  Leave Room
                </button>
              )}
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}