import { useEffect, useState } from 'react'
import { useFamboard } from '../context/FamboardContext.jsx'

function MemberCard({ member, onSave, onRemove }) {
  const [name, setName] = useState(member.name)

  useEffect(() => {
    setName(member.name)
  }, [member])

  const handleSubmit = (event) => {
    event.preventDefault()
    onSave(member.id, { name: name.trim() || member.name })
  }

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-5 shadow-sm transition hover:border-famboard-primary/60 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/80">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            Family member name
          </label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
          />
        </div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Points: <span className="font-semibold text-famboard-primary dark:text-sky-300">{member.points}</span>
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="flex-1 rounded-full bg-famboard-primary px-4 py-2 text-sm font-semibold text-white shadow focus:outline-none focus:ring-2 focus:ring-famboard-accent focus:ring-offset-2"
          >
            Save name
          </button>
          <button
            type="button"
            onClick={() => onRemove(member.id)}
            className="rounded-full border border-rose-400 px-4 py-2 text-sm font-semibold text-rose-500 transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 dark:border-rose-500 dark:text-rose-300 dark:hover:bg-rose-500/10"
          >
            Remove
          </button>
        </div>
      </form>
    </div>
  )
}

export default function SettingsScreen() {
  const {
    state,
    addFamilyMember,
    updateFamilyMember,
    removeFamilyMember,
    setTheme,
    resetAll,
  } = useFamboard()
  const { familyMembers, theme } = state
  const [memberName, setMemberName] = useState('')

  const handleAddMember = (event) => {
    event.preventDefault()
    if (!memberName.trim()) return
    addFamilyMember(memberName.trim())
    setMemberName('')
  }

  const handleRemove = (id) => {
    if (
      typeof window === 'undefined' ||
      window.confirm('Remove this family member? Their chores will become unassigned.')
    ) {
      removeFamilyMember(id)
    }
  }

  const handleReset = () => {
    if (
      typeof window === 'undefined' ||
      window.confirm(
        'This will clear all chores, rewards, and points for everyone. Are you sure you want to reset?',
      )
    ) {
      resetAll()
    }
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="space-y-8 pb-16">
      <section className="rounded-3xl bg-white/80 p-6 shadow-card ring-1 ring-white/30 backdrop-blur dark:bg-slate-900/70 dark:ring-slate-800">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-2xl text-slate-800 dark:text-white">Family roster</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Add everyone who helps out and keep names up to date as kids grow.
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="self-start rounded-full bg-slate-900/10 px-4 py-2 text-sm font-semibold text-slate-700 shadow-inner transition hover:bg-slate-900/20 focus:outline-none focus:ring-2 focus:ring-famboard-primary focus:ring-offset-2 dark:bg-slate-100/10 dark:text-slate-100 dark:hover:bg-slate-100/20"
          >
            {theme === 'dark' ? 'Switch to light mode ☀️' : 'Switch to dark mode 🌙'}
          </button>
        </div>
        <form onSubmit={handleAddMember} className="mt-6 grid gap-4 md:grid-cols-[2fr_1fr]">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              New family member
            </label>
            <input
              value={memberName}
              onChange={(event) => setMemberName(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
              placeholder="Add a name"
            />
          </div>
          <button
            type="submit"
            className="rounded-2xl bg-famboard-primary px-4 py-3 text-lg font-semibold text-white shadow-lg transition hover:bg-famboard-dark focus:outline-none focus:ring-4 focus:ring-famboard-accent/50"
          >
            Add member
          </button>
        </form>
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {familyMembers.map((member) => (
            <MemberCard key={member.id} member={member} onSave={updateFamilyMember} onRemove={handleRemove} />
          ))}
          {familyMembers.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Add your family members above to start tracking points.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-3xl bg-white/80 p-6 shadow-card ring-1 ring-white/30 backdrop-blur dark:bg-slate-900/70 dark:ring-slate-800">
        <h2 className="font-display text-2xl text-slate-800 dark:text-white">Reset Famboard</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Start fresh at the beginning of a new month or chore season. This wipes points, chores, and rewards.
        </p>
        <button
          onClick={handleReset}
          className="mt-4 w-full rounded-full border border-rose-400 px-6 py-3 text-lg font-semibold text-rose-500 transition hover:bg-rose-50 focus:outline-none focus:ring-4 focus:ring-rose-200 focus:ring-offset-2 dark:border-rose-500 dark:text-rose-300 dark:hover:bg-rose-500/10"
        >
          Reset all data
        </button>
      </section>
    </div>
  )
}
