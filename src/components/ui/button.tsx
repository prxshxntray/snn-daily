import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils.ts'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-transform outline-none focus-visible:ring-2 focus-visible:ring-sage/70 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        default: 'bg-sage text-ink',
        secondary: 'bg-panel-2 text-paper border border-line',
        outline: 'border border-line bg-transparent text-paper',
        ghost: 'bg-transparent text-paper',
        clay: 'bg-clay/15 text-clay',
      },
      size: {
        default: 'min-h-12 px-5 text-base',
        sm: 'min-h-10 px-4 text-sm',
        lg: 'min-h-14 px-6 text-lg',
        icon: 'size-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button, buttonVariants }
