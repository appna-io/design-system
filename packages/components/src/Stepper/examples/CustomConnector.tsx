import { Stepper } from '@apx-ui/ds';

export default function CustomConnector() {
  return (
    <Stepper
      active={1}
      steps={[
        { id: 'a', label: 'Start' },
        { id: 'b', label: 'Middle' },
        { id: 'c', label: 'End' },
      ]}
      connector={
        <span
          aria-hidden="true"
          className="flex-1 self-start mt-[15px] border-t-2 border-dashed border-fg-muted mx-1 block"
        />
      }
    />
  );
}
