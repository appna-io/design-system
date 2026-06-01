import { Button, Div, Typography, confirm } from '@apx-ui/ds';

/**
 * `showIcon: false` suppresses the leading icon halo. Useful for plain "do you want to
 * continue?" prompts where a status icon would over-claim the user's attention.
 */
export default function WithoutIcon() {
  return (
    <Div display="flex" flexDirection="column" gap="3" alignItems="flex-start">
      <Typography variant="body" color="fg.muted">
        Pass <code>showIcon: false</code> to drop the leading icon halo entirely. The dialog
        keeps its title + description + button row layout but without any visual status mark.
      </Typography>

      <Button
        variant="outline"
        onClick={() =>
          confirm.display({
            showIcon: false,
            title: 'Continue without saving?',
            description: 'Your unsaved edits will be lost.',
            confirmText: 'Continue',
          })
        }
      >
        Continue without saving
      </Button>
    </Div>
  );
}