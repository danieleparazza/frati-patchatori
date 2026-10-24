import { allVulns, day } from '../lib/calendar';

// Compact index for client-side search and rankings: i=id, n=name, c=CVEs, p=product, d=day, y=year, k=category,
// s=is patron, f=fame, v=CVSS, x=in KEV, r=used by ransomware, l=years alive before disclosure, a=absurd.
export function GET() {
  const index = allVulns().map((v) => ({
    i: v.id,
    n: v.name,
    c: v.cves,
    p: [v.vendor, v.product].filter(Boolean).join(' '),
    d: v.day,
    y: v.date.slice(0, 4),
    k: v.category,
    s: day(v.day).patron?.id === v.id,
    f: v.fame,
    v: v.cvss,
    x: v.kev,
    r: v.ransomware,
    l: v.born ? Number(v.date.slice(0, 4)) - v.born : null,
    a: v.absurd,
  }));
  return new Response(JSON.stringify(index), { headers: { 'Content-Type': 'application/json' } });
}
