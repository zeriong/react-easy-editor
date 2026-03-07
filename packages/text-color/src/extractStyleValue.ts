/**
 * Extracts the value of a CSS property from an inline style string.
 *
 * @param styleStr - The inline style string (e.g. "color: red; font-size: 14px")
 * @param prop     - The CSS property to look for (e.g. "color")
 * @returns The property value, or null if not found
 */
export function extractStyleValue(styleStr: string, prop: string): string | null {
  if (!styleStr) return null;

  const parts = styleStr
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const part of parts) {
    const [key, ...rest] = part.split(":");
    if (!key || rest.length === 0) continue;
    if (key.trim().toLowerCase() === prop.toLowerCase()) {
      return rest.join(":").trim();
    }
  }

  return null;
}
