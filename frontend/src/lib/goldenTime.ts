/**
 * Real-time Golden Time Helper Utility for Tri Ton Tourism
 */

export interface GoldenTimeResult {
  isGolden: boolean;
  activeWindow: string | null;
  currentFormattedTime: string;
}

export function parseTimeToMinutes(timeStr: string): number | null {
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  return hours * 60 + minutes;
}

export function checkIsGoldenTime(windows?: string[], targetDate: Date = new Date()): GoldenTimeResult {
  const currentHour = targetDate.getHours();
  const currentMinute = targetDate.getMinutes();
  const currentTotalMinutes = currentHour * 60 + currentMinute;
  const currentFormattedTime = `${String(currentHour).padStart(2, "0")}:${String(currentMinute).padStart(2, "0")}`;

  if (!windows || !Array.isArray(windows) || windows.length === 0) {
    return { isGolden: false, activeWindow: null, currentFormattedTime };
  }

  for (const win of windows) {
    // Extract HH:MM patterns like 05:30–07:00 or 16:00-17:30
    const timeMatch = win.match(/(\d{1,2}:\d{2})\s*[\u2013\u2014-]\s*(\d{1,2}:\d{2})/);
    if (timeMatch) {
      const startMin = parseTimeToMinutes(timeMatch[1]);
      const endMin = parseTimeToMinutes(timeMatch[2]);
      if (startMin !== null && endMin !== null) {
        if (currentTotalMinutes >= startMin && currentTotalMinutes <= endMin) {
          return { isGolden: true, activeWindow: win, currentFormattedTime };
        }
      }
    }
  }

  return { isGolden: false, activeWindow: null, currentFormattedTime };
}
