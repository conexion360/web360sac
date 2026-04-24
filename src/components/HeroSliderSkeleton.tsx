// src/components/HeroSliderSkeleton.tsx
export default function HeroSliderSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="relative w-full overflow-hidden bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-secondary/20 animate-pulse"
      style={{ aspectRatio: '19 / 6', minHeight: 400 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-purple-500/10" />
    </div>
  );
}
