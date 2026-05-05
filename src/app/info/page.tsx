export default function InfoPage() {
  return (
    <div className="prose prose-stone max-w-none">
      <h1 className="text-2xl font-bold text-stone-900">Hours &amp; house rules</h1>
      <p className="text-stone-600">
        Update this page with your friend&apos;s real address, fees, and policies. The booking grid
        uses <strong>8:00 a.m.–9:00 p.m.</strong> local time and <strong>60-minute</strong> sessions
        (see <code className="rounded bg-stone-100 px-1 text-sm">src/lib/slots.ts</code>).
      </p>
      <h2 className="mt-8 text-lg font-semibold">Suggested rules</h2>
      <ul className="list-disc space-y-2 pl-5 text-stone-700">
        <li>Non-marking athletic shoes only; clean balls.</li>
        <li>Respect neighbors: quiet hours after 8 p.m. if applicable.</li>
        <li>Cancel at least 24 hours ahead when possible so others can use the slot.</li>
        <li>Play at your own risk; not responsible for injury or lost property.</li>
      </ul>
      <h2 className="mt-8 text-lg font-semibold">Blackouts</h2>
      <p className="text-stone-600">
        Maintenance and private events go in the <code className="rounded bg-stone-100 px-1 text-sm">blackouts</code>{" "}
        table in Supabase. Overlapping times show as unavailable in the booking grid.
      </p>
    </div>
  );
}
