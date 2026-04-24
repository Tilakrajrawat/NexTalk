import { FileText } from "lucide-react";
import UserAvatar from "./UserAvatar";
import { formatMessageTime } from "../../lib/utils";

export default function MessageBubble({ message, isOwn = false }) {
  const sender = message?.sender;
  const hasFile = Boolean(message?.fileUrl);
  const isImage = message?.fileType?.startsWith("image/");

  return (
    <div className={`flex gap-3 ${isOwn ? "justify-end" : "justify-start"}`}>
      {!isOwn ? <UserAvatar user={sender} size="sm" /> : null}

      <div className={`max-w-[80%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        {!isOwn ? (
          <span className="mb-1 px-1 text-[11px] font-medium text-white/35">
            {sender?.name || "Unknown"}
          </span>
        ) : null}

        <div
          className={`rounded-3xl border px-4 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.35)] ${
            isOwn
              ? "border-cyan-400/15 bg-cyan-400/10 text-white"
              : "border-white/8 bg-white/[0.04] text-white/90"
          }`}
        >
          {hasFile ? (
            <div className="mb-3">
              {isImage ? (
                <a
                  href={message.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block overflow-hidden rounded-2xl border border-white/8"
                >
                  <img
                    src={message.fileUrl}
                    alt="attachment"
                    className="max-h-80 w-full object-cover"
                  />
                </a>
              ) : (
                <a
                  href={message.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/20 px-3 py-3 transition hover:bg-black/30"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03]">
                    <FileText className="h-5 w-5 text-cyan-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Open attachment</p>
                    <p className="text-xs text-white/45">{message.fileType || "File"}</p>
                  </div>
                </a>
              )}
            </div>
          ) : null}

          {message?.content ? (
            <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.content}</p>
          ) : null}
        </div>

        <span className="mt-1 px-1 text-[11px] text-white/30">
          {formatMessageTime(message?.createdAt)}
        </span>
      </div>
    </div>
  );
}