import React from 'react';

export default function NotificationModal({ show, onClose, title, message, type = 'success' }) {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <span className="material-icons">close</span>
        </button>
        <div className={`modal-icon-wrap ${type}`}>
          <span className="material-icons">
            {type === 'success' ? 'check_circle' : 'error'}
          </span>
        </div>
        <h3 className="modal-title">{title}</h3>
        <p className="modal-message">{message}</p>
        <button 
          className="btn btn-primary" 
          style={{ width: '100%', borderRadius: 12, padding: '12px', fontWeight: 'normal' }}
          onClick={onClose}
        >
          Okay
        </button>
      </div>
    </div>
  );
}
