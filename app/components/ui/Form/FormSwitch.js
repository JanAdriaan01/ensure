'use client';

export default function FormSwitch({ 
  label, 
  checked, 
  onChange, 
  labelLeft, 
  labelRight,
  disabled = false,
  className = '' 
}) {
  return (
    <div className={`form-switch ${className}`}>
      {label && <label className="switch-label">{label}</label>}
      <div className="switch-container">
        {labelLeft && <span className="switch-option-left">{labelLeft}</span>}
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          className={`switch ${checked ? 'checked' : ''}`}
          onClick={() => onChange({ target: { checked: !checked } })}
          disabled={disabled}
        >
          <span className="switch-slider" />
        </button>
        {labelRight && <span className="switch-option-right">{labelRight}</span>}
      </div>
      <style jsx>{`
        .form-switch {
          margin-bottom: 1rem;
        }
        .switch-label {
          display: block;
          margin-bottom: 0.375rem;
          font-weight: 500;
          font-size: 0.875rem;
          color: #374151;
        }
        .switch-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .switch {
          position: relative;
          width: 44px;
          height: 24px;
          background: #d1d5db;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
          padding: 0;
        }
        .switch.checked {
          background: #2563eb;
        }
        .switch-slider {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          transition: transform 0.2s;
        }
        .switch.checked .switch-slider {
          transform: translateX(20px);
        }
        .switch-option-left, .switch-option-right {
          font-size: 0.75rem;
          color: #6b7280;
        }
        .switch:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}