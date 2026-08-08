export function triggerHaptic(pattern: number | number[] = 50, enabled: boolean = true) {
  if (!enabled) return;
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore if unsupported or blocked by browser policy
    }
  }
}
