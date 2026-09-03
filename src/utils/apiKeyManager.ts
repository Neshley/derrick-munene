// Server-side AI Connection Manager
// Enforces that secrets are kept strictly server-side (process.env.GEMINI_API_KEY)
// Automatically purges any legacy secrets from browser localStorage for security.

const LEGACY_STORAGE_KEYS = [
  'genos_gemini_browser_api_key',
  'gemini_api_key',
  'google_genai_api_key',
  'GEMINI_API_KEY',
];

// Purge any legacy browser-stored keys immediately to uphold security
export function purgeBrowserStoredSecrets(): void {
  try {
    if (typeof localStorage !== 'undefined') {
      LEGACY_STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
    }
  } catch (e) {
    // Ignore storage errors
  }
}

// Automatically invoke on module load
purgeBrowserStoredSecrets();

export interface ServerAiStatus {
  configured: boolean;
  active: boolean;
  message: string;
  details?: string;
  hasGeminiKey?: boolean;
}

export async function checkServerAiStatus(): Promise<ServerAiStatus> {
  try {
    const res = await fetch('/api/ai/status');
    if (res.ok) {
      const data = await res.json();
      return {
        configured: Boolean(data.configured),
        active: Boolean(data.active),
        message: data.message || 'Connected to server AI',
        details: data.details,
      };
    }
    // Try health check
    const healthRes = await fetch('/api/health');
    if (healthRes.ok) {
      const healthData = await healthRes.json();
      return {
        configured: Boolean(healthData.hasGeminiKey),
        active: Boolean(healthData.hasGeminiKey),
        message: healthData.hasGeminiKey ? 'Gemini configured on server' : 'No Gemini key on server',
        hasGeminiKey: healthData.hasGeminiKey,
      };
    }
  } catch (e: any) {
    return {
      configured: false,
      active: false,
      message: 'Server unreachable or offline. Local algorithmic mode active.',
      details: e.message,
    };
  }
  return {
    configured: false,
    active: false,
    message: 'Unable to determine server AI status.',
  };
}

// Backwards-compatible stubs that do NOT store secrets
export function getStoredApiKey(): string {
  // Always returns empty string - secrets are managed server-side
  return '';
}

export function setStoredApiKey(_key: string): void {
  // Deliberately no-op: server-side only
  purgeBrowserStoredSecrets();
}

export function clearStoredApiKey(): void {
  purgeBrowserStoredSecrets();
}

export function getAiFetchHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
  };
}
