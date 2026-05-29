import { Accordion } from 'apx-ds';

export default function IconPositionStart() {
  return (
    <Accordion type="single" iconPosition="start" defaultValue="one">
      <Accordion.Item value="one">
        <Accordion.Trigger>Chevron on the logical start</Accordion.Trigger>
        <Accordion.Content>
          Useful for tree-view / navigation patterns where the caret leads the row.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="two">
        <Accordion.Trigger>Same on this row</Accordion.Trigger>
        <Accordion.Content>RTL languages flip this automatically via logical properties.</Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}
