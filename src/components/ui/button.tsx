import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium tracking-wide transition-all duration-150 disabled:pointer-events-none disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#f0ddaa]',
  {
    variants: {
      variant: {
        gold:
          'bg-gradient-to-b from-[#f0ddaa] to-[#d4b46a] text-[#1b1408] shadow-[0_8px_24px_rgba(0,0,0,0.28)] hover:-translate-y-0.5',
        emerald:
          'bg-[rgba(31,138,98,0.2)] text-[#b8ffe0] border border-[rgba(62,224,162,0.32)] hover:bg-[rgba(31,138,98,0.3)]',
        ghost:
          'bg-transparent text-[#efe6d2] border border-[rgba(212,180,106,0.2)] hover:border-[rgba(212,180,106,0.45)] hover:bg-[rgba(255,255,255,0.03)]',
        danger:
          'bg-[rgba(196,91,91,0.16)] text-[#ffd0d0] border border-[rgba(196,91,91,0.35)] hover:bg-[rgba(196,91,91,0.24)]',
        mute: 'bg-[rgba(255,255,255,0.04)] text-[#cfc6b0] border border-[rgba(255,255,255,0.06)]',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4',
        lg: 'h-12 px-5',
      },
    },
    defaultVariants: {
      variant: 'gold',
      size: 'md',
    },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  type = 'button',
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp className={cn(buttonVariants({ variant, size }), className)} type={type} {...props} />
  )
}
