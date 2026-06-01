import { AlignCenter, AlignJustify, AlignLeft, AlignRight } from 'lucide-react';
import { ToggleGroup } from '@apx-ui/ds';

export default function IconOnly() {
  return (
    <ToggleGroup
      type="single"
      aria-label="Text alignment"
      defaultValue="left"
      attached
      variant="outline"
    >
      <ToggleGroup.Item value="left" aria-label="Align left">
        <AlignLeft />
      </ToggleGroup.Item>
      <ToggleGroup.Item value="center" aria-label="Align center">
        <AlignCenter />
      </ToggleGroup.Item>
      <ToggleGroup.Item value="right" aria-label="Align right">
        <AlignRight />
      </ToggleGroup.Item>
      <ToggleGroup.Item value="justify" aria-label="Justify">
        <AlignJustify />
      </ToggleGroup.Item>
    </ToggleGroup>
  );
}