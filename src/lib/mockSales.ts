// MOCK sales data for the admin dashboard (per project brief: sales are mocked,
// everything else is real). Deterministic: the same date always gives the same numbers.

export type DailySale = { date: string; orders: number; revenue: number };
export type Bucket = { label: string; revenue: number; orders: number };

const DAY = 86_400_000;
const CATEGORY_SHARE = [
  { name: "Road", share: 0.42 },
  { name: "Mountain", share: 0.27 },
  { name: "Gravel", share: 0.19 },
  { name: "Time Trial", share: 0.12 },
];

// Tiny seeded random generator so numbers stay stable between refreshes.
function seeded(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

// "Today" in Bangkok time, as a UTC-midnight timestamp.
function bangkokToday() {
  const now = new Date(Date.now() + 7 * 3_600_000);
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

function salesForDay(ts: number): DailySale {
  const d = new Date(ts);
  const dayIndex = Math.floor(ts / DAY);
  const weekend = d.getUTCDay() === 0 || d.getUTCDay() === 6 ? 1.45 : 1;
  const season = 1 + 0.3 * Math.sin(((d.getUTCMonth() - 2) / 12) * 2 * Math.PI); // peaks around Q2
  const growth = 1 + (dayIndex - 19_000) / 4_000; // slow upward trend
  const orders = Math.max(0, Math.round((2 + seeded(dayIndex) * 5) * weekend * season * growth));
  const avgPrice = 2600 + seeded(dayIndex + 0.5) * 2400;
  return { date: d.toISOString().slice(0, 10), orders, revenue: Math.round(orders * avgPrice) };
}

export function getDailySales(days: number) {
  const today = bangkokToday();
  return Array.from({ length: days }, (_, i) => salesForDay(today - (days - 1 - i) * DAY));
}

function sum(rows: DailySale[]) {
  return rows.reduce((a, r) => ({ revenue: a.revenue + r.revenue, orders: a.orders + r.orders }), { revenue: 0, orders: 0 });
}

const TH_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

export function getDashboardData() {
  const daily = getDailySales(366 * 3 + 7);
  const byDate = new Map(daily.map((d) => [d.date, d]));
  const today = new Date(bangkokToday());
  const iso = (ts: number) => new Date(ts).toISOString().slice(0, 10);
  const range = (startTs: number, endTs: number) => {
    const rows: DailySale[] = [];
    for (let t = startTs; t <= endTs; t += DAY) {
      const r = byDate.get(iso(t));
      if (r) rows.push(r);
    }
    return rows;
  };

  const t = today.getTime();
  const weekStart = t - ((today.getUTCDay() + 6) % 7) * DAY; // Monday
  const monthStart = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1);
  const yearStart = Date.UTC(today.getUTCFullYear(), 0, 1);
  const elapsed = (start: number) => t - start; // compare same-length period last time

  const prevMonthStart = Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1);
  const prevYearStart = Date.UTC(today.getUTCFullYear() - 1, 0, 1);

  const kpis = [
    { key: "day", label: "วันนี้", current: sum(range(t, t)), previous: sum(range(t - DAY, t - DAY)), compare: "เทียบกับเมื่อวาน" },
    { key: "week", label: "สัปดาห์นี้", current: sum(range(weekStart, t)), previous: sum(range(weekStart - 7 * DAY, t - 7 * DAY)), compare: "เทียบช่วงเดียวกันสัปดาห์ก่อน" },
    { key: "month", label: "เดือนนี้", current: sum(range(monthStart, t)), previous: sum(range(prevMonthStart, prevMonthStart + elapsed(monthStart))), compare: "เทียบช่วงเดียวกันเดือนก่อน" },
    { key: "year", label: "ปีนี้", current: sum(range(yearStart, t)), previous: sum(range(prevYearStart, prevYearStart + elapsed(yearStart))), compare: "เทียบช่วงเดียวกันปีก่อน" },
  ];

  // Chart series for each period tab
  const dailySeries: Bucket[] = range(t - 29 * DAY, t).map((r) => ({
    label: `${Number(r.date.slice(8))} ${TH_MONTHS[Number(r.date.slice(5, 7)) - 1]}`,
    ...sum([r]),
  }));

  const weeklySeries: Bucket[] = Array.from({ length: 12 }, (_, i) => {
    const start = weekStart - (11 - i) * 7 * DAY;
    const d = new Date(start);
    return { label: `${d.getUTCDate()} ${TH_MONTHS[d.getUTCMonth()]}`, ...sum(range(start, Math.min(start + 6 * DAY, t))) };
  });

  const monthlySeries: Bucket[] = Array.from({ length: 12 }, (_, i) => {
    const start = Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - (11 - i), 1);
    const end = Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - (11 - i) + 1, 0);
    const d = new Date(start);
    return { label: `${TH_MONTHS[d.getUTCMonth()]} ${String(d.getUTCFullYear() + 543).slice(2)}`, ...sum(range(start, Math.min(end, t))) };
  });

  const yearlySeries: Bucket[] = Array.from({ length: 3 }, (_, i) => {
    const y = today.getUTCFullYear() - (2 - i);
    return { label: `${y + 543}`, ...sum(range(Date.UTC(y, 0, 1), Math.min(Date.UTC(y, 11, 31), t))) };
  });

  const monthRevenue = kpis[2].current.revenue;
  const byCategory = CATEGORY_SHARE.map((c) => ({ name: c.name, revenue: Math.round(monthRevenue * c.share) }));

  return {
    kpis,
    series: { day: dailySeries, week: weeklySeries, month: monthlySeries, year: yearlySeries },
    byCategory,
  };
}
