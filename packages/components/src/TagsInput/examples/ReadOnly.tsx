import { TagsInput } from '@apx-ui/ds';

export default function ReadOnly() {
  return (
    <TagsInput
      label="Read-only"
      readOnly
      value={['static', 'display']}
      onChange={() => {}}
    />
  );
}
