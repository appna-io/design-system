import { useState } from 'react';
import { Button, CommandPalette } from 'apx-ds';

const PAGES = {
  theme: {
    title: 'Change Theme',
    placeholder: 'Pick a theme…',
    commands: [
      { id: 'theme-light',  label: 'Light',  onSelect: () => alert('Light')  },
      { id: 'theme-dark',   label: 'Dark',   onSelect: () => alert('Dark')   },
      { id: 'theme-katana', label: 'Katana', onSelect: () => alert('Katana') },
    ],
  },
  workspace: {
    title: 'Switch workspace',
    commands: [
      { id: 'ws-team',     label: 'Team',     onSelect: () => alert('Team')     },
      { id: 'ws-personal', label: 'Personal', onSelect: () => alert('Personal') },
    ],
  },
};

const ROOT = [
  {
    id: 'theme',
    label: 'Change Theme',
    category: 'Preferences',
    onSelect: ({ palette: p }: { palette: { pushPage: (id: string) => void } }) => p.pushPage('theme'),
  },
  {
    id: 'workspace',
    label: 'Switch workspace',
    category: 'Account',
    onSelect: ({ palette: p }: { palette: { pushPage: (id: string) => void } }) => p.pushPage('workspace'),
  },
  { id: 'logout', label: 'Log out', category: 'Account', onSelect: () => alert('Logged out') },
];

export default function SubPages() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open palette</Button>
      <CommandPalette open={open} onOpenChange={setOpen} commands={ROOT} pages={PAGES} />
    </>
  );
}
