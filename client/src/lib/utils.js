export function cn(...classes) {
    return classes.filter(Boolean).join(" ");
  }
  
  export function getInitials(value = "") {
    const text = String(value).trim();
  
    if (!text) return "N";
  
    const parts = text.split(/\s+/).filter(Boolean);
  
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
  
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  }
  
  export function formatRelativeTime(dateValue) {
    if (!dateValue) return "offline";
  
    const date = new Date(dateValue);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
  
    const sec = Math.floor(diffMs / 1000);
    const min = Math.floor(sec / 60);
    const hr = Math.floor(min / 60);
    const day = Math.floor(hr / 24);
  
    if (sec < 10) return "just now";
    if (sec < 60) return `${sec}s ago`;
    if (min < 60) return `${min}m ago`;
    if (hr < 24) return `${hr}h ago`;
    if (day < 7) return `${day}d ago`;
  
    return date.toLocaleDateString();
  }
  
  export function formatMessageTime(dateValue) {
    if (!dateValue) return "";
  
    const date = new Date(dateValue);
  
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  }
  
  export function dedupeMessages(messages = []) {
    const map = new Map();
  
    messages.forEach((message) => {
      const key =
        message?._id ||
        `${message?.sender?._id || "unknown"}-${message?.receiver?._id || "none"}-${
          message?.room?._id || message?.room || "none"
        }-${message?.createdAt || ""}`;
  
      map.set(key, message);
    });
  
    return Array.from(map.values()).sort((a, b) => {
      const aTime = new Date(a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt || 0).getTime();
  
      if (aTime !== bTime) return aTime - bTime;
  
      const aId = String(a._id || "");
      const bId = String(b._id || "");
  
      return aId.localeCompare(bId);
    });
  }