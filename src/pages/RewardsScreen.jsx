import { useEffect, useState } from 'react'
import { useFamboard } from '../context/FamboardContext.jsx'

function RewardCard({ reward, members, onRedeem, onDelete, onSave }) {
  const [selectedMember, setSelectedMember] = useState(members[0]?.id ?? '')
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    title: reward.title,
    description: reward.description,
    cost: reward.cost,
  })

  useEffect(() => {
    setForm({
      title: reward.title,
      description: reward.description,
      cost: reward.cost,
    })
  }, [reward])

  useEffect(() => {
    if (members.length === 0) {
      setSelectedMember('')
      return
    }
    if (!members.find((member) => member.id === selectedMember)) {
      setSelectedMember(members[0].id)
    }
  }, [members, selectedMember])

  const canRedeem = selectedMember
    ? (members.find((member) => member.id === selectedMember)?.points ?? 0) >= reward.cost
    : false

  const handleSubmit = (event) => {
    event.preventDefault()
    onSave(reward.id, {
      title: form.title.trim(),
      description: form.description.trim(),
      cost: Number(form.cost) || 0,
    })
    setIsEditing(false)
  }

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-5 shadow-sm transition hover:border-famboard-primary/60 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/80">
      {isEditing ? (
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Reward title
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
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Cost (points)
            </label>
            <input
              type="number"
              min="0"
              value={form.cost}
              onChange={(event) => setForm((prev) => ({ ...prev, cost: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 rounded-full bg-famboard-primary px-4 py-2 text-sm font-semibold text-white shadow focus:outline-none focus:ring-2 focus:ring-famboard-accent focus:ring-offset-2"
            >
              Save reward
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
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                {reward.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {reward.description || 'Add a fun description to get everyone excited!'}
              </p>
            </div>
            <span className="rounded-full bg-famboard-accent/20 px-3 py-1 text-sm font-semibold text-famboard-dark dark:bg-amber-400/20 dark:text-amber-200">
              {reward.cost} pts
            </span>
          </div>
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Redeem for
            </label>
            <select
              value={selectedMember}
              onChange={(event) => setSelectedMember(event.target.value)}
              className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
            >
              {members.length === 0 && <option value="">Add family members first</option>}
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} · {member.points} pts
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => selectedMember && onRedeem(selectedMember, reward.id)}
              disabled={!canRedeem}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold text-white shadow focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                canRedeem
                  ? 'bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-400'
                  : 'bg-slate-400 focus:ring-slate-300'
              }`}
            >
              Redeem reward
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(reward.id)}
              className="rounded-full border border-rose-400 px-4 py-2 text-sm font-semibold text-rose-500 transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 dark:border-rose-500 dark:text-rose-300 dark:hover:bg-rose-500/10"
            >
              Delete
            </button>
          </div>
          {!canRedeem && selectedMember && (
            <p className="text-xs font-medium text-rose-500 dark:text-rose-300">
              {members.find((member) => member.id === selectedMember)?.name ?? 'They'}
              {' needs more points to redeem this reward.'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default function RewardsScreen() {
  const { state, addReward, redeemReward, removeReward, updateReward } = useFamboard()
  const { familyMembers, rewards } = state
  const [form, setForm] = useState({
    title: '',
    description: '',
    cost: 20,
  })

  const handleCreate = (event) => {
    event.preventDefault()
    if (!form.title.trim()) return
    addReward({
      title: form.title.trim(),
      description: form.description.trim(),
      cost: Number(form.cost) || 0,
    })
    setForm({ title: '', description: '', cost: 20 })
  }

  return (
    <div className="space-y-8 pb-16">
      <section className="rounded-3xl bg-white/80 p-6 shadow-card ring-1 ring-white/30 backdrop-blur dark:bg-slate-900/70 dark:ring-slate-800">
        <h2 className="font-display text-2xl text-slate-800 dark:text-white">
          Dream up a new reward
        </h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Celebrate wins with experiences and treats worth working toward.
        </p>
        <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Reward title
            </label>
            <input
              required
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-lg shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
              placeholder="Family game night"
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
              placeholder="Include all the fun details that make this reward special."
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Cost (points)
            </label>
            <input
              type="number"
              min="0"
              value={form.cost}
              onChange={(event) => setForm((prev) => ({ ...prev, cost: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full rounded-full bg-emerald-500 px-6 py-3 text-lg font-semibold text-white shadow-lg transition hover:bg-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-300/70"
            >
              Add reward
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-6">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h2 className="font-display text-2xl text-slate-800 dark:text-white">
            Reward shelf
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Pick who redeems the reward and the points will update instantly.
          </p>
        </header>
        <div className="grid gap-4 xl:grid-cols-2">
          {rewards.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Add your first reward above to get everyone motivated.
            </p>
          )}
          {rewards.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              members={familyMembers}
              onRedeem={redeemReward}
              onDelete={removeReward}
              onSave={updateReward}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
