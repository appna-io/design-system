import { Tabs } from 'apx-ds';

export default function FullWidth() {
  return (
    <div className="w-full max-w-xl rounded-md border border-border p-4">
      <Tabs
        variant="solid"
        alignment="stretch"
        fullWidth
        defaultValue="day"
        aria-label="Time range"
      >
        <Tabs.List>
          <Tabs.Trigger value="day">Day</Tabs.Trigger>
          <Tabs.Trigger value="week">Week</Tabs.Trigger>
          <Tabs.Trigger value="month">Month</Tabs.Trigger>
          <Tabs.Trigger value="year">Year</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="day">Day view metrics.</Tabs.Panel>
        <Tabs.Panel value="week">Week view metrics.</Tabs.Panel>
        <Tabs.Panel value="month">Month view metrics.</Tabs.Panel>
        <Tabs.Panel value="year">Year view metrics.</Tabs.Panel>
      </Tabs>
    </div>
  );
}
