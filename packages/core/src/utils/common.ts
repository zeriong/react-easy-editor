import type { MutableRefObject } from "react";

const MIN_ALLOWED_FONT_SIZE = 8;
const MAX_ALLOWED_FONT_SIZE = 72;

export function parseAllowedFontSize(input: string): string {
  const match = input.match(/^(\d+(?:\.\d+)?)px$/);
  if (match) {
    const n = Number(match[1]);
    if (n >= MIN_ALLOWED_FONT_SIZE && n <= MAX_ALLOWED_FONT_SIZE) {
      return input;
    }
  }
  return "";
}

export function parseAllowedColor(input: string): string {
  return /^rgb\(\d+, \d+, \d+\)$/.test(input) ? input : "";
}

export function styleStringToObject(styleString: string): Record<string, string> {
  if (!styleString) return {};
  return styleString
    .split(";")
    .map((rule) => rule.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, rule) => {
      const [prop, value] = rule.split(":");
      if (prop && value) {
        acc[prop.trim()] = value.trim();
      }
      return acc;
    }, {});
}

export function clearRefTimeout(timeoutRef: MutableRefObject<ReturnType<typeof setTimeout> | null>): void {
  if (timeoutRef.current !== null) {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }
}

export function toBase64(file: File): Promise<string | ArrayBuffer | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}
