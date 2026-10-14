import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-xl border border-[rgba(212,180,106,0.2)] bg-[rgba(7,8,11,0.65)] px-3 text-sm text-[#efe6d2] outline-none transition-colors placeholder:text-[#6f7380] focus-visible:border-[#d4b46a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0ddaa]',
        className,
      )}
      {...props}
    />
  )
}
