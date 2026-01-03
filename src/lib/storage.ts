export const removeStorage = (key: string, local = false) => (local ? localStorage : sessionStorage).removeItem(key);

export const setStorage = (key: string, value: any, local = false) => (local ? localStorage : sessionStorage).setItem(key, JSON.stringify(value));

export const getStorage = (key: string, fallbackValue?: any, local = false) => {
  let value: any = (local ? localStorage : sessionStorage).getItem(key);
  try {
    if (!value) throw new Error("Value doesn't exist");
    value = JSON.parse(value);
  } catch {
    if (fallbackValue !== undefined) {
      value = fallbackValue;
      setStorage(key, value, local);
    } else {
      value = null;
      removeStorage(key, local);
    }
  }
  return value;
};

export const clearChat = () => {
  removeStorage("rpc-remote-peer");
  removeStorage("rpc-messages");
};
