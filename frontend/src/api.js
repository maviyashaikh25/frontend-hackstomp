const rawApiBaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  'https://backend-hackstomp.onrender.com'

export const API_BASE_URL = String(rawApiBaseUrl).trim().replace(/\/$/, '')

export function apiUrl(path = '') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${normalizedPath}`
}
