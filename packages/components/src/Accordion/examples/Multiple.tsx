import { Accordion } from '@apx-ui/ds';

export default function Multiple() {
  return (
    <Accordion type="multiple" defaultValue={['shipping', 'returns']}>
      <Accordion.Item value="shipping">
        <Accordion.Trigger>Shipping</Accordion.Trigger>
        <Accordion.Content>
          Free 2-day shipping on every order over $50. International rates vary by country.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="returns">
        <Accordion.Trigger>Returns</Accordion.Trigger>
        <Accordion.Content>
          Send anything back within 30 days for a full refund — no questions asked.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="warranty">
        <Accordion.Trigger>Warranty</Accordion.Trigger>
        <Accordion.Content>
          Every product is covered by a 2-year manufacturer warranty against defects.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}