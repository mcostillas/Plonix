import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const InputGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex w-full items-center rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        className
      )}
      {...props}
    />
  )
})
InputGroup.displayName = "InputGroup"

const inputGroupAddonVariants = cva("flex items-center px-3", {
  variants: {
    align: {
      start: "items-start pt-3",
      center: "items-center",
      end: "items-end",
      "block-end": "items-end pb-3",
    },
  },
  defaultVariants: {
    align: "center",
  },
})

interface InputGroupAddonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof inputGroupAddonVariants> {}

const InputGroupAddon = React.forwardRef<HTMLDivElement, InputGroupAddonProps>(
  ({ className, align, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(inputGroupAddonVariants({ align, className }))}
        {...props}
      />
    )
  }
)
InputGroupAddon.displayName = "InputGroupAddon"

interface InputGroupButtonProps
  extends React.ComponentPropsWithoutRef<typeof Button> {}

const InputGroupButton = React.forwardRef<
  HTMLButtonElement,
  InputGroupButtonProps
>(({ className, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      className={cn("h-auto", className)}
      {...props}
    />
  )
})
InputGroupButton.displayName = "InputGroupButton"

export { InputGroup, InputGroupAddon, InputGroupButton }
