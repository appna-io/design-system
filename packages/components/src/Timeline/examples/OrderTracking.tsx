import { Timeline } from 'apx-ds';
import { Check, Home, Package, Truck } from 'lucide-react';

const now = Date.now();
const hour = 3_600_000;

export default function OrderTracking() {
  return (
    <Timeline aria-label="Order tracking">
      <Timeline.Item tone="success" icon={<Check />} timestamp={new Date(now - 48 * hour)}>
        <Timeline.Title>Order placed</Timeline.Title>
        <Timeline.Description>Confirmation sent to ahmad@example.com.</Timeline.Description>
      </Timeline.Item>

      <Timeline.Item tone="success" icon={<Package />} timestamp={new Date(now - 24 * hour)}>
        <Timeline.Title>Picked &amp; packed</Timeline.Title>
        <Timeline.Description>Warehouse: Berlin DC-2.</Timeline.Description>
      </Timeline.Item>

      <Timeline.Item tone="info" icon={<Truck />} timestamp={new Date(now - 2 * hour)} active>
        <Timeline.Title>In transit</Timeline.Title>
        <Timeline.Description>ETA tomorrow at 14:00.</Timeline.Description>
      </Timeline.Item>

      <Timeline.Item tone="neutral" icon={<Home />} timestamp={null}>
        <Timeline.Title>Out for delivery</Timeline.Title>
        <Timeline.Description>You&apos;ll get a notification 30 minutes before arrival.</Timeline.Description>
      </Timeline.Item>
    </Timeline>
  );
}
