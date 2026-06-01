function normalizeAccept(accept: string | string[] | undefined): string[] {
  if (!accept) return [];
  const list = Array.isArray(accept) ? accept : accept.split(',');
  return list.map((item) => item.trim().toLowerCase()).filter(Boolean);
}

function mimeMatches(pattern: string, mime: string): boolean {
  if (pattern === mime) return true;
  if (pattern.endsWith('/*')) {
    const prefix = pattern.slice(0, -1);
    return mime.startsWith(prefix);
  }
  return false;
}

function extensionMatches(pattern: string, fileName: string): boolean {
  const ext = pattern.startsWith('.') ? pattern : `.${pattern}`;
  return fileName.toLowerCase().endsWith(ext.toLowerCase());
}

/**
 * Returns whether `file` matches any accept token (MIME wildcard, exact MIME, or extension).
 */
export function matchAccept(file: File, accept: string | string[] | undefined): boolean {
  const patterns = normalizeAccept(accept);
  if (patterns.length === 0) return true;

  const mime = (file.type || '').toLowerCase();
  const name = file.name.toLowerCase();

  return patterns.some((pattern) => {
    if (pattern.startsWith('.')) return extensionMatches(pattern, name);
    if (pattern.includes('/')) return mimeMatches(pattern, mime);
    return extensionMatches(pattern, name);
  });
}

export { normalizeAccept };