'use client';

import { useState } from 'react';
import { Accordion, Button } from 'apx-ds';

export default function Controlled() {
  const [open, setOpen] = useState<string>('two');
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2 text-sm">
        <span className="text-fg-muted">Open from outside:</span>
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
      </div>
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
    </div>
  );
}
