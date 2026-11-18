import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils.ts'

function Dialog(props: ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root {...props} />
}

function DialogTrigger(props: ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger {...props} />
}

function DialogClose(props: ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close {...props} />
}

function DialogContent({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/65" />
      <DialogPrimitive.Content
        className={cn(
          'fixed z-50 w-[min(100%,32rem)] border border-line bg-panel p-5 text-paper shadow-2xl outline-none',
          'top-auto right-0 bottom-0 left-0 max-h-[85dvh] overflow-y-auto rounded-t-3xl pb-[max(1.25rem,env(safe-area-inset-bottom))]',
          'sm:top-1/2 sm:right-auto sm:bottom-auto sm:left-1/2 sm:max-h-[80dvh] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl',
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full text-mute outline-none focus-visible:ring-2 focus-visible:ring-sage/70">
          <X className="size-5" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

function DialogHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('pr-10', className)} {...props} />
}

function DialogTitle(props: ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className="font-serif text-2xl leading-tight" {...props} />
}

function DialogDescription(props: ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className="mt-2 text-sm leading-relaxed text-mute" {...props} />
}

function DialogFooter({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('mt-5 flex flex-col gap-2', className)} {...props} />
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
}
