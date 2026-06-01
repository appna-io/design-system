import { Div, Icon, Typography } from '@apx-ui/ds';

import { Mail, Search, Settings, Star, User } from './_glyphs';

const SHOWCASE = [
  { glyph: Mail, size: 'xs' as const, caption: 'xs' },
  { glyph: Search, size: 'sm' as const, caption: 'sm / muted', color: 'muted' as const },
  { glyph: User, size: 'md' as const, caption: 'md' },
  { glyph: Settings, size: 'lg' as const, caption: 'lg / accent', color: 'accent' as const },
  { glyph: Star, size: 'xl' as const, caption: 'xl / warning', color: 'warning' as const },
];

export default function Overview() {
  return (
    <Div display="flex" alignItems="center" gap="6" className="flex-wrap">
      {SHOWCASE.map(({ glyph, size, caption, color }) => (
        <Div
          key={caption}
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap="2"
          className="w-20"
        >
          <Icon as={glyph} size={size} color={color} />
          <Typography variant="caption" color="fg.muted" align="center" sx={{ whiteSpace: 'nowrap' }}>
            {caption}
          </Typography>
        </Div>
      ))}
    </Div>
  );
}