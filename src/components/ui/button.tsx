import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'accent';
type Size = 'sm' | 'md' | 'lg' | 'icon';

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-primary-fg hover:bg-primary-hover shadow-1',
  secondary: 'bg-surface text-fg border border-border hover:border-border-strong hover:bg-surface-muted',
  ghost: 'text-fg hover:bg-surface-muted',
  accent: 'bg-accent text-fg hover:brightness-95',
};
const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
  icon: 'h-11 w-11',
};

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', className?: string) {
  return cn(
    'inline-flex items-center justify-center rounded font-semibold transition-colors duration-150 ease-out disabled:pointer-events-none disabled:opacity-50 select-none',
    variants[variant], sizes[size], className,
  );
}

export function Button({ variant, size, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}
