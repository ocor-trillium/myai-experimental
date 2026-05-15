import { useRole } from '@/contexts/useRole';
import type { Role } from '@/types/domain';

const options: { value: Role; label: string }[] = [
  { value: 'employee', label: 'Employee' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Admin' },
];

export function RoleSwitcher() {
  const { role, setRole } = useRole();

  return (
    <label className="flex items-center gap-2 text-xs text-slate-300">
      <span className="font-semibold uppercase tracking-wider">Role</span>
      <select
        value={role}
        onChange={(event) => {
          setRole(event.target.value as Role);
        }}
        className="rounded-md border border-white/10 bg-slate-800/80 px-2 py-1 text-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        aria-label="Switch role"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
