import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils.ts'

function Input({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'min-h-12 w-full rounded-2xl border border-line bg-panel px-4 text-base text-paper outline-none placeholder:text-mute focus-visible:ring-2 focus-visible:ring-sage/70',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
