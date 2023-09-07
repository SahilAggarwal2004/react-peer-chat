export default function useStorage<Value>(key: string, initialValue: Value, { local, save }?: {
    local?: boolean | undefined;
    save?: boolean | undefined;
}): [Value, (value: Value | ((old: Value) => Value)) => void];
