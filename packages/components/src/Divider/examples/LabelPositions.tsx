import { Divider, Div } from '@apx-ui/ds';

export default function LabelPositions() {
  return (
    <Div className="space-y-6">
      <Divider labelPosition="start">Start-aligned</Divider>
      <Divider labelPosition="center">Center-aligned (default)</Divider>
      <Divider labelPosition="end">End-aligned</Divider>
    </Div>
  );
}