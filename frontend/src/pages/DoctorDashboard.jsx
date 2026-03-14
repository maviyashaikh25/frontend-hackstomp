import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import LogoIcon from '../components/LogoIcon'
import NotificationModal from '../components/NotificationModal'
import { getTelehealthDoctorRoomUrl } from '../config'
import { apiUrl } from '../api'

export default function DoctorDashboard() {
  const { t } = useLanguage()
  const [active, setActive] = useState('Dashboard')
  const [filter, setFilter] = useState('ALL') // 'ALL', 'RED', 'YELLOW', 'GREEN'
  const [consultations, setConsultations] = useState([])
  const [selectedCase, setSelectedCase] = useState(null)
  const [videoCallRequests, setVideoCallRequests] = useState([])
  const [prescriptionForm, setPrescriptionForm] = useState([{ medicine_name: '', duration_days: '', timing_frequency: '', notes: '' }])
  const [notification, setNotification] = useState({ show: false, title: '', message: '', type: 'success' })

  const doctorName = localStorage.getItem('doctor_name') || 'Doctor'
  const doctorId = localStorage.getItem('doctor_id') || ''
  const navigate = useNavigate()

  useEffect(() => {
    fetchConsultations()
    fetchVideoCallRequests()
  }, [])

  const fetchVideoCallRequests = async () => {
    try {
      const res = await fetch(apiUrl('/video-call-requests/pending'))
      if (res.ok) {
        const data = await res.json()
        setVideoCallRequests(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error(err)
    }
  }

  const fetchConsultations = async () => {
    try {
      const res = await fetch(apiUrl('/consultations/open'));
      if (!res.ok) throw new Error(t('fetch_failed'));
      let data = await res.json();
      
      const enriched = await Promise.all(data.map(async c => {
        try {
          const p = await fetch(apiUrl(`/patients/${c.patient_id}`));
          const pData = await p.json();
          return { ...c, patientName: pData.full_name, patientAge: pData.age };
        } catch {
          return { ...c, patientName: c.patient_id, patientAge: '?' };
        }
      }));
      setConsultations(enriched);
    } catch (err) {
      console.error(err);
    }
  }

  const handlePrescribe = async (e) => {
    e.preventDefault();
    if (!selectedCase) return;

    try {
      const payload = prescriptionForm.map(m => ({
        medicine_name: m.medicine_name,
        duration_days: parseInt(m.duration_days) || 1,
        timing_frequency: m.timing_frequency,
        notes: m.notes
      }));

      const res = await fetch(apiUrl(`/consultations/${selectedCase.consultation_id}/prescribe?doctor_id=${doctorId}`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(t('prescribe_failed'));
      
      setNotification({ show: true, title: 'Success', message: t('prescribe_success_msg'), type: 'success' });
      setSelectedCase(null);
      setPrescriptionForm([{ medicine_name: '', duration_days: '', timing_frequency: '', notes: '' }]);
      fetchConsultations();
    } catch (err) {
      setNotification({ show: true, title: 'Error', message: err.message, type: 'error' });
    }
  }

  const addMed = () => setPrescriptionForm([...prescriptionForm, { medicine_name: '', duration_days: '', timing_frequency: '', notes: '' }]);

  const filteredConsultations = filter === 'ALL' 
    ? consultations 
    : consultations.filter(c => c.ai_triage_level === filter);

  const KPI = [
    { filterId: 'ALL',     label: t('all_patients_label'),   num: consultations.length, icon:'people',          sub: t('total_consults_sub') },
    { filterId: 'RED',     label: t('urgent_cases'),   num: consultations.filter(c => c.ai_triage_level==='RED').length,  icon:'warning',         sub: t('urgent_cases_sub') },
    { filterId: 'YELLOW',  label: t('attention'),      num: consultations.filter(c => c.ai_triage_level==='YELLOW').length, icon:'event_available', sub: t('attention_sub') },
    { filterId: 'GREEN',   label: t('routine_checks'), num: consultations.filter(c => c.ai_triage_level==='GREEN').length,  icon:'person_add',      sub: t('routine_checks_sub') },
  ];

  const unscheduledRequests = videoCallRequests.filter((r) => !r.scheduled_for)

  const handleRespondVC = async (requestId, status) => {
    try {
      const res = await fetch(apiUrl(`/video-call-requests/${requestId}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          doctor_id: status === 'ACCEPTED' ? doctorId : undefined
        })
      })
      if (!res.ok) throw new Error("Failed to update status")

      if (status === 'ACCEPTED') {
        setNotification({
          show: true,
          title: t('call_accepted_title'),
          message: t('call_accepted_msg'),
          type: 'success'
        })
        fetchVideoCallRequests()
        // Open Sarvam TeleHealth (speech-recognition) room as doctor — room ID = requestId, name auto-filled
        const roomUrl = getTelehealthDoctorRoomUrl(requestId, doctorName)
        window.open(roomUrl, 'telehealth-call', 'noopener,noreferrer,width=1200,height=800')
      } else {
        setNotification({
          show: true,
          title: t('call_ignored_title'),
          message: t('call_ignored_msg'),
          type: 'success'
        })
        fetchVideoCallRequests()
      }
    } catch (err) {
      setNotification({ show: true, title: 'Error', message: err.message, type: 'error' })
    }
  }

  return (
    <>
    <div className="dashboard-layout">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <Link to="/" className="sidebar-brand" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="logo-icon"><LogoIcon size={38} /></div>
          <span className="logo-text" style={{ fontWeight: 'normal' }}>AROGYA</span>
        </Link>


        <div className="sidebar-profile">
          <div className="sidebar-avatar">DR</div>
          <span style={{ fontSize: '0.95rem', color: 'var(--ink)' }}>{doctorName}</span>
          <br/>
          <small>{t('doctor_portal')}</small>
        </div>

        <span className="nav-group-label" style={{ fontWeight: 'normal' }}>{t('main_menu')}</span>
        <nav className="sidebar-nav">
          <Link to="/doctor-dashboard" className={active === 'Dashboard' ? 'active' : ''} onClick={() => setActive('Dashboard')} style={{ fontWeight: 'normal' }}>
            <span className="material-icons">dashboard</span> {t('nav_dashboard')}
          </Link>
          <Link to="/doctor-dashboard/scheduled-meetings" style={{ fontWeight: 'normal' }}><span className="material-icons">event</span> Scheduled Meetings</Link>
          <Link to="/doctor-dashboard/patients" style={{ fontWeight: 'normal' }}><span className="material-icons">people</span> My Patients</Link>
          <Link to="/doctor-dashboard/analytics" style={{ fontWeight: 'normal' }}><span className="material-icons">analytics</span> Analytics</Link>
        </nav>

        <span className="nav-group-label" style={{ marginTop: 12, fontWeight: 'normal' }}>{t('account')}</span>
        <nav className="sidebar-nav">
          <Link to="/" onClick={() => { localStorage.clear() }} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 24px', fontSize:'0.88rem', fontWeight:'normal', color:'var(--ink-mid)' }}>
            <span className="material-icons" style={{ fontSize:'1.2rem', color:'var(--ink-light)' }}>logout</span> {t('nav_logout')}
          </Link>
        </nav>
      </aside>

      {/* ── MAIN ── */}
      <main className="dashboard-main">
        {/* Top bar */}
        <div className="dash-top">
          <div className="dash-greet">
            <h2 style={{ fontWeight: 'normal' }}>{t('doctor_dashboard_title')}</h2>
            <p>{t('doctor_welcome')}, {doctorName}. {t('doctor_review_msg')}</p>
          </div>
        </div>

        {unscheduledRequests.length > 0 && (
          <div className="dash-card vc-requests-card" style={{ marginBottom: 32 }}>
            <div className="dash-card-header">
              <h3 style={{ fontWeight: 'normal', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="material-icons" style={{ color: '#1565c0' }}>videocam</span>
                {t('incoming_vc_title')}
              </h3>
              <a href="#" onClick={(e) => { e.preventDefault(); fetchVideoCallRequests(); }} style={{ fontWeight: 'normal', color: 'var(--ink-light)' }}>
                <span className="material-icons" style={{ fontSize: '1.1rem', verticalAlign: 'middle' }}>refresh</span> {t('refresh_btn')}
              </a>
            </div>
            <div className="vc-requests-list" style={{ marginTop: 12 }}>
              {unscheduledRequests.map((r) => (
                <div key={r.request_id} className="asha-patient-card request-item-card" style={{ marginBottom: 12 }}>
                  <div className="asha-patient-card-inner">
                    <div className="asha-patient-info">
                      <div className="asha-patient-avatar" style={{ background: 'linear-gradient(135deg, #1565c0, #1e88e5)' }}>
                        {r.patient_name ? r.patient_name.substring(0, 2).toUpperCase() : 'PT'}
                      </div>
                      <div className="asha-patient-details">
                        <h4 className="asha-patient-name">{r.patient_name || r.patient_id}</h4>
                        <p className="asha-patient-meta">{t('requested_by')} {r.requested_by_name || 'ASHA worker'} · {r.requested_at ? new Date(r.requested_at).toLocaleTimeString() : ''}</p>
                        {r.notes && <p className="asha-patient-history" style={{ fontStyle: 'italic' }}>"{r.notes}"</p>}
                      </div>
                    </div>
                    <div className="asha-patient-actions">
                    <button className="asha-btn" style={{ background: 'var(--sage-xpale)', border: '1px solid rgba(0,206,209,0.3)', color: 'var(--sage-dark)' }} onClick={() => navigate(`/patient/${r.patient_id}/history`)}>
                      <span className="material-icons">history</span> {t('history_btn')}
                    </button>
                    <button className="asha-btn asha-btn-vc" style={{ background: '#e8f5e9', color: '#2e7d32', borderColor: '#c8e6c9' }} onClick={() => handleRespondVC(r.request_id, 'ACCEPTED')}>
                      <span className="material-icons">check_circle</span> {t('accept_call')}
                    </button>
                    <button className="asha-btn" style={{ background: '#fafafa', color: '#757575', border: '1px solid #eee' }} onClick={() => handleRespondVC(r.request_id, 'REJECTED')}>
                      <span className="material-icons">block</span> {t('ignore_call')}
                    </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedCase ? (
          <div className="dash-card">
            <div className="dash-card-header" style={{ marginBottom: 24, borderBottom: '1px solid var(--sage-pale)', paddingBottom: 16 }}>
              <h3 style={{ fontWeight: 'normal' }}>{t('case_title')}: {selectedCase.patientName}</h3>
              <a href="#" onClick={(e) => { e.preventDefault(); setSelectedCase(null); }} style={{ fontWeight: 'normal' }}>{t('back_to_list')}</a>
            </div>

            <div style={{ background: 'var(--sage-xpale)', padding: 16, borderRadius: 12, marginBottom: 24 }}>
              <h4 style={{ marginBottom: 8, fontSize: '0.95rem' }}>{t('symptoms_reported')}</h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--ink)' }}>{selectedCase.symptoms_text || t('no_symptoms')}</p>
            </div>

            <h4 style={{ marginBottom: 16, fontWeight: 'normal', color: 'var(--ink-mid)' }}>{t('issue_prescription')}</h4>
            <form onSubmit={handlePrescribe}>
              {prescriptionForm.map((med, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr', gap: 12, marginBottom: 16 }}>
                  <input placeholder={t('med_name')} required value={med.medicine_name} onChange={e => {
                    const newF = [...prescriptionForm]; newF[idx].medicine_name = e.target.value; setPrescriptionForm(newF);
                  }} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd' }} />
                  <input placeholder={t('days')} required type="number" value={med.duration_days} onChange={e => {
                    const newF = [...prescriptionForm]; newF[idx].duration_days = e.target.value; setPrescriptionForm(newF);
                  }} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd' }} />
                  <input placeholder={t('timing')} required value={med.timing_frequency} onChange={e => {
                    const newF = [...prescriptionForm]; newF[idx].timing_frequency = e.target.value; setPrescriptionForm(newF);
                  }} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd' }} />
                  <input placeholder={t('notes_optional')} value={med.notes} onChange={e => {
                    const newF = [...prescriptionForm]; newF[idx].notes = e.target.value; setPrescriptionForm(newF);
                  }} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd' }} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button type="button" onClick={addMed} className="btn btn-outline" style={{ fontWeight: 'normal', padding: '10px 16px' }}>{t('add_med')}</button>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: 'normal', padding: '10px 16px' }}>{t('submit_close')}</button>
              </div>
            </form>
          </div>
        ) : (
          <>
            <div className="kpi-grid">
              {KPI.map((k, i) => (
                <div 
                  key={i} 
                  className={`kpi-card ${filter === k.filterId ? 'active-filter' : ''}`}
                  onClick={() => setFilter(k.filterId)}
                  style={{ 
                    cursor: 'pointer',
                    borderColor: filter === k.filterId ? 'var(--sage)' : 'rgba(125,151,114,0.12)',
                    boxShadow: filter === k.filterId ? 'var(--shadow-card)' : 'none',
                    transform: filter === k.filterId ? 'translateY(-6px)' : 'none'
                  }}
                >
                  <div className="kpi-icon"><span className="material-icons">{k.icon}</span></div>
                  <div className="kpi-label" style={{ fontWeight: 'normal' }}>{k.label}</div>
                  <div className="kpi-num" style={{ fontWeight: 'normal' }}>{k.num}</div>
                  <div className="kpi-sub" style={{ fontWeight: 'normal' }}>{k.sub}</div>
                </div>
              ))}
            </div>

            <div className="dash-card" style={{ marginBottom: 24 }}>
              <div className="dash-card-header">
                <h3 style={{ fontWeight: 'normal' }}>{t('open_consultations').toUpperCase()} ({filter})</h3>
                <a href="#" onClick={(e) => { e.preventDefault(); fetchConsultations(); }} style={{ fontWeight: 'normal' }}>{t('refresh_btn')}</a>
              </div>
              
              {filteredConsultations.length === 0 ? (
                <p style={{ color: 'var(--ink-light)', padding: '20px 0' }}>{t('no_patients_found')}</p>
              ) : (
                <div className="consult-list">
                  {filteredConsultations.map((c, i) => {
                    const triageLabel = c.ai_triage_level === 'RED' ? 'RED' : c.ai_triage_level === 'YELLOW' ? 'MEDIUM' : 'GREEN';
                    let badgeClass = c.ai_triage_level === 'RED' ? 'badge-urgent' : c.ai_triage_level === 'YELLOW' ? 'badge-new' : 'badge-routine';
                    return (
                      <div key={i} className="patient-card">
                        <div className="patient-card-left">
                          <div className="consult-avatar">{c.patientName ? c.patientName.substring(0,2).toUpperCase() : '??'}</div>
                          <div className="consult-info">
                            <span className="patient-card-name">{c.patientName}</span>
                            <small>Age: {c.patientAge} · Triage: {triageLabel}</small>
                          </div>
                          <span className={`consult-badge ${badgeClass}`}>{triageLabel}</span>
                        </div>
                        <div className="patient-card-actions">
                          <button type="button" onClick={() => navigate(`/patient/${c.patient_id}/history`)} className="btn-patient btn-history">
                            <span className="material-icons">history</span>
                            {t('history_btn')}
                          </button>
                          <button 
                            type="button" 
                            className="btn-patient btn-video-call" 
                            onClick={() => {
                              window.open(`https://meet.jit.si/ArogyaCall-${c.consultation_id || 'general'}`, '_blank');
                              setNotification({ show: true, title: 'Video Call', message: t('opening_vc'), type: 'success' });
                            }}
                          >
                            <span className="material-icons">videocam</span>
                            {t('video_call_btn')}
                          </button>
                          <button type="button" onClick={() => setSelectedCase(c)} className="btn-patient btn-primary-action">
                            <span className="material-icons">visibility</span>
                            {t('review_btn')}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
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
