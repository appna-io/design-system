import { Breadcrumbs } from 'apx-ds';

export default function Compound() {
  return (
    <Breadcrumbs separator="·">
      <Breadcrumbs.Item asChild>
        <a href="#home">Home</a>
      </Breadcrumbs.Item>
      <Breadcrumbs.Item asChild>
        <a href="#users">Users</a>
      </Breadcrumbs.Item>
      <Breadcrumbs.Item asChild>
        <a href="#users-123">John Smith</a>
      </Breadcrumbs.Item>
      <Breadcrumbs.Item current>Profile</Breadcrumbs.Item>
    </Breadcrumbs>
  );
}
