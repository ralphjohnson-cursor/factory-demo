import type { ReactNode } from 'react'
import type { SymbolId } from '@/engine/types'

export function SymbolDefs() {
  return (
    <svg className="absolute h-0 w-0" aria-hidden="true">
      <defs>
        <linearGradient id="nv-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff3c9" />
          <stop offset="45%" stopColor="#e0c173" />
          <stop offset="100%" stopColor="#8a7038" />
        </linearGradient>
        <linearGradient id="nv-em" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b8ffe0" />
          <stop offset="50%" stopColor="#3ee0a2" />
          <stop offset="100%" stopColor="#0d4a34" />
        </linearGradient>
        <radialGradient id="nv-vault" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#2a2418" />
          <stop offset="100%" stopColor="#0c0d11" />
        </radialGradient>
      </defs>
    </svg>
  )
}

function SvgShell({ children, title }: { children: ReactNode; title: string }) {
  return (
    <svg className="symbol-svg" viewBox="0 0 80 80" aria-hidden="true">
      <title>{title}</title>
      {children}
    </svg>
  )
}

function Crown() {
  return (
    <SvgShell title="Crown">
      <path
        d="M12 54 L16 28 L28 42 L40 18 L52 42 L64 28 L68 54 Z"
        fill="url(#nv-gold)"
        stroke="#f0ddaa"
        strokeWidth="1.4"
      />
      <rect x="14" y="54" width="52" height="8" rx="2" fill="url(#nv-gold)" />
      <circle cx="16" cy="26" r="3.2" fill="#3ee0a2" />
      <circle cx="40" cy="16" r="3.6" fill="#fff3c9" />
      <circle cx="64" cy="26" r="3.2" fill="#3ee0a2" />
    </SvgShell>
  )
}

function Vault() {
  return (
    <SvgShell title="Vault">
      <rect x="16" y="18" width="48" height="46" rx="8" fill="url(#nv-vault)" stroke="url(#nv-gold)" strokeWidth="2" />
      <circle cx="40" cy="40" r="12" fill="none" stroke="url(#nv-gold)" strokeWidth="2.2" />
      <circle cx="40" cy="40" r="3" fill="#d4b46a" />
      <path d="M40 28 V34 M40 46 V52 M28 40 H34 M46 40 H52" stroke="#f0ddaa" strokeWidth="1.4" />
    </SvgShell>
  )
}

function Emerald() {
  return (
    <SvgShell title="Emerald">
      <path d="M40 12 L62 28 L54 64 L26 64 L18 28 Z" fill="url(#nv-em)" stroke="#b8ffe0" strokeWidth="1.2" />
      <path d="M40 12 L40 64 M18 28 H62 M26 64 L40 28 L54 64" fill="none" stroke="rgba(7,20,14,0.28)" strokeWidth="1" />
    </SvgShell>
  )
}

function Coin() {
  return (
    <SvgShell title="Coin">
      <circle cx="40" cy="40" r="22" fill="url(#nv-gold)" stroke="#fff3c9" strokeWidth="1.6" />
      <circle cx="40" cy="40" r="16" fill="none" stroke="#8a7038" strokeWidth="1.2" />
      <text x="40" y="46" textAnchor="middle" fontSize="18" fill="#3a2a10" fontFamily="Cormorant Garamond, serif">
        N
      </text>
    </SvgShell>
  )
}

function Horseshoe() {
  return (
    <SvgShell title="Horseshoe">
      <path
        d="M24 22 C24 12 56 12 56 22 L56 36 C56 54 50 62 40 62 C30 62 24 54 24 36 Z"
        fill="none"
        stroke="url(#nv-gold)"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <circle cx="26" cy="24" r="2" fill="#efe6d2" />
      <circle cx="54" cy="24" r="2" fill="#efe6d2" />
      <circle cx="26" cy="34" r="2" fill="#efe6d2" />
      <circle cx="54" cy="34" r="2" fill="#efe6d2" />
    </SvgShell>
  )
}

function Face({ letter, hue }: { letter: string; hue: string }) {
  return (
    <SvgShell title={letter}>
      <rect x="18" y="14" width="44" height="52" rx="8" fill="#141821" stroke={hue} strokeWidth="1.6" />
      <text
        x="40"
        y="48"
        textAnchor="middle"
        fontSize="26"
        fill={hue}
        fontFamily="Cormorant Garamond, serif"
        fontWeight="600"
      >
        {letter}
      </text>
    </SvgShell>
  )
}

export function SymbolArt({ id }: { id: SymbolId }) {
  switch (id) {
    case 'crown':
      return <Crown />
    case 'vault':
      return <Vault />
    case 'emerald':
      return <Emerald />
    case 'coin':
      return <Coin />
    case 'horseshoe':
      return <Horseshoe />
    case 'ace':
      return <Face letter="A" hue="#f0ddaa" />
    case 'king':
      return <Face letter="K" hue="#d4b46a" />
    case 'queen':
      return <Face letter="Q" hue="#cfc6b0" />
    default:
      return <Face letter="?" hue="#9aa0ab" />
  }
}

