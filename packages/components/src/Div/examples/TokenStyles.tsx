import { Div } from 'apx-ds';

export default function TokenStyles() {
  return (
    <Div display="flex" gap={12} flexWrap="wrap">
      <Div p={4} bg="primary.main" fg="primary.contrast" radius="lg" shadow="md" minWidth={140}>
        primary.main
      </Div>
      <Div p={4} bg="secondary.main" fg="secondary.contrast" radius="lg" shadow="md" minWidth={140}>
        secondary.main
      </Div>
      <Div p={4} bg="success.main" fg="success.contrast" radius="lg" shadow="md" minWidth={140}>
        success.main
      </Div>
      <Div p={4} bg="warning.main" fg="warning.contrast" radius="lg" shadow="md" minWidth={140}>
        warning.main
      </Div>
      <Div p={4} bg="danger.main" fg="danger.contrast" radius="lg" shadow="md" minWidth={140}>
        danger.main
      </Div>
    </Div>
  );
}
