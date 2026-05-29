import { Stat } from 'apx-ds';

export default function ErrorState() {
  return (
    <div className="flex flex-col gap-6">
      <Stat label="Revenue" error="Failed to load" />
      <Stat label="Active users" error="API request timed out" variant="elevated" />
    </div>
  );
}
