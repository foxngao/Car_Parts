import { describe, expect, it } from 'vitest';
import { formatDate } from './formatters';

describe('formatDate', () => {
  it('returns fallback text for invalid dates', () => {
    expect(formatDate(null)).toBe('Chưa cập nhật');
    expect(formatDate(undefined)).toBe('Chưa cập nhật');
    expect(formatDate('not-a-date')).toBe('Chưa cập nhật');
  });
});
