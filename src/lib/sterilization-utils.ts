// ─── Sterilization Utilities ─────────────────────────────────────────────────

/** Format cycle duration from start/end timestamps */
export function formatCycleDuration(startedAt: string | null, completedAt: string | null): string {
  if (!startedAt || !completedAt) return '—';
  const start = new Date(startedAt).getTime();
  const end = new Date(completedAt).getTime();
  const diffMin = Math.round((end - start) / 60000);
  if (diffMin < 60) return `${diffMin} хв`;
  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;
  return m > 0 ? `${h} год ${m} хв` : `${h} год`;
}

/** Get storage expiry based on packaging type */
export function getStorageExpiry(sterilizedAt: string, packagingType: string): Date {
  const base = new Date(sterilizedAt);
  switch (packagingType) {
    case 'kraft':
      base.setDate(base.getDate() + 20); // Крафт-пакет — 20 днів
      break;
    case 'pouch':
      base.setDate(base.getDate() + 30); // Плівковий пакет — 30 днів
      break;
    case 'container':
      base.setDate(base.getDate() + 3); // Контейнер без пакування — 3 дні
      break;
    case 'wrap':
      base.setDate(base.getDate() + 3); // Крепований папір — 3 дні
      break;
    default:
      base.setDate(base.getDate() + 1); // Без пакування — 1 день
  }
  return base;
}

/** Check if all required cycle stages passed */
export function isCycleValid(cycle: {
  disinfection_completed_at?: string | null;
  pso_completed_at?: string | null;
  sterilization_completed_at?: string | null;
  azopyramine_result?: string | null;
  chemical_indicator?: string | null;
}): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  if (!cycle.disinfection_completed_at) issues.push('Дезінфекція не завершена');
  if (!cycle.pso_completed_at) issues.push('ПСО не завершена');
  if (!cycle.sterilization_completed_at) issues.push('Стерилізація не завершена');
  if (cycle.azopyramine_result === 'positive')
    issues.push('Азопірамова проба позитивна (повтор ПСО)');
  if (cycle.chemical_indicator === 'failed') issues.push('Хімічний індикатор не пройшов');

  return { valid: issues.length === 0, issues };
}

/** Format countdown to expiry */
export function formatExpiryCountdown(expiresAt: string): {
  text: string;
  urgent: boolean;
  expired: boolean;
} {
  const now = new Date().getTime();
  const exp = new Date(expiresAt).getTime();
  const diffMs = exp - now;

  if (diffMs <= 0) return { text: 'Прострочений', urgent: true, expired: true };

  const days = Math.floor(diffMs / 86400000);
  const hours = Math.floor((diffMs % 86400000) / 3600000);

  if (days > 3) return { text: `${days} днів`, urgent: false, expired: false };
  if (days > 0) return { text: `${days} дн ${hours} год`, urgent: true, expired: false };
  return { text: `${hours} год`, urgent: true, expired: false };
}

/** Format timer display MM:SS */
export function formatTimerDisplay(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
