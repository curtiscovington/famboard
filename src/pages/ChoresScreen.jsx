import { useEffect, useMemo, useState } from 'react'
import { useFamboard } from '../context/FamboardContext.jsx'
import { launchConfetti } from '../utils/confetti.js'

function ChoreCard({ chore, familyMembers, onToggle, onDelete, onSave }) {
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    title: chore.title,
    description: chore.description,
    assignedTo: chore.assignedTo ?? '',
    points: chore.points,
  })

  useEffect(() => {
    setForm({
      title: chore.title,
      description: chore.description,
      assignedTo: chore.assignedTo ?? '',
      points: chore.points,
    })
  }, [chore])

  const assignedMember = familyMembers.find((member) => member.id === chore.assignedTo)

  const handleSubmit = (event) => {
    event.preventDefault()
    onSave(chore.id, {
      title: form.title.trim(),
      description: form.description.trim(),
      assignedTo: form.assignedTo || null,
      points: Number(form.points) || 0,
    })
    setIsEditing(false)
  }

  const handleToggle = () => {
    onToggle(chore.id, chore.completed)
  }

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-5 shadow-sm transition hover:border-famboard-primary/60 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/80">
      {isEditing ? (
        <form className="space-y-3" onSubmit={handleSubmit}>
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
              >
                <option value="">Unassigned</option>
                {familyMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
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
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {assignedMember ? `Assigned to ${assignedMember.name}` : 'Unassigned'}
          </p>
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
          </div>
        </div>
      )}
    </div>
  )
}

export default function ChoresScreen() {
  const { state, addChore, toggleChoreComplete, removeChore, updateChore } = useFamboard()
  const { familyMembers, chores } = state
  const [form, setForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    points: 10,
  })

  const upcomingChores = useMemo(
    () => chores.filter((chore) => !chore.completed),
    [chores],
  )
  const completedChores = useMemo(
    () => chores.filter((chore) => chore.completed),
    [chores],
  )

  const handleCreate = (event) => {
    event.preventDefault()
    if (!form.title.trim()) return
    addChore({
      title: form.title.trim(),
      description: form.description.trim(),
      assignedTo: form.assignedTo || null,
      points: Number(form.points) || 0,
    })
    setForm({ title: '', description: '', assignedTo: '', points: 10 })
  }

  const handleToggle = (id, wasCompleted) => {
    toggleChoreComplete(id)
    if (!wasCompleted) {
      launchConfetti()
    }
  }

  return (
    <div className="space-y-8 pb-16">
      <section className="rounded-3xl bg-white/80 p-6 shadow-card ring-1 ring-white/30 backdrop-blur dark:bg-slate-900/70 dark:ring-slate-800">
        <h2 className="font-display text-2xl text-slate-800 dark:text-white">
          Add a new chore
        </h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Create bite-sized tasks and award generous points to keep spirits high.
        </p>
        <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Chore title
            </label>
            <input
              required
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-lg shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
              placeholder="Tidy the playroom"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
              placeholder="List the steps so everyone knows what finished looks like."
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Assign to
            </label>
            <select
              value={form.assignedTo}
              onChange={(event) => setForm((prev) => ({ ...prev, assignedTo: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="">Unassigned</option>
              {familyMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
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
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full rounded-full bg-famboard-primary px-6 py-3 text-lg font-semibold text-white shadow-lg transition hover:bg-famboard-dark focus:outline-none focus:ring-4 focus:ring-famboard-accent/60"
            >
              Add chore
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-6">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h2 className="font-display text-2xl text-slate-800 dark:text-white">
            Chore board
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tap a chore to celebrate a job well done or adjust the details anytime.
          </p>
        </header>
        <div className="grid gap-4 xl:grid-cols-2">
          {chores.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No chores yet. Add one above to kick things off.
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
            />
          ))}
        </div>
      </section>
    </div>
  )
}
