import { VoidFunction } from "../types";

const listeners = new Map<string, Set<(value: any) => void>>();

export function clearChat() {
  removeStorage("rpc-remote-peer");
  removeStorage("rpc-messages");
}

const getStorageInstance = (local = true) => (local ? localStorage : sessionStorage);

export function clearStorage(prefix = "", local = true) {
  const storage = getStorageInstance(local);
  const keysToRemove = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key && key.startsWith(prefix)) keysToRemove.push(key);
  }
  keysToRemove.forEach((key) => removeStorage(key, local));
}

const getNamespacedKey = (key: string, local = true) => `${local ? "local" : "session"}:${key}`;

export function getStorage<T>(key: string, fallbackValue?: T, local = true): T | undefined {
  if (typeof window === "undefined") return fallbackValue;
  const value = getStorageInstance(local).getItem(key);
  if (value) {
    try {
      return JSON.parse(value);
    } catch {
      removeStorage(key, local); // Remove corrupted data
    }
  }
  if (fallbackValue !== undefined) setStorage(key, fallbackValue, local);
  return fallbackValue;
}

function publish<T>(key: string, local: boolean, value?: T) {
  const callbacks = listeners.get(getNamespacedKey(key, local));
  if (callbacks) callbacks.forEach((callback) => callback(value));
}

export function removeStorage(key: string, local = true) {
  getStorageInstance(local).removeItem(key);
  publish(key, local);
}

export function setStorage(key: string, value: unknown, local = true) {
  if (typeof value === "function") value = value(getStorage(key, undefined, local));
  getStorageInstance(local).setItem(key, JSON.stringify(value));
  publish(key, local, value);
}

export function subscribeToStorage<T>(key: string, local: boolean, callback: (value: T) => void): VoidFunction {
  key = getNamespacedKey(key, local);
  if (!listeners.has(key)) listeners.set(key, new Set());
  const set = listeners.get(key)!;
  set.add(callback);

  return () => {
    set.delete(callback);
    if (set.size === 0) listeners.delete(key);
  };
}
