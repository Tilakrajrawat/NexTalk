import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import api from "../lib/api";
import {
  clearAuthStorage,
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser
} from "../lib/auth";
import socketService from "../lib/socket";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const initializedRef = useRef(false);

  const [token, setToken] = useState(getStoredToken());
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(true);

  const syncMe = async () => {
    const existingToken = getStoredToken();

    if (!existingToken) {
      setLoading(false);
      return null;
    }

    try {
      const response = await api.get("/auth/me");
      const me = response.data?.data?.user;

      if (!me) {
        throw new Error("Failed to fetch current user");
      }

      setToken(existingToken);
      setUser(me);
      setStoredUser(me);

      socketService.connect(existingToken);

      return me;
    } catch (error) {
      clearAuthStorage();
      socketService.disconnect();
      setToken("");
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    syncMe();
  }, []);

  const login = ({ token: nextToken, user: nextUser }) => {
    setStoredToken(nextToken);
    setStoredUser(nextUser);

    setToken(nextToken);
    setUser(nextUser);

    socketService.connect(nextToken);
  };

  const logout = () => {
    clearAuthStorage();
    socketService.disconnect();

    setToken("");
    setUser(null);
  };

  const updateUser = (nextUser) => {
    setUser(nextUser);
    setStoredUser(nextUser);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      loading,
      login,
      logout,
      updateUser,
      refreshMe: syncMe
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};