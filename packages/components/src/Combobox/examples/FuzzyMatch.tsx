import { Combobox } from 'apx-ds';

const COMMANDS = [
  { value: 'open-file', label: 'Open File…' },
  { value: 'save-as', label: 'Save As…' },
  { value: 'find-in-files', label: 'Find in Files' },
  { value: 'toggle-sidebar', label: 'Toggle Sidebar' },
  { value: 'split-editor', label: 'Split Editor' },
  { value: 'close-tab', label: 'Close Tab' },
  { value: 'reload-window', label: 'Reload Window' },
  { value: 'go-to-symbol', label: 'Go to Symbol' },
];

export default function FuzzyMatch() {
  return (
    <div className="max-w-md">
      <Combobox
        aria-label="Command"
        placeholder="Try typing 'tgsb' or 'rldw'…"
        options={COMMANDS}
        matchStrategy="fuzzy"
      />
    </div>
  );
}
