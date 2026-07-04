import { Outlet } from 'react-router-dom';
import { Feather } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-vs-bg flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-vs-teal/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-vs-feather/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-vs-teal/3 blur-3xl" />
      </div>

      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 animate-fade-in relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-vs-teal flex items-center justify-center shadow-md shadow-vs-teal/20">
          <Feather className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-heading font-bold text-2xl text-vs-text">Velvet Streak</h1>
          <p className="text-sm font-medium text-vs-muted">Keep track of your streaks</p>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="rounded-2xl bg-vs-surface border border-vs-border shadow-xl p-8">
          <Outlet />
        </div>
      </div>

      {/* Footer */}
      <p className="mt-8 text-xs font-semibold text-vs-muted/60 relative z-10">
        © 2026 Velvet Streak · Built with 🦚
      </p>
    </div>
  );
}
