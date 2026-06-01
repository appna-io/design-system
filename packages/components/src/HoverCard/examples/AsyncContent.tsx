import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Div, HoverCard, Spinner, Typography } from '@apx-ui/ds';

interface UserProfile {
  name: string;
  username: string;
  bio: string;
  followers: number;
}

/**
 * The canonical async-load pattern: defer the (fake) network request until the card actually
 * opens. `onOpenChange` is the hook — when `open` flips to `true`, we kick off the fetch.
 * Subsequent opens reuse the cached value.
 */
export default function AsyncContent() {
  const [data, setData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const inFlightRef = useRef(false);

  const fetchProfile = useCallback(async () => {
    if (data || inFlightRef.current) return;
    inFlightRef.current = true;
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setData({
      name: 'Ahmad Igbaryya',
      username: 'ahmad',
      bio: 'Software engineer. Designs systems. Ships things.',
      followers: 1284,
    });
    setLoading(false);
    inFlightRef.current = false;
  }, [data]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) void fetchProfile();
    },
    [fetchProfile],
  );

  useEffect(() => () => {
    inFlightRef.current = false;
  }, []);

  return (
    <Div display="flex" flexDirection="column" alignItems="flex-start" gap="3">
      <Typography variant="bodySmall" color="fg.muted">
        Hover the @mention to fetch the profile lazily. First open shows a Spinner; subsequent
        opens reuse the cached data.
      </Typography>
      <Typography variant="bodySmall" as="p">
        Reviewed by{' '}
        <HoverCard onOpenChange={handleOpenChange}>
          <HoverCard.Trigger>
            <a href="#user-ahmad" className="text-primary underline">
              @ahmad
            </a>
          </HoverCard.Trigger>
          <HoverCard.Content size="md">
            {loading || !data ? (
              <Div display="flex" alignItems="center" gap="2">
                <Spinner size="sm" />
                <Typography as="span" variant="caption" color="fg.muted">
                  Loading profile…
                </Typography>
              </Div>
            ) : (
              <Div display="flex" flexDirection="column" gap="1">
                <strong className="text-sm">{data.name}</strong>
                <Typography as="span" variant="caption" color="fg.muted">
                  @{data.username}
                </Typography>
                <Typography variant="caption">{data.bio}</Typography>
                <Typography as="span" variant="caption" color="fg.muted">
                  {data.followers.toLocaleString()} followers
                </Typography>
              </Div>
            )}
          </HoverCard.Content>
        </HoverCard>
        .
      </Typography>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setData(null);
          setLoading(false);
        }}
      >
        Reset cache
      </Button>
    </Div>
  );
}