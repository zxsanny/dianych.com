export const GALLERY_IDS = ['brooches', 'clothes', 'panel', 'felting', 'kits'] as const;

export type GalleryId = (typeof GALLERY_IDS)[number];

export function isGalleryId(value: string): value is GalleryId {
  return (GALLERY_IDS as readonly string[]).includes(value);
}
