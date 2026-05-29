import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@apx-ui/ds';

export default function Password() {
  const [show, setShow] = useState(false);

  return (
    <div className="flex w-full max-w-sm flex-col gap-1.5 text-sm text-fg">
      <label htmlFor="password-field">Password</label>
      <Input
        id="password-field"
        type={show ? 'text' : 'password'}
        placeholder="••••••••"
        rightIcon={
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? 'Hide password' : 'Show password'}
            className="flex items-center text-fg-muted transition-colors hover:text-fg"
          >
            {show ? <EyeOff /> : <Eye />}
          </button>
        }
      />
    </div>
  );
}
