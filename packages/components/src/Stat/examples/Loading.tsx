import { Stat } from '@apx-ui/ds';

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <Stat label="Revenue" loading />
      <Stat label="Active users" loading variant="elevated" />
      <Stat label="Conversion" loading size="lg" />
    </div>
  );
}
