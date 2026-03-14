import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import LogoIcon from '../components/LogoIcon'
import { getTelehealthPatientRoomUrl } from '../config'
import { API_BASE_URL } from '../api'

const API = API_BASE_URL

function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso
  }
}

export default function AshaRequestsPage() {
  const { t } = useLanguage()
  const workerId = localStorage.getItem('worker_id') || ''
  const workerName = localStorage.getItem('worker_name') || t('worker_label')
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!workerId) {
      setLoading(false)
      return
    }
    fetchRequests()
    const interval = setInterval(fetchRequests, 15000)
    return () => clearInterval(interval)
  }, [workerId])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/video-call-requests/worker/${workerId}`)
      if (res.ok) {
        const data = await res.json()
        setRequests(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-layout" style={{ background: 'var(--sage-xpale)', minHeight: '100vh' }}>
      <aside className="sidebar">
        <Link to="/" className="sidebar-brand" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="logo-icon"><LogoIcon size={38} /></div>
          <span className="logo-text" style={{ fontWeight: 'normal' }}>AROGYA ASHA</span>
        </Link>

        <div className="sidebar-profile">
          <div className="sidebar-avatar" style={{ background: 'var(--ink-light)' }}>AW</div>
          <span style={{ fontSize: '0.95rem', color: 'var(--ink)' }}>{workerName}</span>
          <br />
          <small>{t('worker_label')}</small>
        </div>
        <span className="nav-group-label" style={{ fontWeight: 'normal' }}>{t('menu_label')}</span>
        <nav className="sidebar-nav">
          <Link to="/asha-dashboard" style={{ fontWeight: 'normal' }}>
            <span className="material-icons">dashboard</span> {t('nav_dashboard')}
          </Link>
          <Link to="/asha-dashboard/requests" className="active" style={{ fontWeight: 'normal' }}>
            <span className="material-icons">queue</span> {t('nav_queue')}
          </Link>
        </nav>

        <span className="nav-group-label" style={{ marginTop: 12, fontWeight: 'normal' }}>{t('account_label')}</span>
        <nav className="sidebar-nav">
          <Link to="/" onClick={() => localStorage.clear()} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 24px', fontSize: '0.88rem', fontWeight: 'normal', color: 'var(--ink-mid)' }}>
            <span className="material-icons" style={{ fontSize: '1.2rem', color: 'var(--ink-light)' }}>logout</span> {t('nav_logout')}
          </Link>
        </nav>
      </aside>

      <main className="dashboard-main" style={{ padding: '40px', maxWidth: '900px', margin: 0 }}>
        <div className="dash-top" style={{ marginBottom: 24 }}>
          <div className="dash-greet">
            <p>{t('requests_sub')}</p>
          </div>
          <Link to="/asha-dashboard" className="btn btn-outline" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
            <span className="material-icons" style={{ fontSize: '1.1rem' }}>arrow_back</span> {t('back_to_dash')}
          </Link>
        </div>

        {loading ? (
          <div className="dash-card">
            <p style={{ color: 'var(--ink-mid)', padding: 24, margin: 0 }}>{t('loading_requests')}</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="dash-card">
            <div className="requests-empty">
              <span className="material-icons" style={{ fontSize: '3rem', color: 'var(--ink-light)' }}>videocam_off</span>
              <p style={{ margin: '16px 0 0 0', color: 'var(--ink-mid)' }}>{t('no_requests_msg')}</p>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: 'var(--ink-light)' }}>{t('how_to_request')}</p>
              <Link to="/asha-dashboard" className="btn btn-primary" style={{ marginTop: 20 }}>{t('go_to_dash')}</Link>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--ink-mid)' }}>{requests.length} {t('in_queue')}</p>
              <button type="button" onClick={fetchRequests} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                {t('refresh_btn')}
              </button>
            </div>
            <div className="requests-queue-cards">
              {requests.map((r) => (
                <div key={r.request_id} className={`asha-patient-card request-item-card status-${(r.status || 'PENDING').toLowerCase()}`}>
                  <div className="asha-patient-card-inner">
                    <div className="asha-patient-info">
                      <div className="asha-patient-avatar">
                        {r.patient_name ? r.patient_name.substring(0, 2).toUpperCase() : 'PT'}
                      </div>
                      <div className="asha-patient-details">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                          <h4 className="asha-patient-name" style={{ margin: 0 }}>{r.patient_name || r.patient_id}</h4>
                          <span className={`request-card-status request-card-status--${(r.status || 'PENDING').toLowerCase()}`}>
                            {r.status}
                          </span>
                        </div>
                        <p className="asha-patient-meta">ID: {r.patient_id} · {formatDate(r.requested_at)}</p>
                        {r.notes && (
                          <p className="asha-patient-history" style={{ marginTop: 8 }}>
                            <span className="asha-patient-history-label">{t('note_label')}:</span> {r.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="asha-patient-actions">
                      {(r.status || '').toUpperCase() === 'ACCEPTED' && (
                        <a
                          href={r.invite_link || getTelehealthPatientRoomUrl(r.request_id, workerName)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="asha-btn asha-btn-join-call"
                        >
                          <span className="material-icons">call</span> {t('join_call_btn') || 'Join call'}
                        </a>
                      )}
                      <Link to={`/patient/${r.patient_id}/history`} className="asha-btn asha-btn-history">
                        <span className="material-icons">history</span>
                        {t('view_history_btn')}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
