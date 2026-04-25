// API client for CovenantERP backend

const API_BASE = '/api';

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    displayName: string;
    role: 'super_admin' | 'institution_admin';
    institutionId?: string;
    tenantDbName?: string;
    institution?: {
      id: string;
      name: string;
      display_name: string;
      tenant_db_name: string;
      plan: string;
      primary_color: string;
      secondary_color: string;
    };
  };
}

// Get stored auth token
export function getToken(): string | null {
  try {
    return localStorage.getItem('covenantERP_token');
  } catch { return null; }
}

// Store auth data
export function setAuthData(data: AuthResponse) {
  try {
    localStorage.setItem('covenantERP_token', data.token);
    localStorage.setItem('covenantERP_user', JSON.stringify(data.user));
  } catch {}
}

// Clear auth data
export function clearAuthData() {
  try {
    localStorage.removeItem('covenantERP_token');
    localStorage.removeItem('covenantERP_user');
  } catch {}
}

// Generic fetch wrapper with auth
async function apiFetch(path: string, options: RequestInit = {}): Promise<any> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  
  if (res.status === 401) {
    clearAuthData();
    window.location.hash = '/';
    throw new Error('Session expired');
  }
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ── AUTH ──────────────────────────────────────
export async function login(email: string, password: string, role: string) {
  return apiFetch('/platform/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, role }),
  });
}

export async function getCurrentUser() {
  return apiFetch('/platform/auth/me');
}

// ── PLATFORM (Super Admin) ───────────────────
export async function getInstitutions() {
  return apiFetch('/platform/institutions');
}

export async function createInstitution(data: any) {
  return apiFetch('/platform/institutions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getGlobalUsers() {
  return apiFetch('/platform/users');
}

export async function getPlatformStats() {
  return apiFetch('/platform/stats');
}

export async function getAuditLogs() {
  return apiFetch('/platform/audit-logs');
}

export async function getFeatureFlags(institutionId: string) {
  return apiFetch(`/platform/features/${institutionId}`);
}

// ── TENANT (Admin) ───────────────────────────
export async function getStudents(params?: { search?: string; status?: string; page?: number }) {
  const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
  return apiFetch(`/tenant/students${query}`);
}

export async function createStudent(data: any) {
  return apiFetch('/tenant/students', { method: 'POST', body: JSON.stringify(data) });
}

export async function getStudent(id: string) {
  return apiFetch(`/tenant/students/${id}`);
}

export async function updateStudent(id: string, data: any) {
  return apiFetch(`/tenant/students/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function getTeachers() {
  return apiFetch('/tenant/teachers');
}

export async function createTeacher(data: any) {
  return apiFetch('/tenant/teachers', { method: 'POST', body: JSON.stringify(data) });
}

export async function getTeacher(id: string) {
  return apiFetch(`/tenant/teachers/${id}`);
}

export async function getPrograms() {
  return apiFetch('/tenant/programs');
}

export async function createProgram(data: any) {
  return apiFetch('/tenant/programs', { method: 'POST', body: JSON.stringify(data) });
}

export async function getCourses() {
  return apiFetch('/tenant/courses');
}

export async function createCourse(data: any) {
  return apiFetch('/tenant/courses', { method: 'POST', body: JSON.stringify(data) });
}

export async function getFeeStructures() {
  return apiFetch('/tenant/fee-structures');
}

export async function getPayments() {
  return apiFetch('/tenant/payments');
}

export async function createPayment(data: any) {
  return apiFetch('/tenant/payments', { method: 'POST', body: JSON.stringify(data) });
}

export async function getGrades() {
  return apiFetch('/tenant/grades');
}

export async function getManuscripts(params?: { category?: string; search?: string }) {
  const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
  return apiFetch(`/tenant/manuscripts${query}`);
}

export async function createManuscript(data: any) {
  return apiFetch('/tenant/manuscripts', { method: 'POST', body: JSON.stringify(data) });
}

export async function getLessonPlans() {
  return apiFetch('/tenant/lesson-plans');
}

export async function getAttendance(params?: { date?: string; courseId?: string }) {
  const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
  return apiFetch(`/tenant/attendance${query}`);
}

export async function getDashboardStats() {
  return apiFetch('/tenant/dashboard/stats');
}

// ── PROFILE (Admin) ───────────────────────────
export async function updateProfile(data: {
  fullName?: string;
  displayName?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  churchName?: string;
  pastorName?: string;
  yearsInMinistry?: string;
  statementOfFaith?: string;
}) {
  return apiFetch('/platform/auth/profile', { method: 'PUT', body: JSON.stringify(data) });
}

export async function changePassword(currentPassword: string, newPassword: string) {
  return apiFetch('/platform/auth/password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

// ── PLATFORM (Super Admin) — Additional ─────────
export async function getInstitution(id: string) {
  return apiFetch(`/platform/institutions/${id}`);
}

export async function updateInstitution(id: string, data: any) {
  return apiFetch(`/platform/institutions/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteInstitution(id: string) {
  return apiFetch(`/platform/institutions/${id}`, { method: 'DELETE' });
}

export async function updateUserStatus(userId: string, status: string) {
  return apiFetch(`/platform/users/${userId}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
}

export async function getPlatformSettings() {
  return apiFetch('/platform/settings');
}

export async function updatePlatformSetting(key: string, value: string, description?: string) {
  return apiFetch('/platform/settings', { method: 'PUT', body: JSON.stringify({ key, value, description }) });
}

// ── TENANT (Admin) — Additional ───────────────
export async function updateTeacher(id: string, data: any) {
  return apiFetch(`/tenant/teachers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteStudent(id: string) {
  return apiFetch(`/tenant/students/${id}`, { method: 'DELETE' });
}

export async function getRecentStudents() {
  return apiFetch('/tenant/students/recent');
}
