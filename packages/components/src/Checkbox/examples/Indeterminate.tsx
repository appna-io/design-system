import { useMemo, useState } from 'react';
import { Checkbox } from 'apx-ds';

const FRUITS = ['Apple', 'Banana', 'Cherry'] as const;

export default function Indeterminate() {
  const [selected, setSelected] = useState<Record<string, boolean>>({
    Apple: true,
    Banana: false,
    Cherry: false,
  });

  const allChecked = useMemo(() => FRUITS.every((f) => selected[f]), [selected]);
  const noneChecked = useMemo(() => FRUITS.every((f) => !selected[f]), [selected]);
  const parentIndeterminate = !allChecked && !noneChecked;

  return (
    <div className="flex flex-col gap-2">
      <Checkbox
        checked={allChecked}
        indeterminate={parentIndeterminate}
        onCheckedChange={(checked) => {
          const next = Object.fromEntries(FRUITS.map((f) => [f, checked]));
          setSelected(next);
        }}
      >
        Select all fruits
      </Checkbox>
      <div className="flex flex-col gap-2 ms-6">
        {FRUITS.map((fruit) => (
          <Checkbox
            key={fruit}
            checked={selected[fruit]}
            onCheckedChange={(checked) =>
              setSelected((prev) => ({ ...prev, [fruit]: checked }))
            }
          >
            {fruit}
          </Checkbox>
        ))}
      </div>
    </div>
  );
}
