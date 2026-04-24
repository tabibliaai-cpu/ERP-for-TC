export type UserRole = 'super_admin' | 'admin' | 'faculty' | 'student' | 'accountant' | 'librarian';

export const ROLE_PERMISSIONS: Record<string, UserRole[]> = {
  'dashboard': ['super_admin', 'admin', 'faculty', 'student', 'accountant', 'librarian'],
  'admissions': ['super_admin', 'admin'],
  'faculty': ['super_admin', 'admin', 'accountant'],
  'students': ['super_admin', 'admin', 'faculty'],
  'courses': ['super_admin', 'admin', 'faculty'],
  'finance': ['super_admin', 'admin', 'accountant'],
  'messaging': ['super_admin', 'admin', 'faculty', 'student', 'accountant', 'librarian'],
  'library': ['super_admin', 'admin', 'librarian'],
  'church': ['super_admin', 'admin', 'faculty', 'student', 'accountant', 'librarian'],
  'classroom': ['super_admin', 'admin', 'faculty'],
  'super-admin': ['super_admin'],
  'settings': ['super_admin', 'admin'],
};

export function hasPermission(role: string | null, feature: string, customPermissions?: string[]): boolean {
  if (!role) return false;
  // Safety hatch for primary developer
  if (role === 'super_admin') return true;
  
  // Check granular custom permissions first
  if (customPermissions && customPermissions.includes(feature)) return true;

  const allowedRoles = ROLE_PERMISSIONS[feature];
  if (!allowedRoles) return false;
  return allowedRoles.includes(role as UserRole);
}
