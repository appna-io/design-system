import { Badge, Div } from '@apx-ui/ds';

export default function AsChild() {
  return (
    <Div display="flex" flexWrap="wrap" alignItems="center" gap="3">
      <Badge asChild variant="solid" color="info">
        <a href="#inbox" className="no-underline">
          3
        </a>
      </Badge>
      <Badge asChild variant="outline" color="primary">
        <a href="#docs" className="no-underline">
          Docs →
        </a>
      </Badge>
    </Div>
  );
}
