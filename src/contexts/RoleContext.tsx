import { useCallback, useMemo, useState, type ReactNode } from 'react';

import type { Role } from '@/types/domain';

import { RoleContext, type RoleContextValue } from './roleContextValue';

const STORAGE_KEY = 'trillium.role';

function readInitialRole(): Role {
  if (typeof window === 'undefined') return 'employee';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'employee' || stored === 'manager' || stored === 'admin') {
    return stored;
  }
  return 'employee';
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(readInitialRole);

  const setRole = useCallback((next: Role) => {
    setRoleState(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  const value = useMemo<RoleContextValue>(() => ({ role, setRole }), [role, setRole]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}
