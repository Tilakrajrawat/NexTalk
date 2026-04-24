import { ImagePlus, Paperclip, SendHorizontal } from "lucide-react";
import { cn } from "../../lib/utils";

export default function Composer({
  value,
  onChange,
  onSubmit,
  onAttach,
  disabled = false,
  placeholder = "Write a message...",
  className = ""
}) {
  return (
    <form
      onSubmit={onSubmit}
      className={cn("glass-panel flex items-end gap-3 p-3", className)}
    >
      <button
        type="button"
        onClick={onAttach}
        disabled={disabled}
        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-white/70 transition hover:border-cyan-400/20 hover:bg-white/[0.05] hover:text-cyan-300 disabled:opacity-50"
      >
        <Paperclip className="h-5 w-5" />
      </button>

      <div className="relative flex-1">
        <textarea
          rows={1}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className="glass-input max-h-40 min-h-[52px] resize-none pr-12"
        />
        <ImagePlus className="pointer-events-none absolute right-4 top-4 h-4 w-4 text-white/25" />
      </div>

      <button
        type="submit"
        disabled={disabled}
        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300 transition hover:border-cyan-400/35 hover:bg-cyan-400/15 hover:shadow-glow-cyan disabled:opacity-50"
      >
        <SendHorizontal className="h-5 w-5" />
      </button>
    </form>
  );
}