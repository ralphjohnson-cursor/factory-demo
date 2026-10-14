import * as SwitchPrimitive from '@radix-ui/react-switch'
import { cn } from '@/lib/utils'

interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  id?: string
  label?: string
}

export function Switch({ checked, onCheckedChange, disabled, id, label }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      id={id}
      checked={checked}
      disabled={disabled}
      onCheckedChange={onCheckedChange}
      aria-label={label}
      className={cn(
        'relative h-6 w-11 rounded-full border border-[rgba(212,180,106,0.22)] bg-[rgba(255,255,255,0.06)] transition-colors data-[state=checked]:bg-[#1f8a62] disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#f0ddaa]',
      )}
    >
      <SwitchPrimitive.Thumb className="block size-5 translate-x-0.5 rounded-full bg-[#efe6d2] transition-transform data-[state=checked]:translate-x-5" />
    </SwitchPrimitive.Root>
  )
}
