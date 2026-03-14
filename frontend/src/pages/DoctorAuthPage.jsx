import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import LogoIcon from '../components/LogoIcon'
import { apiUrl } from '../api'

export default function DoctorAuthPage() {
  const { t } = useLanguage()
  const [tab, setTab]     = useState('login')
  const [form, setForm]   = useState({})
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  
  const handleSubmit = async e => { 
    e.preventDefault()
    setError('')
    
    try {
      const endpoint = tab === 'login' ? '/auth/doctor/login' : '/auth/doctor/register'
      let payload = {}
      
      if (tab === 'login') {
        payload = {
          email: form.email,
          password: form.password
        }
      } else {
        payload = {
          full_name: form.fullName,
          email: form.email,
          password: form.password,
          specialization: form.specialization,
          hospital_name: form.hospital || ''
        }
      }

      const res = await fetch(apiUrl(endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.detail || 'Authentication failed')
      }

      const data = await res.json()
      localStorage.setItem('doctor_token', data.token)
      localStorage.setItem('doctor_id', data.id)
      localStorage.setItem('doctor_name', data.full_name)
      
      navigate('/doctor-dashboard') 
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="auth-page">
      {/* Left visual panel */}
      <aside className="auth-side-visual" style={{ background: 'linear-gradient(160deg, var(--sage-dark) 0%, var(--ink-light) 100%)' }}>
        <div className="auth-brand">
          <div className="logo-icon">
            <LogoIcon size={72} color="white" />
          </div>
          <span className="logo-text" style={{ fontWeight: 'normal' }}>AROGYA FOR DOCTORS</span>
          <p>Join our network of medical professionals delivering remote healthcare across India.</p>
        </div>

        <div className="auth-visual-cards">
          {[
            { icon:'health_and_safety', title:'Verified Network',   sub:'Trusted by thousands of peers' },
            { icon:'schedule',          title:'Flexible Hours',     sub:'Consult when you are available' },
            { icon:'monetization_on',   title:'Guaranteed Payouts', sub:'Timely compensation for your time' },
          ].map((c, i) => (
            <div key={i} className="auth-vcard">
              <span className="material-icons">{c.icon}</span>
              <div>
                <strong style={{ fontWeight: 600 }}>{c.title}</strong>
                <small>{c.sub}</small>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Right form panel */}
      <div className="auth-form-side">

        {/* Back link */}
        <Link to="/" style={{ fontSize:'0.85rem', color:'var(--sage-dark)', fontWeight: 'normal', marginBottom:32, display:'inline-flex', alignItems:'center', gap:6 }}>
          {t('back_to_home')}
        </Link>

        {/* Tab toggle */}
        <div className="auth-tabs">
          <button className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => { setTab('login'); setError('') }} style={{ fontWeight: 'normal' }}>{t('login_tab')}</button>
          <button className={`auth-tab${tab === 'register' ? ' active' : ''}`} onClick={() => { setTab('register'); setError('') }} style={{ fontWeight: 'normal' }}>{t('register_tab')}</button>
        </div>

        {error && <div style={{ background: '#fee', color: '#c00', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: '0.85rem' }}>{error}</div>}

        {tab === 'login' ? (
          <>
            <h2 className="auth-heading" style={{ fontWeight: 'normal' }}>{t('welcome_back')}</h2>
            <p className="auth-sub" style={{ fontWeight: 'normal' }}>{t('signin_sub')}</p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label style={{ fontWeight: 'normal' }}>{t('phone_number_label')}</label>
                <input name="email" type="email" placeholder="dr.smith@example.com" onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label style={{ fontWeight: 'normal' }}>{t('pincode_label')}</label>
                <input name="password" type="password" placeholder="Enter password" onChange={handleChange} required />
              </div>
              <button type="submit" className="auth-submit" style={{ fontWeight: 'normal' }}>{t('signin_btn')} →</button>
            </form>
          </>
        ) : (
          <>
            <h2 className="auth-heading" style={{ fontWeight: 'normal' }}>{t('join_doctor_title')}</h2>
            <p className="auth-sub" style={{ fontWeight: 'normal' }}>{t('join_doctor_sub')}</p>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label style={{ fontWeight: 'normal' }}>{t('full_name_label')}</label>
                  <input name="fullName" type="text" placeholder="Dr. Sarah Jenkins" onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label style={{ fontWeight: 'normal' }}>{t('specialization_label')}</label>
                  <select name="specialization" onChange={handleChange} required>
                    <option value="">{t('select_specialty')}</option>
                    {['General Medicine','Cardiology','Pediatrics','Gynecology','Dermatology','Orthopedics','Psychiatry'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label style={{ fontWeight: 'normal' }}>{t('hospital_label')}</label>
                <input name="hospital" type="text" placeholder="City General Hospital" onChange={handleChange} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label style={{ fontWeight: 'normal' }}>{t('email_label')}</label>
                  <input name="email" type="email" placeholder="doctor@example.com" onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label style={{ fontWeight: 'normal' }}>{t('password_label')}</label>
                  <input name="password" type="password" placeholder="Create a strong password" onChange={handleChange} required />
                </div>
              </div>
              <button type="submit" className="auth-submit" style={{ fontWeight: 'normal' }}>{t('register_continue_btn')} →</button>
            </form>
          </>
        )}

      </div>
    </div>
  )
}
