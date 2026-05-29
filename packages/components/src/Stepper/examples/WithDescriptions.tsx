import { Stepper } from '@apx-ui/ds';

export default function WithDescriptions() {
  return (
    <Stepper
      active={1}
      steps={[
        { id: 'a', label: 'Sign up', description: 'Email + password' },
        { id: 'b', label: 'Verify email', description: 'Check your inbox for a code' },
        { id: 'c', label: 'Set up profile', description: 'Name, photo, time zone' },
        { id: 'd', label: 'Done', description: 'Welcome!' },
      ]}
    />
  );
}
