import { Avatar, Combobox } from '@apx-ui/ds';

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
    <div className="max-w-md">
      <Combobox<User>
        aria-label="Assignee"
        placeholder="Find a teammate…"
        options={USERS}
        filterOption={(user, query) =>
          user.label.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase())
        }
        renderOption={({ option }) => (
          <div className="flex items-center gap-2">
            <Avatar src={option.avatarUrl} size="sm" name={option.label} />
            <div className="flex flex-col">
              <span className="font-medium">{option.label}</span>
              <span className="text-xs text-fg-muted">{option.email}</span>
            </div>
          </div>
        )}
      />
    </div>
  );
}
