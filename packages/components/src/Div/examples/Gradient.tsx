import { Div } from '@apx-ui/ds';

export default function Gradient() {
  return (
    <Div display="flex" gap={16} flexWrap="wrap">
      {/* Default — theme-aware radial primary.subtle gradient anchored top-left. */}
      <Div
        position="relative"
        overflow="hidden"
        radius="lg"
        border="1px solid"
        borderColor="border.subtle"
        h={140}
        minWidth={220}
      >
        <Div decorative gradient />
        <Div p={4} position="relative" fg="fg.muted">
          decorative + gradient
        </Div>
      </Div>

      {/* Override the anchor + size + color via the structured config. */}
      <Div
        position="relative"
        overflow="hidden"
        radius="lg"
        border="1px solid"
        borderColor="border.subtle"
        h={140}
        minWidth={220}
      >
        <Div decorative gradient={{ position: 'top', size: '60% 60%', from: 'success.subtle' }} />
        <Div p={4} position="relative" fg="fg.muted">
          success · top · 60% size
        </Div>
      </Div>

      {/* Linear gradient as a real (non-decorative) background. */}
      <Div
        gradient={{ type: 'linear', from: 'primary.main', to: 'primary.subtle', position: 'right' }}
        radius="lg"
        h={140}
        minWidth={220}
        p={4}
        fg="primary.contrast"
      >
        linear · primary.main → subtle
      </Div>
    </Div>
  );
}