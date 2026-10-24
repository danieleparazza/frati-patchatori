import { allVulns, day } from '../lib/calendar';

// Compact index for client-side search: n=name, c=CVEs, p=product, d=day, y=year, k=category, s=is patron.
export function GET() {
  const index = allVulns().map((v) => ({
    n: v.name,
    c: v.cves,
    p: [v.vendor, v.product].filter(Boolean).join(' '),
    d: v.day,
    y: v.date.slice(0, 4),
    k: v.category,
    s: day(v.day).patron?.id === v.id,
  }));
  return new Response(JSON.stringify(index), { headers: { 'Content-Type': 'application/json' } });
}
