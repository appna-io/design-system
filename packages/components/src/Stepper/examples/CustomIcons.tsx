import { CreditCard, Mail, User, Sparkles } from 'lucide-react';
import { Stepper } from '@apx-ui/ds';

export default function CustomIcons() {
  return (
    <Stepper
      active={2}
      steps={[
        { id: 'a', label: 'Sign up', icon: <Mail aria-hidden="true" className="h-4 w-4" /> },
        { id: 'b', label: 'Profile', icon: <User aria-hidden="true" className="h-4 w-4" /> },
        {
          id: 'c',
          label: 'Payment',
          icon: <CreditCard aria-hidden="true" className="h-4 w-4" />,
        },
        { id: 'd', label: 'Done', icon: <Sparkles aria-hidden="true" className="h-4 w-4" /> },
      ]}
    />
  );
}
