import { VoidFunction } from "../types";

const listeners = new Map<string, Set<(value: any) => void>>();

export function clearChat() {
  removeStorage("rpc-remote-peer", false);
  removeStorage("rpc-messages", false);
}

const getStorageInstance = (local: boolean) => (local ? localStorage : sessionStorage);

const getNamespacedKey = (key: string, local: boolean) => `${local ? "local" : "session"}:${key}`;

export function getStorage<T>(key: string, local: boolean, fallbackValue?: T): T | undefined {
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

export function removeStorage(key: string, local: boolean) {
  getStorageInstance(local).removeItem(key);
  publish(key, local);
}

export function setStorage(key: string, value: unknown, local: boolean) {
  if (typeof value === "function") value = value(getStorage(key, local));
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
