import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import LogoIcon from '../components/LogoIcon'
import NotificationModal from '../components/NotificationModal'
import { apiUrl } from '../api'

export default function AshaDashboard() {
  const [tab, setTab] = useState('search') // 'search', 'add', 'consult'
  const [aadharSearch, setAadharSearch] = useState('')
  const [searchedPatient, setSearchedPatient] = useState(null)
  const [symptoms, setSymptoms] = useState('')
  const [uploadedPhotos, setUploadedPhotos] = useState([])
  const [uploading, setUploading] = useState(false)
  const [notification, setNotification] = useState({ show: false, title: '', message: '', type: 'success' })
  const workerName = localStorage.getItem('worker_name') || 'ASHA Worker'
  const workerId = localStorage.getItem('worker_id') || ''
  const navigate = useNavigate()
  const location = useLocation()
  const [vcRequestLoading, setVcRequestLoading] = useState(false)
  const { t } = useLanguage()

  const showModal = (title, message, type = 'success') => {
    setNotification({ show: true, title, message, type });
  };
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(apiUrl('/upload-file'), {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setUploadedPhotos(prev => [...prev, data.url]);
    } catch (err) {
      showModal(t('upload_failed_title'), err.message, "error");
    } finally {
      setUploading(false);
    }
  }

  const handleSearch = async (e) => {
    // ... (rest of handleSearch remains same)
    e.preventDefault()
    if (aadharSearch.length > 5) {
      try {
        const res = await fetch(apiUrl(`/patients/${aadharSearch}`));
        if (!res.ok) throw new Error("Patient not found");
        const data = await res.json();
        setSearchedPatient({
          patient_id: data.patient_id,
          name: data.full_name,
          age: data.age,
          gender: data.gender,
          contact_number: data.contact_number,
          history: 'Available in records',
          lastVisit: 'Recent',
          isNew: false
        })
      } catch (err) {
        showModal(t('patient_not_found_title'), t('register_msg'), "error");
      }
    } else {
      showModal(t('invalid_aadhar_title'), t('invalid_aadhar_msg'), "error");
    }
  }

  const handleStartConsultation = () => {
    setTab('consult')
  }

  const sendVideoCallRequest = async () => {
    if (!searchedPatient?.patient_id || !workerId) {
      showModal(t('cannot_send_req_title'), t('info_missing_msg'), 'error')
      return
    }
    setVcRequestLoading(true)
    try {
      const res = await fetch(apiUrl('/video-call-requests'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: searchedPatient.patient_id,
          requested_by_worker_id: workerId,
          notes: searchedPatient.name ? `Video call requested for ${searchedPatient.name}` : null
        })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || 'Failed to send request')
      }
      showModal(t('request_sent_title'), t('request_sent_msg'), 'success')
    } catch (err) {
      showModal(t('request_failed_title'), err.message || t('vc_request_error'), 'error')
    } finally {
      setVcRequestLoading(false)
    }
  }

  const submitConsultation = async () => {
    if (!symptoms) return showModal(t('missing_symptoms_title'), t('missing_symptoms_msg'), "error");
    const consultationId = 'CONS-' + Date.now();
    const workerId = localStorage.getItem('worker_id') || 'worker_default';

    const payload = {
      worker_id: workerId,
      patients: searchedPatient.isNew ? [{
        patient_id: searchedPatient.patient_id,
        registered_by_worker_id: workerId,
        full_name: searchedPatient.name,
        age: searchedPatient.age,
        gender: searchedPatient.gender,
        contact_number: searchedPatient.contact_number || ''
      }] : [],
      consultations: [{
        consultation_id: consultationId,
        patient_id: searchedPatient.patient_id,
        worker_id: workerId,
        symptoms_text: symptoms,
        symptoms_audio_path: '',
        photo_paths: uploadedPhotos.join(',')
      }]
    };

    try {
      const res = await fetch(apiUrl('/sync/offline-data'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(t('sync_failed'));
      showModal(t('sync_success_title'), t('sync_success_msg'), "success");
      setTab('search');
      setSearchedPatient(null);
      setSymptoms('');
      setUploadedPhotos([]);
      setAadharSearch('');
    } catch (err) {
      showModal(t('sync_error_title'), err.message, "error");
    }
  }

  return (
    <div className="dashboard-layout" style={{ background: 'var(--sage-xpale)', minHeight: '100vh' }}>
      
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <Link to="/" className="sidebar-brand" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="logo-icon"><LogoIcon size={38} /></div>
          <span className="logo-text" style={{ fontWeight: 'normal' }}>AROGYA ASHA</span>
        </Link>


        <div className="sidebar-profile">
          <div className="sidebar-avatar" style={{ background: 'var(--ink-light)' }}>AW</div>
          <span style={{ fontSize: '0.95rem', color: 'var(--ink)' }}>{workerName}</span>
          <br/>
          <small>{t('worker_label')}</small>
        </div>

        <span className="nav-group-label" style={{ fontWeight: 'normal' }}>{t('actions_label')}</span>
        <nav className="sidebar-nav">
          <Link to="/asha-dashboard" className={location.pathname === '/asha-dashboard' && tab === 'search' ? 'active' : ''} onClick={() => setTab('search')} style={{ fontWeight: 'normal' }}>
            <span className="material-icons">search</span> {t('nav_search')}
          </Link>
          <a href="#" className={tab === 'add' ? 'active' : ''} onClick={(e) => {e.preventDefault(); setTab('add'); setSearchedPatient(null)}} style={{ fontWeight: 'normal' }}>
            <span className="material-icons">person_add</span> {t('nav_add')}
          </a>
          <Link to="/asha-dashboard/requests" className={location.pathname === '/asha-dashboard/requests' ? 'active' : ''} style={{ fontWeight: 'normal' }}>
            <span className="material-icons">queue</span> {t('nav_queue')}
          </Link>
        </nav>

        <span className="nav-group-label" style={{ marginTop: 12, fontWeight: 'normal' }}>{t('account')}</span>
        <nav className="sidebar-nav">
          <Link to="/" onClick={() => { localStorage.clear() }} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 24px', fontSize:'0.88rem', fontWeight:'normal', color:'var(--ink-mid)' }}>
            <span className="material-icons" style={{ fontSize:'1.2rem', color:'var(--ink-light)' }}>logout</span> {t('nav_logout')}
          </Link>
        </nav>
      </aside>

      {/* ── MAIN ── */}
      <main className="dashboard-main" style={{ padding: '40px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        
        <div className="dash-top" style={{ marginBottom: 36 }}>
          <div className="dash-greet">
            <h2 style={{ fontWeight: 'normal' }}>{t('asha_field_dash')}</h2>
            <p>{t('asha_field_sub')}</p>
          </div>
        </div>

        {tab === 'search' && (
          <div className="dash-card">
            <div className="dash-card-header">
              <h3 style={{ fontWeight: 'normal' }}>{t('search_title')}</h3>
            </div>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
              <input 
                type="text" 
                placeholder={t('search_placeholder')}
                value={aadharSearch}
                onChange={e => setAadharSearch(e.target.value)}
                style={{ flex: 1, padding: '14px 18px', border: '1.5px solid rgba(0,206,209,0.25)', borderRadius: 14, fontFamily: 'var(--font-body)', fontSize: '0.93rem', outline: 'none' }}
              />
              <button type="submit" className="btn btn-primary" style={{ fontWeight: 'normal', borderRadius: 14 }}>
                <span className="material-icons">search</span> {t('search_btn')}
              </button>
            </form>

            {searchedPatient && (
              <div className="asha-patient-card">
                <div className="asha-patient-card-inner">
                  <div className="asha-patient-info">
                    <div className="asha-patient-avatar">
                      {searchedPatient.name ? searchedPatient.name.substring(0, 2).toUpperCase() : 'PT'}
                    </div>
                    <div className="asha-patient-details">
                      <h4 className="asha-patient-name">{searchedPatient.name}</h4>
                      <p className="asha-patient-meta">{t('age')}: {searchedPatient.age} · {t('gender')}: {searchedPatient.gender}</p>
                      <p className="asha-patient-history">
                        <span className="asha-patient-history-label">{t('known_history')}:</span> {searchedPatient.history}
                      </p>
                    </div>
                  </div>
                  <div className="asha-patient-actions">
                    <button
                      type="button"
                      onClick={() => navigate(`/patient/${searchedPatient.patient_id}/history`)}
                      className="asha-btn asha-btn-history"
                    >
                      <span className="material-icons">history</span>
                      {t('patient_history')}
                    </button>
                    <button
                      type="button"
                      onClick={handleStartConsultation}
                      className="asha-btn asha-btn-primary"
                    >
                      {t('start_consultation')} →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'add' && (
          <div className="dash-card">
            <div className="dash-card-header">
              <h3 style={{ fontWeight: 'normal' }}>{t('add_patient_title')}</h3>
            </div>
            <form onSubmit={(e) => { 
                e.preventDefault(); 
                setSearchedPatient({ 
                  patient_id: e.target.aadhar.value,
                  name: e.target.pname.value, 
                  age: parseInt(e.target.page.value), 
                  gender: e.target.gender.value,
                  contact_number: e.target.phone.value,
                  history: 'None reported', 
                  lastVisit: 'First Visit',
                  isNew: true 
                }); 
                setTab('consult') 
              }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--ink-mid)' }}>{t('full_name_label')}</label>
                  <input name="pname" type="text" placeholder={t('patient_name_placeholder')} style={{ width: '100%', padding: '12px 16px', border: '1.5px solid rgba(0,206,209,0.25)', borderRadius: 12, outline: 'none' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--ink-mid)' }}>{t('age_label')}</label>
                  <input name="page" type="number" placeholder={t('age_placeholder')} style={{ width: '100%', padding: '12px 16px', border: '1.5px solid rgba(0,206,209,0.25)', borderRadius: 12, outline: 'none' }} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--ink-mid)' }}>{t('gender_label')}</label>
                  <select name="gender" style={{ width: '100%', padding: '12px 16px', border: '1.5px solid rgba(0,206,209,0.25)', borderRadius: 12, outline: 'none', background: 'white' }} required>
                    <option value="M">{t('gender_male')}</option>
                    <option value="F">{t('gender_female')}</option>
                    <option value="O">{t('gender_other')}</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--ink-mid)' }}>{t('aadhar_label')}</label>
                  <input name="aadhar" type="text" placeholder={t('aadhar_placeholder')} style={{ width: '100%', padding: '12px 16px', border: '1.5px solid rgba(0,206,209,0.25)', borderRadius: 12, outline: 'none' }} required />
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--ink-mid)' }}>{t('contact_label')}</label>
                <input name="phone" type="text" placeholder={t('contact_placeholder')} style={{ width: '100%', padding: '12px 16px', border: '1.5px solid rgba(0,206,209,0.25)', borderRadius: 12, outline: 'none' }} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontWeight: 'normal' }}>
                {t('register_continue_btn')}
              </button>
            </form>
          </div>
        )}

        {tab === 'consult' && searchedPatient && (
          <div className="dash-card">
            <div className="dash-card-header" style={{ borderBottom: '1px solid var(--sage-pale)', paddingBottom: 16, marginBottom: 24 }}>
              <h3 style={{ fontWeight: 'normal' }}>{t('consult_title')}: {searchedPatient.name.toUpperCase()}</h3>
              <button className="asha-btn-history asha-btn" onClick={() => navigate(`/patient/${searchedPatient.patient_id}/history`)} style={{ padding: '8px 16px', borderRadius: 12, fontSize: '0.8rem' }}>
                <span className="material-icons">history</span> {t('patient_history')}
              </button>
            </div>

            <div style={{ marginBottom: 32 }}>
              <label style={{ display: 'block', marginBottom: 12, fontSize: '0.9rem', color: 'var(--ink)' }}>{t('symptoms_label')}</label>
              <textarea 
                placeholder={t('symptoms_placeholder')}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                style={{ width: '100%', minHeight: '120px', padding: '16px', border: '1.5px solid rgba(0,206,209,0.25)', borderRadius: 16, fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }}
              />
            </div>

            <div style={{ marginBottom: 40 }}>
              <label style={{ display: 'block', marginBottom: 12, fontSize: '0.9rem', color: 'var(--ink)' }}>{t('upload_label')}</label>
              <div 
                onClick={() => document.getElementById('file-upload').click()}
                style={{ border: '2px dashed var(--sage-light)', borderRadius: 16, padding: '32px', textAlign: 'center', background: 'var(--sage-xpale)', cursor: 'pointer' }}
              >
                <input id="file-upload" type="file" hidden onChange={handleFileUpload} accept="image/*,.pdf" />
                <span className="material-icons" style={{ fontSize: '3rem', color: 'var(--sage)', marginBottom: 12 }}>cloud_upload</span>
                <p style={{ color: 'var(--ink-mid)', fontSize: '0.9rem', margin: 0 }}>{uploading ? t('uploading') : t('tap_to_upload')}</p>
                <p style={{ color: 'var(--ink-light)', fontSize: '0.75rem', marginTop: 8 }}>{t('file_format_hint')}</p>
              </div>
              
              {uploadedPhotos.length > 0 && (
                <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                  {uploadedPhotos.map((url, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      {url.endsWith('.pdf') ? (
                        <div style={{ width: 80, height: 80, background: '#eee', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span className="material-icons">description</span>
                        </div>
                      ) : (
                        <img src={url} alt="Uploaded" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: 'var(--cream)', padding: 24, borderRadius: 20, border: '1px solid var(--sage-pale)' }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontWeight: 'normal', fontSize: '1.1rem', color: 'var(--ink)', marginBottom: 4 }}>{t('submit_review_title')}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--ink-light)', margin: 0 }}>{t('submit_review_sub')}</p>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                  <button 
                    type="button"
                    onClick={sendVideoCallRequest}
                    disabled={vcRequestLoading}
                    className="asha-btn asha-btn-vc"
                    style={{ padding: '12px 20px', borderRadius: 16 }}
                  >
                    <span className="material-icons">{vcRequestLoading ? 'sync' : 'videocam'}</span> 
                    {vcRequestLoading ? t('sending') : t('request_vc_btn')}
                  </button>
                  <button onClick={submitConsultation} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 'normal', padding: '12px 20px', borderRadius: 16 }}>
                    <span className="material-icons" style={{ fontSize: '1.2rem' }}>cloud_upload</span> {t('sync_btn')}
                  </button>
              </div>
            </div>

          </div>
        )}
      </main>

      <NotificationModal 
        show={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div>
  )
}
