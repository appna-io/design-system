import { useState } from 'react';
import { Radio, RadioGroup } from 'apx-ds';

export default function Controlled() {
  const [controlled, setControlled] = useState('medium');
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="text-sm font-medium mb-2">Uncontrolled (defaultValue)</div>
        <RadioGroup name="uncontrolled" defaultValue="medium" aria-label="Uncontrolled size">
          <Radio value="small">Small</Radio>
          <Radio value="medium">Medium</Radio>
          <Radio value="large">Large</Radio>
        </RadioGroup>
      </div>
      <div>
        <div className="text-sm font-medium mb-2">
          Controlled (value = <code>{controlled}</code>)
        </div>
        <RadioGroup
          name="controlled"
          value={controlled}
          onValueChange={setControlled}
          aria-label="Controlled size"
        >
          <Radio value="small">Small</Radio>
          <Radio value="medium">Medium</Radio>
          <Radio value="large">Large</Radio>
        </RadioGroup>
      </div>
    </div>
  );
}
