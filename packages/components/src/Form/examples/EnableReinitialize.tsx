import { useState } from 'react';
import { Button, Form, FormField, Input } from 'apx-ds';

const PROFILES = [
  { id: '1', name: 'Ada Lovelace', email: 'ada@example.com' },
  { id: '2', name: 'Grace Hopper', email: 'grace@example.com' },
];

export default function EnableReinitialize() {
  const [selectedId, setSelectedId] = useState('1');
  const profile = PROFILES.find((p) => p.id === selectedId)!;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {PROFILES.map((p) => (
          <Button
            key={p.id}
            variant={selectedId === p.id ? 'solid' : 'outline'}
            onClick={() => setSelectedId(p.id)}
          >
            {p.name}
          </Button>
        ))}
      </div>
      <Form
        key={profile.id}
        initialValues={{ name: profile.name, email: profile.email }}
        enableReinitialize
        onSubmit={async (values) => alert(JSON.stringify(values))}
      >
        <FormField name="name" label="Name">
          <Input />
        </FormField>
        <FormField name="email" label="Email">
          <Input type="email" />
        </FormField>
        <Button type="submit" variant="solid">Save</Button>
      </Form>
    </div>
  );
}
