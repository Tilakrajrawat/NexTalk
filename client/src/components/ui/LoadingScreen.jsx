export default function LoadingScreen() {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="glass-panel-strong flex flex-col items-center gap-4 px-8 py-7">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-cyan-400/20 border-t-cyan-400" />
          <div className="text-center">
            <p className="text-sm font-medium text-white">Loading NexTalk</p>
            <p className="mt-1 text-xs text-white/45">Initializing secure session...</p>
          </div>
        </div>
      </div>
    );
  }