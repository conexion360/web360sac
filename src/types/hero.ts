// src/types/hero.ts
export type HeroSlide = {
  id: string;
  imageUrl: string;
  mobileImageUrl: string | null;
  title: string;
  subtitle: string;
  linkUrl: string | null;
  order: number;
  active: boolean;
};
