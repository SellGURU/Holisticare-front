// utils.ts
export function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

export function prettyJson(v: any) {
  return JSON.stringify(v, null, 2);
}

export function isPlainObject(v: any): v is Record<string, any> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function extractShapeKeys(template: any): string[] {
  if (Array.isArray(template)) {
    const first = template[0];
    return isPlainObject(first) ? Object.keys(first) : [];
  }
  if (isPlainObject(template)) return Object.keys(template);
  return [];
}

/**
 * Checks if `data` matches the top-level shape:
 * - array vs object
 * - required top-level keys exist (for object)
 * - for array-of-objects: first element must be object & include template keys
 */
export function matchesTemplateShape(
  data: any,
  template: any,
): { ok: boolean; reason?: string } {
  // Template expects an array
  if (Array.isArray(template)) {
    if (!Array.isArray(data)) {
      return { ok: false, reason: 'Expected a JSON array.' };
    }

    const t0 = template[0];

    // Array of objects: validate keys using first item
    if (isPlainObject(t0)) {
      if (data.length === 0) return { ok: true }; // empty is acceptable
      const d0 = data[0];
      if (!isPlainObject(d0)) {
        return { ok: false, reason: 'Expected array of objects.' };
      }

      const req = Object.keys(t0);
      const missing = req.filter((k) => !(k in d0));
      if (missing.length) {
        return {
          ok: false,
          reason: `Missing keys in first row: ${missing.join(', ')}`,
        };
      }

      return { ok: true };
    }

    // Array of primitives or unknown: accept
    return { ok: true };
  }

  // Template expects an object
  if (isPlainObject(template)) {
    if (!isPlainObject(data)) {
      return { ok: false, reason: 'Expected a JSON object.' };
    }

    const req = Object.keys(template);
    const missing = req.filter((k) => !(k in data));
    if (missing.length) {
      return {
        ok: false,
        reason: `Missing top-level keys: ${missing.join(', ')}`,
      };
    }

    return { ok: true };
  }

  // Unknown template type: accept
  return { ok: true };
}

export function normalizeEmails(list: string[]) {
  return Array.from(new Set(list.map((e) => e.trim()).filter(Boolean)));
}

export function looksLikeEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}
