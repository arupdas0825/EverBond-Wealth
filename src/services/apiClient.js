/**
 * apiClient.js
 * Authenticated API client for EverBond Wealth backend.
 * Automatically retrieves the Firebase ID token from the authenticated user
 * and attaches `Authorization: Bearer <TOKEN>` to all requests.
 * 
 * Never trusts client identity — backend verifies all tokens via Firebase Admin SDK.
 */

import { auth } from '../utils/firebase';

const BASE_URL = ''; // Proxied via Vite to http://localhost:5000 in dev

async function getAuthHeader() {
  const currentUser = auth?.currentUser;
  if (!currentUser) {
    return {};
  }
  try {
    const token = await currentUser.getIdToken(false);
    return {
      Authorization: `Bearer ${token}`,
    };
  } catch (err) {
    console.error('[apiClient] Error obtaining Firebase ID token:', err);
    return {};
  }
}

export async function apiGet(endpoint, options = {}) {
  const authHeaders = await getAuthHeader();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || 15000);

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const errorMsg = data.error || data.message || (res.status === 502 ? 'Backend service unavailable (port 5000 unreachable)' : `Request failed with status ${res.status}`);
      const error = new Error(errorMsg);
      error.code = data.error || (res.status === 502 ? 'BACKEND_UNAVAILABLE' : `HTTP_${res.status}`);
      error.status = res.status;
      throw error;
    }
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const timeoutErr = new Error('Request timed out. Please check your connection and retry.');
      timeoutErr.code = 'TIMEOUT';
      throw timeoutErr;
    }
    throw err;
  }
}

export async function apiPost(endpoint, body = {}, options = {}) {
  const authHeaders = await getAuthHeader();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || 15000);

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const errorMsg = data.error || data.message || (res.status === 502 ? 'Backend service unavailable (port 5000 unreachable)' : `Request failed with status ${res.status}`);
      const error = new Error(errorMsg);
      error.code = data.error || (res.status === 502 ? 'BACKEND_UNAVAILABLE' : `HTTP_${res.status}`);
      error.status = res.status;
      throw error;
    }
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const timeoutErr = new Error('Request timed out. Please check your connection and retry.');
      timeoutErr.code = 'TIMEOUT';
      throw timeoutErr;
    }
    throw err;
  }
}
