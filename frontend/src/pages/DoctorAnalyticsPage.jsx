import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import LogoIcon from '../components/LogoIcon'
import { API_BASE_URL } from '../api'

const API = API_BASE_URL

function DonutChart({ triageCounts }) {
  const total = (triageCounts?.RED || 0) + (triageCounts?.YELLOW || 0) + (triageCounts?.GREEN || 0) || 1
  const r = (triageCounts?.RED || 0) / total
  const y = (triageCounts?.YELLOW || 0) / total
  const g = (triageCounts?.GREEN || 0) / total
  const degR = r * 360
  const degY = y * 360
  const degG = g * 360
  const conic = `conic-gradient(#e53935 0deg ${degR}deg, #fdd835 ${degR}deg ${degR + degY}deg, #43a047 ${degR + degY}deg 360deg)`
  return (
    <div className="analytics-donut-wrap">
      <div className="analytics-donut" style={{ background: conic }} />
      <div className="analytics-donut-hole">
        <span className="analytics-donut-total">{total}</span>
        <span className="analytics-donut-label">Total</span>
      </div>
    </div>
  )
}

export default function DoctorAnalyticsPage() {
  const doctorId = localStorage.getItem('doctor_id') || ''
  const doctorName = localStorage.getItem('doctor_name') || 'Doctor'
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!doctorId) {
      setLoading(false)
      return
    }
    fetchAnalytics()
  }, [doctorId])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/doctors/${doctorId}/analytics`)
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error(err)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  const maxTriage = data?.triage_counts ? Math.max(...Object.values(data.triage_counts), 1) : 1
  const maxSymptom = data?.symptom_counts?.length ? Math.max(...data.symptom_counts.map((s) => s.count), 1) : 1
  const diseaseByArea = data?.disease_by_area
  // Per-area list of { label, count } for bar charts (only diseases with count > 0)
  const areaDiseaseBars = diseaseByArea?.areas?.length && diseaseByArea?.diseases?.length
    ? diseaseByArea.areas.map((area, ri) => {
        const items = diseaseByArea.diseases
          .map((d, ci) => ({ label: d, count: diseaseByArea.matrix[ri]?.[ci] ?? 0 }))
          .filter((x) => x.count > 0)
          .sort((a, b) => b.count - a.count)
        return { area, items }
      })
    : []

  const updatedAt = data ? new Date().toLocaleString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''

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
          <Link to="/doctor-dashboard/patients" style={{ fontWeight: 'normal' }}><span className="material-icons">people</span> My Patients</Link>
          <Link to="/doctor-dashboard/analytics" className="active" style={{ fontWeight: 'normal' }}><span className="material-icons">analytics</span> Analytics</Link>
        </nav>
        <span className="nav-group-label" style={{ marginTop: 12, fontWeight: 'normal' }}>Account</span>
        <nav className="sidebar-nav">
          <Link to="/" onClick={() => localStorage.clear()} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 24px', fontSize: '0.88rem', fontWeight: 'normal', color: 'var(--ink-mid)' }}>
            <span className="material-icons" style={{ fontSize: '1.2rem', color: 'var(--ink-light)' }}>logout</span> Logout
          </Link>
        </nav>
      </aside>

      <main className="dashboard-main analytics-main">
        <div className="dash-top analytics-header">
          <div className="dash-greet">
            <h2 style={{ fontWeight: 'normal' }}>Dashboard</h2>
            <p className="analytics-updated">Updated: {updatedAt || '—'}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button type="button" onClick={fetchAnalytics} className="btn btn-outline" style={{ padding: '10px 18px', fontSize: '0.85rem' }}>
              <span className="material-icons" style={{ fontSize: '1.1rem', verticalAlign: 'middle', marginRight: 6 }}>refresh</span> Refresh
            </button>
            <Link to="/doctor-dashboard" className="btn btn-outline" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
              <span className="material-icons" style={{ fontSize: '1.1rem' }}>arrow_back</span> Back
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="analytics-loading">
            <div className="analytics-loading-shimmer" />
            <p style={{ marginTop: 16, color: 'var(--ink-mid)' }}>Loading analytics…</p>
          </div>
        ) : !data ? (
          <div className="dash-card"><p style={{ padding: 24, margin: 0, color: 'var(--ink-light)' }}>No analytics data available.</p></div>
        ) : (
          <>
            <div className="analytics-kpi-row">
              <div className="analytics-kpi-card analytics-reveal">
                <div className="analytics-kpi-icon-wrap analytics-kpi-icon-total"><span className="material-icons">people</span></div>
                <span className="analytics-kpi-num">{data.total_patients ?? 0}</span>
                <span className="analytics-kpi-label">Total patients</span>
              </div>
              <div className="analytics-kpi-card analytics-reveal" style={{ animationDelay: '0.05s' }}>
                <div className="analytics-kpi-icon-wrap analytics-kpi-icon-high"><span className="material-icons">warning</span></div>
                <span className="analytics-kpi-num">{data.triage_counts?.RED ?? 0}</span>
                <span className="analytics-kpi-label">High severity</span>
              </div>
              <div className="analytics-kpi-card analytics-reveal" style={{ animationDelay: '0.1s' }}>
                <div className="analytics-kpi-icon-wrap analytics-kpi-icon-med"><span className="material-icons">schedule</span></div>
                <span className="analytics-kpi-num">{data.triage_counts?.YELLOW ?? 0}</span>
                <span className="analytics-kpi-label">Medium</span>
              </div>
              <div className="analytics-kpi-card analytics-reveal" style={{ animationDelay: '0.15s' }}>
                <div className="analytics-kpi-icon-wrap analytics-kpi-icon-low"><span className="material-icons">check_circle</span></div>
                <span className="analytics-kpi-num">{data.triage_counts?.GREEN ?? 0}</span>
                <span className="analytics-kpi-label">Low severity</span>
              </div>
            </div>

            <div className="analytics-charts-row">
              <div className="dash-card analytics-card analytics-reveal" style={{ animationDelay: '0.2s' }}>
                <h3 className="analytics-section-title">Triage by severity</h3>
                <div className="analytics-donut-legend">
                  <DonutChart triageCounts={data.triage_counts} />
                  <div className="analytics-legend">
                    <span className="analytics-legend-item"><i className="dot dot-red" /> High ({data.triage_counts?.RED ?? 0})</span>
                    <span className="analytics-legend-item"><i className="dot dot-yellow" /> Medium ({data.triage_counts?.YELLOW ?? 0})</span>
                    <span className="analytics-legend-item"><i className="dot dot-green" /> Low ({data.triage_counts?.GREEN ?? 0})</span>
                  </div>
                </div>
              </div>
              <div className="dash-card analytics-card analytics-reveal" style={{ animationDelay: '0.25s' }}>
                <h3 className="analytics-section-title">Severity distribution</h3>
                <div className="analytics-bars">
                  {['RED', 'YELLOW', 'GREEN'].map((level) => (
                    <div key={level} className="analytics-bar-row">
                      <span className="analytics-bar-label">{level === 'RED' ? 'High' : level === 'YELLOW' ? 'Medium' : 'Low'}</span>
                      <div className="analytics-bar-track">
                        <div
                          className={`analytics-bar-fill analytics-bar-${level} analytics-bar-animate`}
                          style={{ width: `${((data.triage_counts?.[level] || 0) / maxTriage) * 100}%` }}
                        />
                      </div>
                      <span className="analytics-bar-value">{data.triage_counts?.[level] || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="dash-card analytics-card analytics-reveal" style={{ marginBottom: 24, animationDelay: '0.3s' }}>
              <h3 className="analytics-section-title">Disease / symptom frequency (your region)</h3>
              {!(data.symptom_counts && data.symptom_counts.length) ? (
                <p style={{ color: 'var(--ink-light)', margin: 0 }}>No symptom data yet.</p>
              ) : (
                <div className="analytics-bars analytics-bars-horizontal">
                  {data.symptom_counts.slice(0, 10).map((s, i) => (
                    <div key={s.label} className="analytics-bar-row" style={{ animationDelay: `${0.35 + i * 0.02}s` }}>
                      <span className="analytics-bar-label">{s.label}</span>
                      <div className="analytics-bar-track">
                        <div className="analytics-bar-fill analytics-bar-symptom analytics-bar-animate" style={{ width: `${(s.count / maxSymptom) * 100}%` }} />
                      </div>
                      <span className="analytics-bar-value">{s.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="dash-card analytics-card analytics-reveal" style={{ animationDelay: '0.4s' }}>
              <h3 className="analytics-section-title">Disease by area</h3>
              <p className="analytics-heatmap-desc">See which diseases or symptoms are more or less common in each village/region.</p>
              {!areaDiseaseBars.length ? (
                <p style={{ color: 'var(--ink-light)', margin: 0 }}>No area data yet. Complete consultations with workers from different areas.</p>
              ) : (
                <div className="analytics-area-cards">
                  {areaDiseaseBars.map(({ area, items }, idx) => {
                    const maxInArea = items.length ? Math.max(...items.map((i) => i.count), 1) : 1
                    return (
                      <div key={area} className="analytics-area-card" style={{ animationDelay: `${0.42 + idx * 0.05}s` }}>
                        <div className="analytics-area-card-header">
                          <span className="material-icons analytics-area-icon">location_on</span>
                          <span className="analytics-area-name">{area}</span>
                          <span className="analytics-area-badge">{items.reduce((s, i) => s + i.count, 0)} cases</span>
                        </div>
                        {items.length ? (
                          <div className="analytics-area-bars">
                            {items.slice(0, 8).map((d) => (
                              <div key={d.label} className="analytics-bar-row">
                                <span className="analytics-bar-label">{d.label}</span>
                                <div className="analytics-bar-track">
                                  <div
                                    className="analytics-bar-fill analytics-bar-area analytics-bar-animate"
                                    style={{ width: `${(d.count / maxInArea) * 100}%` }}
                                  />
                                </div>
                                <span className="analytics-bar-value">{d.count}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="analytics-area-empty">No disease data for this area</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
