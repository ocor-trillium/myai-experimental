import { createContext } from 'react';

import type { Role } from '@/types/domain';

export type RoleContextValue = {
  role: Role;
  setRole: (next: Role) => void;
};

export const RoleContext = createContext<RoleContextValue | null>(null);
