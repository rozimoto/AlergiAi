import { isInQuietHours, QuietHoursWindow } from '../quietHoursUtils';

const makeTime = (hh: number, mm: number): Date => {
  const d = new Date(2024, 0, 15);
  d.setHours(hh, mm, 0, 0);
  return d;
};

describe('isInQuietHours – same-day window (09:00–17:00)', () => {
  const window: QuietHoursWindow = { start: '09:00', end: '17:00' };

  it('is quiet at start boundary (09:00)', () => {
    expect(isInQuietHours(window, makeTime(9, 0))).toBe(true);
  });

  it('is quiet mid-window (10:30)', () => {
    expect(isInQuietHours(window, makeTime(10, 30))).toBe(true);
  });

  it('is quiet just before end (16:59)', () => {
    expect(isInQuietHours(window, makeTime(16, 59))).toBe(true);
  });

  it('is NOT quiet at end boundary (17:00)', () => {
    expect(isInQuietHours(window, makeTime(17, 0))).toBe(false);
  });

  it('is NOT quiet before start (08:59)', () => {
    expect(isInQuietHours(window, makeTime(8, 59))).toBe(false);
  });

  it('is NOT quiet after end (20:00)', () => {
    expect(isInQuietHours(window, makeTime(20, 0))).toBe(false);
  });
});

describe('isInQuietHours – overnight window (22:00–07:00)', () => {
  const window: QuietHoursWindow = { start: '22:00', end: '07:00' };

  it('is quiet at start (22:00)', () => {
    expect(isInQuietHours(window, makeTime(22, 0))).toBe(true);
  });

  it('is quiet late night (23:30)', () => {
    expect(isInQuietHours(window, makeTime(23, 30))).toBe(true);
  });

  it('is quiet past midnight (00:00)', () => {
    expect(isInQuietHours(window, makeTime(0, 0))).toBe(true);
  });

  it('is quiet early morning (06:59)', () => {
    expect(isInQuietHours(window, makeTime(6, 59))).toBe(true);
  });

  it('is NOT quiet at end boundary (07:00)', () => {
    expect(isInQuietHours(window, makeTime(7, 0))).toBe(false);
  });

  it('is NOT quiet midday (12:00)', () => {
    expect(isInQuietHours(window, makeTime(12, 0))).toBe(false);
  });

  it('is NOT quiet just before start (21:59)', () => {
    expect(isInQuietHours(window, makeTime(21, 59))).toBe(false);
  });
});
