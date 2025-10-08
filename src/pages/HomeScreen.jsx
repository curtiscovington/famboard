import { useMemo } from 'react'
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

  const handleToggleChore = (chore) => {
    toggleChoreComplete(chore.id)
    if (!chore.completed) {
      launchConfetti()
    }
  }

  return (
    <div className="space-y-8 pb-10">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {familyMembers.map((member) => (
          <div
            key={member.id}
            className="rounded-3xl bg-white/80 p-6 shadow-card ring-1 ring-white/30 backdrop-blur transition hover:-translate-y-1 hover:shadow-lg dark:bg-slate-900/70 dark:ring-slate-700"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Points
                </p>
                <p className="font-display text-4xl text-famboard-primary dark:text-sky-300">
                  {member.points}
                </p>
              </div>
              <span className="rounded-full bg-famboard-primary/10 px-3 py-1 text-sm font-medium text-famboard-primary dark:bg-sky-400/10 dark:text-sky-200">
                {member.name}
              </span>
            </div>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Keep it up! Redeem rewards when you have enough points.
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white/80 p-6 shadow-card ring-1 ring-white/30 backdrop-blur dark:bg-slate-900/70 dark:ring-slate-800">
          <header className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl text-slate-800 dark:text-white">
              Upcoming chores
            </h2>
            <span className="rounded-full bg-famboard-accent/20 px-3 py-1 text-sm font-semibold text-famboard-dark dark:bg-amber-400/20 dark:text-amber-200">
              {upcomingChores.length}
            </span>
          </header>
          <div className="space-y-3">
            {upcomingChores.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Nothing on the list! Enjoy a break together.
              </p>
            )}
            {upcomingChores.map((chore) => {
              const assigned = familyMembers.find(
                (member) => member.id === chore.assignedTo,
              )
              return (
                <div
                  key={chore.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200/60 bg-white/80 p-4 shadow-sm transition hover:border-famboard-primary/50 hover:shadow dark:border-slate-700 dark:bg-slate-900/70"
                >
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white">
                      {chore.title}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {chore.description}
                    </p>
                    <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                      {assigned ? `Assigned to ${assigned.name}` : 'Unassigned'} ·{' '}
                      {chore.points} pts
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleChore(chore)}
                    className="rounded-full bg-famboard-primary px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-famboard-dark focus:outline-none focus:ring-2 focus:ring-famboard-accent focus:ring-offset-2"
                  >
                    Done ✅
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-3xl bg-white/80 p-6 shadow-card ring-1 ring-white/30 backdrop-blur dark:bg-slate-900/70 dark:ring-slate-800">
          <header className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl text-slate-800 dark:text-white">
              Completed chores
            </h2>
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-200">
              {completedChores.length}
            </span>
          </header>
          <div className="space-y-3">
            {completedChores.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Finish chores to see them shine here.
              </p>
            )}
            {completedChores.map((chore) => {
              const assigned = familyMembers.find(
                (member) => member.id === chore.assignedTo,
              )
              return (
                <div
                  key={chore.id}
                  className="flex items-center justify-between rounded-2xl border border-emerald-200/60 bg-white/80 p-4 shadow-sm dark:border-emerald-700 dark:bg-slate-900/70"
                >
                  <div>
                    <p className="font-semibold text-emerald-700 dark:text-emerald-200">
                      {chore.title}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {chore.description}
                    </p>
                    <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                      {assigned ? `By ${assigned.name}` : 'Unassigned'} · {chore.points} pts
                    </p>
                  </div>
                  <button
                    onClick={() => toggleChoreComplete(chore.id)}
                    className="rounded-full border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
                  >
                    Undo
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white/80 p-6 shadow-card ring-1 ring-white/30 backdrop-blur dark:bg-slate-900/70 dark:ring-slate-800">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl text-slate-800 dark:text-white">
            Reward store
          </h2>
          <span className="rounded-full bg-famboard-primary/10 px-3 py-1 text-sm font-semibold text-famboard-primary dark:bg-sky-400/10 dark:text-sky-200">
            {availableRewards.length}
          </span>
        </header>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {availableRewards.map((reward) => (
            <div
              key={reward.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/60 bg-white/90 p-5 shadow-sm transition hover:border-famboard-primary/60 hover:shadow dark:border-slate-700 dark:bg-slate-900/80"
            >
              <div>
                <p className="font-semibold text-slate-800 dark:text-white">
                  {reward.title}
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {reward.description}
                </p>
              </div>
              <p className="mt-4 text-lg font-bold text-famboard-primary dark:text-sky-300">
                {reward.cost} pts
              </p>
            </div>
          ))}
          {availableRewards.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Add rewards in the Rewards tab to motivate the crew!
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
