import { Avatar, Combobox, Div, Typography } from '@apx-ui/ds';

type User = {
  value: string;
  label: string;
  email: string;
  avatarUrl: string;
};

const USERS: User[] = [
  {
    value: 'u1',
    label: 'Alice Nakamura',
    email: 'alice@example.com',
    avatarUrl: 'https://i.pravatar.cc/64?img=1',
  },
  {
    value: 'u2',
    label: 'Bilal Hassan',
    email: 'bilal@example.com',
    avatarUrl: 'https://i.pravatar.cc/64?img=2',
  },
  {
    value: 'u3',
    label: 'Camila Souza',
    email: 'camila@example.com',
    avatarUrl: 'https://i.pravatar.cc/64?img=3',
  },
  {
    value: 'u4',
    label: 'Dieter Schmidt',
    email: 'dieter@example.com',
    avatarUrl: 'https://i.pravatar.cc/64?img=4',
  },
];

export default function CustomItem() {
  return (
    <Div className="max-w-md">
      <Combobox<User>
        aria-label="Assignee"
        placeholder="Find a teammate…"
        options={USERS}
        filterOption={(user, query) =>
          user.label.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase())
        }
        renderOption={({ option }) => (
          <Div display="flex" alignItems="center" gap="2">
            <Avatar src={option.avatarUrl} size="sm" name={option.label} />
            <Div display="flex" flexDirection="column">
              <Typography weight="medium">{option.label}</Typography>
              <Typography variant="caption" color="fg.muted">
                {option.email}
              </Typography>
            </Div>
          </Div>
        )}
      />
    </Div>
  );
}