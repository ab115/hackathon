/**
 * Centralized API Service Layer
 * ─────────────────────────────
 * Self-contained axios instance — no external initialisation needed.
 * Interceptors handle auth token injection and 401 logout globally.
 */

import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// ──────────────────────────────────────────────
// Axios Instance (singleton)
// ──────────────────────────────────────────────

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Inject auth token on every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — clear token and dispatch event
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(error);
  }
);

// ──────────────────────────────────────────────
// Error type
// ──────────────────────────────────────────────

export interface ApiError {
  status: number;
  message: string;
  detail?: string;
  errors?: Record<string, string[]>;
}

function handleApiError(error: AxiosError): ApiError {
  if (!error.response) {
    return { status: 0, message: 'Network error. Please check your connection.', detail: error.message };
  }
  const { status, data } = error.response as any;

  if (status === 403) return { status, message: 'You do not have permission to perform this action.' };
  if (status === 404) return { status, message: 'Resource not found.' };
  if (status === 409) return { status, message: (data as any)?.detail || 'Conflict detected.' };
  if (status === 422) {
    // Pydantic returns detail as an array of {loc, msg, type} objects
    const detail = (data as any)?.detail;
    let message = 'Validation error. Please check your input.';
    if (Array.isArray(detail) && detail.length > 0) {
      // Surface the first meaningful message, stripping the field location prefix
      const first = detail[0];
      const field = Array.isArray(first.loc) ? first.loc[first.loc.length - 1] : '';
      message = field && field !== 'body'
        ? `${field}: ${first.msg}`
        : first.msg || message;
    } else if (typeof detail === 'string') {
      message = detail;
    }
    return { status, message, errors: detail };
  }
  if (status >= 500) return { status, message: 'Server error. Please try again later.', detail: (data as any)?.detail };

  return { status, message: (data as any)?.detail || 'An error occurred.', detail: JSON.stringify(data) };
}

async function request<T = any>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT',
  endpoint: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const response = await apiClient({ method, url: endpoint, data, ...config });
    return response.data;
  } catch (error) {
    throw handleApiError(error as AxiosError);
  }
}

// ──────────────────────────────────────────────
// Auth API
// ──────────────────────────────────────────────

export const authAPI = {
  register: (data: {
    email: string; password: string; full_name: string;
    role: 'STUDENT' | 'ADMIN' | 'JUDGE' | 'MENTOR';
    phone?: string; college?: string; city?: string; state?: string;
  }) => request('POST', '/auth/register', data),

  login: (email: string, password: string) =>
    request<{ access_token: string; token_type: string }>('POST', '/auth/login', { email, password }),

  refresh: () => request<{ access_token: string; token_type: string }>('POST', '/auth/refresh'),

  logout: () => {
    localStorage.removeItem('auth_token');
    return Promise.resolve();
  },

  forgotPassword: (email: string) => request('POST', '/auth/forgot-password', { email }),
};

// ──────────────────────────────────────────────
// User API
// ──────────────────────────────────────────────

export const userAPI = {
  getCurrentUser: () => request('GET', '/users/me'),

  updateProfile: (data: {
    full_name?: string; bio?: string; phone?: string;
    college?: string; city?: string; state?: string;
    skills?: string; interests?: string;
  }) => request('PATCH', '/users/me', data),

  getRecommendations: () => request('GET', '/users/me/recommendations'),

  getProfile: (userId: string | number) => request('GET', `/users/${userId}`),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('POST', '/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ──────────────────────────────────────────────
// Hackathon API
// ──────────────────────────────────────────────

export const hackathonAPI = {
  list: (params?: { skip?: number; limit?: number; status?: string; include_private?: boolean }) =>
    request('GET', '/hackathons', undefined, { params }),

  getById: (id: number) => request('GET', `/hackathons/${id}`),

  create: (data: {
    title: string; description: string; start_date: string; end_date: string;
    registration_start: string; registration_end: string;
    registration_fee: number; prize_pool: number; team_size: number;
    category?: string; problem_statement?: string; problem_statement_file?: string; rules?: string; timeline?: string;
    banner_image?: string;
  }) => request('POST', '/hackathons', data),

  uploadBanner: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('POST', '/hackathons/upload-banner', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  uploadProblemStatement: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('POST', '/hackathons/upload-problem-statement', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  update: (id: number, data: Partial<{ 
    title: string; description: string; status: string; prize_pool: number;
    category: string; start_date: string; end_date: string;
    registration_start: string; registration_end: string;
    registration_fee: number; max_teams: number; team_size: number;
    is_public: boolean; banner_image: string; problem_statement_file: string;
  }>) =>
    request('PATCH', `/hackathons/${id}`, data),

  delete: (id: number) => request('DELETE', `/hackathons/${id}`),

  registerFree: (hackathonId: number) =>
    request('POST', `/hackathons/${hackathonId}/register`),

  getMyRegistrations: () =>
    request<any[]>('GET', '/hackathons/my-registrations'),

  getRegistrations: (hackathonId: number) =>
    request<{ hackathon_id: number; total: number; registrations: any[] }>('GET', `/hackathons/${hackathonId}/registrations`),
};

// ──────────────────────────────────────────────
// Payment API
// ──────────────────────────────────────────────

export const paymentAPI = {
  initiatePayment: (data: { hackathon_id?: number; mentor_id?: number; amount: number; email: string; phone: string }) =>
    request<{
      transaction_id: string; registration_id?: number; booking_id?: number;
      amount_details: {
        base_amount: number; base_formatted: string;
        gst_rate: number; gst_amount: number; gst_formatted: string;
        total: number; total_formatted: string; currency: string;
      };
      payu: { key: string; txnid: string; amount: string; productinfo: string; hash: string; action: string };
    }>('POST', '/payments/initiate', data),

  simulatePayment: (data: { registration_id?: number; booking_id?: number; status: 'success' | 'failure' }) =>
    request<{ status: string; payment_status: string; transaction_id: string }>('POST', '/payments/simulate', data),

  verifyPayment: (data: { txnid: string; status: string; amount?: number }) =>
    request('POST', '/payments/verify', data),

  getPaymentStatus: (txnId: string) => request('GET', `/payments/status/${txnId}`),

  generateHash: (data: { amount: number; productinfo: string; firstname: string; email: string }) =>
    request('POST', '/payments/hash', data),
};

// ──────────────────────────────────────────────
// Submission API
// ──────────────────────────────────────────────

export const submissionAPI = {
  create: (data: {
    hackathon_id: number; team_id: number; title: string; description: string;
    repo_url: string; demo_url?: string; tech_stack?: string;
  }) => request('POST', '/submissions', data),

  getMySubmissions: () => request('GET', '/submissions/my'),

  getByHackathon: (hackathonId: number) => request('GET', `/submissions/hackathon/${hackathonId}`),

  getById: (id: number) => request('GET', `/submissions/${id}`),

  update: (id: number, data: Partial<{ title: string; description: string; repo_url: string; demo_url: string }>) =>
    request('PATCH', `/submissions/${id}`, data),

  getLeaderboard: (hackathonId: number) => request('GET', `/submissions/leaderboard/${hackathonId}`),

  scoreSubmission: (id: number, score: number, judge_feedback: string) =>
    request('PATCH', `/submissions/${id}`, { score, judge_feedback }),

  getHackathonSubmissions: (hackathonId: number) => request('GET', `/submissions/hackathon/${hackathonId}`),
};

// ──────────────────────────────────────────────
// Team API
// ──────────────────────────────────────────────

export const teamAPI = {
  listMyTeams: () => request('GET', '/teams'),
  createTeam: (data: { hackathon_id: number; name: string; description?: string }) => request('POST', '/teams', data),
  updateTeam: (teamId: number, data: { name?: string }) => request('PUT', `/teams/${teamId}`, data),
  deleteTeam: (teamId: number) => request('DELETE', `/teams/${teamId}`),
  removeMember: (teamId: number, userId: number) => request('DELETE', `/teams/${teamId}/members/${userId}`),
  listInvitations: () => request('GET', '/teams/invitations'),
  inviteUser: (teamId: number, inviteeId: number) => request('POST', `/teams/${teamId}/invite?invitee_id=${inviteeId}`),
  acceptInvitation: (memberId: number) => request('POST', `/teams/invitations/${memberId}/accept`),
  rejectInvitation: (memberId: number) => request('POST', `/teams/invitations/${memberId}/reject`),
};

// ──────────────────────────────────────────────
// Admin API
// ──────────────────────────────────────────────

export const adminAPI = {
  getStats: () => request('GET', '/admin/stats'),

  // User management
  listUsers: (params?: { skip?: number; limit?: number; search?: string; role?: string; is_active?: boolean }) =>
    request<{ total: number; skip: number; limit: number; users: any[] }>('GET', '/admin/users', undefined, { params }),

  createUser: (data: any) =>
    request('POST', '/admin/users', data),

  updateUser: (userId: number, data: { role?: string; is_active?: boolean; full_name?: string }) =>
    request('PATCH', `/admin/users/${userId}`, data),

  deactivateUser: (userId: number) =>
    request('DELETE', `/admin/users/${userId}`),

  bulkImportUsers: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<{ message: string; created: string[]; skipped: string[]; errors: any[] }>(
      'POST', '/admin/users/bulk-import', formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },
};

// ──────────────────────────────────────────────
// Resources API
// ──────────────────────────────────────────────

export const resourcesAPI = {
  list: (type?: string) => request('GET', type ? `/resources?type=${type}` : '/resources'),
  getById: (id: number) => request('GET', `/resources/${id}`),
  create: (data: any) => request('POST', '/resources', data),
  update: (id: number, data: any) => request('PATCH', `/resources/${id}`, data),
  delete: (id: number) => request('DELETE', `/resources/${id}`),
};

// ──────────────────────────────────────────────
// Mentors API
// ──────────────────────────────────────────────

export const mentorsAPI = {
  list: () => request('GET', '/mentors'),
  getById: (id: number) => request('GET', `/mentors/${id}`),
  create: (data: any) => request('POST', '/mentors', data),
  update: (id: number, data: any) => request('PATCH', `/mentors/${id}`, data),
  delete: (id: number) => request('DELETE', `/mentors/${id}`),
  
  getMyBookings: () => request('GET', '/mentors/bookings/my'),
};

export const isSuccess = (error: any): boolean => !error || error.status < 400;
