import { useEffect, useState } from 'react'
import { getOfflineStatus, subscribeOfflineStatus } from '../offlineFirst'

export default function OfflineStatusBadge({ className = '', autoHideMs = 12000 }) {
  const [status, setStatus] = useState(getOfflineStatus())
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    return subscribeOfflineStatus(setStatus)
  }, [])

  useEffect(() => {
    setVisible(true)
    const timer = window.setTimeout(() => setVisible(false), autoHideMs)
    return () => window.clearTimeout(timer)
  }, [status.online, status.syncing, status.queueSize, autoHideMs])

  let label = 'Online'
  let tone = 'ok'

  if (!status.online) {
    label = status.queueSize > 0 ? `Offline • queued ${status.queueSize}` : 'Offline'
    tone = 'offline'
  } else if (status.syncing) {
    label = status.queueSize > 0 ? `Syncing ${status.queueSize}` : 'Syncing'
    tone = 'syncing'
  } else if (status.queueSize > 0) {
    label = `Queued ${status.queueSize}`
    tone = 'queued'
  }

  if (!visible) return null

  return (
    <div className={`offline-badge offline-badge--${tone} ${className}`.trim()} title="Offline first sync status">
      <span className="offline-badge__dot" />
      <span>{label}</span>
    </div>
  )
}
