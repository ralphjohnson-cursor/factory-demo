import { SYMBOL_IDS, type SpinResult, type SymbolId } from './types'

const WEIGHTS: Record<SymbolId, number> = {
  crown: 3,
  vault: 4,
  emerald: 6,
  coin: 8,
  horseshoe: 9,
  ace: 11,
  king: 12,
  queen: 14,
}

const PAY: Record<SymbolId, { three: number; four: number; five: number }> = {
  crown: { three: 12, four: 28, five: 80 },
  vault: { three: 8, four: 18, five: 40 },
  emerald: { three: 5, four: 12, five: 24 },
  coin: { three: 3, four: 8, five: 16 },
  horseshoe: { three: 2.4, four: 6, five: 12 },
  ace: { three: 1.8, four: 4, five: 8 },
  king: { three: 1.4, four: 3, five: 6 },
  queen: { three: 1, four: 2, five: 4 },
}

const WEIGHTED: SymbolId[] = SYMBOL_IDS.flatMap((id) =>
  Array.from({ length: WEIGHTS[id] }, () => id),
)

function pickSymbol(random: () => number): SymbolId {
  return WEIGHTED[Math.floor(random() * WEIGHTED.length)] ?? 'queen'
}

function lineWin(symbols: SymbolId[], stake: number): { amount: number; count: number } {
  const first = symbols[0]
  if (!first) return { amount: 0, count: 0 }
  let count = 1
  for (let i = 1; i < symbols.length; i += 1) {
    if (symbols[i] === first) count += 1
    else break
  }
  if (count < 3) return { amount: 0, count }
  const table = PAY[first]
  const multiplier = count === 5 ? table.five : count === 4 ? table.four : table.three
  return { amount: stake * multiplier, count }
}

export function resolveSpin(stake: number, random: () => number = Math.random): SpinResult {
  const grid: SymbolId[][] = Array.from({ length: 5 }, () =>
    Array.from({ length: 3 }, () => pickSymbol(random)),
  )

  const lines: Array<Array<{ reel: number; row: number }>> = [
    [0, 1, 2, 3, 4].map((reel) => ({ reel, row: 1 })),
    [0, 1, 2, 3, 4].map((reel) => ({ reel, row: 0 })),
    [0, 1, 2, 3, 4].map((reel) => ({ reel, row: 2 })),
    [
      { reel: 0, row: 0 },
      { reel: 1, row: 1 },
      { reel: 2, row: 2 },
      { reel: 3, row: 1 },
      { reel: 4, row: 0 },
    ],
    [
      { reel: 0, row: 2 },
      { reel: 1, row: 1 },
      { reel: 2, row: 0 },
      { reel: 3, row: 1 },
      { reel: 4, row: 2 },
    ],
  ]

  let winAmount = 0
  const winning = new Set<string>()
  let paylines = 0

  for (const line of lines) {
    const symbols = line.map(({ reel, row }) => grid[reel]![row]!)
    const result = lineWin(symbols, stake)
    if (result.amount > 0) {
      paylines += 1
      winAmount += result.amount
      line.slice(0, result.count).forEach((cell) => {
        winning.add(`${cell.reel}:${cell.row}`)
      })
    }
  }

  return {
    grid,
    winAmount: Math.round(winAmount * 100) / 100,
    winningCells: [...winning].map((key) => {
      const [reel, row] = key.split(':').map(Number)
      return { reel, row }
    }),
    paylines,
  }
}

export function randomStrip(length: number, random: () => number = Math.random): SymbolId[] {
  return Array.from({ length }, () => pickSymbol(random))
}
