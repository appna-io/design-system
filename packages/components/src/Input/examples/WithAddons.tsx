import { Div, Input } from '@apx-ui/ds';

export default function WithAddons() {
  return (
    <Div display="flex" flexDirection="column" gap="3" className="w-full max-w-md">
      <Input
        leftAddon="https://"
        rightAddon=".com"
        placeholder="your-site"
        aria-label="Website URL composer"
      />
      <Input leftAddon="$" placeholder="0.00" aria-label="Price in USD" />
      <Input rightAddon="kg" placeholder="0.0" aria-label="Weight in kilograms" />
      <Input
        leftAddon="@"
        placeholder="username"
        aria-label="Username"
        variant="solid"
      />
    </Div>
  );
}