import { Button, Div, Drawer, Typography } from '@apx-ui/ds';

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
          <Div as="nav">
            <Div as="ul" display="flex" flexDirection="column" gap="1">
              {links.map((link) => (
                <Typography as="li" key={link.href} variant="bodySmall">
                  <a
                    href={link.href}
                    className="block rounded-md px-3 py-2 hover:bg-bg-subtle"
                  >
                    {link.label}
                  </a>
                </Typography>
              ))}
            </Div>
          </Div>
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