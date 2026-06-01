import { useState } from 'react';
import { Div, Switch } from '@apx-ui/ds';

export default function Loading() {
  const [connected, setConnected] = useState(false);
  const [pending, setPending] = useState(false);

  function toggle(next: boolean) {
    setPending(true);
    // Simulate a server round-trip for connecting / disconnecting Slack.
    window.setTimeout(() => {
      setConnected(next);
      setPending(false);
    }, 1200);
  }

  return (
    <Div display="flex" flexDirection="column" gap="3" className="max-w-sm">
      <Switch
        size="lg"
        color="success"
        checked={connected}
        loading={pending}
        onCheckedChange={toggle}
        description={
          pending
            ? 'Talking to Slack…'
            : connected
              ? 'Connected to #engineering.'
              : 'Connect to start receiving notifications.'
        }
      >
        Slack integration
      </Switch>
    </Div>
  );
}