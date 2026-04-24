export default function TypingIndicator({ text = "Someone is typing..." }) {
    return (
      <div className="inline-flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-2 text-xs text-white/55">
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-cyan-300" />
          <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-cyan-300 [animation-delay:0.15s]" />
          <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-cyan-300 [animation-delay:0.3s]" />
        </div>
        <span>{text}</span>
      </div>
    );
  }