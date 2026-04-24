import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Camera, Loader2, Trash2, X } from "lucide-react";
import GlassCard from "./GlassCard";
import GlassInput from "./GlassInput";
import UserAvatar from "./UserAvatar";

export default function ProfileSettingsModal({
  open,
  user,
  onClose,
  onSave,
  onAvatarUpload,
  onDeleteAccount,
  loading = false,
  avatarUploading = false,
  deleting = false
}) {
  const [form, setForm] = useState({
    name: "",
    username: "",
    bio: ""
  });

  const [confirmDelete, setConfirmDelete] = useState(false);
  const avatarInputRef = useRef(null);

  useEffect(() => {
    if (!open || !user) return;

    setForm({
      name: user?.name || "",
      username: user?.username || "",
      bio: user?.bio || ""
    });
    setConfirmDelete(false);
  }, [open, user]);

  const isDirty = useMemo(() => {
    if (!user) return false;

    return (
      form.name !== (user?.name || "") ||
      form.username !== (user?.username || "") ||
      form.bio !== (user?.bio || "")
    );
  }, [form, user]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(form);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await onAvatarUpload(file);
    e.target.value = "";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
      <GlassCard className="max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Profile Settings</h2>
            <p className="mt-1 text-sm text-white/45">
              Update your NexTalk identity and account settings.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-2xl border border-white/8 bg-white/[0.03] p-2 text-white/60 transition hover:bg-white/[0.05] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-6 flex flex-col items-center gap-4 rounded-3xl border border-white/8 bg-white/[0.02] p-5 md:flex-row">
          <UserAvatar user={user} size="lg" />

          <div className="flex-1">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-white/45">@{user?.username}</p>
            <p className="mt-2 text-xs text-white/35">{user?.email}</p>
          </div>

          <div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />

            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarUploading}
              className="glass-btn !w-auto px-4 py-3 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {avatarUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              Change Avatar
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-white/35">
              Name
            </label>
            <GlassInput
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-white/35">
              Username
            </label>
            <GlassInput
              value={form.username}
              onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
              placeholder="username"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-white/35">
              Bio
            </label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value.slice(0, 160) }))}
              rows={4}
              className="glass-input min-h-[120px] resize-none"
              placeholder="Tell people a bit about yourself..."
            />
            <p className="mt-2 text-right text-xs text-white/35">{form.bio.length}/160</p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4">
            <button
              type="submit"
              disabled={!isDirty || loading}
              className="glass-btn !w-auto px-5 py-3 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save Changes
            </button>

            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-2 rounded-2xl border border-red-400/15 bg-red-400/10 px-4 py-3 text-sm text-red-200 transition hover:bg-red-400/15"
              >
                <Trash2 className="h-4 w-4" />
                Delete Account
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-red-400/15 bg-red-400/10 px-4 py-3">
                <AlertTriangle className="h-4 w-4 text-red-300" />
                <span className="text-xs text-red-100">This cannot be undone.</span>
                <button
                  type="button"
                  onClick={onDeleteAccount}
                  disabled={deleting}
                  className="rounded-xl bg-red-500/80 px-3 py-2 text-xs font-medium text-white transition hover:bg-red-500 disabled:opacity-60"
                >
                  {deleting ? "Deleting..." : "Confirm Delete"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-xl border border-white/10 px-3 py-2 text-xs text-white/70"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </form>
      </GlassCard>
    </div>
  );
}