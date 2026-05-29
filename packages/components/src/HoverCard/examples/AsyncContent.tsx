import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, HoverCard, Spinner } from 'apx-ds';

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
 *
 * **Renderer-safety**: no real network. We use a deterministic `setTimeout` resolved promise so
 * Ahmad sees the loading state for ~600ms before the data renders. The `Reset` button clears the
 * cache so Ahmad can re-trigger the loading state without a page reload (per ship-gate).
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
    <div className="flex flex-col items-start gap-3">
      <p className="text-sm text-fg-muted">
        Hover the @mention to fetch the profile lazily. First open shows a Spinner; subsequent
        opens reuse the cached data.
      </p>
      <p className="text-sm">
        Reviewed by{' '}
        <HoverCard onOpenChange={handleOpenChange}>
          <HoverCard.Trigger>
            <a href="#user-ahmad" className="text-primary underline">
              @ahmad
            </a>
          </HoverCard.Trigger>
          <HoverCard.Content size="md">
            {loading || !data ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" />
                <span className="text-xs text-fg-muted">Loading profile…</span>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <strong className="text-sm">{data.name}</strong>
                <span className="text-xs text-fg-muted">@{data.username}</span>
                <p className="text-xs">{data.bio}</p>
                <span className="text-xs text-fg-muted">
                  {data.followers.toLocaleString()} followers
                </span>
              </div>
            )}
          </HoverCard.Content>
        </HoverCard>
        .
      </p>
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
    </div>
  );
}
