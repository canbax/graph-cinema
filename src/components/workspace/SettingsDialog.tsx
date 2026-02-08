import { useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { ParseStrategy } from "text-to-mermaid";
import {
  AppSettingsService,
  type AppSettings,
} from "../../services/AppSettingsService";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange?: () => void;
}

export default function SettingsDialog({
  isOpen,
  onClose,
  onSettingsChange,
}: SettingsDialogProps) {
  const [settings, setSettings] = useState<AppSettings>(
    AppSettingsService.getSettings(),
  );

  // Removed redundant useEffect (state initialized on mount)

  const handleSave = () => {
    AppSettingsService.saveSettings(settings);
    if (onSettingsChange) {
      onSettingsChange();
    }
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      const savedSettings = AppSettingsService.getSettings();
      const hasChanges =
        JSON.stringify(settings) !== JSON.stringify(savedSettings);

      if (!hasChanges) {
        onClose();
      }
    }
  };

  if (!isOpen) return null;

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
          padding: "20px",
          borderRadius: "8px",
          width: "800px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          color: "#333",
        }}
      >
        <div
          className="settings-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Settings</h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className="settings-content">
            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "10px",
                  fontWeight: "bold",
                }}
              >
                Parse Strategy
              </label>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="parseStrategy"
                    value={ParseStrategy.Deterministic}
                    checked={
                      settings.parseStrategy === ParseStrategy.Deterministic
                    }
                    onChange={() =>
                      setSettings({
                        ...settings,
                        parseStrategy: ParseStrategy.Deterministic,
                      })
                    }
                    style={{ marginRight: "10px" }}
                  />
                  Deterministic (Rule-based)
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="parseStrategy"
                    value={ParseStrategy.Gemini}
                    checked={settings.parseStrategy === ParseStrategy.Gemini}
                    onChange={() =>
                      setSettings({
                        ...settings,
                        parseStrategy: ParseStrategy.Gemini,
                      })
                    }
                    style={{ marginRight: "10px" }}
                  />
                  Gemini AI
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="parseStrategy"
                    value={ParseStrategy.Llm}
                    checked={settings.parseStrategy === ParseStrategy.Llm}
                    onChange={() =>
                      setSettings({
                        ...settings,
                        parseStrategy: ParseStrategy.Llm,
                      })
                    }
                    style={{ marginRight: "10px" }}
                  />
                  Local LLM / Custom
                </label>
              </div>
            </div>

            {settings.parseStrategy === ParseStrategy.Gemini && (
              <div className="form-group" style={{ marginBottom: "15px" }}>
                <label
                  htmlFor="aiApiKey"
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontSize: "0.9rem",
                  }}
                >
                  Gemini API Key
                </label>
                <input
                  id="aiApiKey"
                  type="password"
                  value={settings.aiApiKey || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, aiApiKey: e.target.value })
                  }
                  placeholder="sk-..."
                  autoComplete="off"
                  style={{
                    width: "95%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
            )}

            {settings.parseStrategy === ParseStrategy.Llm && (
              <div className="form-group" style={{ marginBottom: "15px" }}>
                <label
                  htmlFor="aiBaseUrl"
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontSize: "0.9rem",
                  }}
                >
                  LLM Base URL
                </label>
                <input
                  id="aiBaseUrl"
                  type="text"
                  value={settings.aiBaseUrl || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, aiBaseUrl: e.target.value })
                  }
                  placeholder="http://localhost:11434/v1"
                  style={{
                    width: "95%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "10px",
                fontWeight: "bold",
              }}
            >
              Layout Direction
            </label>
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="layoutDirection"
                  value="TD"
                  checked={
                    settings.layoutDirection === "TD" ||
                    !settings.layoutDirection
                  }
                  onChange={() =>
                    setSettings({ ...settings, layoutDirection: "TD" })
                  }
                  style={{ marginRight: "10px" }}
                />
                Top Down (TD)
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="layoutDirection"
                  value="LR"
                  checked={settings.layoutDirection === "LR"}
                  onChange={() =>
                    setSettings({ ...settings, layoutDirection: "LR" })
                  }
                  style={{ marginRight: "10px" }}
                />
                Left to Right (LR)
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="layoutDirection"
                  value="BT"
                  checked={settings.layoutDirection === "BT"}
                  onChange={() =>
                    setSettings({ ...settings, layoutDirection: "BT" })
                  }
                  style={{ marginRight: "10px" }}
                />
                Bottom Up (BT)
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="layoutDirection"
                  value="RL"
                  checked={settings.layoutDirection === "RL"}
                  onChange={() =>
                    setSettings({ ...settings, layoutDirection: "RL" })
                  }
                  style={{ marginRight: "10px" }}
                />
                Right to Left (RL)
              </label>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "15px" }}>
            <label
              htmlFor="wpm"
              style={{
                display: "block",
                marginBottom: "10px",
                fontWeight: "bold",
              }}
            >
              Words Per Minute (WPM)
            </label>
            <input
              id="wpm"
              type="number"
              min="1"
              max="1000"
              value={settings.wpm || 200}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  wpm: parseInt(e.target.value) || 200,
                })
              }
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>

          <div
            className="settings-footer"
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "20px",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                marginRight: "10px",
                padding: "8px 16px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: "8px 16px",
                borderRadius: "4px",
                border: "none",
                background: "#007bff",
                color: "white",
                cursor: "pointer",
              }}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
