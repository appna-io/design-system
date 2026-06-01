'use client';

import { memo, useCallback, useMemo, useRef, useState } from 'react';

import { forwardRef, useI18n } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';

import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import { Progress } from '../Progress/Progress';
import { useFormFieldA11y } from '../_shared/useFormFieldA11y';

import { DEFAULT_FILE_UPLOAD_TRANSLATIONS } from './FileUpload.i18n';
import { fileUploadRecipes } from './FileUpload.recipe';
import type { DSIconName } from '../Icon/DS_ICON_CATALOG';
import type {
  FileUploadProps,
  FileUploadSize,
  FileUploadTranslations,
  FileWithProgress,
} from './FileUpload.types';
import { formatBytes } from './headless/formatBytes';
import { useDropzone } from './headless/useDropzone';
import { useFileUpload } from './headless/useFileUpload';
import { usePasteFiles } from './headless/usePasteFiles';

function statusIconName(status: FileWithProgress['status']): DSIconName {
  switch (status) {
    case 'success':
      return 'check-circle';
    case 'error':
      return 'x-circle';
    case 'uploading':
      return 'upload';
    case 'cancelled':
      return 'x';
    default:
      return 'file';
  }
}

interface FileUploadRowProps {
  entry: FileWithProgress;
  size: FileUploadSize;
  t: FileUploadTranslations;
  locale: string;
  hasUpload: boolean;
  onRetry: (id: string) => void;
  onCancel: (id: string) => void;
  onRemove: (id: string) => void;
}

const FileUploadRow = memo(function FileUploadRow({
  entry,
  size,
  t,
  locale,
  hasUpload,
  onRetry,
  onCancel,
  onRemove,
}: FileUploadRowProps) {
  const { className: rowCls } = useThemedClasses({
    recipe: fileUploadRecipes.row,
    componentName: 'FileUpload',
    slot: 'row',
    props: { size },
  });
  const { className: previewCls } = useThemedClasses({
    recipe: fileUploadRecipes.preview,
    componentName: 'FileUpload',
    slot: 'preview',
    props: { size },
  });
  const { className: nameCls } = useThemedClasses({
    recipe: fileUploadRecipes.name,
    componentName: 'FileUpload',
    slot: 'name',
    props: {},
  });
  const { className: metaCls } = useThemedClasses({
    recipe: fileUploadRecipes.meta,
    componentName: 'FileUpload',
    slot: 'meta',
    props: {},
  });
  const { className: progressCls } = useThemedClasses({
    recipe: fileUploadRecipes.progress,
    componentName: 'FileUpload',
    slot: 'progress',
    props: {},
  });
  const { className: statusCls } = useThemedClasses({
    recipe: fileUploadRecipes.statusIcon,
    componentName: 'FileUpload',
    slot: 'statusIcon',
    props: { status: entry.status },
  });
  const { className: actionsCls } = useThemedClasses({
    recipe: fileUploadRecipes.actions,
    componentName: 'FileUpload',
    slot: 'actions',
    props: {},
  });

  const showProgress = hasUpload && (entry.status === 'uploading' || entry.progress > 0);

  return (
    <li className={rowCls} role="listitem" data-status={entry.status}>
      {entry.previewUrl ? (
        <img
          src={entry.previewUrl}
          alt=""
          className={previewCls}
          width={size === 'sm' ? 32 : size === 'lg' ? 56 : 44}
          height={size === 'sm' ? 32 : size === 'lg' ? 56 : 44}
        />
      ) : (
        <span className={previewCls} aria-hidden>
          <Icon name="file" size={size === 'sm' ? 'sm' : 'md'} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className={nameCls} title={entry.file.name}>
          {entry.file.name}
        </p>
        <p className={metaCls}>{formatBytes(entry.file.size, locale)}</p>
      </div>
      {showProgress ? (
        <Progress
          className={progressCls}
          value={Math.round(entry.progress * 100)}
          size="sm"
          aria-label={t.uploadingFile(entry.file.name)}
        />
      ) : null}
      <span className={statusCls} aria-hidden>
        <Icon name={statusIconName(entry.status)} size="sm" />
      </span>
      <div className={actionsCls}>
        {entry.status === 'error' ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRetry(entry.id);
            }}
            aria-label={t.retry}
          >
            {t.retry}
          </Button>
        ) : null}
        {entry.status === 'uploading' ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onCancel(entry.id);
            }}
            aria-label={t.cancel}
          >
            {t.cancel}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(entry.id);
          }}
          aria-label={t.remove}
        >
          <Icon name="x" size="sm" />
        </Button>
      </div>
    </li>
  );
});

/**
 * Canonical file-upload primitive — dropzone, file list, per-file progress, and a
 * consumer-provided `upload` function.
 */
export const FileUpload = forwardRef<HTMLDivElement, FileUploadProps>(function FileUpload(
  props,
  ref,
) {
  const {
    files: filesProp,
    defaultFiles,
    onFilesChange,
    upload,
    autoUpload = true,
    parallelUploads = 3,
    onComplete,
    onError,
    accept,
    multiple = false,
    maxSize,
    minSize,
    maxFiles,
    validator,
    onDrop,
    onSelect,
    onReject,
    showPreviews = true,
    enablePaste = false,
    variant = 'dashed',
    size = 'md',
    color = 'primary',
    orientation = 'vertical',
    disabled = false,
    invalid = false,
    label,
    hint,
    errorMessage,
    name,
    className,
    style,
    sx,
    browseButtonVariant = 'outline',
    browseButtonSize,
    browseButtonColor,
    id: providedId,
    'aria-describedby': ariaDescribedBy,
    ...rest
  } = props;

  const rootRef = useRef<HTMLDivElement | null>(null);
  const i18n = useI18n();
  const locale = i18n?.locale ?? 'en-US';
  const t = useMemo(
    () => ({
      ...DEFAULT_FILE_UPLOAD_TRANSLATIONS,
      ...(i18n?.get<FileUploadTranslations>('FileUpload') ?? {}),
    }),
    [i18n],
  );

  const a11y = useFormFieldA11y({
    id: providedId,
    invalid: invalid || Boolean(errorMessage),
    componentName: 'FileUpload',
    'aria-describedby': ariaDescribedBy,
  });

  const fileUploadOptions = {
    ...(filesProp !== undefined ? { files: filesProp } : {}),
    ...(defaultFiles !== undefined ? { defaultFiles } : {}),
    ...(onFilesChange ? { onFilesChange } : {}),
    ...(upload ? { upload } : {}),
    autoUpload,
    parallelUploads,
    ...(onComplete ? { onComplete } : {}),
    ...(onError ? { onError } : {}),
    showPreviews,
  };

  const { files, addFiles, removeFile, retryFile, cancelFile, uploadAll } =
    useFileUpload(fileUploadOptions);

  const [announcement, setAnnouncement] = useState('');

  const handleAccepted = useCallback(
    (accepted: File[]) => {
      if (accepted.length === 0) return;
      addFiles(accepted);
      onSelect?.(accepted);
      const last = accepted[accepted.length - 1];
      if (last) setAnnouncement(t.uploadComplete(last.name));
    },
    [addFiles, onSelect, t],
  );

  const dropzone = useDropzone({
    ...(accept !== undefined ? { accept } : {}),
    multiple,
    ...(maxSize !== undefined ? { maxSize } : {}),
    ...(minSize !== undefined ? { minSize } : {}),
    ...(maxFiles !== undefined ? { maxFiles } : {}),
    currentFileCount: files.length,
    ...(validator !== undefined ? { validator } : {}),
    disabled,
    noClick: true,
    onDrop: (accepted, event) => {
      onDrop?.(accepted, event);
      handleAccepted(accepted);
    },
    ...(onReject ? { onReject } : {}),
  });

  usePasteFiles({
    enabled: enablePaste,
    disabled,
    rootRef,
    onPaste: handleAccepted,
  });

  const dropState = dropzone.isDragReject
    ? 'dragReject'
    : dropzone.isDragOver
      ? 'dragOver'
      : disabled
        ? 'disabled'
        : 'idle';

  const { className: rootCls, style: rootStyle } = useThemedClasses({
    recipe: fileUploadRecipes.root,
    componentName: 'FileUpload',
    slot: 'root',
    props: { orientation, className, sx, style },
  });

  const { className: labelCls } = useThemedClasses({
    recipe: fileUploadRecipes.label,
    componentName: 'FileUpload',
    slot: 'label',
    props: { size },
  });

  const { className: hintCls } = useThemedClasses({
    recipe: fileUploadRecipes.hint,
    componentName: 'FileUpload',
    slot: 'hint',
    props: { size },
  });

  const { className: errorCls } = useThemedClasses({
    recipe: fileUploadRecipes.error,
    componentName: 'FileUpload',
    slot: 'error',
    props: { size },
  });

  const { className: dropzoneCls } = useThemedClasses({
    recipe: fileUploadRecipes.dropzone,
    componentName: 'FileUpload',
    slot: 'dropzone',
    props: { variant, size, color, state: dropState },
  });

  const { className: promptCls } = useThemedClasses({
    recipe: fileUploadRecipes.prompt,
    componentName: 'FileUpload',
    slot: 'prompt',
    props: { size },
  });

  const { className: listCls } = useThemedClasses({
    recipe: fileUploadRecipes.list,
    componentName: 'FileUpload',
    slot: 'list',
    props: { orientation },
  });

  const { className: hiddenInputCls } = useThemedClasses({
    recipe: fileUploadRecipes.hiddenInput,
    componentName: 'FileUpload',
    slot: 'hiddenInput',
    props: {},
  });

  const { className: liveCls } = useThemedClasses({
    recipe: fileUploadRecipes.liveRegion,
    componentName: 'FileUpload',
    slot: 'liveRegion',
    props: {},
  });

  const promptText = dropzone.isDragReject
    ? t.dropzonePromptDragReject
    : dropzone.isDragOver
      ? t.dropzonePromptDragOver
      : t.dropzonePromptIdle;

  const hintId = `${a11y.id}-hint`;
  const errorId = `${a11y.id}-error`;
  const rowSize: FileUploadSize = typeof size === 'string' ? size : 'md';
  const describedBy = [
    a11y['aria-describedby'],
    hint ? hintId : undefined,
    errorMessage ? errorId : undefined,
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  const showUploadAll = Boolean(upload) && !autoUpload && files.some((f) => f.status === 'pending');

  return (
    <div
      ref={(node) => {
        rootRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      className={rootCls}
      style={rootStyle}
      data-invalid={a11y['data-invalid']}
      {...rest}
    >
      {label ? (
        <label htmlFor={a11y.id} className={labelCls}>
          {label}
        </label>
      ) : null}

      <div
        {...dropzone.rootProps}
        className={dropzoneCls}
        aria-label={t.dropzoneLabel}
        aria-describedby={describedBy}
        aria-invalid={a11y['aria-invalid']}
        data-variant={variant}
        data-size={size}
        data-color={color}
      >
        <p className={promptCls}>{promptText}</p>
        <Button
          type="button"
          variant={browseButtonVariant}
          size={browseButtonSize ?? size}
          color={browseButtonColor ?? color}
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            dropzone.open();
          }}
        >
          {t.browseButton}
        </Button>
        {enablePaste ? <p className={hintCls}>{t.pasteHint}</p> : null}
        <input
          {...dropzone.inputProps}
          ref={dropzone.inputRef}
          id={a11y.id}
          name={name}
          className={hiddenInputCls}
        />
      </div>

      {hint ? (
        <p id={hintId} className={hintCls}>
          {hint}
        </p>
      ) : null}
      {errorMessage ? (
        <p id={errorId} className={errorCls} role="alert">
          {errorMessage}
        </p>
      ) : null}

      {files.length > 0 ? (
        <ul className={listCls} role="list" aria-label={t.dropzoneLabel}>
          {files.map((entry) => (
            <FileUploadRow
              key={entry.id}
              entry={entry}
              size={rowSize}
              t={t}
              locale={locale}
              hasUpload={Boolean(upload)}
              onRetry={retryFile}
              onCancel={cancelFile}
              onRemove={removeFile}
            />
          ))}
        </ul>
      ) : null}

      {showUploadAll ? (
        <Button type="button" variant="solid" size={size} onClick={() => uploadAll()}>
          {t.uploadAll}
        </Button>
      ) : null}

      <div className={liveCls} aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
    </div>
  );
});

FileUpload.displayName = 'FileUpload';