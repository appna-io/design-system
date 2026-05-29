import { TagsInput } from '@apx-ui/ds';

export default function Disabled() {
  return (
    <TagsInput
      label="Disabled"
      disabled
      value={['cannot', 'edit', 'these']}
      onChange={() => {}}
    />
  );
}
