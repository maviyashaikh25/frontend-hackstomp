import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import LogoIcon from './LogoIcon'
import LanguageSelector from './LanguageSelector'
import OfflineStatusBadge from './OfflineStatusBadge'

export default function Header() {
  const { t } = useLanguage()
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  return (
    <header className={`site-header${scrolled ? ' scrolled' : ''}`}>
      {/* Desktop nav */}
      <nav className="nav-container">
        <div className="nav-left">
          <NavLink to="/" className="nav-link">{t('nav_home')}</NavLink>
          <a href="/#how-it-works" className="nav-link">{t('nav_how_it_works')}</a>
          <a href="/#features" className="nav-link">{t('nav_features')}</a>
        </div>

        <div className="logo-stack">
          <Link to="/" className="logo-wrap">
            <div className="logo-icon">
              <LogoIcon />
            </div>
            <span className="logo-text">AROGYA</span>
          </Link>
          <OfflineStatusBadge className="offline-badge--under-logo" autoHideMs={12000} />
        </div>

        <div className="nav-right">
          {pathname === '/' && <LanguageSelector />}
          <NavLink to="/user-login" className="nav-link">{t('nav_user_login') || 'User Login'}</NavLink>
          <NavLink to="/asha-login" className="nav-link">{t('nav_asha_portal')}</NavLink>
          <NavLink to="/doctor-login" className="nav-btn">{t('nav_doctor_login')}</NavLink>
        </div>
      </nav>

      {/* Mobile nav */}
      <div className="nav-mobile">
        <button
          className="burger"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
        <Link to="/" className="logo-wrap-mobile">AROGYA</Link>
      </div>
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          {pathname === '/' && <LanguageSelector />}
        </div>
        <Link to="/">{t('nav_home')}</Link>
        <a href="/#how-it-works" onClick={() => setMenuOpen(false)}>{t('nav_how_it_works')}</a>
        <a href="/#features" onClick={() => setMenuOpen(false)}>{t('nav_features')}</a>
        <Link to="/user-login" onClick={() => setMenuOpen(false)}>{t('nav_user_login') || 'User Login'}</Link>
        <Link to="/asha-login">{t('nav_asha_portal')}</Link>
        <Link to="/doctor-login">{t('nav_doctor_login')}</Link>
      </div>
    </header>
  )
}
