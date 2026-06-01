import { Alert, Button, Div, Typography } from '@apx-ui/ds';

/**
 * Quick-review demo of `<Alert />` — four representative status banners side-by-side:
 * default info, success with title, warning with action, and closable danger.
 */
export default function Overview() {
  return (
    <Div display="flex" alignItems="flex-start" gap="6" className="flex-wrap">
      <Div display="flex" flexDirection="column" alignItems="stretch" gap="2" className="min-w-[200px] flex-1">
        <Alert color="info">Your changes have been saved.</Alert>
        <Typography variant="caption" color="fg.muted" align="center">
          Default — soft info
        </Typography>
      </Div>

      <Div display="flex" flexDirection="column" alignItems="stretch" gap="2" className="min-w-[200px] flex-1">
        <Alert color="success">
          <Alert.Title>Payment received</Alert.Title>
          <Alert.Description>Invoice #1042 was paid on May 28.</Alert.Description>
        </Alert>
        <Typography variant="caption" color="fg.muted" align="center">
          Title + description
        </Typography>
      </Div>

      <Div display="flex" flexDirection="column" alignItems="stretch" gap="2" className="min-w-[200px] flex-1">
        <Alert color="warning">
          <Alert.Title>Session expiring</Alert.Title>
          <Alert.Description>You will be signed out in 5 minutes.</Alert.Description>
          <Alert.Action>
            <Button size="sm" variant="solid" color="warning">
              Extend session
            </Button>
          </Alert.Action>
        </Alert>
        <Typography variant="caption" color="fg.muted" align="center">
          With action
        </Typography>
      </Div>

      <Div display="flex" flexDirection="column" alignItems="stretch" gap="2" className="min-w-[200px] flex-1">
        <Alert color="danger" closable onClose={() => {}}>
          Failed to sync — check your connection and try again.
        </Alert>
        <Typography variant="caption" color="fg.muted" align="center">
          Closable
        </Typography>
      </Div>
    </Div>
  );
}