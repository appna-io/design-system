import { Stat } from '@apx-ui/ds';

export default function Currency() {
  return (
    <div className="flex flex-col gap-6">
      <Stat label="MRR (USD)" value={84512} format="currency" currency="USD" />
      <Stat label="ARR (EUR)" value={1014144} format="currency" currency="EUR" locale="de-DE" />
      <Stat label="Pending payouts (JPY)" value={4280000} format="currency" currency="JPY" fractionDigits={0} />
    </div>
  );
}
