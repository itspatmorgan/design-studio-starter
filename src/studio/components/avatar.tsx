import { cn } from "@/lib/utils"

// Initials in a gray circle, like a contributor avatar without a photo.
function ContributorAvatar({ name, size = 20, className }: { name?: string; size?: number; className?: string }) {
  const initials = name ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "?"
  return (
    <span
      className={cn("flex shrink-0 items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground", className)}
      style={{ width: size, height: size, fontSize: size * 0.45 }}
      aria-hidden
    >
      {initials}
    </span>
  )
}

export { ContributorAvatar }
