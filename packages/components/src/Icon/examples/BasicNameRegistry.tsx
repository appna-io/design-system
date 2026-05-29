import { Icon, IconProvider, createIconRegistry } from '@apx-ui/ds';

import * as Glyphs from './_glyphs';

const icons = createIconRegistry({
  mail: Glyphs.Mail,
  user: Glyphs.User,
  settings: Glyphs.Settings,
});

export default function BasicNameRegistry() {
  return (
    <IconProvider value={icons}>
      <div style={{ display: 'flex', gap: 12 }}>
        <Icon name="mail" />
        <Icon name="user" />
        <Icon name="settings" />
      </div>
    </IconProvider>
  );
}
