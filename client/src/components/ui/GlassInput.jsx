import { cn } from "../../lib/utils";

export default function GlassInput({ className = "", ...props }) {
  return <input className={cn("glass-input", className)} {...props} />;
}