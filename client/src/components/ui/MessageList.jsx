import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

export default function MessageList({
  messages = [],
  currentUserId,
  loading = false,
  isTyping = false,
  typingText = "Someone is typing..."
}) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (loading) {
    return (
      <div className="glass-panel-strong flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-cyan-400/20 border-t-cyan-400" />
          <p className="mt-4 text-sm text-white/55">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel-strong flex h-full flex-col overflow-hidden">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <h3 className="text-sm font-semibold text-white">No messages yet</h3>
              <p className="mt-2 text-xs leading-6 text-white/45">
                Start the conversation and your messages will appear here.
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message._id || `${message.createdAt}-${Math.random()}`}
              message={message}
              isOwn={message?.sender?._id === currentUserId}
            />
          ))
        )}

        {isTyping ? <TypingIndicator text={typingText} /> : null}

        <div ref={endRef} />
      </div>
    </div>
  );
}