import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useFamboard } from '../context/FamboardContext.jsx'
import { launchConfetti } from '../utils/confetti.js'

export default function HomeScreen() {
  const { state, toggleChoreComplete } = useFamboard()
  const { familyMembers, chores, rewards } = state

  const upcomingChores = useMemo(
    () => chores.filter((chore) => !chore.completed),
    [chores],
  )
  const completedChores = useMemo(
    () =>
      chores
        .filter((chore) => chore.completed)
        .sort((a, b) => {
          if (!a.completedAt) return 1
          if (!b.completedAt) return -1
          return new Date(b.completedAt) - new Date(a.completedAt)
        }),
    [chores],
  )

  const availableRewards = useMemo(
    () => [...rewards].sort((a, b) => a.cost - b.cost),
    [rewards],
  )

  const totalPoints = useMemo(
    () => familyMembers.reduce((sum, member) => sum + member.points, 0),
    [familyMembers],
  )

  const totalChores = chores.length
  const completedCount = completedChores.length

  const handleToggleChore = (chore) => {
    toggleChoreComplete(chore.id)
    if (!chore.completed) {
      launchConfetti()
    }
  }

  return (
    <div className="space-y-10 pb-16">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-famboard-primary via-sky-500 to-emerald-500 p-8 text-white shadow-xl">
        <div className="absolute -left-32 top-10 h-60 w-60 rounded-full bg-white/10 blur-3xl" aria-hidden />
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-emerald-400/30 blur-3xl" aria-hidden />
        <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/70">Famboard HQ</p>
            <h1 className="font-display text-4xl leading-tight sm:text-5xl">Celebrate progress and spark more high-fives</h1>
            <p className="text-base text-white/80">
              Glance at the latest wins, keep chores flowing, and hype the next big reward moment for your crew.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/chores"
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-famboard-primary shadow-lg transition hover:-translate-y-0.5 hover:bg-famboard-accent hover:text-famboard-dark"
              >
                View chore board
              </Link>
              <Link
                to="/rewards"
                className="inline-flex items-center justify-center rounded-full border border-white/70 px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                Browse rewards
              </Link>
            </div>
          </div>
          <div className="grid w-full max-w-md gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/15 p-4 shadow-inner backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Family members</p>
              <p className="mt-2 text-3xl font-bold">{familyMembers.length}</p>
              <p className="text-xs text-white/70">Cheering each other on.</p>
            </div>
            <div className="rounded-2xl bg-white/15 p-4 shadow-inner backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Points in play</p>
              <p className="mt-2 text-3xl font-bold">{totalPoints}</p>
              <p className="text-xs text-white/70">Ready for epic rewards.</p>
            </div>
            <div className="rounded-2xl bg-white/15 p-4 shadow-inner backdrop-blur sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Chores completed</p>
              <p className="mt-2 text-3xl font-bold">{completedCount}</p>
              <p className="text-xs text-white/70">Out of {totalChores} total chores.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-3xl text-slate-800 dark:text-white">Family spotlight</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">See everyone’s momentum and encourage the next victory lap.</p>
          </div>
          <span className="rounded-full bg-famboard-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-famboard-primary dark:bg-sky-500/10 dark:text-sky-200">
            {familyMembers.length} member{familyMembers.length === 1 ? '' : 's'}
          </span>
        </header>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {familyMembers.map((member) => (
            <div
              key={member.id}
              className="group relative overflow-hidden rounded-3xl border border-transparent bg-white/90 p-6 shadow-card transition hover:-translate-y-1 hover:border-famboard-primary/40 hover:shadow-xl dark:bg-slate-900/80"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-famboard-primary/10 blur-2xl transition group-hover:bg-famboard-primary/20" aria-hidden />
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-inner dark:border-slate-700 dark:bg-slate-800">
                  {member.imageUrl ? (
                    <img src={member.imageUrl} alt={member.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl">😊</div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Point stash</p>
                      <p className="font-display text-4xl text-famboard-primary dark:text-sky-300">{member.points}</p>
                    </div>
                    <span className="rounded-full bg-famboard-primary/10 px-3 py-1 text-sm font-medium text-famboard-primary dark:bg-sky-400/10 dark:text-sky-200">
                      {member.name}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Keep it up! Rewards are just a few chores away.</p>
                </div>
              </div>
            </div>
          ))}
          {familyMembers.length === 0 && (
            <p className="rounded-3xl border border-dashed border-slate-300/70 bg-white/70 p-6 text-sm text-slate-500 shadow-inner dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-400">
              Add your crew in settings to start tracking their progress.
            </p>
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white/85 p-6 shadow-card ring-1 ring-white/30 backdrop-blur dark:bg-slate-900/75 dark:ring-slate-800">
          <header className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl text-slate-800 dark:text-white">Upcoming chores</h2>
            <span className="rounded-full bg-famboard-accent/20 px-3 py-1 text-sm font-semibold text-famboard-dark dark:bg-amber-400/20 dark:text-amber-200">
              {upcomingChores.length}
            </span>
          </header>
          <div className="space-y-3">
            {upcomingChores.length === 0 && (
              <p className="rounded-2xl border border-dashed border-slate-300/70 bg-white/60 p-4 text-sm text-slate-500 shadow-inner dark:border-slate-700/70 dark:bg-slate-900/60 dark:text-slate-400">
                Nothing on the list! Enjoy a break together.
              </p>
            )}
            {upcomingChores.map((chore) => {
              const assigned = familyMembers.find((member) => member.id === chore.assignedTo)
              return (
                <div
                  key={chore.id}
                  className="flex items-center gap-4 rounded-2xl border border-slate-200/60 bg-white/90 p-4 shadow-sm transition hover:border-famboard-primary/50 hover:shadow dark:border-slate-700 dark:bg-slate-900/70"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner dark:border-slate-700 dark:bg-slate-800">
                    {chore.imageUrl ? (
                      <img src={chore.imageUrl} alt={chore.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl">🧺</div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold text-slate-800 dark:text-white">{chore.title}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{chore.description}</p>
                    <p className="pt-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                      {assigned ? `Assigned to ${assigned.name}` : 'Unassigned'} · {chore.points} pts
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleChore(chore)}
                    className="shrink-0 rounded-full bg-famboard-primary px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-famboard-dark focus:outline-none focus:ring-2 focus:ring-famboard-accent focus:ring-offset-2"
                  >
                    Done ✅
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-3xl bg-white/85 p-6 shadow-card ring-1 ring-white/30 backdrop-blur dark:bg-slate-900/75 dark:ring-slate-800">
          <header className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl text-slate-800 dark:text-white">Completed chores</h2>
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-200">
              {completedChores.length}
            </span>
          </header>
          <div className="space-y-3">
            {completedChores.length === 0 && (
              <p className="rounded-2xl border border-dashed border-emerald-300/60 bg-white/60 p-4 text-sm text-slate-500 shadow-inner dark:border-emerald-600/60 dark:bg-slate-900/60 dark:text-slate-400">
                Finish chores to see them shine here.
              </p>
            )}
            {completedChores.map((chore) => {
              const assigned = familyMembers.find((member) => member.id === chore.assignedTo)
              return (
                <div
                  key={chore.id}
                  className="flex items-center gap-4 rounded-2xl border border-emerald-200/60 bg-white/90 p-4 shadow-sm dark:border-emerald-700 dark:bg-slate-900/70"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 shadow-inner dark:border-emerald-700 dark:bg-emerald-900/40">
                    {chore.imageUrl ? (
                      <img src={chore.imageUrl} alt={chore.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl">🌟</div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold text-emerald-700 dark:text-emerald-200">{chore.title}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{chore.description}</p>
                    <p className="pt-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                      {assigned ? `By ${assigned.name}` : 'Unassigned'} · {chore.points} pts
                    </p>
                  </div>
                  <button
                    onClick={() => toggleChoreComplete(chore.id)}
                    className="shrink-0 rounded-full border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-600 transition hover:-translate-y-0.5 hover:bg-emerald-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
                  >
                    Undo
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white/85 p-6 shadow-card ring-1 ring-white/30 backdrop-blur dark:bg-slate-900/75 dark:ring-slate-800">
        <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-3xl text-slate-800 dark:text-white">Reward store preview</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Get inspired by what’s waiting once the points pile up.</p>
          </div>
          <span className="rounded-full bg-famboard-primary/10 px-3 py-1 text-sm font-semibold text-famboard-primary dark:bg-sky-400/10 dark:text-sky-200">
            {availableRewards.length} reward{availableRewards.length === 1 ? '' : 's'}
          </span>
        </header>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {availableRewards.map((reward) => (
            <div
              key={reward.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-transparent bg-white/90 p-5 shadow-card transition hover:-translate-y-1 hover:border-famboard-primary/40 hover:shadow-xl dark:bg-slate-900/80"
            >
              <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-famboard-primary/10 blur-3xl transition group-hover:bg-famboard-primary/20" aria-hidden />
              <div className="space-y-2">
                <div className="h-24 w-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-inner dark:border-slate-700 dark:bg-slate-800">
                  {reward.imageUrl ? (
                    <img src={reward.imageUrl} alt={reward.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl">🎈</div>
                  )}
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Reward idea</p>
                <p className="text-lg font-semibold text-slate-800 dark:text-white">{reward.title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{reward.description || 'Add a description in settings to build excitement.'}</p>
              </div>
              <p className="mt-4 text-lg font-bold text-famboard-primary dark:text-sky-300">{reward.cost} pts</p>
            </div>
          ))}
          {availableRewards.length === 0 && (
            <p className="rounded-3xl border border-dashed border-slate-300/70 bg-white/70 p-6 text-sm text-slate-500 shadow-inner dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-400">
              Add rewards in the Rewards tab to motivate the crew!
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
