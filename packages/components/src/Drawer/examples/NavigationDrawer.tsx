import { Button, Drawer } from 'apx-ds';

const links = [
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Projects', href: '#projects' },
  { label: 'Team', href: '#team' },
  { label: 'Reports', href: '#reports' },
  { label: 'Settings', href: '#settings' },
];

export default function NavigationDrawer() {
  return (
    <Drawer>
      <Drawer.Trigger>
        <Button variant="outline">Menu</Button>
      </Drawer.Trigger>
      <Drawer.Content side="left" size="sm" aria-label="Primary navigation">
        <Drawer.Close />
        <Drawer.Header title="Navigation" />
        <Drawer.Body>
          <nav>
            <ul className="flex flex-col gap-1">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="block rounded-md px-3 py-2 text-sm hover:bg-bg-subtle"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </Drawer.Body>
        <Drawer.Footer align="start">
          <Drawer.Close asChild>
            <Button variant="ghost" size="sm">
              Sign out
            </Button>
          </Drawer.Close>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
}
