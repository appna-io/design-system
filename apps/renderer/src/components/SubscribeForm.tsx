'use client';

import { useState, type FormEvent } from 'react';
import { Check, Loader2, Mail } from 'lucide-react';
import { Button, Input, Typography } from '@apx-ui/ds';

import { getRealtimeDb } from '../lib/firebase';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Stable key for a node under `/subscribers` — lowercased email with disallowed RTDB key chars swapped. */
function emailKey(email: string): string {
  return email.trim().toLowerCase().replace(/[.#$/[\]]/g, '_');
}

/**
 * Email capture for the design-system landing surface. Writes one record per
 * address under the Realtime Database `/subscribers` node, keyed by a sanitised
 * email so re-submitting the same address updates rather than duplicates.
 *
 * Firebase is imported lazily inside the submit handler so the SDK only loads
 * when a visitor actually subscribes — it never weighs on first paint.
 */
export function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim();

    if (!EMAIL_RE.test(value)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('submitting');
    setMessage('');

    try {
      const { ref, set, serverTimestamp } = await import('firebase/database');
      await set(ref(getRealtimeDb(), `subscribers/${emailKey(value)}`), {
        email: value,
        source: 'renderer',
        createdAt: serverTimestamp(),
      });
      setStatus('success');
      setMessage("You're on the list — we'll be in touch.");
      setEmail('');
    } catch (err) {
      console.error('[SubscribeForm] failed to save subscription', err);
      setStatus('error');
      setMessage('Something went wrong. Please try again in a moment.');
    }
  }

  const submitting = status === 'submitting';

  return (
    <form onSubmit={handleSubmit} className="mt-4 w-full max-w-md" noValidate>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="email"
          name="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status !== 'idle') setStatus('idle');
          }}
          placeholder="you@company.com"
          aria-label="Email address"
          autoComplete="email"
          invalid={status === 'error'}
          disabled={submitting}
          leftIcon={<Mail size={16} aria-hidden />}
        />
        <Button type="submit" loading={submitting} loadingText="Subscribing…">
          Notify me
        </Button>
      </div>
      {message ? (
        <Typography
          variant="caption"
          color={status === 'success' ? 'success.main' : status === 'error' ? 'danger.main' : 'fg.muted'}
          className="mt-2 inline-flex items-center gap-1.5"
          role={status === 'error' ? 'alert' : 'status'}
        >
          {status === 'success' ? (
            <Check size={13} aria-hidden />
          ) : submitting ? (
            <Loader2 size={13} aria-hidden className="animate-spin" />
          ) : null}
          {message}
        </Typography>
      ) : null}
    </form>
  );
}
