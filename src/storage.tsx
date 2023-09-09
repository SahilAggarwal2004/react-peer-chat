import { useState } from "react";

const setStorage = (key: string, value: any, local = false) => (local ? localStorage : sessionStorage).setItem(key, JSON.stringify(value))

export const removeStorage = (key: string, local = false) => (local ? localStorage : sessionStorage).removeItem(key)

const getStorage = (key: string, fallbackValue?: any, local = false) => {
    if (typeof window === "undefined") return fallbackValue
    let value = (local ? localStorage : sessionStorage).getItem(key)
    try {
        if (!value) throw new Error("Value doesn't exist")
        value = JSON.parse(value)
    } catch {
        if (fallbackValue !== undefined) {
            value = fallbackValue
            setStorage(key, value, local)
        } else {
            value = null
            removeStorage(key, local)
        }
    }
    return value
}

export default function useStorage<Value>(key: string, initialValue: Value, { local = false, save = false } = {}): [Value, (value: Value | ((old: Value) => Value)) => void] {
    save ||= getStorage('mode') !== 'online'
    const [storedValue, setStoredValue] = useState(save ? getStorage(key, initialValue, local) : initialValue)
    const setValue = (value: Value | ((old: Value) => Value)) => {
        setStoredValue((old: Value) => {
            const updatedValue = typeof value === 'function' ? (value as Function)(old) : value;
            if (save) setStorage(key, updatedValue, local)
            return updatedValue
        })
    };
    return [storedValue, setValue];
}