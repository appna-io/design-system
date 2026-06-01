'use client';

import { useState } from 'react';
import { Accordion, Button, Div, Typography } from '@apx-ui/ds';

export default function Controlled() {
  const [open, setOpen] = useState<string>('two');
  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Div display="flex" flexWrap="wrap" gap="2" className="text-sm">
        <Typography as="span" variant="bodySmall" color="fg.muted">
          Open from outside:
        </Typography>
        <Button size="sm" variant="soft" onClick={() => setOpen('one')}>
          Open #1
        </Button>
        <Button size="sm" variant="soft" onClick={() => setOpen('two')}>
          Open #2
        </Button>
        <Button size="sm" variant="soft" onClick={() => setOpen('three')}>
          Open #3
        </Button>
        <Button size="sm" variant="outline" onClick={() => setOpen('')}>
          Close all
        </Button>
      </Div>
      <Accordion type="single" value={open} onValueChange={setOpen}>
        <Accordion.Item value="one">
          <Accordion.Trigger>Section one</Accordion.Trigger>
          <Accordion.Content>Controlled body one.</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="two">
          <Accordion.Trigger>Section two</Accordion.Trigger>
          <Accordion.Content>Controlled body two.</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="three">
          <Accordion.Trigger>Section three</Accordion.Trigger>
          <Accordion.Content>Controlled body three.</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </Div>
  );
}