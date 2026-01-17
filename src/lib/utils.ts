import { iosRegex, mobileRegex } from "../constants";

export const addPrefix = (str: string): string => `rpc-${str}`;

export function isMobile(iOS = true): boolean {
  let result = (navigator as any).userAgentData?.mobile as boolean | undefined;
  result ??= mobileRegex.test(navigator.userAgent) || (iOS && iosRegex.test(navigator.userAgent));
  return result;
}
