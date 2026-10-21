import { srcSet } from '@/lib/assets';

interface Source { name: string; widths: number[]; media?: string }

/** <picture> with AVIF/WebP sources and optional art direction per breakpoint. */
export function ArtPicture({ sources, fallback, alt, sizes, className, priority, width, height }: {
  sources: Source[]; fallback: { name: string; width: number }; alt: string; sizes: string; className?: string; priority?: boolean; width: number; height: number;
}) {
  return (
    <picture>
      {sources.flatMap((s) => [
        <source key={`${s.name}-avif`} type="image/avif" media={s.media} srcSet={srcSet(s.name, s.widths, 'avif')} sizes={sizes} />,
        <source key={`${s.name}-webp`} type="image/webp" media={s.media} srcSet={srcSet(s.name, s.widths, 'webp')} sizes={sizes} />,
      ])}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/assets/higgsfield/${fallback.name}-${fallback.width}.webp`} alt={alt} width={width} height={height} className={className}
        loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async" />
    </picture>
  );
}
