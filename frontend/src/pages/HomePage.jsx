import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useLanguage } from '../context/LanguageContext'

/* ── Reusable reveal wrapper ── */
function Reveal({ children, className = '', delay = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('visible'); obs.unobserve(el) } },
      { threshold: 0.12 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} className={`reveal-up ${delay} ${className}`}>
      {children}
    </div>
  )
}

/* ── Counter animation ── */
function Counter({ target, unit }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        obs.unobserve(el)
        let start = 0
        const step = Math.ceil(target / 60)
        const timer = setInterval(() => {
          start = Math.min(start + step, target)
          setVal(start)
          if (start >= target) clearInterval(timer)
        }, 25)
      }
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [target])
  return <span ref={ref}>{val.toLocaleString()}{unit}</span>
}

const TICKER_KEYS = [
  'ticker_asha', 'ticker_tele', 'ticker_rural', 'ticker_ai',
  'ticker_records', 'ticker_maternal', 'ticker_village'
];

export default function HomePage() {
  const { t } = useLanguage()

  return (
    <>
      <Header />
      <main>

        {/* ── HERO ── */}
        <section className="hero" id="hero">
          <div className="hero-bg-grid" />
          <div className="hero-content">
            <Reveal className="hero-badge">{t('hero_badge')}</Reveal>
            <Reveal delay="delay-1">
              <h1 className="hero-heading">
                {t('hero_title_1')} <span className="highlight-pill">{t('hero_title_pill')}</span><br />{t('hero_title_2')}
              </h1>
            </Reveal>
            <Reveal delay="delay-2">
              <p className="hero-sub">
                {t('hero_sub')}
              </p>
            </Reveal>
            <Reveal delay="delay-3">
              <div className="hero-cta">
                <Link to="/asha-login" className="btn btn-primary">{t('btn_asha_worker')}</Link>
                <Link to="/doctor-login" className="btn btn-outline">{t('btn_doctor_portal')}</Link>
              </div>
            </Reveal>
            <Reveal delay="delay-4">
              <div className="hero-stats">
                <div className="stat">
                  <span className="stat-num"><Counter target={12000} unit="+" /></span>
                  <p>{t('stat_workers')}</p>
                </div>
                <div className="stat-divider" />
                <div className="stat">
                  <span className="stat-num"><Counter target={850} unit="+" /></span>
                  <p>{t('stat_villages')}</p>
                </div>
                <div className="stat-divider" />
                <div className="stat">
                  <span className="stat-num"><Counter target={95} unit="%" /></span>
                  <p>{t('stat_satisfaction')}</p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Hero visual */}
          <div className="hero-visual">
            <div className="hero-card-float hero-card-1">
              <span className="material-icons">monitor_heart</span>
              <div><strong>{t('hero_card_vitals')}</strong><small>{t('hero_card_vitals_sub')}</small></div>
            </div>
            <div className="hero-circle-main">
              <div className="hero-circle-inner">
                <span className="material-icons hero-icon-main">health_and_safety</span>
              </div>
              <div className="orbit orbit-1"><div className="orbit-dot" /></div>
              <div className="orbit orbit-2"><div className="orbit-dot" /></div>
              <div className="orbit orbit-3"><div className="orbit-dot" /></div>
            </div>
            <div className="hero-card-float hero-card-2">
              <span className="material-icons">video_call</span>
              <div><strong>{t('hero_card_tele')}</strong><small>{t('hero_card_tele_sub')}</small></div>
            </div>
          </div>
        </section>

        {/* ── TICKER ── */}
        <div className="ticker-wrap">
          <div className="ticker-track">
            {[...TICKER_KEYS, ...TICKER_KEYS].map((key, i) => (
              <span key={i}>{t(key)}{i % 2 === 1 && <span className="ticker-dot"> ✦ </span>}</span>
            ))}
          </div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <section className="section" id="how-it-works">
          <div className="container">
            <div className="section-header">
              <Reveal><span className="section-label">{t('process_label')}</span></Reveal>
              <Reveal delay="delay-1"><h2 className="section-title">{t('how_it_works_title')} <span className="text-sage">{t('works_highlight')}</span></h2></Reveal>
              <Reveal delay="delay-2"><p className="section-sub">{t('how_it_works_sub')}</p></Reveal>
            </div>
            <div className="steps-grid">
              {[
                { n:'01', icon:'person_pin',      title: t('step1_title'),   body: t('step1_body') },
                { n:'02', icon:'biotech',          title: t('step2_title'),   body: t('step2_body') },
                { n:'03', icon:'video_call',       title: t('step3_title'),   body: t('step3_body') },
                { n:'04', icon:'medical_services', title: t('step4_title'),   body: t('step4_body') },
              ].map((s, i) => (
                <Reveal key={i} delay={`delay-${i+1}`}>
                  <div className="step-card">
                    <div className="step-num">{s.n}</div>
                    <div className="step-icon"><span className="material-icons">{s.icon}</span></div>
                    <h3>{s.title}</h3>
                    <p>{s.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="section-alt" id="features">
          <div className="container">
            <div className="section-header">
              <Reveal><span className="section-label">{t('features_label')}</span></Reveal>
              <Reveal delay="delay-1"><h2 className="section-title">{t('built_for')} <span className="text-sage">{t('bharat')}</span></h2></Reveal>
            </div>
            <div className="features-bento">
              {[
                { size:'bento-large',  icon:'smart_toy',       title: t('feat1_title'),   body: t('feat1_body'), tag: t('feat1_tag') },
                { size:'bento-medium', icon:'folder_shared',   title: t('feat2_title'),   body: t('feat2_body'), tag: t('feat2_tag') },
                { size:'bento-medium', icon:'pregnant_woman',  title: t('feat3_title'),   body: t('feat3_body'), tag: t('feat3_tag') },
                { size:'bento-small',  icon:'local_pharmacy',  title: t('feat4_title'),   body: t('feat4_body'), tag: t('feat4_tag') },
                { size:'bento-small',  icon:'bar_chart',       title: t('feat5_title'),   body: t('feat5_body'), tag: t('feat5_tag') },
                { size:'bento-small',  icon:'wifi_off',        title: t('feat6_title'),   body: t('feat6_body'), tag: t('feat6_tag') },
              ].map((f, i) => (
                <Reveal key={i} delay={`delay-${(i%3)+1}`} className={f.size}>
                  <div className="bento-card" style={{ height: '100%' }}>
                    <div className="bento-icon"><span className="material-icons">{f.icon}</span></div>
                    <h3>{f.title}</h3>
                    <p>{f.body}</p>
                    <div className="bento-tag">{f.tag}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── MISSION ── */}
        <section className="mission-section" id="mission">
          <div className="container">
            <div className="mission-layout">
              <div className="reveal-left mission-text" ref={useRevealRef()}>
                <span className="section-label">{t('mission_label')}</span>
                <h2 className="section-title">{t('mission_title')} <span className="highlight-block">{t('mission_highlight')}</span></h2>
                <p>{t('mission_p1')}</p>
                <p>{t('mission_p2')}</p>
                <a href="#" className="btn btn-primary" style={{ marginTop: '24px' }}>{t('read_story')}</a>
              </div>
              <div className="mission-cards">
                {[
                  { icon:'favorite', num:'150,000+', label: t('stat1_label'), accent:false },
                  { icon:'groups',   num:'12,000+',  label: t('stat2_label'), accent:true },
                  { icon:'science',  num:'97%',      label: t('stat3_label'), accent:false },
                ].map((m, i) => (
                  <div key={i} className={`mcard${m.accent ? ' mcard-accent' : ''}`}>
                    <span className="material-icons mcard-icon">{m.icon}</span>
                    <div>
                      <h4>{m.num}</h4>
                      <p>{m.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="section" id="testimonials">
          <div className="container">
            <div className="section-header">
              <Reveal><span className="section-label">{t('stories_label')}</span></Reveal>
              <Reveal delay="delay-1"><h2 className="section-title">{t('voices_title')} <span className="text-sage">{t('field_highlight')}</span></h2></Reveal>
            </div>
            <div className="testimonials-grid">
              {[
                { quote: t('test1_quote'), name: 'Sunita Sharma', role: t('test1_role'), init: 'SS' },
                { quote: t('test2_quote'), name: 'Dr. Rekha Pillai', role: t('test2_role'), init: 'DR' },
                { quote: t('test3_quote'), name: 'Anil Kumar', role: t('test3_role'), init: 'AK' },
              ].map((t, i) => (
                <Reveal key={i} delay={`delay-${i+1}`}>
                  <div className="tcard">
                    <div className="tcard-quote">"</div>
                    <p>{t.quote}</p>
                    <div className="tcard-author">
                      <div className="tcard-avatar">{t.init}</div>
                      <div>
                        <strong>{t.name}</strong>
                        <small>{t.role}</small>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="cta-section">
          <Reveal>
            <div className="cta-content">
              <h2>{t('cta_title_1')}<br /><span className="cta-highlight">{t('cta_title_2')}</span></h2>
              <p>{t('cta_sub')}</p>
              <div className="cta-actions">
                <Link to="/asha-login"       className="btn btn-white">{t('get_started')}</Link>
                <Link to="/doctor-login" className="btn btn-outline-white">{t('doctor_portal_btn')} →</Link>
              </div>
            </div>
          </Reveal>
        </section>

      </main>
      <Footer />
    </>
  )
}

/* tiny helper to avoid importing the hook (mission section needs imperative ref) */
function useRevealRef() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('visible'); obs.unobserve(el) } },
      { threshold: 0.12 }
    )
    obs.observe(el); return () => obs.disconnect()
  }, [])
  return ref
}
