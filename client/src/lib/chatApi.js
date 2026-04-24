import api from "./api";

const unwrap = (response) => response?.data?.data;

const chatApi = {
  // users
  searchUsers: async (query = "", limit = 20) => {
    const response = await api.get(`/users?q=${encodeURIComponent(query)}&limit=${limit}`);
    return unwrap(response) || [];
  },

  getMyProfile: async () => {
    const response = await api.get("/users/me/profile");
    return unwrap(response);
  },

  updateMyProfile: async (payload) => {
    const response = await api.patch("/users/me/profile", payload);
    return unwrap(response);
  },

  updateMyAvatar: async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await api.patch("/users/me/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    return unwrap(response);
  },

  deleteMyAccount: async () => {
    const response = await api.delete("/users/me");
    return unwrap(response);
  },

  // rooms
  getRooms: async () => {
    const response = await api.get("/rooms");
    return unwrap(response) || [];
  },

  createRoom: async (payload) => {
    const response = await api.post("/rooms", payload);
    return unwrap(response);
  },

  updateRoom: async (roomId, payload) => {
    const response = await api.patch(`/rooms/${roomId}`, payload);
    return unwrap(response);
  },

  addRoomMembers: async (roomId, memberIds) => {
    const response = await api.post(`/rooms/${roomId}/members`, { memberIds });
    return unwrap(response);
  },

  removeRoomMember: async (roomId, memberId) => {
    const response = await api.delete(`/rooms/${roomId}/members/${memberId}`);
    return unwrap(response);
  },

  deleteRoom: async (roomId) => {
    const response = await api.delete(`/rooms/${roomId}`);
    return unwrap(response);
  },

  leaveRoom: async (roomId) => {
    const response = await api.post(`/rooms/${roomId}/leave`);
    return unwrap(response);
  },

  // messages
  getDMThreads: async () => {
    const response = await api.get("/messages/threads");
    return unwrap(response) || [];
  },

  getDMMessages: async (userId, limit = 100) => {
    const response = await api.get(`/messages/dm/${userId}?limit=${limit}`);
    return unwrap(response) || [];
  },

  getRoomMessages: async (roomId, limit = 100) => {
    const response = await api.get(`/messages/room/${roomId}?limit=${limit}`);
    return unwrap(response) || [];
  },

  // upload
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    return unwrap(response);
  }
};

export default chatApi;