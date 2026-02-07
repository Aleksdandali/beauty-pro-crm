// ─── AI Client Import — Utilities ─────────────────────────────────────────────

export interface ParsedClient {
  name: string;
  phone: string;
  email?: string;
  instagram?: string;
  last_service?: string;
  last_visit?: string;
  notes?: string;
}

export interface MatchedClientInfo {
  id: string;
  name: string;
  phone: string;
}

export interface ImportClientRow extends ParsedClient {
  /** Status: new, duplicate (>=80), possible_duplicate (40-79), error */
  status: 'new' | 'duplicate' | 'possible_duplicate' | 'error';
  /** Human-readable reason for duplicate / error */
  statusNote?: string;
  /** Duplicate reason string for UI */
  duplicate_reason?: string;
  /** Matched existing client info */
  matched_client?: MatchedClientInfo;
  /** Confidence score 0-100 */
  match_score: number;
  /** Whether user selected this row for import */
  selected: boolean;
  /** Parsed first name */
  first_name: string;
  /** Parsed last name */
  last_name: string;
}

// ─── Phone Normalisation ──────────────────────────────────────────────────────

/**
 * Normalise a Ukrainian phone number to +380XXXXXXXXX format.
 * Handles: 0XX..., 380XX..., +380XX..., 80XX..., with or without dashes/spaces/parens.
 */
export function normalizePhone(raw: string): string {
  // strip everything except digits and leading +
  let d = raw.replace(/[^\d+]/g, '');

  // if starts with +, strip it and remember
  const hasPlus = d.startsWith('+');
  if (hasPlus) d = d.slice(1);

  // Now d is all digits
  if (d.startsWith('380') && d.length === 12) return `+${d}`;
  if (d.startsWith('80') && d.length === 11) return `+3${d}`;
  if (d.startsWith('0') && d.length === 10) return `+38${d}`;
  // 9-digit without leading 0 (rare)
  if (d.length === 9 && /^[3-9]/.test(d)) return `+380${d}`;

  // already looks correct with +
  if (hasPlus && d.length >= 10) return `+${d}`;

  return raw.trim(); // return as-is if can't normalise
}

/**
 * Validate that phone is a valid Ukrainian mobile number.
 */
export function isValidUAPhone(phone: string): boolean {
  return /^\+380\d{9}$/.test(phone);
}

// ─── Name Parsing ─────────────────────────────────────────────────────────────

/**
 * Split "Олена Коваленко" into { first_name, last_name }.
 */
export function splitName(full: string): { first_name: string; last_name: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 0) return { first_name: '', last_name: '' };
  if (parts.length === 1) return { first_name: parts[0]!, last_name: '' };
  return { first_name: parts[0]!, last_name: parts.slice(1).join(' ') };
}

// ─── Text Parsing ─────────────────────────────────────────────────────────────

/**
 * Parse free-text input into client records.
 * Each line is one client. Tries to extract name + phone.
 * Format: "Олена Коваленко +380501234567" or "Олена 0501234567"
 */
export function parseTextInput(text: string): ParsedClient[] {
  const lines = text
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const clients: ParsedClient[] = [];

  for (const line of lines) {
    // Try to find phone number in the line
    const phoneMatch = line.match(/(\+?3?8?0?\d[\d\s\-()]{7,14}\d)/);

    let phone = '';
    let name = line;

    if (phoneMatch) {
      phone = normalizePhone(phoneMatch[1]!);
      // Remove phone from string to get name
      name = line.replace(phoneMatch[0], '').trim();
      // Clean up separators
      name = name.replace(/^[\s,;:\-–—|/]+|[\s,;:\-–—|/]+$/g, '').trim();
    }

    // Try to find instagram
    const igMatch = name.match(/@[\w.]+/);
    let instagram: string | undefined;
    if (igMatch) {
      instagram = igMatch[0];
      name = name.replace(igMatch[0], '').trim();
    }

    // Try to find email
    const emailMatch = name.match(/[\w.+-]+@[\w.-]+\.\w+/);
    let email: string | undefined;
    if (emailMatch) {
      email = emailMatch[0];
      name = name.replace(emailMatch[0], '').trim();
    }

    // Clean name
    name = name.replace(/^[\s,;:\-–—|/]+|[\s,;:\-–—|/]+$/g, '').trim();

    if (name || phone) {
      clients.push({
        name: name || 'Без імені',
        phone,
        email,
        instagram,
      });
    }
  }

  return clients;
}

// ─── Duplicate Detection — Smart Multi-Criteria ──────────────────────────────

export interface ExistingClient {
  id: string;
  phone: string;
  first_name: string;
  last_name: string | null;
  instagram?: string | null;
}

/**
 * Levenshtein distance between two strings.
 */
export function levenshteinDistance(a: string, b: string): number {
  const la = a.length;
  const lb = b.length;
  if (la === 0) return lb;
  if (lb === 0) return la;

  const matrix: number[][] = [];
  for (let i = 0; i <= la; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= lb; j++) {
    matrix[0]![j] = j;
  }

  for (let i = 1; i <= la; i++) {
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i]![j] = Math.min(
        matrix[i - 1]![j]! + 1, // deletion
        matrix[i]![j - 1]! + 1, // insertion
        matrix[i - 1]![j - 1]! + cost // substitution
      );
    }
  }

  return matrix[la]![lb]!;
}

/**
 * Normalize name for fuzzy comparison — lowercase, remove soft/hard signs, unify i/и.
 */
export function normalizeNameForCompare(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/ь/g, '')
    .replace(/ъ/g, '')
    .replace(/ё/g, 'е')
    .replace(/і/g, 'и')
    .replace(/ї/g, 'и')
    .replace(/є/g, 'е')
    .replace(/'/g, '')
    .replace(/ʼ/g, '');
}

interface DuplicateMatch {
  score: number;
  reason: string;
  matched: ExistingClient;
}

/**
 * Find the best duplicate match for a single imported client against all existing.
 */
function findBestMatch(
  firstName: string,
  lastName: string,
  phone: string,
  instagram: string | undefined,
  existing: ExistingClient[]
): DuplicateMatch | null {
  const normPhone = phone ? normalizePhone(phone) : '';
  const normFirst = normalizeNameForCompare(firstName);
  const normLast = normalizeNameForCompare(lastName);

  let bestMatch: DuplicateMatch | null = null;

  for (const ex of existing) {
    const exPhone = ex.phone ? normalizePhone(ex.phone) : '';
    const exFirst = normalizeNameForCompare(ex.first_name || '');
    const exLast = normalizeNameForCompare(ex.last_name || '');
    const exFullName = `${ex.first_name} ${ex.last_name ?? ''}`.trim();

    // LEVEL 1: Exact phone match (score 100)
    if (normPhone && exPhone && normPhone === exPhone) {
      const score = 100;
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = {
          score,
          reason: `Телефон збігається з: ${exFullName}`,
          matched: ex,
        };
      }
      continue; // Can't do better than 100
    }

    // LEVEL 2: Exact first_name + last_name match (score 80)
    if (
      normFirst &&
      normLast &&
      exFirst &&
      exLast &&
      normFirst === exFirst &&
      normLast === exLast
    ) {
      const score = 80;
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = {
          score,
          reason: `Ім'я та прізвище збігаються${exPhone ? ` (телефон: ${exPhone})` : ''}`,
          matched: ex,
        };
      }
      continue;
    }

    // LEVEL 3: last_name exact + first_name Levenshtein <= 2 (score 60)
    if (normLast && exLast && normLast === exLast && normFirst && exFirst) {
      const dist = levenshteinDistance(normFirst, exFirst);
      if (dist > 0 && dist <= 2) {
        const score = 60;
        if (!bestMatch || score > bestMatch.score) {
          bestMatch = {
            score,
            reason: `Схоже ім'я: ${ex.first_name} ${ex.last_name ?? ''} ≈ ${firstName} ${lastName}`,
            matched: ex,
          };
        }
        continue;
      }
    }

    // LEVEL 4: last_name exact + first 4 digits of phone match (score 40)
    if (normLast && exLast && normLast === exLast && normPhone && exPhone) {
      const phoneDigits = normPhone.replace(/\D/g, '').slice(-9);
      const exPhoneDigits = exPhone.replace(/\D/g, '').slice(-9);
      if (
        phoneDigits.length >= 4 &&
        exPhoneDigits.length >= 4 &&
        phoneDigits.slice(0, 4) === exPhoneDigits.slice(0, 4)
      ) {
        const score = 40;
        if (!bestMatch || score > bestMatch.score) {
          bestMatch = {
            score,
            reason: `Те саме прізвище + схожий номер: ${exFullName}`,
            matched: ex,
          };
        }
        continue;
      }
    }

    // LEVEL 5: last_name match + instagram match (score 30)
    if (normLast && exLast && normLast === exLast) {
      const igMatch =
        instagram &&
        ex.instagram &&
        instagram.toLowerCase().replace('@', '') === ex.instagram.toLowerCase().replace('@', '');
      if (igMatch) {
        const score = 30;
        if (!bestMatch || score > bestMatch.score) {
          bestMatch = {
            score,
            reason: `Те саме прізвище + Instagram: ${exFullName}`,
            matched: ex,
          };
        }
      }
    }
  }

  return bestMatch;
}

/**
 * Smart duplicate detection: checks each parsed client against existing DB clients
 * AND against other clients within the same import batch.
 */
export function markDuplicates(
  parsed: ParsedClient[],
  existing: ExistingClient[]
): ImportClientRow[] {
  // Track phones & names within this import for intra-import dedup
  const seenPhones = new Map<string, number>(); // normalized phone → index
  const seenNames = new Map<string, number>(); // "first last" normalized → index

  const results: ImportClientRow[] = [];

  for (let i = 0; i < parsed.length; i++) {
    const p = parsed[i]!;
    const { first_name, last_name } = splitName(p.name);
    const normPhone = p.phone ? normalizePhone(p.phone) : '';
    const hasError = !first_name && !normPhone;

    if (hasError) {
      results.push({
        ...p,
        first_name,
        last_name,
        status: 'error',
        statusNote: 'Немає імені та телефону',
        match_score: 0,
        selected: false,
      });
      continue;
    }

    // Check intra-import duplicates first
    const normNameKey = normalizeNameForCompare(`${first_name} ${last_name}`);
    let intraReason: string | null = null;

    if (normPhone && seenPhones.has(normPhone)) {
      const origIdx = seenPhones.get(normPhone)!;
      const orig = results[origIdx];
      intraReason = `Дублікат в цьому імпорті (рядок ${origIdx + 1}: ${orig?.name || orig?.first_name})`;
    } else if (normNameKey && normNameKey.trim().length > 2 && seenNames.has(normNameKey)) {
      const origIdx = seenNames.get(normNameKey)!;
      const orig = results[origIdx];
      intraReason = `Дублікат в цьому імпорті (рядок ${origIdx + 1}: ${orig?.name || orig?.first_name})`;
    }

    if (intraReason) {
      results.push({
        ...p,
        phone: normPhone || p.phone,
        first_name,
        last_name,
        status: 'duplicate',
        statusNote: intraReason,
        duplicate_reason: intraReason,
        match_score: 90,
        selected: false,
      });
      continue;
    }

    // Check against existing DB clients
    const match = findBestMatch(first_name, last_name, normPhone, p.instagram, existing);

    // Track for intra-import dedup
    if (normPhone) seenPhones.set(normPhone, i);
    if (normNameKey && normNameKey.trim().length > 2) seenNames.set(normNameKey, i);

    if (match && match.score >= 80) {
      // Strong duplicate — checkbox OFF
      const matchedName = `${match.matched.first_name} ${match.matched.last_name ?? ''}`.trim();
      results.push({
        ...p,
        phone: normPhone || p.phone,
        first_name,
        last_name,
        status: 'duplicate',
        statusNote: matchedName,
        duplicate_reason: match.reason,
        matched_client: {
          id: match.matched.id,
          name: matchedName,
          phone: match.matched.phone ? normalizePhone(match.matched.phone) : '',
        },
        match_score: match.score,
        selected: false,
      });
    } else if (match && match.score >= 40) {
      // Possible duplicate — checkbox ON with warning
      const matchedName = `${match.matched.first_name} ${match.matched.last_name ?? ''}`.trim();
      results.push({
        ...p,
        phone: normPhone || p.phone,
        first_name,
        last_name,
        status: 'possible_duplicate',
        statusNote: matchedName,
        duplicate_reason: match.reason,
        matched_client: {
          id: match.matched.id,
          name: matchedName,
          phone: match.matched.phone ? normalizePhone(match.matched.phone) : '',
        },
        match_score: match.score,
        selected: true, // ON but with warning
      });
    } else {
      // New client
      results.push({
        ...p,
        phone: normPhone || p.phone,
        first_name,
        last_name,
        status: 'new',
        match_score: match?.score ?? 0,
        selected: true,
      });
    }
  }

  return results;
}

// ─── Column Matching for Excel ────────────────────────────────────────────────

const COL_PATTERNS: Record<string, RegExp> = {
  name: /ім['ʼ]?я|name|клієнт|прізвище|піб|фіо|пиб|client/i,
  phone: /телефон|phone|тел|моб|mobile|номер/i,
  email: /email|пошта|e-mail|mail/i,
  instagram: /instagram|інста|insta|ig/i,
  service: /послуга|service|сервіс/i,
  date: /дата|date|візит|visit|останн/i,
  notes: /нотатки|notes|коментар|примітк|comment/i,
};

/**
 * Try to match Excel headers to known columns.
 * Returns map: logical_name → column_index
 */
export function matchColumns(headers: string[]): Record<string, number> {
  const map: Record<string, number> = {};

  for (const [key, pattern] of Object.entries(COL_PATTERNS)) {
    for (let i = 0; i < headers.length; i++) {
      if (pattern.test(headers[i] ?? '')) {
        map[key] = i;
        break;
      }
    }
  }

  return map;
}

/**
 * Convert Excel rows (2D array) to ParsedClient[] using column mapping.
 */
export function rowsToClients(rows: string[][], colMap: Record<string, number>): ParsedClient[] {
  return rows
    .map((row) => {
      const nameVal = colMap.name !== undefined ? (row[colMap.name] ?? '').trim() : '';
      const phoneVal = colMap.phone !== undefined ? (row[colMap.phone] ?? '').trim() : '';

      if (!nameVal && !phoneVal) return null;

      return {
        name: nameVal || 'Без імені',
        phone: phoneVal ? normalizePhone(phoneVal) : '',
        email:
          colMap.email !== undefined ? (row[colMap.email] ?? '').trim() || undefined : undefined,
        instagram:
          colMap.instagram !== undefined
            ? (row[colMap.instagram] ?? '').trim() || undefined
            : undefined,
        last_service:
          colMap.service !== undefined
            ? (row[colMap.service] ?? '').trim() || undefined
            : undefined,
        last_visit:
          colMap.date !== undefined ? (row[colMap.date] ?? '').trim() || undefined : undefined,
        notes:
          colMap.notes !== undefined ? (row[colMap.notes] ?? '').trim() || undefined : undefined,
      } satisfies ParsedClient;
    })
    .filter(Boolean) as ParsedClient[];
}
