import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import chatApi from "../lib/chatApi";
import socketService from "../lib/socket";
import { CHAT_TYPES } from "../lib/constants";
import { dedupeMessages } from "../lib/utils";

export default function useChatDashboard(currentUser) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);

  const [dmThreads, setDmThreads] = useState([]);
  const [dmThreadsLoading, setDmThreadsLoading] = useState(true);

  const [activeChat, setActiveChat] = useState(null);
  const [activeMessages, setActiveMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  const [activeTyping, setActiveTyping] = useState(false);

  const [composerText, setComposerText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [sending, setSending] = useState(false);

  const [uiError, setUiError] = useState("");
  const [createRoomLoading, setCreateRoomLoading] = useState(false);

  const typingTimeoutRef = useRef(null);

  const loadUsers = useCallback(async (query = "") => {
    try {
      setSearchLoading(true);
      const users = await chatApi.searchUsers(query);
      setSearchResults(users);
    } catch (error) {
      setUiError(error?.response?.data?.message || "Failed to search users");
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const loadRooms = useCallback(async () => {
    try {
      setRoomsLoading(true);
      const data = await chatApi.getRooms();
      setRooms(data);
    } catch (error) {
      setUiError(error?.response?.data?.message || "Failed to load rooms");
    } finally {
      setRoomsLoading(false);
    }
  }, []);

  const loadThreads = useCallback(async () => {
    try {
      setDmThreadsLoading(true);
      const data = await chatApi.getDMThreads();
      setDmThreads(data);
    } catch (error) {
      setUiError(error?.response?.data?.message || "Failed to load DM threads");
    } finally {
      setDmThreadsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!currentUser?._id) return;

    loadUsers("");
    loadRooms();
    loadThreads();
  }, [currentUser?._id, loadUsers, loadRooms, loadThreads]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers(searchQuery);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, loadUsers]);

  const openDM = async (user) => {
    if (!user?._id) return;

    setActiveChat({
      type: CHAT_TYPES.DM,
      id: user._id,
      user
    });

    setChatLoading(true);
    setActiveTyping(false);

    try {
      const messages = await chatApi.getDMMessages(user._id);
      setActiveMessages(messages);
    } catch (error) {
      setUiError(error?.response?.data?.message || "Failed to load DM messages");
    } finally {
      setChatLoading(false);
    }
  };

  const openRoom = async (room) => {
    if (!room?._id) return;

    setActiveChat({
      type: CHAT_TYPES.ROOM,
      id: room._id,
      room
    });

    setChatLoading(true);
    setActiveTyping(false);

    try {
      socketService.emit("room:join", { roomId: room._id });
      const messages = await chatApi.getRoomMessages(room._id);
      setActiveMessages(messages);
    } catch (error) {
      setUiError(error?.response?.data?.message || "Failed to load room messages");
    } finally {
      setChatLoading(false);
    }
  };

  const handleComposerChange = (e) => {
    const value = e.target.value;
    setComposerText(value);

    if (!activeChat) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (activeChat.type === CHAT_TYPES.DM) {
      socketService.emit("dm:typing", {
        receiverId: activeChat.id,
        isTyping: true
      });

      typingTimeoutRef.current = setTimeout(() => {
        socketService.emit("dm:typing", {
          receiverId: activeChat.id,
          isTyping: false
        });
      }, 1000);
    } else {
      socketService.emit("room:typing", {
        roomId: activeChat.id,
        isTyping: true
      });

      typingTimeoutRef.current = setTimeout(() => {
        socketService.emit("room:typing", {
          roomId: activeChat.id,
          isTyping: false
        });
      }, 1000);
    }
  };

  const handleSelectFile = (file) => {
    if (!file) return;

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setUiError("File size must be under 10MB");
      return;
    }

    setSelectedFile(file);
  };

  const updateRoomInState = useCallback((updatedRoom) => {
    if (!updatedRoom?._id) return;

    setRooms((prev) =>
      prev.map((room) => (room._id === updatedRoom._id ? { ...room, ...updatedRoom } : room))
    );

    setActiveChat((prev) => {
      if (!prev || prev.type !== CHAT_TYPES.ROOM || prev.id !== updatedRoom._id) return prev;

      return {
        ...prev,
        room: updatedRoom
      };
    });
  }, []);

  const sendMessage = async () => {
    if (!activeChat) return;
    if (!composerText.trim() && !selectedFile) return;

    setSending(true);

    try {
      let uploaded = null;

      if (selectedFile) {
        uploaded = await chatApi.uploadFile(selectedFile);
      }

      const payload =
        activeChat.type === CHAT_TYPES.DM
          ? {
              receiverId: activeChat.id,
              content: composerText.trim(),
              fileUrl: uploaded?.fileUrl || "",
              fileType: uploaded?.mimetype || ""
            }
          : {
              roomId: activeChat.id,
              content: composerText.trim(),
              fileUrl: uploaded?.fileUrl || "",
              fileType: uploaded?.mimetype || ""
            };

      const eventName = activeChat.type === CHAT_TYPES.DM ? "dm:send" : "room:send";

      socketService.emit(eventName, payload, (response) => {
        if (!response?.success) {
          setUiError(response?.message || "Failed to send message");
        }
      });

      setComposerText("");
      setSelectedFile(null);
    } catch (error) {
      setUiError(error?.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const createRoomFromModal = async ({ name, description, memberIds }) => {
    try {
      setCreateRoomLoading(true);
      const room = await chatApi.createRoom({ name, description, memberIds });

      setRooms((prev) => [room, ...prev]);
      await openRoom(room);
    } catch (error) {
      setUiError(error?.response?.data?.message || "Failed to create room");
    } finally {
      setCreateRoomLoading(false);
    }
  };

  const updateProfile = async (payload) => {
    const updated = await chatApi.updateMyProfile(payload);
    return updated;
  };

  const updateAvatar = async (file) => {
    const updated = await chatApi.updateMyAvatar(file);
    return updated;
  };

  const deleteAccount = async () => {
    await chatApi.deleteMyAccount();
  };

  const updateRoomDetails = async (roomId, payload) => {
    const updatedRoom = await chatApi.updateRoom(roomId, payload);
    updateRoomInState(updatedRoom);
    return updatedRoom;
  };

  const addMembersToRoom = async (roomId, memberIds) => {
    const updatedRoom = await chatApi.addRoomMembers(roomId, memberIds);
    updateRoomInState(updatedRoom);
    return updatedRoom;
  };

  const removeMemberFromRoom = async (roomId, memberId) => {
    const updatedRoom = await chatApi.removeRoomMember(roomId, memberId);
    updateRoomInState(updatedRoom);
    return updatedRoom;
  };

  const deleteRoomById = async (roomId) => {
    await chatApi.deleteRoom(roomId);

    setRooms((prev) => prev.filter((room) => room._id !== roomId));

    setActiveChat((prev) => {
      if (!prev || prev.type !== CHAT_TYPES.ROOM || prev.id !== roomId) return prev;
      return null;
    });

    setActiveMessages((prev) => (activeChat?.type === CHAT_TYPES.ROOM && activeChat?.id === roomId ? [] : prev));
  };

  const leaveRoomById = async (roomId) => {
    await chatApi.leaveRoom(roomId);

    setRooms((prev) => prev.filter((room) => room._id !== roomId));

    setActiveChat((prev) => {
      if (!prev || prev.type !== CHAT_TYPES.ROOM || prev.id !== roomId) return prev;
      return null;
    });

    setActiveMessages((prev) => (activeChat?.type === CHAT_TYPES.ROOM && activeChat?.id === roomId ? [] : prev));
  };

  useEffect(() => {
    const onDMNew = (message) => {
      const senderId = String(message?.sender?._id || "");
      const receiverId = String(message?.receiver?._id || "");
      const otherUserId =
        senderId === String(currentUser?._id) ? receiverId : senderId;

      setDmThreads((prev) => {
        const filtered = prev.filter((thread) => thread?.user?._id !== otherUserId);
        const user =
          senderId === String(currentUser?._id) ? message?.receiver : message?.sender;

        return [{ user, lastMessage: message }, ...filtered];
      });

      if (
        activeChat?.type === CHAT_TYPES.DM &&
        (activeChat.id === senderId || activeChat.id === receiverId)
      ) {
        setActiveMessages((prev) => dedupeMessages([...prev, message]));
      }
    };

    const onRoomNew = (message) => {
      const roomId = String(message?.room?._id || message?.room || "");

      setRooms((prev) =>
        prev.map((room) =>
          String(room._id) === roomId
            ? { ...room, lastMessage: message, updatedAt: new Date().toISOString() }
            : room
        )
      );

      if (activeChat?.type === CHAT_TYPES.ROOM && activeChat.id === roomId) {
        setActiveMessages((prev) => dedupeMessages([...prev, message]));
      }
    };

    const onDMTyping = ({ fromUserId, isTyping }) => {
      if (activeChat?.type === CHAT_TYPES.DM && activeChat.id === fromUserId) {
        setActiveTyping(Boolean(isTyping));
      }
    };

    const onRoomTyping = ({ roomId, fromUserId, isTyping }) => {
      if (
        activeChat?.type === CHAT_TYPES.ROOM &&
        activeChat.id === roomId &&
        String(fromUserId) !== String(currentUser?._id)
      ) {
        setActiveTyping(Boolean(isTyping));
      }
    };

    const onRoomUpdated = (updatedRoom) => {
      updateRoomInState(updatedRoom);
    };

    socketService.on("dm:new", onDMNew);
    socketService.on("room:new", onRoomNew);
    socketService.on("dm:typing", onDMTyping);
    socketService.on("room:typing", onRoomTyping);
    socketService.on("room:updated", onRoomUpdated);

    return () => {
      socketService.off("dm:new", onDMNew);
      socketService.off("room:new", onRoomNew);
      socketService.off("dm:typing", onDMTyping);
      socketService.off("room:typing", onRoomTyping);
      socketService.off("room:updated", onRoomUpdated);
    };
  }, [activeChat, currentUser?._id, updateRoomInState]);

  const activeTypingText = useMemo(() => {
    if (!activeChat) return "Someone is typing...";
    return activeChat.type === CHAT_TYPES.DM
      ? `${activeChat.user?.name || "Someone"} is typing...`
      : "A room member is typing...";
  }, [activeChat]);

  return {
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
    activeTypingText,

    chatLoading,
    sending,
    composerText,
    selectedFile,

    uiError,
    createRoomLoading,

    setUiError,
    setSelectedFile,

    handleComposerChange,
    handleSelectFile,
    sendMessage,
    openDM,
    openRoom,
    createRoomFromModal,

    updateProfile,
    updateAvatar,
    deleteAccount,

    updateRoomDetails,
    addMembersToRoom,
    removeMemberFromRoom,
    deleteRoomById,
    leaveRoomById
  };
}