import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

export default function GlassButton({
  children,
  className = "",
  variant = "primary",
  loading = false,
  ...props
}) {
  const baseClass = variant === "secondary" ? "glass-btn-secondary" : "glass-btn";

  return (
    <button
      className={cn(
        baseClass,
        "w-full disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}