# Phase 36 — `<FileUpload />` (+ `<Dropzone />`)

> Status: **Completed** · Depends on: Phase 6 (Button) · Phase 7 (Input — file input style only) · Phase 12 (Badge — for chips) · Phase 24 (Progress) · Phase 15 (Alert — for error states) · Engine `<I18nProvider>` · Optional: Phase 25 (Skeleton) · Blocks: nothing
> Self-contained; positioning engine not required.

## Objective

Ship the canonical file-upload primitive — `<FileUpload />` — and the lower-level `<Dropzone />` primitive that backs it.

`<Dropzone />` is the **headless drag-and-drop receiver**: an area users can drag files onto. Used as a layout primitive in feature UIs (project import screens, profile photo widgets, etc.).

`<FileUpload />` is the **full file picker**: Dropzone + file list + per-file progress + per-file remove + upload trigger. The "drop a file here or click to browse" widget consumers reach for 90% of the time.

Together they cover:

- Single + multi-file selection.
- Drag-and-drop + click-to-browse.
- File-type filtering (MIME + extension).
- Per-file size limits + count limits.
- Image / video / generic file preview.
- Per-file upload progress (when consumer wires a real uploader).
- Per-file retry + remove.
- Paste-to-upload (`Ctrl/Cmd+V` of an image).
- Full a11y (keyboard browse trigger, screen-reader announcements).

---

## What This Component Proves

- Native HTML5 drag-and-drop APIs (`dragenter` / `dragover` / `drop`) work cleanly when composed with React refs + cleanup.
- The DS can ship the **promise-of-progress** pattern: consumer-provided uploader returns a `Promise<void>` with an `onProgress` callback, and FileUpload renders a `<Progress>` per file.
- File previews use object URLs with reliable revocation (no memory leaks).
- `<Dropzone>` standalone is useful enough to ship independently (3rd consumer of `react-dropzone`-style logic doesn't need to reinvent it).

---

## Public API

```tsx
import { FileUpload, Dropzone, type FileWithProgress } from 'apx-ds';

// Simple — accepts files, reports them; uploader-agnostic
<FileUpload
  accept="image/*"
  maxSize={10 * 1024 * 1024}              // 10 MB
  maxFiles={5}
  onFilesChange={(files) => setFiles(files)}
/>

// With actual uploader
<FileUpload
  accept={['image/png', 'image/jpeg', 'application/pdf']}
  multiple
  upload={async (file, { onProgress, signal }) => {
    const form = new FormData();
    form.append('file', file);
    await axios.post('/api/upload', form, {
      signal,
      onUploadProgress: (e) => onProgress(e.loaded / (e.total ?? file.size)),
    });
  }}
  onComplete={(file, result) => toast.success(`${file.name} uploaded`)}
  onError={(file, err) => toast.error(err.message)}
/>

// Standalone Dropzone (headless drop receiver)
<Dropzone
  onDrop={(files) => handleFiles(files)}
  accept={['image/png', 'image/jpeg']}
  maxSize={5 * 1024 * 1024}
>
  {({ isDragOver, isDragReject, open }) => (
    <Card variant="outline" className={isDragReject ? 'border-danger-solid' : isDragOver ? 'border-primary-solid' : ''}>
      <Card.Body>
        <p>{isDragOver ? 'Drop here!' : 'Drag files here or'}</p>
        <Button onClick={open}>Browse…</Button>
      </Card.Body>
    </Card>
  )}
</Dropzone>

// Full FileUpload prop form
<FileUpload
  /* files */
  files={undefined}                        // controlled — File[] | FileWithProgress[]
  defaultFiles={[]}
  onFilesChange={(files) => …}
  /* selection */
  accept={undefined}                       // string | string[] — MIME types + extensions (e.g. ['.png', 'image/jpeg'])
  multiple={false}
  maxSize={undefined}                      // bytes
  minSize={undefined}
  maxFiles={undefined}
  validator={(file) => null | string}      // custom validator returns error string
  /* upload */
  upload={async (file, ctx) => …}          // consumer-provided uploader (per-file)
  autoUpload={true}                        // start uploading immediately after select; false → user clicks "Upload"
  parallelUploads={3}                      // concurrent uploads cap
  /* events */
  onDrop={(files) => …}                    // raw drop event
  onSelect={(files) => …}                  // accepted files after validation
  onReject={(rejections) => …}             // rejected files w/ reason
  onComplete={(file, result) => …}
  onError={(file, err) => …}
  /* preview */
  showPreviews={true}                      // image / video thumbnails
  previewMaxDimension={120}                // px
  /* paste */
  enablePaste={false}                      // listen for Ctrl/Cmd+V image paste
  /* visual */
  variant="dashed"                         // 'dashed' (default) | 'solid' | 'outline' | 'minimal'
  size="md"                                // 'sm' | 'md' | 'lg'
  color="primary"
  orientation="vertical"                   // 'vertical' (dropzone + list below) | 'horizontal' (side-by-side)
  /* state */
  disabled={false}
  invalid={false}
  /* labels (overridden by translations) */
  label="Upload files"
  hint="PNG, JPG up to 10 MB"
  errorMessage=""
  /* misc */
  className=""
  sx={{}}
  name="attachments"                       // forwarded to the underlying <input type="file">
/>
```

### `FileWithProgress` interface

```ts
export interface FileWithProgress {
  id: string;                              // generated
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error' | 'cancelled';
  progress: number;                        // 0–1
  error?: Error;
  result?: unknown;                        // upload's resolved value
  previewUrl?: string;                     // object URL — auto-revoked on remove
}
```

---

## API Decisions

| Decision                                                       | Why                                                                                       |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Two exports — `<FileUpload>` + `<Dropzone>`**                 | Dropzone is generic; FileUpload is opinionated.                                            |
| **Consumer provides the `upload` function**                    | The DS doesn't ship an HTTP client; consumers wire `fetch` / `axios` / signed-URL flows. |
| **`upload` returns Promise + `onProgress(0..1)` + `signal`**    | Standard pattern; supports any uploader.                                                  |
| **`parallelUploads` cap** (default 3)                          | Prevents browser HTTP-2 head-of-line + UX feels controlled.                               |
| **`autoUpload` defaults `true`**                               | Common UX (Dropbox-style). Opt-out for "queue then submit" flows.                          |
| **`accept` accepts MIME or extension**                         | Native `<input accept>` accepts both; we forward + validate.                              |
| **Preview URLs auto-revoked on file remove / unmount**         | Prevents memory leaks; canonical bug in hand-rolled uploaders.                            |
| **Paste-to-upload is opt-in**                                  | Surprising default; opt-in via `enablePaste`.                                              |
| **`Dropzone` uses render-prop API**                            | Headless flexibility; consumers style their own drop area completely.                     |

---

## Variants

### FileUpload — Dropzone area

| Variant   | Border                   | Idle bg              | Drag-over bg                    | Drag-reject bg                 |
| --------- | ------------------------ | -------------------- | ------------------------------- | ------------------------------ |
| `dashed`  | `border-2 border-dashed` | transparent          | `bg-<color>-subtle/40`          | `bg-danger-subtle/40`          |
| `solid`   | `border`                 | `bg-bg-subtle`       | `bg-<color>-subtle`             | `bg-danger-subtle`             |
| `outline` | `border-2`               | transparent          | `bg-<color>-subtle/40`          | `bg-danger-subtle/40`          |
| `minimal` | no border                | `bg-bg-subtle/40`    | `bg-<color>-subtle`             | `bg-danger-subtle`             |

7 colors × 4 variants × 3 sizes (84 cells) + drag-over and drag-reject states.

### File list row

- Thumbnail (image preview, video frame, or generic icon by MIME).
- File name (truncated with ellipsis; tooltip on hover via Phase 17).
- File size (`formatBytes` helper).
- Per-file `<Progress>` (linear, height matches row).
- Status indicator (icon: pending / uploading / success / error / cancelled).
- Action buttons: retry (on error), cancel (during upload), remove.

### Sizes

| Size | Dropzone min-height | File row height | Thumbnail | Padding   |
| ---- | ------------------- | --------------- | --------- | --------- |
| `sm` | 96px                | 40px            | 32×32     | `p-3`     |
| `md` | 128px               | 56px            | 44×44     | `p-4`     |
| `lg` | 160px               | 72px            | 56×56     | `p-6`     |

---

## File Structure

```
packages/components/src/FileUpload/
├── FileUpload.tsx
├── Dropzone.tsx
├── FileUpload.types.ts
├── FileUpload.recipe.ts                 # 6 slots: root, dropzone, prompt, list, row, fileRow* parts
├── headless/
│   ├── useDropzone.ts                   # drag/drop event handlers, file picker open()
│   ├── useFileUpload.ts                 # state machine: queue, upload concurrency, retry, cancel
│   ├── useUploadQueue.ts                # parallel-cap scheduler with AbortController per file
│   ├── usePasteFiles.ts                 # opt-in clipboard listener
│   ├── validateFile.ts                  # pure: file + constraints → 'ok' | { reason, message }
│   ├── matchAccept.ts                   # pure: file + accept patterns → boolean
│   ├── formatBytes.ts                   # pure: 1234567 → '1.2 MB' (locale-aware via Intl.NumberFormat)
│   ├── makePreviewUrl.ts                # createObjectURL + revocation registry
│   └── iconForMimeType.ts               # generic file icon picker
├── parts/
│   ├── FileUploadRoot.tsx
│   ├── FileUploadDropzone.tsx
│   ├── FileUploadPrompt.tsx             # "Drag files here or browse"
│   ├── FileUploadList.tsx
│   ├── FileUploadRow.tsx
│   ├── FileUploadRowPreview.tsx
│   ├── FileUploadRowName.tsx
│   ├── FileUploadRowSize.tsx
│   ├── FileUploadRowProgress.tsx
│   ├── FileUploadRowStatus.tsx
│   └── FileUploadRowActions.tsx
├── FileUpload.test.tsx
├── Dropzone.test.tsx
├── FileUpload.a11y.test.tsx
├── validateFile.test.ts
├── formatBytes.test.ts
├── useUploadQueue.test.ts
├── index.ts
├── README.mdx
├── meta.ts
└── examples/
    ├── Basic.tsx
    ├── ImageOnly.tsx
    ├── MultipleFiles.tsx
    ├── SingleFile.tsx
    ├── MaxSize.tsx
    ├── MaxCount.tsx
    ├── CustomValidator.tsx              # only accept square images
    ├── WithUploader.tsx                 # real progress via mocked uploader
    ├── ParallelLimited.tsx              # parallelUploads=1 — show queue
    ├── RetryOnError.tsx
    ├── AvatarUpload.tsx                 # single-file image preview that replaces avatar
    ├── DropzoneHeadless.tsx             # the standalone Dropzone primitive
    ├── PasteToUpload.tsx
    ├── Variants.tsx
    ├── Sizes.tsx
    ├── Colors.tsx
    ├── Horizontal.tsx
    ├── Disabled.tsx
    ├── Invalid.tsx
    ├── Rtl.tsx
    └── FormSubmission.tsx               # works inside a real <form>
```

---

## Headless — `useDropzone()`

```ts
export interface UseDropzoneOptions {
  onDrop?: (files: File[], event: DragEvent | ChangeEvent) => void;
  accept?: string | string[];
  multiple?: boolean;
  maxSize?: number;
  minSize?: number;
  maxFiles?: number;
  validator?: (file: File) => string | null;
  disabled?: boolean;
  noClick?: boolean;                   // disable click-to-open
  noKeyboard?: boolean;                // disable keyboard activation
  noDragEventsBubbling?: boolean;
}

export interface UseDropzoneReturn {
  isDragOver: boolean;
  isDragReject: boolean;
  acceptedFiles: File[];
  rejectedFiles: Array<{ file: File; reason: 'size' | 'type' | 'count' | 'custom'; message: string }>;
  open: () => void;
  rootProps: HTMLAttributes<HTMLDivElement>;
  inputProps: InputHTMLAttributes<HTMLInputElement>;
}
```

Manages:

- `dragenter` / `dragover` / `dragleave` / `drop` listeners with proper counter-based tracking (handles bubbling).
- `dragover` returns `false` from `preventDefault` to enable drop.
- Hidden `<input type="file">` clicked via `open()`.
- Keyboard: Enter / Space on the dropzone triggers `open()`.
- Validates drop synchronously and reports accepted vs rejected.
- Cleanup on unmount.

---

## Headless — `useFileUpload()`

Owns the file queue and orchestrates concurrency:

```ts
export interface UseFileUploadOptions {
  files?: FileWithProgress[];
  defaultFiles?: FileWithProgress[] | File[];
  onFilesChange?: (files: FileWithProgress[]) => void;
  upload?: (file: File, ctx: { onProgress: (n: number) => void; signal: AbortSignal }) => Promise<unknown>;
  autoUpload?: boolean;
  parallelUploads?: number;
  onComplete?: (file: FileWithProgress, result: unknown) => void;
  onError?: (file: FileWithProgress, err: Error) => void;
}

export interface UseFileUploadReturn {
  files: FileWithProgress[];
  addFiles: (newFiles: File[]) => void;
  removeFile: (id: string) => void;
  retryFile: (id: string) => void;
  cancelFile: (id: string) => void;
  uploadAll: () => void;
  uploadFile: (id: string) => void;
  clear: () => void;
}
```

Concurrency via `useUploadQueue`:

- Maintains a "pending" queue and "running" set sized by `parallelUploads`.
- When a slot frees, schedules the next pending file.
- Each running file has its own `AbortController`; `cancelFile` aborts it.
- Status transitions: `pending → uploading → success | error | cancelled`.
- Retry resets status to `pending` and re-queues.

---

## Pure Helpers

```ts
// validateFile.ts
export function validateFile(file: File, opts: {
  accept?: string[];
  maxSize?: number;
  minSize?: number;
  validator?: (f: File) => string | null;
}): { ok: true } | { ok: false; reason: 'type' | 'size' | 'custom'; message: string };

// matchAccept.ts — handles MIME wildcards ("image/*") + extensions (".png")
export function matchAccept(file: File, accept: string[]): boolean;

// formatBytes.ts — locale-aware via Intl.NumberFormat
export function formatBytes(bytes: number, locale?: string): string;
// 1234567 → '1.2 MB'  (en-US)
// 1234567 → '1,2 MB'  (de-DE)
```

All pure; 100% line coverage required.

---

## Preview URLs

`makePreviewUrl.ts` maintains a `WeakMap<FileWithProgress, string>` registry:

- On `addFiles`: for image / video MIME types, `URL.createObjectURL(file)` and store.
- On `removeFile`: `URL.revokeObjectURL(stored)`.
- On unmount: revoke all.
- No leaks across remounts (WeakMap GC + explicit revoke).

---

## Paste-to-Upload

When `enablePaste={true}`:

- Listen for `paste` events on the root element.
- For each clipboardItem of `kind="file"`, extract via `clipboardData.files`.
- Validate + add via the same path as drop.
- Renamed paste files use `pasted-{timestamp}.{ext}` based on MIME type.
- Cleanup listener on unmount.

---

## A11y

- Dropzone root: `role="button"`, `tabIndex={0}`, `aria-label={t.dropzoneLabel}`, `aria-disabled`, `aria-describedby` to the hint and error.
- Hidden `<input type="file">` retained for screen-reader users + form submission. `aria-hidden="false"` (still focusable), but visually hidden.
- File list: `<ul role="list">`; each row `<li role="listitem">`.
- Each row's progress `<Progress>` has `aria-label={t.uploadingFile(name)}` + `aria-valuenow`.
- Status changes announced via `aria-live="polite"` region (`t.uploadComplete(name)` / `t.uploadFailed(name)`).
- Remove / retry / cancel buttons have translated `aria-label`s.
- Drag-over state announced when keyboard users have focus? **Not announced** — drag-over is mouse-only by definition; keyboard users use `open()`.

axe-core: 0 violations across the 4 × 7 × 3 = 84 variant cells.

---

## I18n

```ts
export interface FileUploadTranslations {
  dropzoneLabel: string;
  dropzonePromptIdle: string;            // "Drag files here or"
  dropzonePromptDragOver: string;        // "Drop here!"
  dropzonePromptDragReject: string;      // "These files can't be uploaded"
  browseButton: string;                  // "Browse…"
  pasteHint: string;                     // "or paste an image (⌘V)"
  acceptedTypes: (types: string[]) => string;
  maxSizeHint: (max: string) => string;
  maxFilesHint: (max: number) => string;
  errorTooLarge: (max: string) => string;
  errorTooSmall: (min: string) => string;
  errorWrongType: string;
  errorTooManyFiles: (max: number) => string;
  status: {
    pending: string;
    uploading: string;
    success: string;
    error: string;
    cancelled: string;
  };
  uploadingFile: (name: string) => string;
  uploadComplete: (name: string) => string;
  uploadFailed: (name: string) => string;
  retry: string;
  cancel: string;
  remove: string;
  removeAll: string;
}
```

Defaults English; merges via `<I18nProvider>` same precedence as the rest.

---

## Recipes

```ts
export const fileUploadRecipes = {
  root: cv({ /* outer wrapper, flex column or row by orientation */ }),
  dropzone: cv({
    base: 'flex flex-col items-center justify-center gap-3 rounded-lg cursor-pointer transition-colors duration-fast focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    variants: {
      size:    { sm: 'min-h-24 p-3', md: 'min-h-32 p-4', lg: 'min-h-40 p-6' },
      variant: { dashed: 'border-2 border-dashed', solid: 'border bg-bg-subtle', outline: 'border-2', minimal: 'bg-bg-subtle/40' },
      color:   { primary: '', /* …6 more… */ },
      state:   { idle: '', dragOver: '', dragReject: '', disabled: 'opacity-50 pointer-events-none' },
    },
    compoundVariants: [
      { state: 'dragOver',   variant: 'dashed', color: 'primary', class: 'border-primary-solid bg-primary-subtle/40' },
      { state: 'dragReject', variant: 'dashed',                   class: 'border-danger-solid bg-danger-subtle/40' },
      /* …complete matrix in implementation… */
    ],
  }),
  prompt:  cv({ base: 'text-center', variants: { size: { sm: 'text-sm', md: 'text-base', lg: 'text-lg' } } }),
  list:    cv({ base: 'flex flex-col gap-2 mt-3' }),
  row:     cv({ base: 'flex items-center gap-3 rounded-md border border-border p-3' }),
  preview: cv({ base: 'rounded-md object-cover shrink-0 bg-bg-subtle', variants: { size: { sm: 'size-8', md: 'size-11', lg: 'size-14' } } }),
  name:    cv({ base: 'truncate font-medium text-fg-default' }),
  size:    cv({ base: 'text-xs text-fg-muted shrink-0' }),
  progress: cv({ base: 'w-24 shrink-0' }),
  statusIcon: cv({
    base: 'shrink-0',
    variants: {
      status: {
        pending:   'text-fg-muted',
        uploading: 'text-primary-solid',
        success:   'text-success-solid',
        error:     'text-danger-solid',
        cancelled: 'text-fg-muted',
      },
    },
  }),
  actions: cv({ base: 'ms-auto flex items-center gap-1 shrink-0' }),
};
```

---

## Animation

- Drag-over fade-in: 150ms `ease-out` opacity + bg color.
- File-row enter: 200ms fade + scale 0.97 → 1.
- File-row exit: 150ms fade + scale 1 → 0.95.
- Progress: smooth via `<Progress>`'s own transition.
- `prefers-reduced-motion`: all opacity-only at ≤ 80ms.

Uses Motion's `<AnimatePresence>` for row enter/exit. Drag-over is a CSS transition (no JS animation).

---

## Performance

- Dropzone listeners attached to a single root element; no per-file listeners.
- File-row uses `React.memo` keyed by `file.id`; only the row whose progress changes re-renders.
- Preview URLs are lazy — created only for image/video MIME types, only on `addFiles`.
- 100-file queue with 3-parallel uploads should run with ≤ 16ms re-render per progress tick.

---

## Testing

- Pure: `validateFile`, `matchAccept`, `formatBytes`, `useUploadQueue` (scheduler logic with mocked AbortController).
- Integration: drag/drop happy path, click-to-browse, validator rejections, max-size / max-files, retry, cancel, remove.
- Async: parallel upload cap honored; retry re-queues; cancel aborts the in-flight fetch.
- Preview: object URLs created + revoked correctly on unmount + remove.
- Paste: image paste handled when `enablePaste={true}`.
- A11y: focus management on browse button, screen-reader announcements, axe.
- Bundle target: < 6 KB gz for FileUpload + < 1.5 KB gz for Dropzone standalone.

---

## Acceptance Criteria

- [x] `<Dropzone>` standalone with render-prop API.
- [x] `<FileUpload>` with file list, per-file progress, retry, cancel, remove.
- [x] `accept` honored for MIME + extension.
- [x] `maxSize` / `minSize` / `maxFiles` / `validator` constraints.
- [x] Consumer-provided `upload(file, { onProgress, signal })`.
- [x] `parallelUploads` scheduler with proper queueing.
- [x] Auto-revoking preview URLs (no leaks).
- [x] Paste-to-upload (`enablePaste`).
- [ ] All 4 variants × 7 colors × 3 sizes × {idle, dragOver, dragReject} pass snapshots.
- [ ] axe-core: 0 violations (dedicated `FileUpload.a11y.test.tsx` not yet added).
- [ ] RTL: layout + chevron flips correct (no RTL example yet).
- [x] `<I18nProvider>` integration; English defaults shipped (`DEFAULT_FILE_UPLOAD_TRANSLATIONS`).
- [x] Hidden `<input type="file">` for form submission.
- [ ] Bundle < 6 KB gz (FileUpload) + < 1.5 KB gz (Dropzone) — not measured in CI yet.

---

## DRY Self-Check

- [x] Reuses `<Progress>` for per-file progress.
- [x] Reuses `<Button>` for browse / retry / cancel / remove.
- [ ] Reuses `<Badge>` for file count / status pills (status uses `<Icon>` instead).
- [ ] Reuses `<Alert>` for top-level error states (inline label/error text instead).
- [x] Reuses `<I18nProvider>` (no parallel translation system).
- [x] `formatBytes` is pure + locale-aware via `Intl.NumberFormat`.
- [x] `useDropzone` is exported publicly — other features (image cropper, profile photo) can reuse without inheriting FileUpload's chrome.
- [x] No `clsx`.

---

## When This Phase Is Complete

1. Move file to `plans/completed/components/36-file-upload.md`. ✓
2. Append `## Outcome`: bundle deltas, async-uploader test coverage, deviations, follow-ups. ✓
3. `useDropzone` becomes reusable infrastructure — future image-cropper, paste-target, avatar-upload primitives can consume.
4. With Phase 36 done, the DS covers **all "essential" form controls**: text input, textarea, checkbox, switch, radio, select, combobox, slider, number, toggle group, date picker, file upload. Future form controls (rich-text, color picker, signature pad) are domain-specific extensions on top.

---

## Outcome

Shipped. Core surface is in `packages/components/src/FileUpload/` and exported from `@apx-dsponents`.

### Public surface

- **Components**: `<FileUpload>`, `<Dropzone>` (render-prop).
- **Hooks**: `useDropzone`, `useFileUpload`, `useUploadQueue` (internal scheduler, tested).
- **Pure helpers**: `validateFile`, `matchAccept`, `formatBytes` (exported).
- **Defaults**: `DEFAULT_FILE_UPLOAD_TRANSLATIONS` (English bundled; merges via `<I18nProvider namespace="FileUpload">`).
- **Types**: `FileWithProgress`, `FileUploadProps`, `DropzoneProps`, `FileUploadFn`, and related option/return types.

### Tests

- `FileUpload.test.tsx` — browse, select, maxSize rejection, upload + progress, remove.
- `FileUpload.helpers.test.ts` — `matchAccept`, `validateFile`, `formatBytes`.
- `useUploadQueue.test.ts` — parallel-cap scheduler.

### Deviations from plan

- **Single-file component** instead of `parts/FileUploadRow*.tsx` split — rows live in `FileUpload.tsx` as a memoized `FileUploadRow`.
- **Examples**: `Basic.tsx` + `WithUploader.tsx` only (plan listed ~20 example files).
- **No `FileUpload.a11y.test.tsx`** yet; no variant/color snapshot matrix.
- **Badge / Alert** not used for status chrome — Icon + inline text instead.
- **he/ar locale bundles** not shipped in-repo (I18nProvider merge path works; only English defaults bundled).

### Follow-ups

- Add `FileUpload.a11y.test.tsx` + axe sweep.
- Expand `examples/` (Variants, Sizes, PasteToUpload, DropzoneHeadless, FormSubmission, Rtl).
- Bundle-size gate in CI (< 6 KB gz FileUpload, < 1.5 KB gz Dropzone).
- Optional: top-level `<Alert>` for batch rejections; `<Badge>` for file-count pill.