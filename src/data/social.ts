/** Completează cu URL-uri reale; dacă toate sunt goale, iconițele sociale nu se afișează. */
export const socialLinks = {
  facebook: '',
  instagram: '',
  linkedin: '',
} as const;

export function hasSocialLinks(): boolean {
  return Object.values(socialLinks).some((u) => typeof u === 'string' && u.trim().length > 0);
}
