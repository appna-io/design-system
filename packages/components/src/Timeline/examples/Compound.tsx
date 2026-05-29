import { Timeline } from 'apx-ds';
import { GitBranch, GitMerge, GitPullRequest } from 'lucide-react';

export default function Compound() {
  return (
    <Timeline aria-label="Repository activity">
      <Timeline.Item tone="info" icon={<GitBranch />}>
        <Timeline.Title>Branch <code>feat/onboarding</code> created</Timeline.Title>
        <Timeline.Description>From <code>main</code> @ a3f9b2c.</Timeline.Description>
        <Timeline.Timestamp value={new Date(Date.now() - 4 * 3_600_000)} />
      </Timeline.Item>

      <Timeline.Item tone="info" icon={<GitPullRequest />}>
        <Timeline.Title>PR #214 opened</Timeline.Title>
        <Timeline.Description>&ldquo;Add Timeline component&rdquo; \u2014 5 files changed, +312 \u22125.</Timeline.Description>
        <Timeline.Timestamp value={new Date(Date.now() - 2 * 3_600_000)} />
      </Timeline.Item>

      <Timeline.Item tone="success" icon={<GitMerge />} active>
        <Timeline.Title>Merged into main</Timeline.Title>
        <Timeline.Description>Squash merge by reviewer.</Timeline.Description>
        <Timeline.Timestamp value={new Date(Date.now() - 15 * 60_000)} />
      </Timeline.Item>
    </Timeline>
  );
}
