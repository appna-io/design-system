import { Search } from 'lucide-react';
import { Div, Input, Typography } from '@apx-ui/ds';

export default function Overview() {
  return (
    <Div display="flex" alignItems="flex-start" gap="4" className="flex-wrap">
      <Div display="flex" flexDirection="column" gap="1.5" className="w-48">
        <Input placeholder="Search projects…" aria-label="Search projects" />
        <Typography variant="caption" color="fg.muted" align="center">
          Placeholder
        </Typography>
      </Div>

      <Div display="flex" flexDirection="column" gap="1.5" className="w-48">
        <label htmlFor="overview-email" className="text-sm text-fg">
          Work email
        </label>
        <Input id="overview-email" type="email" placeholder="maya@northwind.io" />
        <Typography variant="caption" color="fg.muted" align="center">
          With label
        </Typography>
      </Div>

      <Div display="flex" flexDirection="column" gap="1.5" className="w-48">
        <label htmlFor="overview-error" className="text-sm text-fg">
          Username
        </label>
        <Input
          id="overview-error"
          defaultValue="m"
          invalid
          aria-describedby="overview-error-msg"
        />
        <Typography id="overview-error-msg" variant="caption" color="danger">
          At least 3 characters
        </Typography>
        <Typography variant="caption" color="fg.muted" align="center">
          With error
        </Typography>
      </Div>

      <Div display="flex" flexDirection="column" gap="1.5" className="w-48">
        <Input
          leftIcon={<Search />}
          placeholder="Filter by name…"
          aria-label="Filter by name"
        />
        <Typography variant="caption" color="fg.muted" align="center">
          With icon
        </Typography>
      </Div>
    </Div>
  );
}