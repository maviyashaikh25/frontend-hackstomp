import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import LogoIcon from '../components/LogoIcon'
import { API_BASE_URL } from '../api'

const API = API_BASE_URL

export default function DoctorPatientsPage() {
  const doctorId = localStorage.getItem('doctor_id') || ''
  const doctorName = localStorage.getItem('doctor_name') || 'Doctor'
  const [consultations, setConsultations] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState('')

  useEffect(() => {
    if (!doctorId) {
      setLoading(false)
      return
    }
    fetchConsultations()
  }, [doctorId, dateFilter])

  const fetchConsultations = async () => {
    setLoading(true)
    try {
      const url = dateFilter
        ? `${API}/doctors/${doctorId}/consultations?date_filter=${dateFilter}`
        : `${API}/doctors/${doctorId}/consultations`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch')
      let data = await res.json()
      const enriched = await Promise.all(
        (data || []).map(async (c) => {
          try {
            const p = await fetch(`${API}/patients/${c.patient_id}`)
            const pData = await p.json()
            return { ...c, patientName: pData.full_name, patientAge: pData.age }
          } catch {
            return { ...c, patientName: c.patient_id, patientAge: '?' }
          }
        })
      )
      setConsultations(enriched)
    } catch (err) {
      console.error(err)
      setConsultations([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (iso) => {
    if (!iso) return '—'
    try {
      return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
    } catch {
      return iso
    }
  }

  const triageLabel = (level) => (level === 'RED' ? 'High' : level === 'YELLOW' ? 'Medium' : 'Low')
  const triageClass = (level) => (level === 'RED' ? 'badge-urgent' : level === 'YELLOW' ? 'badge-new' : 'badge-routine')

  return (
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
          <Link to="/doctor-dashboard/scheduled-meetings" style={{ fontWeight: 'normal' }}><span className="material-icons">event</span> Scheduled Meetings</Link>
          <Link to="/doctor-dashboard/patients" className="active" style={{ fontWeight: 'normal' }}><span className="material-icons">people</span> My Patients</Link>
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
            <h2 style={{ fontWeight: 'normal' }}>Patients attended by you</h2>
            <p>Filter by date to see patient data for a specific day.</p>
          </div>
          <Link to="/doctor-dashboard" className="btn btn-outline" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
            <span className="material-icons" style={{ fontSize: '1.1rem' }}>arrow_back</span> Back to Dashboard
          </Link>
        </div>

        <div className="dash-card" style={{ marginBottom: 24 }}>
          <div className="dash-card-header">
            <h3 style={{ fontWeight: 'normal' }}>Filter by date</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid var(--sage-pale)', fontFamily: 'var(--font-body)' }}
            />
            <button type="button" onClick={() => setDateFilter('')} className="btn btn-outline" style={{ padding: '10px 16px' }}>Clear</button>
          </div>
        </div>

        {loading ? (
          <div className="dash-card"><p style={{ padding: 24, margin: 0, color: 'var(--ink-mid)' }}>Loading…</p></div>
        ) : consultations.length === 0 ? (
          <div className="dash-card">
            <p style={{ padding: 24, margin: 0, color: 'var(--ink-light)' }}>
              {dateFilter ? 'No patients attended on this date.' : 'No patients attended yet.'}
            </p>
          </div>
        ) : (
          <div className="dash-card">
            <div className="dash-card-header">
              <h3 style={{ fontWeight: 'normal' }}>{dateFilter ? `Patients on ${dateFilter}` : 'All patients attended'} ({consultations.length})</h3>
            </div>
            <div className="doctor-patients-list">
              {consultations.map((c, i) => (
                <div key={c.consultation_id || i} className="doctor-patient-card">
                  <div className="doctor-patient-card-left">
                    <div className="consult-avatar">{c.patientName ? c.patientName.substring(0, 2).toUpperCase() : '??'}</div>
                    <div>
                      <div className="doctor-patient-name">{c.patientName || c.patient_id}</div>
                      <div className="doctor-patient-meta">Age {c.patientAge} · {c.consultation_id} · {formatDate(c.recorded_at)}</div>
                      {c.symptoms_text && <div className="doctor-patient-symptoms">{c.symptoms_text.substring(0, 80)}{c.symptoms_text.length > 80 ? '…' : ''}</div>}
                    </div>
                  </div>
                  <span className={`consult-badge ${triageClass(c.ai_triage_level)}`}>{triageLabel(c.ai_triage_level)}</span>
                  <Link to={`/patient/${c.patient_id}/history`} className="btn btn-outline" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>View history</Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
