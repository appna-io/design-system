import { TagsInput } from 'apx-ds';

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
