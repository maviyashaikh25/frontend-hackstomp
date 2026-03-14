import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LogoIcon from '../components/LogoIcon'
import NotificationModal from '../components/NotificationModal'
import { getTelehealthDoctorRoomUrl } from '../config'
import { apiUrl } from '../api'

function formatDateTime(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return value
  }
}

export default function DoctorScheduledMeetingsPage() {
  const doctorName = localStorage.getItem('doctor_name') || 'Doctor'
  const doctorId = localStorage.getItem('doctor_id') || ''
  const navigate = useNavigate()
  const [scheduledMeetings, setScheduledMeetings] = useState([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState({ show: false, title: '', message: '', type: 'success' })

  const fetchScheduledMeetings = async () => {
    setLoading(true)
    try {
      const res = await fetch(apiUrl('/video-call-requests/pending'))
      if (!res.ok) throw new Error('Failed to fetch scheduled meetings')
      const data = await res.json()
      const sorted = (Array.isArray(data) ? data : [])
        .filter((r) => !!r.scheduled_for)
        .sort((a, b) => new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime())
      setScheduledMeetings(sorted)
    } catch (err) {
      console.error(err)
      setScheduledMeetings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchScheduledMeetings()
  }, [])

  const handleRequestVC = async (requestId) => {
    try {
      const res = await fetch(apiUrl(`/video-call-requests/${requestId}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'ACCEPTED',
          doctor_id: doctorId,
        }),
      })
      if (!res.ok) throw new Error('Failed to start video call')
      setNotification({ show: true, title: 'Success', message: 'Video call requested and accepted.', type: 'success' })
      fetchScheduledMeetings()
      const roomUrl = getTelehealthDoctorRoomUrl(requestId, doctorName)
      window.open(roomUrl, 'telehealth-call', 'noopener,noreferrer,width=1200,height=800')
    } catch (err) {
      setNotification({ show: true, title: 'Error', message: err.message, type: 'error' })
    }
  }

  return (
    <>
      <div className="dashboard-layout">
        <aside className="sidebar">
          <Link to="/" className="sidebar-brand" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="logo-icon"><LogoIcon size={38} /></div>
            <span className="logo-text" style={{ fontWeight: 'normal' }}>AROGYA</span>
          </Link>
          <div className="sidebar-profile">
            <div className="sidebar-avatar">DR</div>
            <span style={{ fontSize: '0.95rem', color: 'var(--ink)' }}>{doctorName}</span>
            <br />
            <small>Doctor Portal</small>
          </div>
          <span className="nav-group-label" style={{ fontWeight: 'normal' }}>Main Menu</span>
          <nav className="sidebar-nav">
            <Link to="/doctor-dashboard" style={{ fontWeight: 'normal' }}><span className="material-icons">dashboard</span> Dashboard</Link>
            <Link to="/doctor-dashboard/scheduled-meetings" className="active" style={{ fontWeight: 'normal' }}><span className="material-icons">event</span> Scheduled Meetings</Link>
            <Link to="/doctor-dashboard/patients" style={{ fontWeight: 'normal' }}><span className="material-icons">people</span> My Patients</Link>
            <Link to="/doctor-dashboard/analytics" style={{ fontWeight: 'normal' }}><span className="material-icons">analytics</span> Analytics</Link>
          </nav>
          <span className="nav-group-label" style={{ marginTop: 12, fontWeight: 'normal' }}>Account</span>
          <nav className="sidebar-nav">
            <Link to="/" onClick={() => localStorage.clear()} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 24px', fontSize: '0.88rem', fontWeight: 'normal', color: 'var(--ink-mid)' }}>
              <span className="material-icons" style={{ fontSize: '1.2rem', color: 'var(--ink-light)' }}>logout</span> Logout
            </Link>
          </nav>
        </aside>

        <main className="dashboard-main">
          <div className="dash-top" style={{ marginBottom: 24 }}>
            <div className="dash-greet">
              <h2 style={{ fontWeight: 'normal' }}>Scheduled Meetings</h2>
              <p>All patient meetings with a requested schedule are listed here.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button type="button" onClick={fetchScheduledMeetings} className="btn btn-outline" style={{ padding: '10px 18px', fontSize: '0.85rem' }}>
                <span className="material-icons" style={{ fontSize: '1.1rem', verticalAlign: 'middle', marginRight: 6 }}>refresh</span> Refresh
              </button>
              <Link to="/doctor-dashboard" className="btn btn-outline" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                <span className="material-icons" style={{ fontSize: '1.1rem' }}>arrow_back</span> Back to Dashboard
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="dash-card">
              <p style={{ padding: 24, margin: 0, color: 'var(--ink-mid)' }}>Loading scheduled meetings…</p>
            </div>
          ) : scheduledMeetings.length === 0 ? (
            <div className="dash-card">
              <p style={{ padding: 24, margin: 0, color: 'var(--ink-light)' }}>No scheduled meetings right now.</p>
            </div>
          ) : (
            <div className="dash-card vc-requests-card">
              <div className="dash-card-header">
                <h3 style={{ fontWeight: 'normal', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="material-icons" style={{ color: '#1565c0' }}>event</span>
                  Upcoming Scheduled Meetings ({scheduledMeetings.length})
                </h3>
              </div>
              <div className="vc-requests-list" style={{ marginTop: 12 }}>
                {scheduledMeetings.map((r) => (
                  <div key={r.request_id} className="asha-patient-card request-item-card" style={{ marginBottom: 12 }}>
                    <div className="asha-patient-card-inner">
                      <div className="asha-patient-info">
                        <div className="asha-patient-avatar" style={{ background: 'linear-gradient(135deg, #00897b, #26a69a)' }}>
                          {r.patient_name ? r.patient_name.substring(0, 2).toUpperCase() : 'PT'}
                        </div>
                        <div className="asha-patient-details">
                          <h4 className="asha-patient-name">{r.patient_name || r.patient_id}</h4>
                          <p className="asha-patient-meta">Scheduled: {formatDateTime(r.scheduled_for)}</p>
                          <p className="asha-patient-meta">Requested by: {r.requested_by_name || 'User'}</p>
                          {r.notes && <p className="asha-patient-history" style={{ fontStyle: 'italic' }}>"{r.notes}"</p>}
                        </div>
                      </div>
                      <div className="asha-patient-actions">
                        <button
                          className="asha-btn asha-btn-vc"
                          style={{ background: '#e8f5e9', color: '#2e7d32', borderColor: '#c8e6c9' }}
                          onClick={() => handleRequestVC(r.request_id)}
                        >
                          <span className="material-icons">videocam</span> Request VC
                        </button>
                        <button className="asha-btn" style={{ background: 'var(--sage-xpale)', border: '1px solid rgba(0,206,209,0.3)', color: 'var(--sage-dark)' }} onClick={() => navigate(`/patient/${r.patient_id}/history`)}>
                          <span className="material-icons">history</span> History
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <NotificationModal
        show={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </>
  )
}
