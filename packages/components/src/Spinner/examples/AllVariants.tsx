import { Spinner } from 'apx-ds';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

export default function AllVariants() {
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {(['ring', 'dots', 'pulse'] as const).map((variant) => (
        <div key={variant} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <strong style={{ fontSize: 13, opacity: 0.7 }}>{variant}</strong>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {SIZES.map((size) => (
              <Spinner key={size} variant={variant} size={size} color="primary" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
