const API_BASE = import.meta.env.VITE_API_URL || '';
const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET || '';

/**
 * Thin fetch wrapper that injects the x-admin-secret header on every request.
 * Use this in all admin tab components instead of duplicating headers.
 */
export const adminFetch = (path: string, init?: RequestInit): Promise<Response> =>
  fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-secret': ADMIN_SECRET,
      ...init?.headers,
    },
  });

/** Shared pagination shape returned by all admin list endpoints. */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  externalReferenceId: string | null;
  createdAt: string;
  _count: { members: number };
}

export interface MemberUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}

export type MemberRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'VIEWER';

export interface Member {
  id: string;
  userId: string;
  organizationId: string;
  role: MemberRole;
  user: MemberUser;
}

export const MEMBER_ROLES: MemberRole[] = ['OWNER', 'ADMIN', 'MANAGER', 'VIEWER'];
