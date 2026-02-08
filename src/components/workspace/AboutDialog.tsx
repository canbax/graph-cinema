import { createPortal } from "react-dom";
import { X, Github } from "lucide-react";

interface AboutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutDialog({ isOpen, onClose }: AboutDialogProps) {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="settings-overlay"
      onClick={handleOverlayClick}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        className="settings-modal"
        style={{
          backgroundColor: "white",
          padding: "24px",
          borderRadius: "12px",
          width: "800px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          color: "#333",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#666",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#f0f0f0")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h2
            style={{
              margin: "0 0 8px 0",
              fontSize: "1.5rem",
              color: "#1a1a1a",
            }}
          >
            About Graph Cinema
          </h2>

          <p style={{ margin: 0, color: "#666", fontSize: "0.95rem" }}>
            Turn your words into a visual experience. Graph Cinema transforms
            your text into engaging visual storyboards instantly. Give a visual
            life to your boring text. Happy directing! 🎬
          </p>
        </div>

        <div
          style={{
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "20px",
            fontSize: "0.9rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "8px",
            }}
          >
            <span style={{ color: "#666" }}>Version</span>
            <span style={{ fontWeight: 500 }}>{__APP_VERSION__}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#666" }}>Commit</span>
            <span
              style={{
                fontFamily: "monospace",
                backgroundColor: "#e9ecef",
                padding: "2px 6px",
                borderRadius: "4px",
                fontSize: "0.85rem",
              }}
            >
              {__COMMIT_HASH__}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <a
            href="https://github.com/canbax/graph-cinema"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
              color: "#24292e",
              fontWeight: 500,
              padding: "8px 16px",
              borderRadius: "6px",
              border: "1px solid #e1e4e8",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#f6f8fa")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "white")
            }
          >
            <Github size={18} />
            View on GitHub
          </a>
        </div>
      </div>
    </div>,
    document.body,
  );
}
