import { Stepper } from '@apx-ui/ds';

export default function Overview() {
  return (
    <Stepper
      active={1}
      steps={[
        { id: 'account', label: 'Account', description: 'Email + password' },
        { id: 'profile', label: 'Profile', description: 'Name + photo' },
        { id: 'plan', label: 'Plan', description: 'Pick a plan' },
        { id: 'review', label: 'Review', description: 'Confirm details' },
      ]}
    />
  );
}