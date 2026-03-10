/**
 * Auth helpers — token & user from localStorage (no React Context).
 * Same pattern as Courses_platform: guard by token + role from JWT.
 */
import { User } from '../models/User.js';

const TOKEN_KEY = 'asyad_token';
const USER_KEY = 'asyad_user';

export function getToken() {
  const raw = localStorage.getItem(TOKEN_KEY);
  if (!raw) return null;
  try {
    return typeof raw === 'string' && raw.startsWith('"') ? JSON.parse(raw) : raw;
  } catch {
    return raw;
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return new User(JSON.parse(raw));
  } catch {
    return null;
  }
}

/** Prefer stored user id, then id from JWT (so My Payments works even if getMe didn't return _id). */
export function getCurrentUserId() {
  const user = getStoredUser();
  const fromUser = user?.id ?? user?._id ?? null;
  if (fromUser) return fromUser;
  return getUserIdFromToken();
}

/** Decode JWT payload (no verification; used for id/role from our own token). */
function decodeTokenPayload() {
  const token = getToken();
  if (!token) return null;
  const str = typeof token === 'string' ? token : (token?.token ?? '');
  try {
    const base64Url = str.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/** User id from JWT (common claims: sub, id, userId, _id). */
export function getUserIdFromToken() {
  const payload = decodeTokenPayload();
  if (!payload) return null;
  return payload.id ?? payload.userId ?? payload.sub ?? payload._id ?? null;
}

export function getRole() {
  const payload = decodeTokenPayload();
  return payload?.role ?? null;
}

export function isAuthenticated() {
  return !!getToken();
}

export function isAdmin() {
  const r = getRole();
  return r != null && String(r).toLowerCase() === 'admin';
}
