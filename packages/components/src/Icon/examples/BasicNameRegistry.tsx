import { Div, Icon, IconProvider, createIconRegistry } from '@apx-ui/ds';

import * as Glyphs from './_glyphs';

const icons = createIconRegistry({
  mail: Glyphs.Mail,
  user: Glyphs.User,
  settings: Glyphs.Settings,
});

export default function BasicNameRegistry() {
  return (
    <IconProvider value={icons}>
      <Div display="flex" gap="3">
        <Icon name="mail" />
        <Icon name="user" />
        <Icon name="settings" />
      </Div>
    </IconProvider>
  );
}