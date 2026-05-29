import { useState } from 'react';
import { Radio } from '@apx-ui/ds';

export default function Standalone() {
  // Standalone is the documented escape hatch: a lone <Radio> without a <RadioGroup>. Useful for
  // single-option opt-ins (e.g. "Use my default shipping address") where you don't need group
  // semantics. For 99% of use cases, prefer <RadioGroup>.
  const [accepted, setAccepted] = useState(false);
  return (
    <Radio
      value="default-address"
      checked={accepted}
      onCheckedChange={setAccepted}
      description="We'll fall back to your saved address on file."
    >
      Use my default shipping address
    </Radio>
  );
}
