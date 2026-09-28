import React from 'react';

export function ConfirmModal({
  isOpen,
  title = 'Are you sure?',
  message = 'Your unsaved progress will be lost.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop confirm-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal-card modal-small">
        <div className="confirm-icon-wrapper">
          <span className="confirm-emoji">{isDanger ? '⚠️' : '❓'}</span>
        </div>
        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-message">{message}</p>

        <div className="confirm-actions">
          <button className="btn btn-secondary" onClick={onCancel} autoFocus>
            {cancelText}
          </button>
          <button
            className={`btn ${isDanger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
