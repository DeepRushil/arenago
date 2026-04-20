import PropTypes from 'prop-types';

export default function ToastManager({ toasts, removeToast }) {
  return (
    <div
      className="toast-container"
      role="status"
      aria-live="polite"
      aria-atomic="false"
      aria-label="Notifications"
    >
      {toasts.map(t => (
        <div key={t.id} className="toast" role="alert">
          <span className="toast-icon" aria-hidden="true">{t.icon}</span>
          <span className="toast-message">{t.message}</span>
          <button
            className="toast-close"
            onClick={() => removeToast(t.id)}
            aria-label="Dismiss notification"
          >✕</button>
        </div>
      ))}
    </div>
  );
}

ToastManager.propTypes = {
  toasts: PropTypes.arrayOf(
    PropTypes.shape({
      id:      PropTypes.number.isRequired,
      message: PropTypes.string.isRequired,
      icon:    PropTypes.string,
    })
  ).isRequired,
  removeToast: PropTypes.func.isRequired,
};
