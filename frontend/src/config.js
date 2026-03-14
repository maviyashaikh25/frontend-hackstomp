/**
 * Base URL for the Sarvam TeleHealth / speech-recognition video call app.
 * Set VITE_TELEHEALTH_URL in .env (e.g. http://localhost:3000) to override.
 */
export const TELEHEALTH_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_TELEHEALTH_URL) ||
  'http://localhost:3000'

function getSafeBaseUrl() {
  return String(TELEHEALTH_BASE_URL || '').trim().replace(/\/$/, '')
}

function buildRoomUrl(requestId, role, userName) {
  const base = getSafeBaseUrl()
  const room = encodeURIComponent(String(requestId || ''))
  const name = encodeURIComponent(String(userName || '').trim() || (role === 'doctor' ? 'Doctor' : 'ASHA Worker'))

  // Keep both userName and username for compatibility with telehealth variants.
  return `${base}/room/${room}?role=${encodeURIComponent(role)}&userName=${name}&username=${name}`
}

/**
 * Doctor-only link: opens Sarvam TeleHealth as "Join as Doctor" (role=doctor).
 * Used only when the doctor clicks Accept Call — same speech-to-text / live preview as in speech-recognition.
 */
export function getTelehealthDoctorRoomUrl(requestId, doctorName) {
  return buildRoomUrl(requestId, 'doctor', doctorName || 'Doctor')
}

/**
 * ASHA / patient-only link: opens Sarvam TeleHealth as "Join as Patient" (role=patient).
 * Prefer using invite_link from API (GET video-call-requests/worker/...) when available — that is the link sent as response to Arogya Sethu when the doctor accepts.
 */
export function getTelehealthPatientRoomUrl(requestId, userName) {
  return buildRoomUrl(requestId, 'patient', userName || 'ASHA Worker')
}
