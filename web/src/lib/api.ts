const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; error?: any }> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('mc_access_token') : null;

  const headers: HeadersInit = {
    ...(options.headers || {}),
  };

  // If not uploading FormData, default to application/json
  if (!(options.body instanceof FormData)) {
    (headers as any)['Content-Type'] = 'application/json';
  }

  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const result = await response.json().catch(() => ({
      success: response.ok,
      message: response.statusText,
    }));

    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
        // Token expired or invalid
        localStorage.removeItem('mc_access_token');
        localStorage.removeItem('mc_user');
      }
      return {
        success: false,
        message: result.message || 'An error occurred',
        error: result,
      };
    }

    return result;
  } catch (err: any) {
    console.error(`API Error [${endpoint}]:`, err);
    return {
      success: false,
      message: err.message || 'Network request failed. Is the server running?',
      error: err,
    };
  }
}

export const api = {
  get: <T = any>(endpoint: string) => apiRequest<T>(endpoint, { method: 'GET' }),
  post: <T = any>(endpoint: string, body?: any) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: <T = any>(endpoint: string, body?: any) =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  patch: <T = any>(endpoint: string, body?: any) =>
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: <T = any>(endpoint: string) => apiRequest<T>(endpoint, { method: 'DELETE' }),
  
  // Helpers for GridFS file URLs
  getFileStreamUrl: (fileId: string) => `${API_BASE}/files/stream/${fileId}`,
  getFileDownloadUrl: (fileId: string) => `${API_BASE}/files/${fileId}`,
};
