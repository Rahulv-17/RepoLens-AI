import * as React from "react"
import { cn } from "../../utils/cn"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          {
            "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow hover:opacity-90": variant === "default",
            "bg-[var(--color-destructive)] text-[var(--color-destructive-foreground)] shadow-sm hover:opacity-90": variant === "destructive",
            "border border-[var(--color-border)] bg-transparent shadow-sm hover:bg-[var(--color-secondary)] text-[var(--color-foreground)]": variant === "outline",
            "bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] shadow-sm hover:opacity-80": variant === "secondary",
            "hover:bg-[var(--color-secondary)] text-[var(--color-foreground)]": variant === "ghost",
            "text-[var(--color-primary)] underline-offset-4 hover:underline": variant === "link",
            "h-9 px-4 py-2": size === "default",
            "h-8 rounded-md px-3 text-xs": size === "sm",
            "h-10 rounded-md px-8": size === "lg",
            "h-9 w-9 p-0": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
