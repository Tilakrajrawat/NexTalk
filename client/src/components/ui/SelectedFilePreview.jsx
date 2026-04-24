import { FileText, X } from "lucide-react";

export default function SelectedFilePreview({ file, onRemove }) {
  if (!file) return null;

  const isImage = file.type?.startsWith("image/");

  return (
    <div className="glass-panel mb-3 flex items-center gap-3 p-3">
      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03]">
        {isImage ? (
          <img
            src={URL.createObjectURL(file)}
            alt={file.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <FileText className="h-5 w-5 text-cyan-300" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{file.name}</p>
        <p className="text-xs text-white/45">{Math.ceil(file.size / 1024)} KB</p>
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="rounded-xl border border-white/8 bg-white/[0.03] p-2 text-white/60 transition hover:bg-white/[0.05]"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}