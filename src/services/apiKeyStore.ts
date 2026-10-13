// Almacenamiento de la API key de Gemini SOLO en el navegador del usuario.
// - "Recordar" => localStorage (persiste entre sesiones en este navegador).
// - Sin recordar => sessionStorage (se borra al cerrar la pestaña).
// La clave nunca se envía a ningún servidor propio: va directa de este navegador a la API de Google.

const STORAGE_KEY = 'geospecter.geminiApiKey';
const CHANGE_EVENT = 'geospecter:apikey-change';

const safeGet = (storage: Storage, key: string): string | null => {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
};

const safeRemove = (storage: Storage, key: string) => {
  try {
    storage.removeItem(key);
  } catch {
    // almacenamiento bloqueado (modo privado, cookies deshabilitadas...)
  }
};

export const getApiKey = (): string => {
  return safeGet(window.sessionStorage, STORAGE_KEY) || safeGet(window.localStorage, STORAGE_KEY) || '';
};

export const isApiKeyRemembered = (): boolean => Boolean(safeGet(window.localStorage, STORAGE_KEY));

export const setApiKey = (key: string, remember: boolean): boolean => {
  const trimmed = key.trim();
  clearApiKey(false);
  if (!trimmed) {
    window.dispatchEvent(new Event(CHANGE_EVENT));
    return true;
  }
  try {
    (remember ? window.localStorage : window.sessionStorage).setItem(STORAGE_KEY, trimmed);
    window.dispatchEvent(new Event(CHANGE_EVENT));
    return true;
  } catch {
    return false;
  }
};

export const clearApiKey = (notify = true) => {
  safeRemove(window.localStorage, STORAGE_KEY);
  safeRemove(window.sessionStorage, STORAGE_KEY);
  if (notify) window.dispatchEvent(new Event(CHANGE_EVENT));
};

export const maskApiKey = (key: string): string =>
  key.length <= 8 ? '••••' : `${key.slice(0, 4)}••••••${key.slice(-4)}`;

export const onApiKeyChange = (listener: () => void): (() => void) => {
  window.addEventListener(CHANGE_EVENT, listener);
  // Sincroniza también entre pestañas abiertas de la app
  const storageListener = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) listener();
  };
  window.addEventListener('storage', storageListener);
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    window.removeEventListener('storage', storageListener);
  };
};
