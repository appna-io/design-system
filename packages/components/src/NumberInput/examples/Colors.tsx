import { Div, NumberInput } from '@apx-ui/ds';

export default function Colors() {
  return (
    <Div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {(['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'] as const).map(
        (c) => (
          <NumberInput key={c} aria-label={c} defaultValue={42} color={c} />
        ),
      )}
    </Div>
  );
}