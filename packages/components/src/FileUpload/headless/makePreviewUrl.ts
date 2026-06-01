const previewById = new Map<string, string>();

function isPreviewableMime(mime: string): boolean {
  return mime.startsWith('image/') || mime.startsWith('video/');
}

export function createPreviewUrl(file: File, id: string): string | undefined {
  if (!isPreviewableMime(file.type)) return undefined;
  if (typeof URL.createObjectURL !== 'function') return undefined;
  const existing = previewById.get(id);
  if (existing) return existing;
  const url = URL.createObjectURL(file);
  previewById.set(id, url);
  return url;
}

export function revokePreviewUrl(id: string): void {
  const url = previewById.get(id);
  if (!url) return;
  URL.revokeObjectURL(url);
  previewById.delete(id);
}

export function revokeAllPreviewUrls(): void {
  for (const url of previewById.values()) {
    URL.revokeObjectURL(url);
  }
  previewById.clear();
}