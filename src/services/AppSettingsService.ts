import { ParseStrategy } from "text-to-mermaid";

export interface AppSettings {
  parseStrategy: ParseStrategy;
  aiBaseUrl?: string;
  aiApiKey?: string;
  layoutDirection: "TD" | "LR" | "BT" | "RL";
  wpm: number;
}

const SETTINGS_KEY = "app_settings";

const DEFAULT_SETTINGS: AppSettings = {
  parseStrategy: ParseStrategy.Deterministic,
  aiBaseUrl: "",
  aiApiKey: "",
  layoutDirection: "TD",
  wpm: 200,
};

export const AppSettingsService = {
  saveSettings: (settings: AppSettings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  getSettings: (): AppSettings => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      } catch (e) {
        console.error("Failed to parse app settings", e);
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  },
};
