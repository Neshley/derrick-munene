// Browser-safe API key manager for Gemini
// Reads from localStorage or Vite environment variables

const STORAGE_KEYS = [
  'genos_gemini_browser_api_key',
  'gemini_api_key',
  'google_genai_api_key',
  'GEMINI_API_KEY',
];

export function getStoredApiKey(): string {
  try {
    for (const key of STORAGE_KEYS) {
      const val = localStorage.getItem(key);
      if (val && val.trim()) {
        return val.trim();
      }
    }
    // Also check Vite env if provided during build or runtime
    const viteKey = (import.meta as any)?.env?.VITE_GEMINI_API_KEY;
    if (typeof viteKey === 'string' && viteKey.trim()) {
      return viteKey.trim();
    }
  } catch (e) {
    console.warn('Unable to read API key from storage', e);
  }
  return '';
}

export function setStoredApiKey(key: string): void {
  try {
    const trimmed = key.trim();
    if (trimmed) {
      localStorage.setItem('genos_gemini_browser_api_key', trimmed);
      localStorage.setItem('gemini_api_key', trimmed);
    } else {
      STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
    }
    window.dispatchEvent(new CustomEvent('genos-api-key-updated', { detail: trimmed }));
  } catch (e) {
    console.error('Unable to save API key to localStorage', e);
  }
}

export function clearStoredApiKey(): void {
  try {
    STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
    window.dispatchEvent(new CustomEvent('genos-api-key-updated', { detail: '' }));
  } catch (e) {
    console.error('Unable to clear API key from localStorage', e);
  }
}

export function getAiFetchHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const key = getStoredApiKey();
  if (key) {
    headers['x-gemini-api-key'] = key;
    headers['Authorization'] = `Bearer ${key}`;
  }
  return headers;
}

