import { Star, Sparkles, Zap } from 'lucide-react';
import { Badge } from '@apx-ui/ds';

export default function WithIcons() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Badge variant="soft" color="warning" leftIcon={<Star />}>
        Featured
      </Badge>
      <Badge variant="outline" color="info" leftIcon={<Sparkles />}>
        New
      </Badge>
      <Badge variant="solid" color="primary" rightIcon={<Zap />}>
        Power
      </Badge>
    </div>
  );
}
