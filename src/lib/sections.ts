export type Section = {
  id: string;
  label: string;
  viewfinderImage: string;
  viewfinderSrcSet: string;
  overlayBody: string;
};

export function nextSectionIndex(current: number, length: number): number {
  if (length <= 0) return 0;
  return (current + 1) % length;
}
