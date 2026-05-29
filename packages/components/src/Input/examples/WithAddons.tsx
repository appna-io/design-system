import { Input } from '@apx-ui/ds';

export default function WithAddons() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
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
    </div>
  );
}
