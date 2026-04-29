export interface QuietHoursWindow {
  start: string; // "HH:MM" 24h
  end: string;
}

export const isInQuietHours = (window: QuietHoursWindow, now: Date = new Date()): boolean => {
  const cur = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = window.start.split(':').map(Number);
  const [eh, em] = window.end.split(':').map(Number);
  const start = sh * 60 + sm;
  const end   = eh * 60 + em;

  if (start <= end) {
    // Same-day window e.g. 09:00–17:00
    return cur >= start && cur < end;
  } else {
    // Overnight window e.g. 22:00–07:00
    return cur >= start || cur < end;
  }
};
