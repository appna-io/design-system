import { Checkbox } from 'apx-ds';

export default function Invalid() {
  return (
    <div className="flex flex-col gap-2">
      <Checkbox invalid description="This field is required." required>
        Accept the terms of service
      </Checkbox>
      <p className="text-xs text-danger ms-6">You must accept before continuing.</p>
    </div>
  );
}
