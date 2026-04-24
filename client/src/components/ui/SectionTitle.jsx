export default function SectionTitle({ children, action = null }) {
    return (
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/35">{children}</h4>
        {action}
      </div>
    );
  }