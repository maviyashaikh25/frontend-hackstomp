import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import LogoIcon from '../components/LogoIcon'
import { API_BASE_URL } from '../api'

const API = API_BASE_URL

export default function UserLoginPage() {
  const { t } = useLanguage()
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ aadhaar: '', password: '', full_name: '', contact_number: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const trimmed = (form.aadhaar || '').replace(/\D/g, '').slice(0, 12)
    if (trimmed.length !== 12) {
      setError(t('user_login_invalid_aadhaar') || 'Enter a valid 12-digit Aadhaar.')
      return
    }
    if (!(form.password || '').trim()) {
      setError(t('user_login_enter_password') || 'Enter password.')
      return
    }
    setLoading(true)
    try {
      const endpoint = tab === 'login' ? '/auth/user/login' : '/auth/user/register'
      const payload = tab === 'login'
        ? { aadhaar: trimmed, password: form.password }
        : { aadhaar: trimmed, password: form.password, full_name: form.full_name || trimmed, contact_number: form.contact_number || null }
      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        const msg = Array.isArray(err.detail) ? (err.detail[0]?.msg || err.detail[0]) : (err.detail || t('user_invalid_credentials'))
        throw new Error(typeof msg === 'string' ? msg : t('user_invalid_credentials'))
      }
      const data = await res.json()
      localStorage.setItem('user_token', data.token)
      localStorage.setItem('user_aadhaar', data.id)
      localStorage.setItem('user_name', data.full_name)
      navigate('/user-dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <aside className="auth-side-visual">
        <div className="auth-brand">
          <div className="logo-icon">
            <LogoIcon size={72} color="white" />
          </div>
          <span className="logo-text">AROGYA</span>
          <p>{t('user_login_subtitle') || 'View your health history, book appointments and get medicine reminders.'}</p>
        </div>
        <div className="auth-visual-cards">
          {[
            { icon: 'video_call', title: t('user_login_feature_book_title'), sub: t('user_login_feature_book_sub') },
            { icon: 'history_edu', title: t('user_login_feature_records_title'), sub: t('user_login_feature_records_sub') },
            { icon: 'medication', title: t('user_login_feature_reminders_title'), sub: t('user_login_feature_reminders_sub') },
          ].map((c, i) => (
            <div key={i} className="auth-vcard">
              <span className="material-icons">{c.icon}</span>
              <div>
                <strong>{c.title}</strong>
                <small>{c.sub}</small>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <div className="auth-form-side">
        <Link to="/" style={{ fontSize: '0.85rem', color: 'var(--sage-dark)', fontWeight: 600, marginBottom: 32, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {t('back_to_home') || '← Back to home'}
        </Link>

        <div className="auth-tabs">
          <button type="button" className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => { setTab('login'); setError('') }}>
            {t('login_tab')}
          </button>
          <button type="button" className={`auth-tab${tab === 'register' ? ' active' : ''}`} onClick={() => { setTab('register'); setError('') }}>
            {t('register_tab')}
          </button>
        </div>

        {error && (
          <div style={{ background: '#fee', color: '#c00', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <h2 className="auth-heading">
          {tab === 'login' ? (t('user_login_title') || 'User Login') : (t('user_register_title') || 'Register')}
        </h2>
        <p className="auth-sub">
          {tab === 'login'
            ? (t('user_login_enter_aadhaar') || 'Enter your Aadhaar and password.')
            : (t('user_register_sub') || 'Create an account to book appointments and see reminders.')}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('user_login_aadhaar_label') || 'Aadhaar number'}</label>
            <input
              name="aadhaar"
              type="text"
              inputMode="numeric"
              maxLength={14}
              placeholder={t('user_login_aadhaar_placeholder') || '12-digit Aadhaar'}
              value={form.aadhaar}
              onChange={(e) => setForm((f) => ({ ...f, aadhaar: e.target.value.replace(/\D/g, '').slice(0, 12) }))}
              required
            />
          </div>
          {tab === 'register' && (
            <>
              <div className="form-group">
                <label>{t('full_name_label') || 'Full name'}</label>
                <input name="full_name" type="text" placeholder={t('patient_name_placeholder') || 'Your name'} value={form.full_name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>{t('contact_label') || 'Contact number'}</label>
                <input name="contact_number" type="tel" placeholder="+91 98765 43210" value={form.contact_number} onChange={handleChange} />
              </div>
            </>
          )}
          <div className="form-group">
            <label>{t('user_password_label') || 'Password'}</label>
            <input
              name="password"
              type="password"
              placeholder={tab === 'login' ? t('user_password_placeholder_login') : t('user_password_placeholder_register')}
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? t('loading') : (tab === 'login' ? (t('signin_btn') || 'Sign in') : (t('user_register_btn') || 'Register'))} →
          </button>
        </form>
      </div>
    </div>
  )
}
