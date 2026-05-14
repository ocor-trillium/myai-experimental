import { NavLink, Outlet } from 'react-router-dom';

const navLinkBase =
  'rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950';
const navLinkInactive = 'text-slate-300 hover:bg-white/5 hover:text-white';
const navLinkActive = 'bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-md';

const navItems: { to: string; label: string; end: boolean }[] = [
  { to: '/', label: 'Home', end: true },
  { to: '/experiments', label: 'Experiments', end: false },
  { to: '/about', label: 'About', end: false },
];

function Layout() {
  return (
    <div className="flex h-full w-full flex-col">
      <header className="flex w-full shrink-0 items-center justify-between gap-4 border-b border-white/5 bg-white/[0.02] px-[clamp(1rem,4vw,2.5rem)] py-3 backdrop-blur">
        <NavLink
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-white"
        >
          <span className="inline-flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 text-xs font-bold">
            T
          </span>
          Trillium · MyAI
        </NavLink>
        <nav aria-label="Main navigation" className="flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="min-h-0 w-full flex-1 overflow-auto px-[clamp(1.5rem,4vw,3rem)] py-[clamp(1.5rem,3vw,2.5rem)]">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
