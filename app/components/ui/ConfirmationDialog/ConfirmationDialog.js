'use client';

import Modal from '../Modal/Modal';
import Button from '../Button/Button';

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false
}) {
  const variantStyles = {
    danger: { bg: '#dc2626', hover: '#b91c1c' },
    warning: { bg: '#f59e0b', hover: '#d97706' },
    primary: { bg: '#2563eb', hover: '#1d4ed8' },
    success: { bg: '#10b981', hover: '#059669' }
  };

  const style = variantStyles[variant] || variantStyles.danger;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="confirmation-dialog">
        <div className="message">{message}</div>
        <div className="actions">
          <Button variant="secondary" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            style={{ background: style.bg }}
            className="confirm-btn"
          >
            {loading ? 'Processing...' : confirmText}
          </Button>
        </div>
      </div>
      <style jsx>{`
        .confirmation-dialog {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .message {
          font-size: 0.875rem;
          color: #374151;
          line-height: 1.5;
        }
        .actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
        }
        .confirm-btn {
          background: ${style.bg};
        }
        .confirm-btn:hover {
          background: ${style.hover};
        }
      `}</style>
    </Modal>
  );
}