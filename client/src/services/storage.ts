const STORAGE_PREFIX = 'media-basket-mini:';

type StoreValue = Record<string, unknown> | unknown[] | string | number | boolean | null;

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const value = window.localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!value) {
      return fallback;
    }
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn('[storage] read failed', error);
    return fallback;
  }
}

export function writeStorage(key: string, value: StoreValue) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  } catch (error) {
    console.warn('[storage] write failed', error);
  }
}

export function clearStorage(key: string) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
}
