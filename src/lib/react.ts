import type { SetStateAction } from "react";

export function isSetStateFunction<T>(v: SetStateAction<T>): v is (old: T) => T {
  return typeof v === "function";
}
