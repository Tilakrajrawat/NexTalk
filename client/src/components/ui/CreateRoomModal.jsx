import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import GlassCard from "./GlassCard";
import GlassButton from "./GlassButton";
import GlassInput from "./GlassInput";
import UserAvatar from "./UserAvatar";

export default function CreateRoomModal({
  open,
  onClose,
  users = [],
  onCreate,
  loading = false
}) {
  const [roomName, setRoomName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  const selectedSet = useMemo(() => new Set(selectedUsers), [selectedUsers]);

  useEffect(() => {
    if (!open) {
      setRoomName("");
      setDescription("");
      setSelectedUsers([]);
    }
  }, [open]);

  if (!open) return null;

  const toggleUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (!roomName.trim()) return;

    await onCreate({
      name: roomName.trim(),
      description: description.trim(),
      memberIds: selectedUsers
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
      <GlassCard className="w-full max-w-2xl p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Create Room</h3>
            <p className="text-sm text-white/45">Start a premium group conversation.</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-2xl border border-white/8 bg-white/[0.03] p-2 text-white/60 transition hover:bg-white/[0.05]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <GlassInput
            placeholder="Room name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />

          <GlassInput
            placeholder="Short description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="rounded-3xl border border-white/8 bg-white/[0.02] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/35">
              Select Members
            </p>

            <div className="mt-4 max-h-72 space-y-2 overflow-y-auto">
              {users.map((user) => (
                <button
                  key={user._id}
                  type="button"
                  onClick={() => toggleUser(user._id)}
                  className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                    selectedSet.has(user._id)
                      ? "border-cyan-400/20 bg-cyan-400/10 shadow-glow-cyan"
                      : "border-white/6 bg-white/[0.02] hover:bg-white/[0.04]"
                  }`}
                >
                  <UserAvatar user={user} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{user.name}</p>
                    <p className="truncate text-xs text-white/45">@{user.username}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <GlassButton variant="secondary" type="button" onClick={onClose}>
              Cancel
            </GlassButton>

            <GlassButton type="button" onClick={handleCreate} loading={loading}>
              Create Room
            </GlassButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}