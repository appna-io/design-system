# Renderer public assets

Static files served from the site root (`/`). Drop the **AppNA brand assets**
here and the renderer wires them up automatically — no code changes needed.

## Expected AppNA files

| File              | Used for                                              | Notes                                          |
| ----------------- | ----------------------------------------------------- | ---------------------------------------------- |
| `appna-icon.svg`  | Sidebar brand mark + browser tab icon (favicon/apple) | Square mark works best (e.g. 32×32 viewBox).   |
| `favicon.ico`     | Legacy favicon fallback                               | Optional; modern browsers use the SVG above.   |
| `appna-logo.svg`  | Full wordmark (reserved for future header use)        | Optional.                                      |

References live in:

- `src/app/layout.tsx` — `metadata.icons` (favicon / apple-touch icon)
- `src/components/chrome/Sidebar.tsx` — the brand block `<img src="/appna-icon.svg">`

Until `appna-icon.svg` is present, the sidebar falls back to the Sparkles glyph,
so the chrome never shows a broken image.
