const LOCAL_UPLOAD_ORIGIN_RE = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/i;
const UPLOADS_SEGMENT_RE = /^\/?uploads(?:\/|$)/i;

const ensureUploadsPath = (pathname = '') => {
  if (!pathname) return '/uploads';
  if (UPLOADS_SEGMENT_RE.test(pathname)) {
    return pathname.startsWith('/') ? pathname : `/${pathname}`;
  }
  const clean = pathname.replace(/^\/+/, '');
  return `/uploads/${clean}`;
};

const getApiOrigin = () => {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  if (!apiUrl) return '';
  try {
    return new URL(apiUrl).origin;
  } catch {
    return '';
  }
};

/**
 * Turn backend-relative media paths into absolute URLs on the API host.
 * - "/uploads/..." or "uploads/..." → https://<api-origin>/uploads/...
 * - "http://localhost:5000/uploads/..." on public sites → same path on api origin
 */
export const normalizeAssetUrl = (value) => {
  if (!value || typeof value !== 'string') return value || '';
  const raw = value.trim();
  if (!raw) return '';

  if (/^(https?:|data:|blob:)/i.test(raw)) {
    const apiOrigin = getApiOrigin();
    if (apiOrigin && LOCAL_UPLOAD_ORIGIN_RE.test(raw)) {
      try {
        const url = new URL(raw);
        return `${apiOrigin}${ensureUploadsPath(url.pathname)}${url.search}${url.hash}`;
      } catch {
        return raw.replace(LOCAL_UPLOAD_ORIGIN_RE, apiOrigin);
      }
    }
    return raw;
  }

  if (raw.startsWith('//')) {
    return raw;
  }

  const apiOrigin = getApiOrigin();
  if (!apiOrigin) return raw;

  const path = ensureUploadsPath(raw.replace(/^\.\//, ''));

  return `${apiOrigin}${path}`;
};
