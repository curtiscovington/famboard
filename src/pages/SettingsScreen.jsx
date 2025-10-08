/* global __APP_VERSION__ */

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useFamboard } from '../context/FamboardContext.jsx'
import { getRecurrenceLabel, RECURRENCE_OPTIONS } from '../utils/recurrence.js'
import { MediaPicker } from '../components/MediaPicker.jsx'
import { MediaImage } from '../components/MediaImage.jsx'

const APP_VERSION = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : 'dev'

function MemberCard({ member, onSave, onRemove }) {
  const [name, setName] = useState(member.name)
  const [imageId, setImageId] = useState(member.imageId ?? null)
  const [imageUrl, setImageUrl] = useState(member.imageUrl ?? '')

  useEffect(() => {
    setName(member.name)
    setImageId(member.imageId ?? null)
    setImageUrl(member.imageUrl ?? '')
  }, [member])

  const handleSubmit = (event) => {
    event.preventDefault()
    onSave(member.id, {
      name: name.trim() || member.name,
      imageId,
      imageUrl: imageUrl.trim(),
    })
  }

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-5 shadow-sm transition hover:border-famboard-primary/60 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/80">
      <form onSubmit={handleSubmit} className="space-y-4">
        <MediaPicker
          label="Profile photo"
          description="Add a friendly face so kids can spot their card at a glance."
          imageId={imageId}
          imageUrl={imageUrl}
          onChange={(next) => {
            setImageId(next.imageId ?? null)
            setImageUrl(next.imageUrl ?? '')
          }}
        />
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

function RewardAdminCard({ reward, onSave, onRemove }) {
  const [form, setForm] = useState({
    title: reward.title,
    description: reward.description,
    cost: reward.cost,
    imageId: reward.imageId ?? null,
    imageUrl: reward.imageUrl ?? '',
  })

  useEffect(() => {
    setForm({
      title: reward.title,
      description: reward.description,
      cost: reward.cost,
      imageId: reward.imageId ?? null,
      imageUrl: reward.imageUrl ?? '',
    })
  }, [reward])

  const handleSubmit = (event) => {
    event.preventDefault()
    onSave(reward.id, {
      title: form.title.trim() || reward.title,
      description: form.description.trim(),
      cost: Number(form.cost) || 0,
      imageId: form.imageId ?? null,
      imageUrl: form.imageUrl.trim(),
    })
  }

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-5 shadow-sm transition hover:border-famboard-primary/60 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/80">
      <form onSubmit={handleSubmit} className="space-y-4">
        <MediaPicker
          label="Reward photo"
          description="Visual rewards help non-readers understand the prize instantly."
          imageId={form.imageId}
          imageUrl={form.imageUrl}
          onChange={(next) =>
            setForm((prev) => ({
              ...prev,
              imageId: next.imageId ?? null,
              imageUrl: next.imageUrl ?? '',
            }))
          }
        />
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Reward title
          </label>
          <input
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
            rows={3}
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Cost (points)
          </label>
          <input
            type="number"
            min="0"
            value={form.cost}
            onChange={(event) => setForm((prev) => ({ ...prev, cost: event.target.value }))}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="flex-1 rounded-full bg-famboard-primary px-4 py-2 text-sm font-semibold text-white shadow focus:outline-none focus:ring-2 focus:ring-famboard-accent focus:ring-offset-2"
          >
            Save reward
          </button>
          <button
            type="button"
            onClick={() => onRemove(reward.id)}
            className="rounded-full border border-rose-400 px-4 py-2 text-sm font-semibold text-rose-500 transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 dark:border-rose-500 dark:text-rose-300 dark:hover:bg-rose-500/10"
          >
            Remove
          </button>
        </div>
      </form>
    </div>
  )
}

function ChoreAdminCard({ chore, members, onSave, onRemove }) {
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    title: chore.title,
    description: chore.description,
    assignedTo: chore.assignedTo ?? '',
    points: chore.points,
    imageId: chore.imageId ?? null,
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
      imageId: chore.imageId ?? null,
      imageUrl: chore.imageUrl ?? '',
      recurrence: chore.recurrence ?? 'none',
      rotateAssignment: Boolean(chore.rotateAssignment),
    })
  }, [chore])

  const assignedMember = members.find((member) => member.id === chore.assignedTo)

  const handleSubmit = (event) => {
    event.preventDefault()
    onSave(chore.id, {
      title: form.title.trim() || chore.title,
      description: form.description.trim(),
      assignedTo: form.assignedTo || null,
      points: Number(form.points) || 0,
      imageId: form.imageId ?? null,
      imageUrl: form.imageUrl.trim(),
      recurrence: form.recurrence,
      rotateAssignment: form.rotateAssignment,
    })
    setIsEditing(false)
  }

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-5 shadow-sm transition hover:border-famboard-primary/60 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/80">
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <MediaPicker
            label="Chore photo"
            description="Update the title, picture, or assignment for this chore."
            imageId={form.imageId}
            imageUrl={form.imageUrl}
            onChange={(next) =>
              setForm((prev) => ({
                ...prev,
                imageId: next.imageId ?? null,
                imageUrl: next.imageUrl ?? '',
              }))
            }
          />
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Chore title</label>
            <input
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Description</label>
            <textarea
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Assign to</label>
              <select
                value={form.assignedTo}
                onChange={(event) => setForm((prev) => ({ ...prev, assignedTo: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
                disabled={form.rotateAssignment && members.length <= 1}
              >
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
              {form.rotateAssignment && (
                <p className="text-xs text-slate-400 dark:text-slate-500">Assignment rotates automatically.</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Points</label>
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
                  id={`admin-rotate-${chore.id}`}
                  type="checkbox"
                  checked={form.rotateAssignment}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      rotateAssignment: event.target.checked,
                      assignedTo:
                        event.target.checked && members.length === 0 ? '' : prev.assignedTo,
                    }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-famboard-primary focus:ring-famboard-primary"
                />
                <label htmlFor={`admin-rotate-${chore.id}`} className="flex-1 cursor-pointer select-none">
                  Rotate between family members
                </label>
              </div>
              {form.rotateAssignment && members.length === 0 && (
                <p className="text-xs text-rose-500">Add family members to enable rotation.</p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="flex-1 rounded-full bg-famboard-primary px-4 py-2 text-sm font-semibold text-white shadow focus:outline-none focus:ring-2 focus:ring-famboard-accent focus:ring-offset-2"
            >
              Save chore
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
              {chore.imageId ? (
                <MediaImage
                  mediaId={chore.imageId}
                  alt={chore.title}
                  className="h-full w-full object-cover"
                  fallback={<div className="flex h-full w-full items-center justify-center text-3xl">🧽</div>}
                />
              ) : chore.imageUrl ? (
                <img src={chore.imageUrl} alt={chore.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl">🧽</div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{chore.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{chore.description || 'Add a description to guide helpers.'}</p>
                </div>
                <span className="rounded-full bg-famboard-primary/10 px-3 py-1 text-sm font-semibold text-famboard-primary dark:bg-sky-400/10 dark:text-sky-200">
                  {chore.points} pts
                </span>
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
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Edit chore
            </button>
            <button
              onClick={() => onRemove(chore.id)}
              className="rounded-full border border-rose-400 px-4 py-2 text-sm font-semibold text-rose-500 transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 dark:border-rose-500 dark:text-rose-300 dark:hover:bg-rose-500/10"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SettingsScreen() {
  const {
    state,
    addFamilyMember,
    updateFamilyMember,
    removeFamilyMember,
    addReward,
    updateReward,
    removeReward,
    addChore,
    updateChore,
    removeChore,
    setTheme,
    resetAll,
  } = useFamboard()
  const { familyMembers, rewards, chores, theme } = state
  const [memberName, setMemberName] = useState('')
  const [memberImageUrl, setMemberImageUrl] = useState('')
  const [memberImageId, setMemberImageId] = useState(null)
  const [rewardForm, setRewardForm] = useState({
    title: '',
    description: '',
    cost: 20,
    imageId: null,
    imageUrl: '',
  })
  const [choreForm, setChoreForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    points: 10,
    imageId: null,
    imageUrl: '',
    recurrence: 'none',
    rotateAssignment: false,
  })

  const totalPoints = useMemo(
    () => familyMembers.reduce((sum, member) => sum + member.points, 0),
    [familyMembers],
  )

  const averageRewardCost = useMemo(() => {
    if (rewards.length === 0) return 0
    const totalCost = rewards.reduce((sum, reward) => sum + reward.cost, 0)
    return Math.round(totalCost / rewards.length)
  }, [rewards])

  const handleAddMember = (event) => {
    event.preventDefault()
    if (!memberName.trim()) return
    addFamilyMember({
      name: memberName.trim(),
      imageId: memberImageId,
      imageUrl: memberImageUrl.trim(),
    })
    setMemberName('')
    setMemberImageId(null)
    setMemberImageUrl('')
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

  const handleCreateReward = (event) => {
    event.preventDefault()
    if (!rewardForm.title.trim()) return
    addReward({
      title: rewardForm.title.trim(),
      description: rewardForm.description.trim(),
      cost: Number(rewardForm.cost) || 0,
      imageId: rewardForm.imageId ?? null,
      imageUrl: rewardForm.imageUrl.trim(),
    })
    setRewardForm({ title: '', description: '', cost: 20, imageId: null, imageUrl: '' })
  }

  const handleCreateChore = (event) => {
    event.preventDefault()
    if (!choreForm.title.trim()) return
    addChore({
      title: choreForm.title.trim(),
      description: choreForm.description.trim(),
      assignedTo: choreForm.assignedTo || null,
      points: Number(choreForm.points) || 0,
      imageId: choreForm.imageId ?? null,
      imageUrl: choreForm.imageUrl.trim(),
      recurrence: choreForm.recurrence,
      rotateAssignment: choreForm.rotateAssignment,
    })
    setChoreForm({
      title: '',
      description: '',
      assignedTo: '',
      points: 10,
      imageUrl: '',
      recurrence: 'none',
      rotateAssignment: false,
    })
    setChoreForm({
      title: '',
      description: '',
      assignedTo: '',
      points: 10,
      imageId: null,
      imageUrl: '',
    })
  }

  const handleRemoveChore = (id) => {
    if (
      typeof window === 'undefined' ||
      window.confirm('Remove this chore? Kids will no longer see it on their lists.')
    ) {
      removeChore(id)
    }
  }

  return (
    <div className="space-y-10 pb-16">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-famboard-primary via-sky-500 to-rose-500 p-8 text-white shadow-xl">
        <div className="absolute -left-24 top-12 h-60 w-60 rounded-full bg-white/10 blur-3xl" aria-hidden />
        <div className="absolute -right-16 -bottom-12 h-64 w-64 rounded-full bg-rose-400/30 blur-3xl" aria-hidden />
        <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/70">Control center</p>
            <h1 className="font-display text-4xl leading-tight sm:text-5xl">Tune your Famboard to match your family vibe</h1>
            <p className="text-base text-white/80">
              Update members, craft rewards, and reset the board when it’s time for a fresh season of teamwork.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={toggleTheme}
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-famboard-primary shadow-lg transition hover:-translate-y-0.5 hover:bg-famboard-accent hover:text-famboard-dark"
              >
                {theme === 'dark' ? 'Switch to light mode ☀️' : 'Switch to dark mode 🌙'}
              </button>
              <Link
                to="/rewards"
                className="inline-flex items-center justify-center rounded-full border border-white/70 px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                Preview rewards
              </Link>
            </div>
          </div>
          <div className="grid w-full max-w-lg gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/15 p-4 shadow-inner backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Family members</p>
              <p className="mt-2 text-3xl font-bold">{familyMembers.length}</p>
              <p className="text-xs text-white/70">Currently on the roster.</p>
            </div>
            <div className="rounded-2xl bg-white/15 p-4 shadow-inner backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Rewards crafted</p>
              <p className="mt-2 text-3xl font-bold">{rewards.length}</p>
              <p className="text-xs text-white/70">Ready to motivate everyone.</p>
            </div>
            <div className="rounded-2xl bg-white/15 p-4 shadow-inner backdrop-blur sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Points in circulation</p>
              <p className="mt-2 text-3xl font-bold">{totalPoints}</p>
              <p className="text-xs text-white/70">Average reward cost {averageRewardCost} pts.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white/85 p-8 shadow-card ring-1 ring-white/30 backdrop-blur dark:bg-slate-900/75 dark:ring-slate-800">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-3xl text-slate-800 dark:text-white">Family roster</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Add everyone who helps out and keep names up to date as kids grow.
            </p>
          </div>
          <span className="rounded-full bg-famboard-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-famboard-primary dark:bg-sky-500/10 dark:text-sky-200">
            Team management
          </span>
        </header>
        <form onSubmit={handleAddMember} className="mt-6 grid gap-4 md:grid-cols-[2fr_3fr_1fr]">
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
          <div className="md:col-span-1">
            <MediaPicker
              label="Photo"
              description="Optional: add a photo or favorite character for quick recognition."
              imageId={memberImageId}
              imageUrl={memberImageUrl}
              onChange={(next) => {
                setMemberImageId(next.imageId ?? null)
                setMemberImageUrl(next.imageUrl ?? '')
              }}
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

      <section className="rounded-3xl bg-white/85 p-8 shadow-card ring-1 ring-white/30 backdrop-blur dark:bg-slate-900/75 dark:ring-slate-800">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl space-y-2">
            <h2 className="font-display text-3xl text-slate-800 dark:text-white">Chore workshop</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Create new chores, adjust assignments, and remove tasks that have run their course. Kids will see updates instantly in their view.
            </p>
          </div>
          <p className="rounded-full bg-famboard-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-famboard-primary dark:bg-sky-500/10 dark:text-sky-200">
            Admin tools
          </p>
        </div>
        <form onSubmit={handleCreateChore} className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Chore title</label>
            <input
              value={choreForm.title}
              onChange={(event) => setChoreForm((prev) => ({ ...prev, title: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
              placeholder="Tidy the playroom"
              required
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Description</label>
            <textarea
              value={choreForm.description}
              onChange={(event) => setChoreForm((prev) => ({ ...prev, description: event.target.value }))}
              className="min-h-[140px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
              placeholder="List the steps so everyone knows what finished looks like."
            />
          </div>
          <div className="md:col-span-2">
            <MediaPicker
              label="Chore photo"
              description="Add a helpful visual so kids recognize the task."
              imageId={choreForm.imageId}
              imageUrl={choreForm.imageUrl}
              onChange={(next) =>
                setChoreForm((prev) => ({
                  ...prev,
                  imageId: next.imageId ?? null,
                  imageUrl: next.imageUrl ?? '',
                }))
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Assign to</label>
            <select
              value={choreForm.assignedTo}
              onChange={(event) => setChoreForm((prev) => ({ ...prev, assignedTo: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
              disabled={choreForm.rotateAssignment && familyMembers.length <= 1}
            >
              <option value="">Unassigned</option>
              {familyMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
            {choreForm.rotateAssignment && (
              <p className="text-xs text-slate-400 dark:text-slate-500">Assignment rotates automatically.</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Points</label>
            <input
              type="number"
              min="0"
              value={choreForm.points}
              onChange={(event) => setChoreForm((prev) => ({ ...prev, points: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Repeats</label>
            <select
              value={choreForm.recurrence}
              onChange={(event) => setChoreForm((prev) => ({ ...prev, recurrence: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
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
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-inner dark:border-slate-700 dark:bg-slate-900">
              <input
                id="new-chore-rotate"
                type="checkbox"
                checked={choreForm.rotateAssignment}
                onChange={(event) =>
                  setChoreForm((prev) => ({
                    ...prev,
                    rotateAssignment: event.target.checked,
                    assignedTo:
                      event.target.checked && familyMembers.length === 0 ? '' : prev.assignedTo,
                  }))
                }
                className="h-4 w-4 rounded border-slate-300 text-famboard-primary focus:ring-famboard-primary"
              />
              <label htmlFor="new-chore-rotate" className="flex-1 cursor-pointer select-none">
                Rotate between family members
              </label>
            </div>
            {choreForm.rotateAssignment && familyMembers.length === 0 && (
              <p className="text-xs text-rose-500">Add family members to enable rotation.</p>
            )}
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full rounded-full bg-emerald-500 px-6 py-3 text-lg font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-300/70"
            >
              Add chore
            </button>
          </div>
        </form>
        <div className="mt-8 grid gap-5 xl:grid-cols-2">
          {chores.map((chore) => (
            <ChoreAdminCard key={chore.id} chore={chore} members={familyMembers} onSave={updateChore} onRemove={handleRemoveChore} />
          ))}
          {chores.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-300/70 bg-white/60 p-6 text-sm text-slate-500 shadow-inner dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-400">
              No chores yet—add your first task above to populate the board.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-3xl bg-white/85 p-8 shadow-card ring-1 ring-white/30 backdrop-blur dark:bg-slate-900/75 dark:ring-slate-800">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl space-y-2">
            <h2 className="font-display text-3xl text-slate-800 dark:text-white">Reward workshop</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Curate the experiences your family works toward. Update descriptions, adjust point costs, and remove retired ideas.
            </p>
          </div>
          <p className="rounded-full bg-famboard-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-famboard-primary dark:bg-sky-500/10 dark:text-sky-200">
            Admin tools
          </p>
        </div>
        <form onSubmit={handleCreateReward} className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Reward title</label>
            <input
              value={rewardForm.title}
              onChange={(event) => setRewardForm((prev) => ({ ...prev, title: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
              placeholder="Family movie marathon"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Description</label>
            <textarea
              value={rewardForm.description}
              onChange={(event) => setRewardForm((prev) => ({ ...prev, description: event.target.value }))}
              className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
              placeholder="Add the cozy details or rules that make this reward special."
            />
          </div>
          <div className="md:col-span-2">
            <MediaPicker
              label="Reward photo"
              description="Show what the reward looks like so little ones know what they are earning."
              imageId={rewardForm.imageId}
              imageUrl={rewardForm.imageUrl}
              onChange={(next) =>
                setRewardForm((prev) => ({
                  ...prev,
                  imageId: next.imageId ?? null,
                  imageUrl: next.imageUrl ?? '',
                }))
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Cost (points)</label>
            <input
              type="number"
              min="0"
              value={rewardForm.cost}
              onChange={(event) => setRewardForm((prev) => ({ ...prev, cost: event.target.value }))}
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
        <div className="mt-8 grid gap-5 xl:grid-cols-2">
          {rewards.map((reward) => (
            <RewardAdminCard key={reward.id} reward={reward} onSave={updateReward} onRemove={removeReward} />
          ))}
          {rewards.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-300/70 bg-white/60 p-6 text-sm text-slate-500 shadow-inner dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-400">
              No rewards yet—add your first idea above to populate the reward shelf.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-3xl bg-white/85 p-8 shadow-card ring-1 ring-white/30 backdrop-blur dark:bg-slate-900/75 dark:ring-slate-800">
        <h2 className="font-display text-3xl text-slate-800 dark:text-white">Reset Famboard</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Start fresh at the beginning of a new month or chore season. This wipes points, chores, and rewards.
        </p>
        <button
          onClick={handleReset}
          className="mt-6 w-full rounded-full border border-rose-400 px-6 py-3 text-lg font-semibold text-rose-500 transition hover:-translate-y-0.5 hover:bg-rose-50 focus:outline-none focus:ring-4 focus:ring-rose-200 focus:ring-offset-2 dark:border-rose-500 dark:text-rose-300 dark:hover:bg-rose-500/10"
        >
          Reset all data
        </button>
        <p className="mt-6 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
          App version <span className="font-semibold text-slate-600 dark:text-slate-300">{APP_VERSION}</span>
        </p>
      </section>
    </div>
  )
}
