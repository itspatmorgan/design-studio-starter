import { Command as CommandPrimitive } from "cmdk"
import { Dialog as DialogPrimitive } from "radix-ui"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

// App UI command menu (shadcn's Command, on cmdk). Renders into document.body, in the app UI look.
function CommandDialog({ title = "Command menu", children, ...props }) {
  return (
    <DialogPrimitive.Root {...props}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/20 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed top-[20%] left-1/2 z-50 w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-lg border border-border bg-popover shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
          <CommandPrimitive className="flex w-full flex-col text-popover-foreground">{children}</CommandPrimitive>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

function CommandInput({ className, ...props }) {
  return (
    <div className="flex items-center border-b border-border px-3">
      <HugeiconsIcon icon={Search01Icon} size={16} className="mr-2 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        className={cn("flex h-12 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground", className)}
        {...props}
      />
    </div>
  )
}

function CommandList({ className, ...props }) {
  return <CommandPrimitive.List className={cn("max-h-[min(420px,60vh)] overflow-x-hidden overflow-y-auto", className)} {...props} />
}

function CommandEmpty(props) {
  return <CommandPrimitive.Empty className="py-6 text-center text-sm" {...props} />
}

function CommandGroup({ className, ...props }) {
  return (
    <CommandPrimitive.Group
      className={cn(
        "overflow-hidden px-2 pt-2 pb-1 text-foreground",
        "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pt-1 [&_[cmdk-group-heading]]:pb-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function CommandSeparator({ className, ...props }) {
  return <CommandPrimitive.Separator className={cn("h-px bg-border", className)} {...props} />
}

function CommandItem({ className, ...props }) {
  return (
    <CommandPrimitive.Item
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-3 text-sm outline-none select-none",
        "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandSeparator, CommandItem }
