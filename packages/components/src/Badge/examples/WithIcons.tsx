import { Star, Sparkles, Zap } from 'lucide-react';
import { Badge, Div } from '@apx-ui/ds';

export default function WithIcons() {
  return (
    <Div display="flex" flexWrap="wrap" alignItems="center" gap="3">
      <Badge variant="soft" color="warning" leftIcon={<Star />}>
        Featured
      </Badge>
      <Badge variant="outline" color="info" leftIcon={<Sparkles />}>
        New
      </Badge>
      <Badge variant="solid" color="primary" rightIcon={<Zap />}>
        Power
      </Badge>
    </Div>
  );
}