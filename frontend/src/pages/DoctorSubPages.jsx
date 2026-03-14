import { useState } from 'react'
import { Link } from 'react-router-dom'
import LogoIcon from '../components/LogoIcon'

function DashboardHeader({ title }) {
  return (
    <div className="dash-top" style={{ marginBottom: 36 }}>
      <div className="dash-greet">
        <h2 style={{ fontWeight: 'normal' }}>{title}</h2>
        <p>Manage your professional activities</p>
      </div>
      <div className="dash-actions">
        <Link to="/doctor-dashboard" className="btn btn-outline" style={{ padding:'10px 20px', fontSize:'0.85rem', fontWeight: 'normal' }}>
          <span className="material-icons" style={{ fontSize:'1.1rem' }}>arrow_back</span> Back to Dashboard
        </Link>
      </div>
    </div>
  )
}

function DoctorSidebar({ active }) {
  return (
    <aside className="sidebar">
      <Link to="/" className="sidebar-brand" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="logo-icon"><LogoIcon size={38} /></div>
        <span className="logo-text" style={{ fontWeight: 'normal' }}>AROGYA</span>
      </Link>

      <div className="sidebar-profile">
        <div className="sidebar-avatar">SJ</div>
        <span style={{ fontSize: '0.95rem', color: 'var(--ink)' }}>Dr. Sarah Jenkins</span>
        <br/>
        <small>Senior Cardiologist</small>
      </div>

      <span className="nav-group-label" style={{ fontWeight: 'normal' }}>Main Menu</span>
      <nav className="sidebar-nav">
        <Link to="/doctor-dashboard" className={active === 'Dashboard' ? 'active' : ''} style={{ fontWeight: 'normal' }}><span className="material-icons">dashboard</span>Dashboard</Link>
        <Link to="/doctor/prescriptions" className={active === 'Prescriptions' ? 'active' : ''} style={{ fontWeight: 'normal' }}><span className="material-icons">description</span>Prescriptions</Link>
        <Link to="/doctor/reports" className={active === 'Reports' ? 'active' : ''} style={{ fontWeight: 'normal' }}><span className="material-icons">analytics</span>Reports</Link>
        <Link to="/doctor/messages" className={active === 'Messages' ? 'active' : ''} style={{ fontWeight: 'normal' }}><span className="material-icons">message</span>Messages</Link>
      </nav>

      <span className="nav-group-label" style={{ marginTop: 8, fontWeight: 'normal' }}>Settings</span>
      <nav className="sidebar-nav">
        <a href="#" style={{ fontWeight: 'normal' }}><span className="material-icons">settings</span>Preferences</a>
      </nav>
    </aside>
  )
}

export function PrescriptionsPage() {
  const [prescriptions] = useState([
    { id: 'RX-7489', patient: 'Ramesh Kumar', date: '12 Mar 2026', med: 'Metoprolol 50mg, Aspirin', status: 'Active' },
    { id: 'RX-7490', patient: 'Meena Lal', date: '10 Mar 2026', med: 'Amoxicillin 500mg, Paracetamol', status: 'Completed' },
    { id: 'RX-7491', patient: 'Arjun Singh', date: '08 Mar 2026', med: 'Metformin 500mg', status: 'Active' },
  ]);

  return (
    <div className="dashboard-layout">
      <DoctorSidebar active="Prescriptions" />
      <main className="dashboard-main">
        <DashboardHeader title="PATIENT PRESCRIPTIONS" />
        <div className="dash-card">
          <div className="dash-card-header" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 'normal' }}>RECENT PRESCRIPTIONS</h3>
            <button className="btn btn-primary" style={{ padding:'8px 16px', fontSize:'0.8rem', fontWeight: 'normal' }}>+ New Prescription</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--sage-light)', color: 'var(--ink-mid)' }}>
                <th style={{ padding: '12px 0', fontWeight: 'normal' }}>Prescription ID</th>
                <th style={{ padding: '12px 0', fontWeight: 'normal' }}>Patient Name</th>
                <th style={{ padding: '12px 0', fontWeight: 'normal' }}>Date Issued</th>
                <th style={{ padding: '12px 0', fontWeight: 'normal' }}>Medications</th>
                <th style={{ padding: '12px 0', fontWeight: 'normal' }}>Status</th>
                <th style={{ padding: '12px 0', fontWeight: 'normal', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '16px 0', fontWeight: '600', color: 'var(--sage-dark)' }}>{p.id}</td>
                  <td style={{ padding: '16px 0' }}>{p.patient}</td>
                  <td style={{ padding: '16px 0', color: 'var(--ink-light)' }}>{p.date}</td>
                  <td style={{ padding: '16px 0' }}>{p.med}</td>
                  <td style={{ padding: '16px 0' }}>
                    <span style={{ padding: '4px 8px', borderRadius: 4, background: p.status === 'Active' ? 'var(--sage-pale)' : '#e0e0e0', color: p.status === 'Active' ? 'var(--sage-dark)' : 'var(--ink)' }}>{p.status}</span>
                  </td>
                  <td style={{ padding: '16px 0', textAlign: 'right' }}>
                    <button style={{ border: 'none', background: 'transparent', color: 'var(--sage)', cursor: 'pointer', padding: '0 8px' }}><span className="material-icons">visibility</span></button>
                    <button style={{ border: 'none', background: 'transparent', color: 'var(--ink-light)', cursor: 'pointer', padding: '0 8px' }}><span className="material-icons">print</span></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

export function ReportsPage() {
  return (
    <div className="dashboard-layout">
      <DoctorSidebar active="Reports" />
      <main className="dashboard-main">
        <DashboardHeader title="HEALTH ANALYTICS & REPORTS" />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20, marginBottom: 24 }}>
          <div className="dash-card" style={{ textAlign: 'center' }}>
            <span className="material-icons" style={{ fontSize: '2rem', color: 'var(--sage)', marginBottom: 8 }}>people</span>
            <h3 style={{ fontSize:'2rem', margin: 0, fontWeight: 'normal' }}>1,204</h3>
            <p style={{ color: 'var(--ink-light)', margin: 0 }}>Total Patients Treated</p>
          </div>
          <div className="dash-card" style={{ textAlign: 'center' }}>
            <span className="material-icons" style={{ fontSize: '2rem', color: '#2980B9', marginBottom: 8 }}>trending_up</span>
            <h3 style={{ fontSize:'2rem', margin: 0, fontWeight: 'normal' }}>85%</h3>
            <p style={{ color: 'var(--ink-light)', margin: 0 }}>Recovery Rate</p>
          </div>
          <div className="dash-card" style={{ textAlign: 'center' }}>
            <span className="material-icons" style={{ fontSize: '2rem', color: '#F39C12', marginBottom: 8 }}>timer</span>
            <h3 style={{ fontSize:'2rem', margin: 0, fontWeight: 'normal' }}>12m</h3>
            <p style={{ color: 'var(--ink-light)', margin: 0 }}>Avg. Consultation Time</p>
          </div>
        </div>
        
        <div className="dash-card">
          <h3 style={{ fontWeight: 'normal', marginBottom: 20 }}>Monthly Consultations Breakdown</h3>
          <div style={{ height: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '20px 0', borderBottom: '1px solid var(--sage-light)' }}>
            <div style={{ width: 40, height: '40%', background: 'var(--sage-pale)' }} title="Jan"></div>
            <div style={{ width: 40, height: '60%', background: 'var(--sage)' }} title="Feb"></div>
            <div style={{ width: 40, height: '80%', background: 'var(--sage-dark)' }} title="Mar"></div>
            <div style={{ width: 40, height: '50%', background: 'var(--sage-pale)' }} title="Apr"></div>
            <div style={{ width: 40, height: '70%', background: 'var(--sage)' }} title="May"></div>
            <div style={{ width: 40, height: '90%', background: 'var(--sage-dark)' }} title="Jun"></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 10, color: 'var(--ink-light)' }}>
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
          </div>
        </div>
      </main>
    </div>
  )
}

export function MessagesPage() {
  return (
    <div className="dashboard-layout">
      <DoctorSidebar active="Messages" />
      <main className="dashboard-main">
        <DashboardHeader title="SECURE MESSAGING" />
        <div className="dash-card" style={{ display: 'flex', height: '60vh', padding: 0, overflow: 'hidden' }}>
          {/* Contacts List */}
          <div style={{ width: '30%', borderRight: '1px solid #eee', background: '#fafafa', overflowY: 'auto' }}>
            <div style={{ padding: 16, borderBottom: '1px solid #eee', fontWeight: 'bold' }}>Recent Chats</div>
            {[
              { name: 'Dr. Anita Desai (ASHA)', role: 'Field Worker', time: '10:42 AM' },
              { name: 'Ramesh Kumar', role: 'Patient', time: 'Yesterday' },
              { name: 'Staff Support', role: 'Admin', time: 'Mon' }
            ].map((contact, i) => (
              <div key={i} style={{ padding: 16, borderBottom: '1px solid #eee', cursor: 'pointer', background: i === 0 ? 'white' : 'transparent', borderLeft: i === 0 ? '4px solid var(--sage)' : '4px solid transparent' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <strong style={{ fontWeight: 600, fontSize: '0.9rem' }}>{contact.name}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--ink-light)' }}>{contact.time}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--ink-mid)' }}>{contact.role}</div>
              </div>
            ))}
          </div>
          {/* Chat Window */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: 16, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 20, background: 'var(--sage-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--sage-dark)' }}>AD</div>
              <div>
                <strong style={{ display: 'block', fontWeight: 600 }}>Dr. Anita Desai</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--sage)' }}>• Online</span>
              </div>
            </div>
            
            <div style={{ flex: 1, padding: 20, overflowY: 'auto', background: '#fcfcfc', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ alignSelf: 'flex-start', background: '#eee', padding: '10px 16px', borderRadius: '16px 16px 16px 0', maxWidth: '70%' }}>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>Hello Dr. Jenkins, Patient Ramesh Kumar's vitals look stable today.</p>
                <small style={{ color: 'var(--ink-light)', fontSize: '0.7rem', marginTop: 4, display: 'block' }}>10:30 AM</small>
              </div>
              <div style={{ alignSelf: 'flex-end', background: 'var(--sage-pale)', color: 'var(--sage-dark)', padding: '10px 16px', borderRadius: '16px 16px 0 16px', maxWidth: '70%' }}>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>Excellent. Please continue the current medication dosage.</p>
                <small style={{ color: 'var(--sage)', fontSize: '0.7rem', marginTop: 4, display: 'block' }}>10:42 AM</small>
              </div>
            </div>
            
            <div style={{ padding: 16, borderTop: '1px solid #eee', display: 'flex', gap: 10 }}>
              <input type="text" placeholder="Type your message..." style={{ flex: 1, padding: '10px 16px', borderRadius: 20, border: '1px solid #ddd', outline: 'none' }} />
              <button style={{ width: 40, height: 40, borderRadius: 20, background: 'var(--sage)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-icons" style={{ fontSize: '1.2rem' }}>send</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
