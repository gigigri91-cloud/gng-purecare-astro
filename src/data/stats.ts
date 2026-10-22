export interface TrustStat {
  count: number;
  suffix: string;
  label: string;
}

/** KPI-uri bandă „GNG PureCare în cifre” — homepage + /despre */
export const TRUST_STATS: TrustStat[] = [
  { count: 100, suffix: '+', label: 'spații curățate' },
  { count: 99, suffix: '%', label: 'clienți mulțumiți' },
  { count: 4, suffix: '', label: 'ani de experiență' },
  { count: 24, suffix: 'h', label: 'răspuns la ofertă' },
];
