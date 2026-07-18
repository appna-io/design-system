import { Avatar, Combobox, Div, Typography } from '@apx-ui/ds';


const USERS = [
  { value: 'u1', label: 'Amara Okafor' },
  { value: 'u2', label: 'Yuki Tanaka' },
  { value: 'u3', label: 'Maya Cohen' },
  { value: 'u4', label: 'Dieter Schmidt' },
];

const USER_DETAILS: Record<string, { email: string; avatarUrl: string }> = {
  u1: { email: 'amara@example.com', avatarUrl: 'https://i.pravatar.cc/64?img=1' },
  u2: { email: 'yuki@example.com', avatarUrl: 'https://i.pravatar.cc/64?img=2' },
  u3: { email: 'maya@example.com', avatarUrl: 'https://i.pravatar.cc/64?img=3' },
  u4: { email: 'dieter@example.com', avatarUrl: 'https://i.pravatar.cc/64?img=4' },
};

export default function CustomItem() {
  return (
    <Div className="max-w-md">
      <Combobox
        aria-label="Assignee"
        placeholder="Find a teammate…"
        options={USERS}
        filterOption={(user, query) =>
          user.label.toLowerCase().includes(query.toLowerCase()) ||
          (USER_DETAILS[user.value]?.email ?? '').toLowerCase().includes(query.toLowerCase())
        }
        renderOption={({ option }) => (
          <Div display="flex" alignItems="center" gap="2">
            <Avatar src={USER_DETAILS[option.value]?.avatarUrl} size="sm" name={option.label} />
            <Div display="flex" flexDirection="column">
              <Typography weight="medium">{option.label}</Typography>
              <Typography variant="caption" color="fg.muted">
                {USER_DETAILS[option.value]?.email}
              </Typography>
            </Div>
          </Div>
        )}
      />
    </Div>
  );
}