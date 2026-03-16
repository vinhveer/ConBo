import { useEffect } from "react";

export function AppModal({ open, title, onClose, children, footer, size = "default" }) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="app-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        aria-modal="true"
        className={`app-modal app-modal-${size}`}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="app-modal-header">
          <h2 className="app-modal-title">{title}</h2>
          <button aria-label="Đóng" className="app-modal-close" onClick={onClose} type="button">
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="app-modal-body">{children}</div>
        {footer ? <div className="app-modal-footer">{footer}</div> : null}
      </div>
    </div>
  );
}
