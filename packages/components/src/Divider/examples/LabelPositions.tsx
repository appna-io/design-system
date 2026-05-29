import { Divider } from 'apx-ds';

export default function LabelPositions() {
  return (
    <div className="space-y-6">
      <Divider labelPosition="start">Start-aligned</Divider>
      <Divider labelPosition="center">Center-aligned (default)</Divider>
      <Divider labelPosition="end">End-aligned</Divider>
    </div>
  );
}
