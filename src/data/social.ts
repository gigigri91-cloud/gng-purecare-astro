/** Completează cu URL-uri reale; dacă toate sunt goale, iconițele sociale nu se afișează. */
export const socialLinks = {
  facebook: 'https://www.facebook.com/gngpurecare',
  instagram: 'https://www.instagram.com/gngpurecare',
  linkedin: '',
} as const;

export function hasSocialLinks(): boolean {
  return Object.values(socialLinks).some((u) => typeof u === 'string' && u.trim().length > 0);
}
