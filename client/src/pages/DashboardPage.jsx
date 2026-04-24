import { useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  LogOut,
  MessageSquareMore,
  Plus,
  Search,
  Settings2,
  Sparkles
} from "lucide-react";

import AppShell from "../layouts/AppShell";
import { useAuth } from "../context/AuthContext";
import useChatDashboard from "../hooks/useChatDashboard";
import { CHAT_TYPES } from "../lib/constants";

import GlassCard from "../components/ui/GlassCard";
import SearchInput from "../components/ui/SearchInput";
import UserAvatar from "../components/ui/UserAvatar";
import StatusBadge from "../components/ui/StatusBadge";
import SectionTitle from "../components/ui/SectionTitle";
import EmptyState from "../components/ui/EmptyState";
import ConversationListItem from "../components/ui/ConversationListItem";
import ChatHeader from "../components/ui/ChatHeader";
import Composer from "../components/ui/Composer";
import MessageList from "../components/ui/MessageList";
import ChatInfoPanel from "../components/ui/ChatInfoPanel";
import CreateRoomModal from "../components/ui/CreateRoomModal";
import SelectedFilePreview from "../components/ui/SelectedFilePreview";
import ProfileSettingsModal from "../components/ui/ProfileSettingsModal";
import RoomSettingsModal from "../components/ui/RoomSettingsModal";

export default function DashboardPage() {
  const { user, logout, updateUser } = useAuth();

  const fileInputRef = useRef(null);

  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [roomSettingsOpen, setRoomSettingsOpen] = useState(false);

  const [profileSaving, setProfileSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [accountDeleting, setAccountDeleting] = useState(false);

  const [roomUpdating, setRoomUpdating] = useState(false);
  const [roomDeleting, setRoomDeleting] = useState(false);

  const {
    searchQuery,
    setSearchQuery,
    searchLoading,
    searchResults,

    rooms,
    roomsLoading,

    dmThreads,
    dmThreadsLoading,

    activeChat,
    activeMessages,
    activeTyping,

    chatLoading,
    sending,
    composerText,
    selectedFile,

    uiError,
    createRoomLoading,

    setUiError,
    handleComposerChange,
    handleSelectFile,
    sendMessage,
    openDM,
    openRoom,
    createRoomFromModal,
    setSelectedFile,

    updateProfile,
    updateAvatar,
    deleteAccount,

    updateRoomDetails,
    addMembersToRoom,
    removeMemberFromRoom,
    deleteRoomById,
    leaveRoomById
  } = useChatDashboard(user);

  const activeTypingText = useMemo(() => {
    if (!activeChat) return "Someone is typing...";
    return activeChat.type === CHAT_TYPES.DM
      ? `${activeChat.user?.name || "Someone"} is typing...`
      : "A room member is typing...";
  }, [activeChat]);

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    handleSelectFile(file);
    e.target.value = "";
  };

  const handleSend = async (e) => {
    e.preventDefault();
    await sendMessage();
  };

  const handleCreateRoom = async ({ name, description, memberIds }) => {
    await createRoomFromModal({ name, description, memberIds });
    setRoomModalOpen(false);
  };

  const handleSaveProfile = async (payload) => {
    try {
      setProfileSaving(true);
      const updated = await updateProfile(payload);
      updateUser(updated);
      setProfileModalOpen(false);
    } catch (error) {
      setUiError(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAvatarUpload = async (file) => {
    try {
      setAvatarUploading(true);
      const updated = await updateAvatar(file);
      updateUser(updated);
    } catch (error) {
      setUiError(error?.response?.data?.message || "Failed to update avatar");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setAccountDeleting(true);
      await deleteAccount();
      logout();
    } catch (error) {
      setUiError(error?.response?.data?.message || "Failed to delete account");
    } finally {
      setAccountDeleting(false);
    }
  };

  const handleSaveRoomDetails = async (payload) => {
    if (!activeChat?.room?._id) return;

    try {
      setRoomUpdating(true);
      await updateRoomDetails(activeChat.room._id, payload);
    } catch (error) {
      setUiError(error?.response?.data?.message || "Failed to update room");
    } finally {
      setRoomUpdating(false);
    }
  };

  const handleAddMembers = async (memberIds) => {
    if (!activeChat?.room?._id) return;

    try {
      setRoomUpdating(true);
      await addMembersToRoom(activeChat.room._id, memberIds);
    } catch (error) {
      setUiError(error?.response?.data?.message || "Failed to add members");
    } finally {
      setRoomUpdating(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!activeChat?.room?._id) return;

    try {
      setRoomUpdating(true);
      await removeMemberFromRoom(activeChat.room._id, memberId);
    } catch (error) {
      setUiError(error?.response?.data?.message || "Failed to remove member");
    } finally {
      setRoomUpdating(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!activeChat?.room?._id) return;

    try {
      setRoomDeleting(true);
      await deleteRoomById(activeChat.room._id);
      setRoomSettingsOpen(false);
    } catch (error) {
      setUiError(error?.response?.data?.message || "Failed to delete room");
    } finally {
      setRoomDeleting(false);
    }
  };

  const handleLeaveRoom = async () => {
    if (!activeChat?.room?._id) return;

    try {
      setRoomDeleting(true);
      await leaveRoomById(activeChat.room._id);
      setRoomSettingsOpen(false);
    } catch (error) {
      setUiError(error?.response?.data?.message || "Failed to leave room");
    } finally {
      setRoomDeleting(false);
    }
  };

  const activeHeaderProps = useMemo(() => {
    if (!activeChat) return null;

    if (activeChat.type === CHAT_TYPES.DM) {
      return {
        title: activeChat.user?.name || "Direct Message",
        user: activeChat.user
      };
    }

    return {
      title: activeChat.room?.name || "Room",
      subtitle: `${activeChat.room?.members?.length || 0} members`
    };
  }, [activeChat]);

  return (
    <AppShell>
      <div className="grid h-full grid-cols-1 gap-4 xl:grid-cols-[360px_1fr_320px]">
        <GlassCard className="flex min-h-[500px] flex-col p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <UserAvatar user={user} size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
                <p className="truncate text-xs text-white/45">@{user?.username}</p>
                <div className="mt-1">
                  <StatusBadge isOnline={true} showLabel />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setProfileModalOpen(true)}
                className="rounded-2xl border border-white/8 bg-white/[0.03] p-2 text-white/60 transition hover:bg-white/[0.05] hover:text-cyan-300"
              >
                <Settings2 className="h-4 w-4" />
              </button>

              <button
                onClick={logout}
                className="rounded-2xl border border-white/8 bg-white/[0.03] p-2 text-white/60 transition hover:bg-white/[0.05] hover:text-white"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>

          <SearchInput
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {uiError ? (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-400/15 bg-red-400/10 px-4 py-3 text-xs text-red-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="flex-1">
                <p>{uiError}</p>
              </div>
              <button
                onClick={() => setUiError("")}
                className="text-red-200/80 transition hover:text-red-100"
              >
                ×
              </button>
            </div>
          ) : null}

          <div className="mt-5 flex-1 space-y-5 overflow-y-auto pr-1">
            <div>
              <SectionTitle
                action={
                  <div className="flex items-center gap-2 text-[11px] text-white/35">
                    <Search className="h-3.5 w-3.5" />
                    {searchLoading ? "Searching..." : `${searchResults.length} results`}
                  </div>
                }
              >
                Discover Users
              </SectionTitle>

              <div className="space-y-2">
                {searchResults.slice(0, 6).map((result) => (
                  <ConversationListItem
                    key={result._id}
                    type="dm"
                    user={result}
                    active={activeChat?.type === CHAT_TYPES.DM && activeChat?.id === result._id}
                    onClick={() => openDM(result)}
                  />
                ))}

                {searchResults.length === 0 ? (
                  <div className="rounded-2xl border border-white/6 bg-white/[0.02] px-4 py-3 text-xs text-white/40">
                    No users found
                  </div>
                ) : null}
              </div>
            </div>

            <div>
              <SectionTitle
                action={
                  <button
                    onClick={() => setRoomModalOpen(true)}
                    className="rounded-xl border border-white/8 bg-white/[0.03] p-2 text-white/60 transition hover:bg-white/[0.05] hover:text-cyan-300"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                }
              >
                Rooms
              </SectionTitle>

              <div className="space-y-2">
                {roomsLoading ? (
                  <div className="rounded-2xl border border-white/6 bg-white/[0.02] px-4 py-3 text-xs text-white/40">
                    Loading rooms...
                  </div>
                ) : rooms.length > 0 ? (
                  rooms.map((room) => (
                    <ConversationListItem
                      key={room._id}
                      type="room"
                      room={room}
                      lastMessage={room.lastMessage}
                      active={activeChat?.type === CHAT_TYPES.ROOM && activeChat?.id === room._id}
                      onClick={() => openRoom(room)}
                    />
                  ))
                ) : (
                  <div className="rounded-2xl border border-white/6 bg-white/[0.02] px-4 py-3 text-xs text-white/40">
                    No rooms yet
                  </div>
                )}
              </div>
            </div>

            <div>
              <SectionTitle
                action={
                  <div className="flex items-center gap-2 text-[11px] text-white/35">
                    <MessageSquareMore className="h-3.5 w-3.5" />
                    {dmThreadsLoading ? "..." : dmThreads.length}
                  </div>
                }
              >
                Direct Messages
              </SectionTitle>

              <div className="space-y-2">
                {dmThreadsLoading ? (
                  <div className="rounded-2xl border border-white/6 bg-white/[0.02] px-4 py-3 text-xs text-white/40">
                    Loading conversations...
                  </div>
                ) : dmThreads.length > 0 ? (
                  dmThreads.map((thread) => (
                    <ConversationListItem
                      key={thread.user._id}
                      type="dm"
                      user={thread.user}
                      lastMessage={thread.lastMessage}
                      active={
                        activeChat?.type === CHAT_TYPES.DM && activeChat?.id === thread.user._id
                      }
                      onClick={() => openDM(thread.user)}
                    />
                  ))
                ) : (
                  <div className="rounded-2xl border border-white/6 bg-white/[0.02] px-4 py-3 text-xs text-white/40">
                    No DM threads yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </GlassCard>

        <div className="flex min-h-[500px] flex-col gap-4">
          {!activeChat ? (
            <EmptyState
              title="Your premium workspace is ready"
              description="Search a user to start a direct message, or create a room to begin a group conversation in NexTalk."
              action={
                <button onClick={() => setRoomModalOpen(true)} className="glass-btn">
                  <Sparkles className="h-4 w-4" />
                  Create First Room
                </button>
              }
            />
          ) : (
            <>
              <ChatHeader {...activeHeaderProps} />

              <div className="min-h-0 flex-1">
                <MessageList
                  messages={activeMessages}
                  currentUserId={user?._id}
                  loading={chatLoading}
                  isTyping={activeTyping}
                  typingText={activeTypingText}
                />
              </div>

              <div>
                <SelectedFilePreview file={selectedFile} onRemove={() => setSelectedFile(null)} />

                <Composer
                  value={composerText}
                  onChange={handleComposerChange}
                  onSubmit={handleSend}
                  onAttach={handleAttachClick}
                  disabled={sending}
                  placeholder={
                    activeChat?.type === CHAT_TYPES.DM
                      ? `Message ${activeChat?.user?.name || "user"}...`
                      : `Message #${activeChat?.room?.name || "room"}...`
                  }
                />

                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </>
          )}
        </div>

        <ChatInfoPanel
          activeChat={activeChat}
          currentUser={user}
          onOpenProfileSettings={() => setProfileModalOpen(true)}
          onOpenRoomSettings={() => setRoomSettingsOpen(true)}
        />

        <CreateRoomModal
          open={roomModalOpen}
          onClose={() => setRoomModalOpen(false)}
          users={searchResults}
          onCreate={handleCreateRoom}
          loading={createRoomLoading}
        />

        <ProfileSettingsModal
          open={profileModalOpen}
          user={user}
          onClose={() => setProfileModalOpen(false)}
          onSave={handleSaveProfile}
          onAvatarUpload={handleAvatarUpload}
          onDeleteAccount={handleDeleteAccount}
          loading={profileSaving}
          avatarUploading={avatarUploading}
          deleting={accountDeleting}
        />

        <RoomSettingsModal
          open={roomSettingsOpen && activeChat?.type === CHAT_TYPES.ROOM}
          room={activeChat?.room}
          currentUser={user}
          searchResults={searchResults}
          onClose={() => setRoomSettingsOpen(false)}
          onSaveDetails={handleSaveRoomDetails}
          onAddMembers={handleAddMembers}
          onRemoveMember={handleRemoveMember}
          onDeleteRoom={handleDeleteRoom}
          onLeaveRoom={handleLeaveRoom}
          loading={roomUpdating}
          deleting={roomDeleting}
        />
      </div>
    </AppShell>
  );
}