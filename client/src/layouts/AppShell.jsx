export default function AppShell({ children }) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-transparent">
        <div className="pointer-events-none absolute inset-0 bg-radial-cyan" />
        <div className="pointer-events-none absolute inset-0 bg-hero-grid bg-[size:40px_40px] opacity-[0.03]" />
  
        <div className="relative z-10 h-screen p-3 sm:p-4 lg:p-5">{children}</div>
      </div>
    );
  }