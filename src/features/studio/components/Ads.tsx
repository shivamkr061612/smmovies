// All ads temporarily disabled. Components render nothing and
// openSmartlink is a no-op so existing call sites keep working.

export const SMARTLINK_URL = "";

export function AdsterraBanner(_props: {
  adKey: string;
  width: number;
  height: number;
  className?: string;
}) {
  return null;
}

export function Banner320x50(_props: { className?: string }) {
  return null;
}

export function Banner160x600(_props: { className?: string }) {
  return null;
}

export function NativeBanner(_props: { className?: string }) {
  return null;
}

export function PopunderLoader() {
  return null;
}

export function openSmartlink() {
  /* ads disabled */
}
