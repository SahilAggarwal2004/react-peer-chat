import { useState } from "react";
const setStorage = (key, value, local = false) => (local ? localStorage : sessionStorage).setItem(key, JSON.stringify(value));
export const removeStorage = (key, local = false) => (local ? localStorage : sessionStorage).removeItem(key);
const getStorage = (key, fallbackValue, local = false) => {
    if (typeof window === "undefined")
        return fallbackValue;
    let value = (local ? localStorage : sessionStorage).getItem(key);
    try {
        if (!value)
            throw new Error("Value doesn't exist");
        value = JSON.parse(value);
    }
    catch (_a) {
        if (fallbackValue !== undefined) {
            value = fallbackValue;
            setStorage(key, value, local);
        }
        else {
            value = null;
            removeStorage(key, local);
        }
    }
    return value;
};
export default function useStorage(key, initialValue, { local = false, save = false } = {}) {
    save || (save = getStorage('mode') !== 'online');
    const [storedValue, setStoredValue] = useState(save ? getStorage(key, initialValue, local) : initialValue);
    const setValue = (value) => {
        setStoredValue((old) => {
            const updatedValue = typeof value === 'function' ? value(old) : value;
            if (save)
                setStorage(key, updatedValue, local);
            return updatedValue;
        });
    };
    return [storedValue, setValue];
}
