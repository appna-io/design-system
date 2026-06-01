import { useState } from 'react';
import { Div, ToggleGroup, Typography } from '@apx-ui/ds';

export default function BasicGroupMultiple() {
  const [formatting, setFormatting] = useState<string[]>(['bold']);
  return (
    <Div display="flex" flexDirection="column" gap="3">
      <ToggleGroup
        type="multiple"
        aria-label="Text formatting"
        value={formatting}
        onValueChange={setFormatting}
      >
        <ToggleGroup.Item value="bold" aria-label="Bold">
          <strong>B</strong>
        </ToggleGroup.Item>
        <ToggleGroup.Item value="italic" aria-label="Italic">
          <em>I</em>
        </ToggleGroup.Item>
        <ToggleGroup.Item value="underline" aria-label="Underline">
          <u>U</u>
        </ToggleGroup.Item>
        <ToggleGroup.Item value="strike" aria-label="Strikethrough">
          <s>S</s>
        </ToggleGroup.Item>
      </ToggleGroup>
      <Typography variant="bodySmall" color="fg.muted">
        Active: {formatting.length === 0 ? '(none)' : formatting.join(', ')}
      </Typography>
    </Div>
  );
}