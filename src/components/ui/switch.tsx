import * as SwitchPrimitive from '@radix-ui/react-switch'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils.ts'

function Switch({ className, ...props }: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        'peer inline-flex h-8 w-14 shrink-0 items-center rounded-full border border-line bg-panel-2 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sage/70 data-[state=checked]:bg-sage data-[state=checked]:border-sage',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none block size-6 translate-x-1 rounded-full bg-paper transition-transform data-[state=checked]:translate-x-7 data-[state=checked]:bg-ink" />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
