import { Button, Menu } from 'apx-ds';

export default function Submenus() {
  return (
    <Menu>
      <Menu.Trigger asChild>
        <Button>Tools</Button>
      </Menu.Trigger>
      <Menu.Content>
        <Menu.Item>Find</Menu.Item>
        <Menu.Item>Replace</Menu.Item>
        <Menu.Separator />
        <Menu.Sub>
          <Menu.SubTrigger>More tools</Menu.SubTrigger>
          <Menu.SubContent>
            <Menu.Item>Format document</Menu.Item>
            <Menu.Item>Sort lines</Menu.Item>
            <Menu.Separator />
            <Menu.Sub>
              <Menu.SubTrigger>Developer</Menu.SubTrigger>
              <Menu.SubContent>
                <Menu.Item>DevTools</Menu.Item>
                <Menu.Item>Reload window</Menu.Item>
              </Menu.SubContent>
            </Menu.Sub>
          </Menu.SubContent>
        </Menu.Sub>
        <Menu.Separator />
        <Menu.Item>Settings</Menu.Item>
      </Menu.Content>
    </Menu>
  );
}
