// ─── RFM Engine — клієнтська сегментація для салонів краси ────────────────────

export type RFMSegment = 'vip' | 'loyal' | 'regular' | 'new' | 'sleeping' | 'lost';

export interface RFMScores {
  recency: number; // 1-5
  frequency: number; // 1-5
  monetary: number; // 1-5
  total: number; // R+F+M
}

export interface RFMResult {
  clientId: string;
  clientName: string;
  phone: string | null;
  scores: RFMScores;
  segment: RFMSegment;
  lastVisit: string | null;
  totalVisits: number;
  totalSpent: number;
  daysSinceLastVisit: number;
}

export interface RFMSegmentInfo {
  key: RFMSegment;
  label: string;
  description: string;
  color: string;
  badgeVariant: string;
  recommendations: string[];
}

// ─── Segment definitions ────────────────────────────────────────────────────

export const RFM_SEGMENTS: Record<RFMSegment, RFMSegmentInfo> = {
  vip: {
    key: 'vip',
    label: 'VIP',
    description: 'Найцінніші клієнти',
    color: '#8B5CF6',
    badgeVariant: 'vip',
    recommendations: [
      'Персональні бонуси та привілеї',
      'Пріоритетний запис на зручний час',
      'Ексклюзивні пропозиції нових послуг',
      'Подарунок на день народження',
    ],
  },
  loyal: {
    key: 'loyal',
    label: 'Лояльні',
    description: 'Лояльні, регулярні',
    color: '#10B981',
    badgeVariant: 'loyal',
    recommendations: [
      'Програма лояльності з накопиченням',
      'Знижка на нові послуги',
      'Пріоритетний запис',
      'Реферальна програма — бонус за друга',
    ],
  },
  regular: {
    key: 'regular',
    label: 'Регулярні',
    description: 'Стабільні клієнти',
    color: '#3B82F6',
    badgeVariant: 'regular',
    recommendations: [
      'Пропонувати додаткові послуги (cross-sell)',
      'Нагадування про запис',
      'Знижка на комплекс послуг',
    ],
  },
  new: {
    key: 'new',
    label: 'Нові',
    description: 'Нові клієнти',
    color: '#06B6D4',
    badgeVariant: 'new',
    recommendations: [
      'Привітальне повідомлення',
      'Знижка на другий візит',
      'Попросити залишити відгук',
      'Запропонувати підписку на нагадування',
    ],
  },
  sleeping: {
    key: 'sleeping',
    label: 'Сплячі',
    description: 'Були активні, давно не приходили',
    color: '#F59E0B',
    badgeVariant: 'sleeping',
    recommendations: [
      'Відправити нагадування про візит',
      'Запропонувати знижку на повернення',
      'Персональна пропозиція улюбленої послуги',
      'SMS / Telegram повідомлення',
    ],
  },
  lost: {
    key: 'lost',
    label: 'Втрачені',
    description: 'Втрачені клієнти',
    color: '#F43F5E',
    badgeVariant: 'lost',
    recommendations: [
      'Спеціальна пропозиція повернення (-20%)',
      'Персональний дзвінок від адміністратора',
      'Опитування — чому перестали відвідувати',
      'Подарунковий сертифікат',
    ],
  },
};

// ─── Quantile scoring ───────────────────────────────────────────────────────

function quantileScore(values: number[], value: number, ascending = true): number {
  if (values.length === 0) return 3;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = sorted.findIndex((v) => v >= value);
  const position = idx === -1 ? sorted.length : idx;
  const percentile = position / sorted.length;

  // ascending: higher value → higher score (frequency, monetary)
  // descending: lower value → higher score (recency — fewer days = better)
  const p = ascending ? percentile : 1 - percentile;

  if (p >= 0.8) return 5;
  if (p >= 0.6) return 4;
  if (p >= 0.4) return 3;
  if (p >= 0.2) return 2;
  return 1;
}

// ─── Segment determination ──────────────────────────────────────────────────

function determineSegment(
  r: number,
  f: number,
  m: number,
  daysSinceLastVisit: number,
  totalVisits: number
): RFMSegment {
  // New: only 1 visit and first visit within 30 days
  if (totalVisits <= 1 && daysSinceLastVisit <= 30) return 'new';

  // VIP: high on all dimensions
  if (r >= 4 && f >= 4 && m >= 4) return 'vip';

  // Loyal: good recency and frequency
  if (r >= 3 && f >= 3) return 'loyal';

  // Lost: very low recency, had at least some visits
  if (r === 1 && f >= 1) return 'lost';

  // Sleeping: low recency but was active before
  if (r <= 2 && f >= 2) return 'sleeping';

  // Regular: decent recency
  if (r >= 3 && f >= 2) return 'regular';

  // Fallback based on recency
  if (r <= 2) return 'sleeping';

  return 'regular';
}

// ─── Main RFM calculation ───────────────────────────────────────────────────

interface ClientData {
  id: string;
  full_name: string;
  phone: string | null;
  last_visit: string | null;
  total_visits: number;
  total_spent: number;
}

export function calculateRFM(clients: ClientData[]): RFMResult[] {
  if (clients.length === 0) return [];

  const now = new Date();

  // Calculate recency (days since last visit) for each client
  const recencies = clients.map((c) => {
    if (!c.last_visit) return 365; // No visit → treat as 365 days
    const days = Math.floor((now.getTime() - new Date(c.last_visit).getTime()) / 86400000);
    return Math.max(0, days);
  });

  const frequencies = clients.map((c) => c.total_visits ?? 0);
  const monetaries = clients.map((c) => Number(c.total_spent) || 0);

  return clients.map((client, i) => {
    const daysSince = recencies[i] ?? 365;
    const freq = frequencies[i] ?? 0;
    const money = monetaries[i] ?? 0;

    // Score: recency is inverse (fewer days = better score)
    const rScore = quantileScore(recencies, daysSince, false);
    const fScore = quantileScore(frequencies, freq, true);
    const mScore = quantileScore(monetaries, money, true);

    const segment = determineSegment(rScore, fScore, mScore, daysSince, freq);

    return {
      clientId: client.id,
      clientName: client.full_name,
      phone: client.phone,
      scores: {
        recency: rScore,
        frequency: fScore,
        monetary: mScore,
        total: rScore + fScore + mScore,
      },
      segment,
      lastVisit: client.last_visit,
      totalVisits: freq,
      totalSpent: money,
      daysSinceLastVisit: daysSince,
    };
  });
}

// ─── Get recommendations for a segment ──────────────────────────────────────

export function getSegmentRecommendations(segment: RFMSegment): string[] {
  return RFM_SEGMENTS[segment]?.recommendations ?? [];
}

// ─── Segment summary from results ───────────────────────────────────────────

export interface SegmentSummary {
  segment: RFMSegment;
  info: RFMSegmentInfo;
  count: number;
  percentage: number;
  avgSpent: number;
  clients: RFMResult[];
}

export function getSegmentSummaries(results: RFMResult[]): SegmentSummary[] {
  const total = results.length || 1;
  const groups: Record<RFMSegment, RFMResult[]> = {
    vip: [],
    loyal: [],
    regular: [],
    new: [],
    sleeping: [],
    lost: [],
  };

  for (const r of results) {
    groups[r.segment].push(r);
  }

  const order: RFMSegment[] = ['vip', 'loyal', 'regular', 'new', 'sleeping', 'lost'];

  return order.map((seg) => {
    const clients = groups[seg];
    const avgSpent =
      clients.length > 0 ? clients.reduce((s, c) => s + c.totalSpent, 0) / clients.length : 0;

    return {
      segment: seg,
      info: RFM_SEGMENTS[seg],
      count: clients.length,
      percentage: Math.round((clients.length / total) * 100),
      avgSpent: Math.round(avgSpent),
      clients,
    };
  });
}
