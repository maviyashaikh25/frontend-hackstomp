import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import LogoIcon from './LogoIcon'

export default function Footer() {
  const { t } = useLanguage()
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo">
            <LogoIcon size={36} color="currentColor" />
            <span>AROGYA</span>
          </div>
          <p>{t('footer_sub')}</p>
          <div className="footer-socials">
            <a href="#" aria-label="Twitter">𝕏</a>
            <a href="#" aria-label="LinkedIn">in</a>
            <a href="#" aria-label="Instagram">IG</a>
          </div>
        </div>
        <div className="footer-links">
          <div className="footer-col">
            <h5>{t('footer_platform')}</h5>
            <Link to="/asha-login">{t('nav_asha_portal')}</Link>
            <Link to="/doctor-login">{t('doctor_dashboard_title')}</Link>
            <a href="#">{t('ticker_records')}</a>
            <a href="#">{t('ticker_tele')}</a>
          </div>
          <div className="footer-col">
            <h5>{t('footer_company')}</h5>
            <a href="#">{t('footer_about')}</a>
            <Link to="/user-login">{t('nav_user_login') || 'User Login'}</Link>
            <a href="#">{t('footer_press')}</a>
            <a href="#">{t('footer_careers')}</a>
          </div>
          <div className="footer-col">
            <h5>{t('footer_support')}</h5>
            <a href="#">{t('footer_help')}</a>
            <a href="#">{t('footer_training')}</a>
            <a href="#">{t('footer_contact')}</a>
            <a href="#">{t('footer_data_privacy')}</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 Arogya Health Technologies Pvt. Ltd. {t('footer_rights')}</p>
        <div className="footer-bottom-links">
          <a href="#">{t('footer_privacy')}</a>
          <a href="#">{t('footer_terms')}</a>
          <a href="#">{t('footer_abdm')}</a>
        </div>
      </div>
    </footer>
  )
}
