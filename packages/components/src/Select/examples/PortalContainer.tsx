import { useRef } from 'react';

import { Div, Select, Typography } from '@apx-ui/ds';

/**
 * Render the listbox inside a custom container — useful for portalling Select inside a Modal /
 * Drawer so the dropdown lives inside the overlay's stacking context.
 */
export default function PortalContainer() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <Div display="flex" flexDirection="column" gap="4">
      <Select placeholder="Pick" aria-label="Region">
        <Select.Trigger />
        <Select.Content portalContainer={containerRef.current ?? undefined}>
          <Select.Item value="amer">Americas</Select.Item>
          <Select.Item value="emea">EMEA</Select.Item>
          <Select.Item value="apac">APAC</Select.Item>
        </Select.Content>
      </Select>
      <Div
        ref={containerRef}
        className="border border-dashed border-border rounded-md p-3 min-h-[8rem] relative"
      >
        <Typography variant="bodySmall" color="fg.muted">
          Listbox renders inside this dashed container.
        </Typography>
      </Div>
    </Div>
  );
}