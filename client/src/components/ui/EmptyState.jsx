export default function EmptyState({ title, description, action = null }) {
    return (
      <div className="glass-panel-strong flex h-full min-h-[420px] flex-col items-center justify-center px-6 text-center">
        <div className="mb-5 h-16 w-16 rounded-3xl border border-cyan-400/15 bg-cyan-400/10 shadow-glow-cyan" />
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="mt-3 max-w-md text-sm leading-6 text-white/50">{description}</p>
        {action ? <div className="mt-6">{action}</div> : null}
      </div>
    );
  }