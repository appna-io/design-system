import { Div } from 'apx-ds';

export default function OnHover() {
  return (
    <Div display="flex" gap={12} flexWrap="wrap">
      <Div
        p={4}
        bg="primary.50"
        fg="primary.contrast"
        radius="md"
        cursor="pointer"
        transition="transform 150ms ease, background-color 150ms ease"
        onHover="bg-primary-100 scale-[1.02]"
      >
        Hover me
      </Div>
      <Div
        p={4}
        bg="bg.paper"
        fg="fg.default"
        radius="md"
        border="1px solid"
        borderColor="border.subtle"
        cursor="pointer"
        transition="background-color 150ms ease, border-color 150ms ease"
        onHover="bg-secondary-50 border-secondary-300"
      >
        Or me
      </Div>
    </Div>
  );
}
