import { useState, useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import LogoIcon from '../components/LogoIcon'
import { API_BASE_URL } from '../api'

const API = API_BASE_URL

function formatDate(iso) {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso
  }
}

function formatDateShort(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return iso
  }
}

function TriageBadge({ level }) {
  const label = level === 'RED' ? 'high' : level === 'YELLOW' ? 'medium' : 'low'
  const cls = level === 'RED' ? 'badge-urgent' : level === 'YELLOW' ? 'badge-new' : 'badge-routine'
  return <span className={`consult-badge ${cls}`}>{label}</span>
}

const PRINT_STYLES = `
  body{ font-family: system-ui,sans-serif; padding: 24px; max-width: 700px; margin: 0 auto; }
  h1{ font-size: 1.25rem; margin-bottom: 4px; }
  .meta{ color: #666; font-size: 0.9rem; margin-bottom: 20px; }
  .summary{ background: #f5f5f5; padding: 12px 16px; border-radius: 8px; margin-bottom: 24px; }
  .visit{ border: 1px solid #eee; border-radius: 8px; padding: 14px; margin-bottom: 12px; }
  .visit h3{ font-size: 0.95rem; margin: 0 0 8px 0; }
  .symptoms{ font-size: 0.9rem; color: #333; margin-bottom: 8px; }
  .meds{ font-size: 0.85rem; color: #444; }
  ul{ margin: 4px 0 0 16px; padding: 0; }
`

export default function PatientHistoryPage() {
  const { t } = useLanguage()
  const { patientId } = useParams()
  const printRef = useRef(null)
  const [patient, setPatient] = useState(null)
  const [consultations, setConsultations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const userRole = localStorage.getItem('role') // 'doctor' or 'worker'
  const backLink = userRole === 'doctor' ? '/doctor-dashboard' : '/asha-dashboard'
  const backLabel = userRole === 'doctor' ? 'Doctor Dashboard' : 'ASHA Dashboard'

  useEffect(() => {
    if (!patientId) return
    let cancelled = false
    setLoading(true)
    setError(null)
    Promise.all([
      fetch(`${API}/patients/${patientId}`).then(r => (r.ok ? r.json() : null)),
      fetch(`${API}/patients/${patientId}/consultations`).then(r => (r.ok ? r.json() : []))
    ])
      .then(([p, cons]) => {
        if (cancelled) return
        setPatient(p || { patient_id: patientId, full_name: 'Unknown', age: '?', gender: '—' })
        setConsultations(Array.isArray(cons) ? cons : [])
      })
      .catch(err => {
        if (!cancelled) setError(err.message || 'Failed to load history')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [patientId])

  const handleDownloadPDF = () => {
    const el = printRef.current
    if (!el) return
    const prevTitle = document.title
    document.title = `Patient Prescriptions - ${patient?.full_name || patientId}`
    const win = window.open('', '_blank')
    win.document.write(`
      <!DOCTYPE html><html><head><title>${document.title}</title><style>${PRINT_STYLES}</style></head><body>${el.innerHTML}</body></html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => {
      win.print()
      win.close()
      document.title = prevTitle
    }, 250)
  }

  if (loading) {
    return (
      <div className="patient-history-layout">
        <header className="patient-history-header">
          <Link to="/" className="patient-history-logo">
            <LogoIcon size={32} />
            <span>AROGYA</span>
          </Link>
          <p style={{ color: 'var(--ink-mid)', margin: 0 }}>Loading patient history…</p>
        </header>
        <main className="patient-history-main" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ color: 'var(--ink-mid)' }}>Loading…</p>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="patient-history-layout">
        <header className="patient-history-header">
          <Link to="/" className="patient-history-logo">
            <LogoIcon size={32} />
            <span>AROGYA</span>
          </Link>
          <Link to={backLink} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>← Back to ASHA Dashboard</Link>
        </header>
        <main className="patient-history-main" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ color: '#c62828' }}>{error}</p>
          <Link to={backLink} className="btn btn-outline" style={{ marginTop: 16 }}>Back to ASHA Dashboard</Link>
        </main>
      </div>
    )
  }

  const patientName = patient?.full_name || 'Patient'
  const patientAge = patient?.age ?? '?'
  const patientGender = patient?.gender ?? '—'
  const allMeds = consultations.flatMap((c) => (c.prescribed_medicines || []).map((m) => m.medicine_name))

  return (
    <div className="patient-history-layout">
      <header className="patient-history-header">
        <Link to="/" className="patient-history-logo" style={{ textDecoration: 'none', color: 'inherit' }}>
          <LogoIcon size={32} />
          <span>AROGYA</span>
        </Link>
      </header>

      <main className="patient-history-main">
        <div className="history-page">
          <div className="container">
            <div style={{ padding: '40px 0 20px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Link to={backLink} className="back-link">
                <span className="material-icons">arrow_back</span> {backLabel}
              </Link>
              <button type="button" className="btn btn-primary" onClick={handleDownloadPDF} disabled={!patient}>
                <span className="material-icons" style={{ fontSize: 18, marginRight: 6 }}>download</span>
                {t('user_history_download_pdf') || 'Download PDF'}
              </button>
            </div>

            <div className="history-header">
              <h2 className="history-title">{t('patient_history')}</h2>
              <div className="history-patient-pill">
                <span className="material-icons">person</span>
                ID: {patientId}
              </div>
            </div>
          </div>
        </div>

        <div className="patient-history-content">
        {consultations.length === 0 ? (
          <div className="dash-card">
            <p style={{ color: 'var(--ink-light)', padding: '24px 0', margin: 0 }}>{t('no_consultation_history_for_this_patient')}.</p>
          </div>
        ) : (
          <div className="history-list">
            {consultations.map((c, i) => (
              <div key={c.consultation_id || i} className="history-card">
                <div className="history-card-header">
                  <span className="history-card-id">{c.consultation_id}</span>
                  <TriageBadge level={c.ai_triage_level} />
                  <span className="history-card-status">{c.case_status}</span>
                  <span className="history-card-date">{formatDate(c.recorded_at)}</span>
                </div>
                <div className="history-card-body">
                  {c.prescribed_medicines && c.prescribed_medicines.length > 0 && (
                    <section className="history-section history-meds-section">
                      <h4 className="history-section-title history-meds-title">
                        <span className="material-icons">medication</span>
                        Medicines prescribed by doctor
                      </h4>
                      <div className="history-meds-grid">
                        {c.prescribed_medicines.map((m, j) => (
                          <div key={m.prescription_id || j} className="history-med-item-card">
                            <div className="history-med-name">{m.medicine_name}</div>
                            <div className="history-med-details">
                              <span className="history-med-days">{m.duration_days} Days</span>
                              <span>{m.timing_frequency}</span>
                            </div>
                            {m.notes && <div className="history-med-notes">Note: {m.notes}</div>}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                  <section className="history-section">
                    <h4 className="history-section-title">Symptoms</h4>
                    <p className="history-section-text">{c.symptoms_text || '—'}</p>
                  </section>
                  {c.doctor_diagnosis && (
                    <section className="history-section">
                      <h4 className="history-section-title">Doctor diagnosis</h4>
                      <p className="history-section-text">{c.doctor_diagnosis}</p>
                    </section>
                  )}
                  {c.referral_required && (
                    <p className="history-referral">Referral required</p>
                  )}
                  {c.sync_status && (
                    <p className="history-meta">Sync: {c.sync_status}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        </div>

        {/* Hidden printable content for PDF — same structure as user history */}
        <div
          ref={printRef}
          className="patient-history-printable"
          aria-hidden="true"
          style={{ position: 'absolute', left: '-9999px', width: '700px', top: 0 }}
        >
          <h1>{patientName}</h1>
          <p className="meta">Patient ID: {patientId} · Age: {patientAge} · Gender: {patientGender}</p>
          <div className="summary">
            <strong>{t('user_history_summary') || 'Summary'}</strong>
            <p>Doctor visits: <strong>{consultations.length}</strong></p>
            {allMeds.length > 0 && (
              <p>Prescriptions: {[...new Set(allMeds)].slice(0, 20).join(', ')}{allMeds.length > 20 ? '…' : ''}</p>
            )}
          </div>
          <h2 className="history-h2" style={{ fontSize: '1.05rem', marginBottom: 14 }}>{t('user_history_visits') || 'Visit history'}</h2>
          {consultations.map((c) => (
            <div className="visit" key={c.consultation_id}>
              <h3>{formatDateShort(c.recorded_at)} · {c.case_status} · {c.ai_triage_level}</h3>
              {c.symptoms_text && <p className="symptoms">{c.symptoms_text}</p>}
              {c.doctor_diagnosis && <p><strong>Diagnosis:</strong> {c.doctor_diagnosis}</p>}
              {c.prescribed_medicines && c.prescribed_medicines.length > 0 && (
                <p className="meds">
                  <strong>Prescribed:</strong>
                  <ul>
                    {c.prescribed_medicines.map((m) => (
                      <li key={m.prescription_id}>{m.medicine_name} — {m.timing_frequency}, {m.duration_days} days{m.notes ? ` (${m.notes})` : ''}</li>
                    ))}
                  </ul>
                </p>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
