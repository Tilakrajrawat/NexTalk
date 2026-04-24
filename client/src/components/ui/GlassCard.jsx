import { cn } from "../../lib/utils";

export default function GlassCard({ children, className = "" }) {
  return <div className={cn("glass-panel surface-highlight relative overflow-hidden", className)}>{children}</div>;
}