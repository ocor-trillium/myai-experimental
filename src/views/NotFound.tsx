import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center gap-4 text-center">
      <p className="text-6xl font-bold text-slate-300">404</p>
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-slate-400">The route you tried to open does not exist.</p>
      <Link
        to="/"
        className="rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 px-5 py-2 font-semibold text-white shadow-md transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      >
        Back to home
      </Link>
    </div>
  );
}

export default NotFound;
