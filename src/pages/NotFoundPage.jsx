import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center">
      <div className="glass-panel border border-[#A0B1DC]/15 rounded-3xl p-10 sm:p-14 max-w-lg mx-auto shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#7951C8]/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative">
          <span className="inline-block px-3.5 py-1 bg-[#C04BAA]/15 text-[#E05BBE] text-xs font-mono font-semibold rounded-full border border-[#C04BAA]/30 mb-4 tracking-wider">
            404 // UNRESOLVED ROUTE
          </span>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight mb-3">
            Page Not Found
          </h1>
          <p className="text-[#A5B1CA] text-sm mb-8 leading-relaxed">
            The requested route does not exist. React Router has caught this unmatched navigation path.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#2855D9] via-[#7951C8] to-[#C04BAA] hover:brightness-110 shadow-lg shadow-[#7951C8]/25 transition-all"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
