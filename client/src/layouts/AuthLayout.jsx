export default function AuthLayout({ children, title, subtitle }) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
        <div className="pointer-events-none absolute inset-0 bg-radial-cyan" />
        <div className="pointer-events-none absolute inset-0 bg-hero-grid bg-[size:42px_42px] opacity-[0.04]" />
  
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center gap-10 lg:grid lg:grid-cols-2">
          <div className="hidden lg:block">
            <div className="glass-panel-strong surface-highlight relative overflow-hidden p-10">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
              <div className="space-y-6">
                <div className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
                  Premium Realtime Messaging
                </div>
  
                <h1 className="text-5xl font-semibold leading-tight text-white">
                  Welcome to <span className="text-gradient-cyan">NexTalk</span>
                </h1>
  
                <p className="max-w-xl text-base leading-7 text-white/60">
                  Futuristic real-time messaging with glossy dark glass panels, instant presence, private
                  conversations, multi-user rooms, and a premium black mirror interface.
                </p>
  
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    "Realtime DMs",
                    "Typing Indicators",
                    "Presence Tracking",
                    "Room Conversations"
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/80 shadow-inner-glass"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
  
          <div className="w-full max-w-md">
            <div className="mb-6 space-y-2 text-center lg:text-left">
              <h2 className="text-3xl font-semibold tracking-tight text-white">{title}</h2>
              <p className="text-sm text-white/50">{subtitle}</p>
            </div>
  
            {children}
          </div>
        </div>
      </div>
    );
  }