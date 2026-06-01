import { useState } from 'react';
import { Div, Radio, RadioGroup, Typography } from '@apx-ui/ds';

export default function Controlled() {
  const [controlled, setControlled] = useState('medium');
  return (
    <Div display="flex" flexDirection="column" gap="6">
      <Div>
        <Typography variant="bodySmall" weight="medium" className="mb-2">
          Uncontrolled (defaultValue)
        </Typography>
        <RadioGroup name="uncontrolled" defaultValue="medium" aria-label="Uncontrolled size">
          <Radio value="small">Small</Radio>
          <Radio value="medium">Medium</Radio>
          <Radio value="large">Large</Radio>
        </RadioGroup>
      </Div>
      <Div>
        <Typography variant="bodySmall" weight="medium" className="mb-2">
          Controlled (value = <code>{controlled}</code>)
        </Typography>
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
      </Div>
    </Div>
  );
}