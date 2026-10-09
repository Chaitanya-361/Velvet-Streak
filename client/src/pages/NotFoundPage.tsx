import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-vs-bg via-vs-surface to-[#E0F2F1] text-vs-text flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in">
      <div className="max-w-md w-full flex flex-col items-center">
        {/* Large Owl Emoji */}
        <div className="text-8xl sm:text-9xl mb-6 animate-float drop-shadow-md">
          🦉
        </div>

        {/* 404 Badge */}
        <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-vs-teal/10 text-vs-teal border border-vs-teal/20 mb-4">
          404 Not Found
        </span>

        {/* Heading */}
        <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-vs-text mb-3">
          Lost in the Night?
        </h1>

        {/* Description */}
        <p className="text-vs-muted text-base sm:text-lg max-w-sm mx-auto mb-8 font-medium">
          Whooops! Looks like this page flew away into the darkness or doesn&apos;t exist.
        </p>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-vs-teal text-white font-bold text-sm shadow-md shadow-vs-teal/20 hover:bg-vs-teal/90 hover:shadow-lg hover:shadow-vs-teal/30 hover:scale-105 active:scale-95 transition-all"
          >
            <Home className="w-4 h-4" />
            Return to Homepage
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-vs-surface border border-vs-border text-vs-muted hover:text-vs-text hover:bg-vs-surface-hover font-bold text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
