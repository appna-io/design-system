import { TagsInput } from 'apx-ds';

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
