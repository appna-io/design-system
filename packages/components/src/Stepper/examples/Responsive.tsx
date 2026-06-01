import { Div, Stepper, Typography } from '@apx-ui/ds';

export default function Responsive() {
  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Typography variant="caption" color="fg.muted">
        Vertical at narrow widths, horizontal from <code>md</code> up. Resize the renderer
        viewport to see the switch.
      </Typography>
      <Stepper
        active={1}
        orientation={{ base: 'vertical', md: 'horizontal' }}
        steps={[
          { id: 'a', label: 'Sign up', description: 'Email + password' },
          { id: 'b', label: 'Verify', description: 'Confirm your email' },
          { id: 'c', label: 'Configure', description: 'Pick preferences' },
          { id: 'd', label: 'Launch' },
        ]}
      />
    </Div>
  );
}