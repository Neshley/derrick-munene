// Browser-only API key manager for Gemini
// Saves the API key strictly to browser localStorage as requested by the user.

const STORAGE_KEY = 'genos_gemini_browser_api_key';

export function getStoredApiKey(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch (e) {
    console.warn('Unable to read API key from localStorage', e);
    return '';
  }
}

export function setStoredApiKey(key: string): void {
  try {
    if (key.trim()) {
      localStorage.setItem(STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    window.dispatchEvent(new CustomEvent('genos-api-key-updated', { detail: key.trim() }));
  } catch (e) {
    console.error('Unable to save API key to localStorage', e);
  }
}

export function clearStoredApiKey(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
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
  }
  return headers;
}
