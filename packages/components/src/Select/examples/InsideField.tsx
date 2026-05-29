import { Select } from 'apx-ds';

/**
 * Composing Select with manual `<label htmlFor>` + helper text + error text — the same pattern a
 * future `<Field>` primitive will encapsulate. `useFormFieldA11y` is doing the heavy lifting:
 * `id` is shared between `<label>` and the Trigger; `aria-describedby` ties helper + error to
 * the trigger.
 */
export default function InsideField() {
  return (
    <div className="flex flex-col gap-1 max-w-sm">
      <label htmlFor="lang" className="text-sm font-medium">
        Language
      </label>
      <Select id="lang" required placeholder="Select a language" aria-describedby="lang-helper">
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="en">English</Select.Item>
          <Select.Item value="es">Español</Select.Item>
          <Select.Item value="fr">Français</Select.Item>
          <Select.Item value="ja">日本語</Select.Item>
        </Select.Content>
      </Select>
      <p id="lang-helper" className="text-xs text-fg-muted">
        We&apos;ll translate the UI based on your choice.
      </p>
    </div>
  );
}
