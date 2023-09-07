import { useState } from "react";
var setStorage = function (key, value, local) {
    if (local === void 0) { local = false; }
    return (local ? localStorage : sessionStorage).setItem(key, JSON.stringify(value));
};
var removeStorage = function (key, local) {
    if (local === void 0) { local = false; }
    return (local ? localStorage : sessionStorage).removeItem(key);
};
var getStorage = function (key, fallbackValue, local) {
    if (local === void 0) { local = false; }
    if (typeof window === "undefined")
        return fallbackValue;
    var value = (local ? localStorage : sessionStorage).getItem(key);
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
export default function useStorage(key, initialValue, _a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.local, local = _c === void 0 ? false : _c, _d = _b.save, save = _d === void 0 ? false : _d;
    save || (save = getStorage('mode') !== 'online');
    var _e = useState(save ? getStorage(key, initialValue, local) : initialValue), storedValue = _e[0], setStoredValue = _e[1];
    var setValue = function (value) {
        setStoredValue(function (old) {
            var updatedValue = typeof value === 'function' ? value(old) : value;
            if (save)
                setStorage(key, updatedValue, local);
            return updatedValue;
        });
    };
    return [storedValue, setValue];
}
