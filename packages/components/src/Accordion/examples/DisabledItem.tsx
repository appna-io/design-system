import { Accordion } from 'apx-ds';

export default function DisabledItem() {
  return (
    <Accordion type="single" defaultValue="available">
      <Accordion.Item value="available">
        <Accordion.Trigger>Available — clickable</Accordion.Trigger>
        <Accordion.Content>This section opens and closes normally.</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="locked" disabled>
        <Accordion.Trigger>Locked — disabled</Accordion.Trigger>
        <Accordion.Content>
          A disabled item is dimmed, cannot be clicked, and is skipped by Arrow-key navigation.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="other">
        <Accordion.Trigger>Other — clickable</Accordion.Trigger>
        <Accordion.Content>Try ArrowDown from the first trigger — focus jumps right past the locked item.</Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}
