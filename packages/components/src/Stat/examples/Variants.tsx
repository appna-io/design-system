import { Div, Stat } from '@apx-ui/ds';

export default function Variants() {
  return (
    <Div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <Stat
        variant="default"
        label="Default"
        value="$12.4K"
        delta={{ value: 5.4, direction: 'up' }}
        caption="No chrome — sits in any container."
      />
      <Stat
        variant="elevated"
        label="Elevated"
        value="$12.4K"
        delta={{ value: 5.4, direction: 'up' }}
        caption="Self-contained card with border + shadow."
      />
      <Stat
        variant="minimal"
        label="Minimal"
        value="$12.4K"
        delta={{ value: 5.4, direction: 'up' }}
        caption="Tight spacing — for dense data tables."
      />
    </Div>
  );
}