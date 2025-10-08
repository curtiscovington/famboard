import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useFamboard } from '../context/FamboardContext.jsx'
import { launchConfetti } from '../utils/confetti.js'
import { getRecurrenceLabel, RECURRENCE_OPTIONS } from '../utils/recurrence.js'

function ChoreCard({ chore, familyMembers, onToggle, onDelete, onSave, canManage = true }) {
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    title: chore.title,
    description: chore.description,
    assignedTo: chore.assignedTo ?? '',
    points: chore.points,
    imageUrl: chore.imageUrl ?? '',
    recurrence: chore.recurrence ?? 'none',
    rotateAssignment: Boolean(chore.rotateAssignment),
  })

  useEffect(() => {
    setForm({
      title: chore.title,
      description: chore.description,
      assignedTo: chore.assignedTo ?? '',
      points: chore.points,
      imageUrl: chore.imageUrl ?? '',
      recurrence: chore.recurrence ?? 'none',
      rotateAssignment: Boolean(chore.rotateAssignment),
    })
  }, [chore])

  useEffect(() => {
    if (!canManage) {
      setIsEditing(false)
    }
  }, [canManage])

  const assignedMember = familyMembers.find((member) => member.id === chore.assignedTo)

  const handleSubmit = (event) => {
    event.preventDefault()
    onSave(chore.id, {
      title: form.title.trim(),
      description: form.description.trim(),
      assignedTo: form.assignedTo || null,
      points: Number(form.points) || 0,
      imageUrl: form.imageUrl.trim(),
      recurrence: form.recurrence,
      rotateAssignment: form.rotateAssignment,
    })
    setIsEditing(false)
  }

  const handleToggle = () => {
    onToggle(chore.id, chore.completed)
  }

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-5 shadow-sm transition hover:border-famboard-primary/60 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/80">
      {isEditing && canManage ? (
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="flex items-center gap-3">
            <div className="h-20 w-20 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-inner dark:border-slate-700 dark:bg-slate-800">
              {form.imageUrl ? (
                <img src={form.imageUrl} alt={form.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl">🧹</div>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Add a picture so little helpers recognize the task in a snap.
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Title
            </label>
            <input
              required
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
              rows={3}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Assign to
              </label>
              <select
                value={form.assignedTo ?? ''}
                onChange={(event) => setForm((prev) => ({ ...prev, assignedTo: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
                disabled={form.rotateAssignment && familyMembers.length <= 1}
              >
                <option value="">Unassigned</option>
                {familyMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
              {form.rotateAssignment && (
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Assignment rotates automatically.
                </p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Points
              </label>
              <input
                type="number"
                min="0"
                value={form.points}
                onChange={(event) => setForm((prev) => ({ ...prev, points: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Repeats</label>
              <select
                value={form.recurrence}
                onChange={(event) => setForm((prev) => ({ ...prev, recurrence: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
              >
                {RECURRENCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Rotation</label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner dark:border-slate-700 dark:bg-slate-900">
                <input
                  id={`rotate-${chore.id}`}
                  type="checkbox"
                  checked={form.rotateAssignment}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      rotateAssignment: event.target.checked,
                      assignedTo:
                        event.target.checked && familyMembers.length === 0 ? '' : prev.assignedTo,
                    }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-famboard-primary focus:ring-famboard-primary"
                />
                <label htmlFor={`rotate-${chore.id}`} className="flex-1 cursor-pointer select-none">
                  Rotate between family members
                </label>
              </div>
              {form.rotateAssignment && familyMembers.length === 0 && (
                <p className="text-xs text-rose-500">Add family members to enable rotation.</p>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Picture URL
            </label>
            <input
              value={form.imageUrl}
              onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
              placeholder="https://..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
            />
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Use icons or photos that show the chore in action.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 rounded-full bg-famboard-primary px-4 py-2 text-sm font-semibold text-white shadow focus:outline-none focus:ring-2 focus:ring-famboard-accent focus:ring-offset-2"
            >
              Save changes
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-inner dark:border-slate-700 dark:bg-slate-800">
              {chore.imageUrl ? (
                <img src={chore.imageUrl} alt={chore.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl">🧽</div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg text-slate-800 dark:text-white">
                    {chore.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {chore.description || 'No description yet.'}
                  </p>
                </div>
                <span className="rounded-full bg-famboard-primary/10 px-3 py-1 text-sm font-semibold text-famboard-primary dark:bg-sky-400/10 dark:text-sky-200">
                  {chore.points} pts
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {assignedMember ? `Assigned to ${assignedMember.name}` : 'Unassigned'}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium dark:bg-slate-800/60">
              {getRecurrenceLabel(chore.recurrence ?? 'none')}
            </span>
            {chore.rotateAssignment && (
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium dark:bg-slate-800/60">
                Rotates between helpers
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleToggle}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold text-white shadow focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                chore.completed
                  ? 'bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-400'
                  : 'bg-famboard-primary hover:bg-famboard-dark focus:ring-famboard-accent'
              }`}
            >
              {chore.completed ? 'Mark as not done' : 'Mark complete'}
            </button>
            {canManage && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(chore.id)}
                  className="rounded-full border border-rose-400 px-4 py-2 text-sm font-semibold text-rose-500 transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 dark:border-rose-500 dark:text-rose-300 dark:hover:bg-rose-500/10"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ChoresScreen() {
  const { state, toggleChoreComplete, removeChore, updateChore } = useFamboard()
  const { familyMembers, chores, rewards, activeView } = state

  const selectedMember = activeView === 'family' ? null : familyMembers.find((member) => member.id === activeView)
  const isMemberView = Boolean(selectedMember)

  const upcomingChores = useMemo(() => {
    return chores.filter(
      (chore) => !chore.completed && (!isMemberView || chore.assignedTo === selectedMember.id),
    )
  }, [chores, isMemberView, selectedMember?.id])

  const completedChores = useMemo(() => {
    return chores.filter(
      (chore) => chore.completed && (!isMemberView || chore.assignedTo === selectedMember.id),
    )
  }, [chores, isMemberView, selectedMember?.id])

  const totalPointsInRewards = useMemo(
    () => rewards.reduce((sum, reward) => sum + reward.cost, 0),
    [rewards],
  )

  const handleToggle = (id, wasCompleted) => {
    toggleChoreComplete(id)
    if (!wasCompleted) {
      launchConfetti()
    }
  }

  return (
    <div className="space-y-10 pb-16">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-famboard-primary via-sky-500 to-violet-500 p-8 text-white shadow-xl">
        <div className="absolute -left-28 top-12 h-56 w-56 rounded-full bg-white/10 blur-3xl" aria-hidden />
        <div className="absolute -right-16 -bottom-12 h-60 w-60 rounded-full bg-violet-400/30 blur-3xl" aria-hidden />
        <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/70">
              {isMemberView ? 'Your checklist' : 'Mission control'}
            </p>
            <h1 className="font-display text-4xl leading-tight sm:text-5xl">
              {isMemberView ? `Let’s tackle your chores, ${selectedMember.name}!` : 'Organize the work, unleash the celebrations'}
            </h1>
            <p className="text-base text-white/80">
              {isMemberView
                ? 'Mark chores complete, watch the confetti fly, and keep earning points toward your next reward.'
                : 'Assign helpers, track progress, and shower the family with confetti and points as chores get done.'}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/rewards"
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-famboard-primary shadow-lg transition hover:-translate-y-0.5 hover:bg-famboard-accent hover:text-famboard-dark"
              >
                {isMemberView ? 'Check rewards you can claim' : 'Plan reward payouts'}
              </Link>
              <Link
                to="/settings"
                className="inline-flex items-center justify-center rounded-full border border-white/70 px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                Manage chores in settings
              </Link>
            </div>
          </div>
          <div className="grid w-full max-w-lg gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/15 p-4 shadow-inner backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
                {isMemberView ? 'Chores waiting for you' : 'Chores in queue'}
              </p>
              <p className="mt-2 text-3xl font-bold">{upcomingChores.length}</p>
              <p className="text-xs text-white/70">
                {isMemberView ? 'Ready when you are.' : 'Ready for a helping hand.'}
              </p>
            </div>
            <div className="rounded-2xl bg-white/15 p-4 shadow-inner backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
                {isMemberView ? 'Your completed chores' : 'Completed'}
              </p>
              <p className="mt-2 text-3xl font-bold">{completedChores.length}</p>
              <p className="text-xs text-white/70">
                {isMemberView ? 'Confetti-worthy wins already logged.' : 'Confetti-worthy moments logged.'}
              </p>
            </div>
            <div className="rounded-2xl bg-white/15 p-4 shadow-inner backdrop-blur sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
                {isMemberView ? 'Points you can spend' : 'Reward wishlist value'}
              </p>
              <p className="mt-2 text-3xl font-bold">
                {isMemberView ? selectedMember.points : `${totalPointsInRewards} pts`}
              </p>
              <p className="text-xs text-white/70">
                {isMemberView
                  ? 'Head to the rewards shelf when you’re ready to celebrate.'
                  : 'Goal points to unlock every prize.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white/85 p-8 shadow-card ring-1 ring-white/30 backdrop-blur dark:bg-slate-900/75 dark:ring-slate-800">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl space-y-2">
            <h2 className="font-display text-3xl text-slate-800 dark:text-white">Need a new chore?</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              All chore creation and editing tools now live in the admin settings so grown-ups can manage the board in one place.
            </p>
          </div>
          <Link
            to="/settings"
            className="inline-flex items-center justify-center rounded-full bg-famboard-primary px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-famboard-dark focus:outline-none focus:ring-2 focus:ring-famboard-accent focus:ring-offset-2"
          >
            Go to admin settings
          </Link>
        </div>
      </section>

      <section className="space-y-6">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-3xl text-slate-800 dark:text-white">Chore board</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Tap a card to celebrate a job well done or edit the details.</p>
          </div>
          <span className="rounded-full bg-famboard-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-famboard-primary dark:bg-sky-500/10 dark:text-sky-200">
            {isMemberView ? upcomingChores.length + completedChores.length : chores.length} total
          </span>
        </header>
        <div className="grid gap-5 xl:grid-cols-2">
          {(isMemberView ? upcomingChores.length + completedChores.length === 0 : chores.length === 0) && (
            <p className="rounded-3xl border border-dashed border-slate-300/70 bg-white/70 p-6 text-sm text-slate-500 shadow-inner dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-400">
              {isMemberView
                ? 'No chores assigned to you yet. Check back soon!'
                : 'No chores yet. Add new tasks from the settings page to kick things off.'}
            </p>
          )}
          {[...upcomingChores, ...completedChores].map((chore) => (
            <ChoreCard
              key={chore.id}
              chore={chore}
              familyMembers={familyMembers}
              onToggle={handleToggle}
              onDelete={removeChore}
              onSave={updateChore}
              canManage={!isMemberView}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
