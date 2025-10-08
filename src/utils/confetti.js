import confetti from 'canvas-confetti'

export function launchConfetti() {
  if (typeof window === 'undefined') return

  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.7 },
    colors: ['#1f7a8c', '#ffb703', '#fb7185', '#38bdf8'],
  })
}
