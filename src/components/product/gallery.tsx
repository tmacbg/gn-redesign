'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { ProductImage } from '@/domain/types';
import { cn } from '@/lib/cn';

export function Gallery({ images, alt, badge }: { images: ProductImage[]; alt: string; badge?: React.ReactNode }) {
  const [i, setI] = useState(0);
  const current = images[i];
  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-white">
        {current && <Image src={current.large} alt={alt} fill priority sizes="(min-width:768px) 50vw, 100vw" className="object-contain p-6" />}
        {badge}
      </div>
      {images.length > 1 && (
        <ul className="mt-3 flex gap-2" aria-label="Снимки">
          {images.map((img, n) => (
            <li key={img.id}>
              <button type="button" onClick={() => setI(n)} aria-label={`Снимка ${n + 1}`} aria-pressed={n === i}
                className={cn('relative h-16 w-16 overflow-hidden rounded border bg-white', n === i ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-border-strong')}>
                <Image src={img.medium} alt="" fill sizes="64px" className="object-contain p-1" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
