/* global __APP_VERSION__ */

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useFamboard } from '../context/FamboardContext.jsx'
import { getRecurrenceLabel, RECURRENCE_OPTIONS } from '../utils/recurrence.js'
import { MediaPicker } from '../components/MediaPicker.jsx'
import { MediaImage } from '../components/MediaImage.jsx'
import { IdeaGallery } from '../components/IdeaGallery.jsx'
import {
  formatDateForInput,
  formatDateLabel,
  parseInputDateToISO,
  toStartOfDayISOString,
} from '../utils/date.js'
import {
  DEFAULT_PIN_ITERATIONS,
  derivePinHash,
  generatePinSalt,
  verifyPin,
} from '../utils/pin.js'
import { CHORE_IDEAS, REWARD_IDEAS } from '../data/ideaDecks.js'
import { formatMemberNameList, getAssignedMemberIds } from '../utils/choreAssignments.js'
import { ROUTES } from '../constants/routes.js'

const APP_VERSION = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : 'dev'
const PIN_REQUIREMENT_OVERRIDE = import.meta.env.VITE_REQUIRE_SETTINGS_PIN
const SHOULD_REQUIRE_SETTINGS_PIN =
  PIN_REQUIREMENT_OVERRIDE === 'true'
    ? true
    : PIN_REQUIREMENT_OVERRIDE === 'false'
      ? false
      : import.meta.env.PROD

const mapRewardToFormState = (reward) => ({
  title: reward.title,
  description: reward.description,
  cost: reward.cost,
  imageId: reward.imageId ?? null,
  imageUrl: reward.imageUrl ?? '',
})

function MemberCard({ member, onSave, onRemove }) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(member.name)
  const [imageId, setImageId] = useState(member.imageId ?? null)
  const [imageUrl, setImageUrl] = useState(member.imageUrl ?? '')

  useEffect(() => {
    setName(member.name)
    setImageId(member.imageId ?? null)
    setImageUrl(member.imageUrl ?? '')
    setIsEditing(false)
  }, [member])

  const resetForm = () => {
    setName(member.name)
    setImageId(member.imageId ?? null)
    setImageUrl(member.imageUrl ?? '')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSave(member.id, {
      name: name.trim() || member.name,
      imageId,
      imageUrl: imageUrl.trim(),
    })
    setIsEditing(false)
  }

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-5 shadow-sm transition hover:border-famboard-primary/60 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/80">
      {isEditing ? (
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
              Save member
            </button>
            <button
              type="button"
              onClick={() => {
                resetForm()
                setIsEditing(false)
              }}
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
              {member.imageId ? (
                <MediaImage
                  mediaId={member.imageId}
                  alt={member.name}
                  className="h-full w-full object-cover"
                  fallback={<div className="flex h-full w-full items-center justify-center text-3xl">🙂</div>}
                />
              ) : member.imageUrl ? (
                <img src={member.imageUrl} alt={member.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl">🙂</div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{member.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Keep their profile updated so kids can spot their card in a snap.
              </p>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Points: <span className="font-semibold text-famboard-primary dark:text-sky-300">{member.points}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                resetForm()
                setIsEditing(true)
              }}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Edit member
            </button>
            <button
              onClick={() => onRemove(member.id)}
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

function RewardAdminCard({ reward, onSave, onRemove }) {
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState(mapRewardToFormState(reward))

  useEffect(() => {
    setForm(mapRewardToFormState(reward))
    setIsEditing(false)
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
    setIsEditing(false)
  }

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-5 shadow-sm transition hover:border-famboard-primary/60 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/80">
      {isEditing ? (
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
              onClick={() => {
                setForm(mapRewardToFormState(reward))
                setIsEditing(false)
              }}
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
              {reward.imageId ? (
                <MediaImage
                  mediaId={reward.imageId}
                  alt={reward.title}
                  className="h-full w-full object-cover"
                  fallback={<div className="flex h-full w-full items-center justify-center text-3xl">🎉</div>}
                />
              ) : reward.imageUrl ? (
                <img src={reward.imageUrl} alt={reward.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl">🎉</div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{reward.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {reward.description || 'Add a description so kids know exactly what they earned.'}
                  </p>
                </div>
                <span className="rounded-full bg-famboard-primary/10 px-3 py-1 text-sm font-semibold text-famboard-primary dark:bg-sky-400/10 dark:text-sky-200">
                  {reward.cost} pts
                </span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Keep rewards fresh to keep helpers motivated.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setForm(mapRewardToFormState(reward))
                setIsEditing(true)
              }}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Edit reward
            </button>
            <button
              onClick={() => onRemove(reward.id)}
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

function ChoreAdminCard({ chore, members, onSave, onRemove }) {
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    title: chore.title,
    description: chore.description,
    assignedTo: getAssignedMemberIds(chore),
    points: chore.points,
    imageId: chore.imageId ?? null,
    imageUrl: chore.imageUrl ?? '',
    recurrence: chore.recurrence ?? 'none',
    rotateAssignment: Boolean(chore.rotateAssignment),
    scheduleAnchor: formatDateForInput(chore.schedule?.anchorDate ?? toStartOfDayISOString(new Date())),
  })

  useEffect(() => {
    setForm({
      title: chore.title,
      description: chore.description,
      assignedTo: getAssignedMemberIds(chore),
      points: chore.points,
      imageId: chore.imageId ?? null,
      imageUrl: chore.imageUrl ?? '',
      recurrence: chore.recurrence ?? 'none',
      rotateAssignment: Boolean(chore.rotateAssignment),
      scheduleAnchor: formatDateForInput(chore.schedule?.anchorDate ?? toStartOfDayISOString(new Date())),
    })
  }, [chore])

  const assignedMembers = getAssignedMemberIds(chore)
    .map((id) => members.find((member) => member.id === id))
    .filter(Boolean)
  const assignedLabel = assignedMembers.length
    ? formatMemberNameList(assignedMembers.map((member) => member.name))
    : 'Unassigned'

  const handleSubmit = (event) => {
    event.preventDefault()
    onSave(chore.id, {
      title: form.title.trim() || chore.title,
      description: form.description.trim(),
      assignedTo: [...form.assignedTo],
      points: Number(form.points) || 0,
      imageId: form.imageId ?? null,
      imageUrl: form.imageUrl.trim(),
      recurrence: form.recurrence,
      rotateAssignment: form.rotateAssignment,
      schedule: {
        anchorDate: parseInputDateToISO(form.scheduleAnchor, chore.schedule?.anchorDate),
        allDay: true,
      },
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
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Assign to</label>
              <div className="flex flex-wrap gap-2">
                {members.length === 0 && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Add family members to assign this chore.
                  </p>
                )}
                {members.map((member) => {
                  const isChecked = form.assignedTo.includes(member.id)
                  return (
                    <label
                      key={member.id}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition ${
                        isChecked
                          ? 'border-famboard-primary bg-famboard-primary/10 text-famboard-primary dark:border-sky-500 dark:bg-sky-500/10 dark:text-sky-200'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-famboard-primary/40 hover:bg-famboard-primary/5 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-famboard-primary focus:ring-famboard-primary dark:border-slate-600"
                        checked={isChecked}
                        onChange={() =>
                          setForm((prev) => {
                            const current = new Set(prev.assignedTo)
                            if (current.has(member.id)) {
                              current.delete(member.id)
                            } else {
                              current.add(member.id)
                            }
                            const nextAssigned = Array.from(current)
                            return {
                              ...prev,
                              assignedTo: nextAssigned,
                              rotateAssignment: nextAssigned.length > 1 ? false : prev.rotateAssignment,
                            }
                          })
                        }
                      />
                      <span>{member.name}</span>
                    </label>
                  )
                })}
                {form.assignedTo.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        assignedTo: [],
                      }))
                    }
                    className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Clear
                  </button>
                )}
              </div>
              {form.rotateAssignment && form.assignedTo.length <= 1 && (
                <p className="text-xs text-slate-400 dark:text-slate-500">Assignment rotates automatically.</p>
              )}
              {form.assignedTo.length > 1 && (
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Rotation is disabled while multiple helpers are selected.
                </p>
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
                        event.target.checked && prev.assignedTo.length === 0 && members.length > 0
                          ? [members[0].id]
                          : prev.assignedTo,
                    }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-famboard-primary focus:ring-famboard-primary"
                  disabled={form.assignedTo.length > 1 || members.length <= 1}
                />
                <label htmlFor={`admin-rotate-${chore.id}`} className="flex-1 cursor-pointer select-none">
                  Rotate between family members
                </label>
              </div>
              {form.rotateAssignment && members.length === 0 && (
                <p className="text-xs text-rose-500">Add family members to enable rotation.</p>
              )}
              {form.assignedTo.length > 1 && (
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Select one helper to re-enable rotation.
                </p>
              )}
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Starts on</label>
              <input
                type="date"
                value={form.scheduleAnchor}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    scheduleAnchor: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
              />
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Align this anchor date with your household calendar so sync exports stay accurate.
              </p>
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
                {assignedMembers.length ? `Assigned to ${assignedLabel}` : 'Unassigned'}
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
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Starts {formatDateLabel(chore.schedule?.anchorDate, { month: 'short', day: 'numeric', year: 'numeric' }) || 'soon'}
              </p>
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
    isHydrated,
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
    setSettingsPin,
  } = useFamboard()
  const { familyMembers, rewards, chores, theme, settingsPin } = state
  const [isUnlocked, setIsUnlocked] = useState(!SHOULD_REQUIRE_SETTINGS_PIN)
  const [pinEntry, setPinEntry] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [pinHint, setPinHint] = useState('')
  const [pinError, setPinError] = useState('')
  const [pinLoading, setPinLoading] = useState(false)
  const [showChangePin, setShowChangePin] = useState(false)
  const [changePinForm, setChangePinForm] = useState({ current: '', next: '', confirm: '', hint: '' })
  const [changePinError, setChangePinError] = useState('')
  const [changePinLoading, setChangePinLoading] = useState(false)
  const [memberName, setMemberName] = useState('')
  const [memberImageUrl, setMemberImageUrl] = useState('')
  const [memberImageId, setMemberImageId] = useState(null)
  const [creationTab, setCreationTab] = useState('family')
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
    assignedTo: [],
    points: 10,
    imageId: null,
    imageUrl: '',
    recurrence: 'none',
    rotateAssignment: false,
    scheduleAnchor: formatDateForInput(toStartOfDayISOString(new Date())),
  })

  useEffect(() => {
    if (!showChangePin) return
    setChangePinForm({
      current: '',
      next: '',
      confirm: '',
      hint: settingsPin?.hint ?? '',
    })
    setChangePinError('')
  }, [showChangePin, settingsPin])

  const handleVerifyPin = async (event) => {
    event.preventDefault()
    if (pinLoading) return
    if (!settingsPin) return

    setPinError('')
    setPinLoading(true)

    try {
      const input = pinEntry.trim()
      if (!input) {
        setPinError('Enter your PIN to unlock the settings.')
        return
      }
      if (input.length < 4) {
        setPinError('PINs are at least 4 digits long.')
        return
      }
      if (!/^\d+$/.test(input)) {
        setPinError('PINs use digits only.')
        setPinEntry('')
        return
      }

      const isValid = await verifyPin(input, settingsPin)
      if (!isValid) {
        setPinError('That PIN did not match. Try again or check your hint.')
        setPinEntry('')
        return
      }

      setIsUnlocked(true)
      setPinEntry('')
      setPinError('')
    } catch (error) {
      console.error('Unable to verify PIN', error)
      setPinError('We could not verify the PIN on this device. Try updating your browser.')
    } finally {
      setPinLoading(false)
    }
  }

  const handleSetupPin = async (event) => {
    event.preventDefault()
    if (pinLoading) return

    setPinError('')

    const basePin = newPin.trim()
    const confirmed = confirmPin.trim()
    if (basePin.length < 4) {
      setPinError('Choose a PIN with at least 4 digits so it is harder to guess.')
      return
    }
    if (!/^\d+$/.test(basePin)) {
      setPinError('For now PINs must use digits only.')
      return
    }
    if (basePin !== confirmed) {
      setPinError('Your PIN entries need to match before we can save them.')
      return
    }

    setPinLoading(true)

    try {
      const salt = generatePinSalt()
      const hash = await derivePinHash(basePin, salt, DEFAULT_PIN_ITERATIONS)
      setSettingsPin({
        salt,
        hash,
        iterations: DEFAULT_PIN_ITERATIONS,
        hint: pinHint.trim(),
        createdAt: new Date().toISOString(),
      })
      setIsUnlocked(true)
      setNewPin('')
      setConfirmPin('')
      setPinHint('')
    } catch (error) {
      console.error('Unable to set PIN', error)
      setPinError('We could not save that PIN. Make sure this browser supports secure storage.')
    } finally {
      setPinLoading(false)
    }
  }

  const handleChangePin = async (event) => {
    event.preventDefault()
    if (changePinLoading) return
    if (!settingsPin) return

    setChangePinError('')

    const current = changePinForm.current.trim()
    const next = changePinForm.next.trim()
    const confirmation = changePinForm.confirm.trim()

    if (!current) {
      setChangePinError('Enter your current PIN to make a change.')
      return
    }
    if (next.length < 4) {
      setChangePinError('The new PIN needs at least 4 digits.')
      return
    }
    if (!/^\d+$/.test(next)) {
      setChangePinError('The new PIN must use digits only.')
      return
    }
    if (next !== confirmation) {
      setChangePinError('The new PIN entries must match.')
      return
    }

    setChangePinLoading(true)

    try {
      const isValid = await verifyPin(current, settingsPin)
      if (!isValid) {
        setChangePinError('That current PIN was incorrect.')
        return
      }

      const salt = generatePinSalt()
      const hash = await derivePinHash(next, salt, DEFAULT_PIN_ITERATIONS)
      setSettingsPin({
        salt,
        hash,
        iterations: DEFAULT_PIN_ITERATIONS,
        hint: changePinForm.hint.trim(),
        updatedAt: new Date().toISOString(),
      })
      setShowChangePin(false)
    } catch (error) {
      console.error('Unable to update PIN', error)
      setChangePinError('We could not update the PIN. Try again on a modern browser.')
    } finally {
      setChangePinLoading(false)
    }
  }

  const totalPoints = useMemo(
    () => familyMembers.reduce((sum, member) => sum + member.points, 0),
    [familyMembers],
  )

  const averageRewardCost = useMemo(() => {
    if (rewards.length === 0) return 0
    const totalCost = rewards.reduce((sum, reward) => sum + reward.cost, 0)
    return Math.round(totalCost / rewards.length)
  }, [rewards])

  const choreIdeaCards = useMemo(
    () =>
      CHORE_IDEAS.map((idea) => ({
        ...idea,
        badge: `${idea.points} pts`,
        meta: [
          getRecurrenceLabel(idea.recurrence ?? 'none'),
          idea.rotateAssignment ? 'Rotates helpers' : null,
        ]
          .filter(Boolean)
          .join(' • '),
      })),
    [],
  )

  const rewardIdeaCards = useMemo(
    () =>
      REWARD_IDEAS.map((idea) => ({
        ...idea,
        badge: `${idea.cost} pts`,
        meta: idea.tag,
      })),
    [],
  )

  const handleApplyChoreIdea = (idea) => {
    setCreationTab('chore')
    setChoreForm((prev) => {
      const assigned = Array.isArray(idea.assignedTo)
        ? idea.assignedTo
        : idea.assignedTo
          ? [idea.assignedTo]
          : []
      const rotateAssignment =
        assigned.length > 1 ? false : idea.rotateAssignment ?? prev.rotateAssignment

      return {
        ...prev,
        title: idea.title,
        description: idea.description,
        points: idea.points,
        imageId: null,
        imageUrl: idea.imageUrl ?? '',
        recurrence: idea.recurrence ?? prev.recurrence,
        assignedTo: assigned,
        rotateAssignment,
      }
    })
  }

  const handleApplyRewardIdea = (idea) => {
    setCreationTab('reward')
    setRewardForm((prev) => ({
      ...prev,
      title: idea.title,
      description: idea.description,
      cost: idea.cost ?? prev.cost,
      imageId: null,
      imageUrl: idea.imageUrl ?? '',
    }))
  }

  if (!isHydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-10 dark:bg-slate-950">
        <p className="text-base font-medium text-slate-500 dark:text-slate-400">Loading settings…</p>
      </main>
    )
  }

  if (SHOULD_REQUIRE_SETTINGS_PIN && !isUnlocked) {
    if (!settingsPin) {
      return (
        <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-16">
          <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-8 shadow-2xl dark:border-slate-700/70 dark:bg-slate-900/90">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Set a PIN for grown-up controls</h1>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              The settings area holds tools for parents and caregivers. Create a PIN so curious helpers need permission before they can make changes.
            </p>
            <form onSubmit={handleSetupPin} className="mt-8 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-200">Choose a PIN</label>
                <input
                  type="password"
                  value={newPin}
                  onChange={(event) => {
                    setNewPin(event.target.value)
                    setPinError('')
                  }}
                  inputMode="numeric"
                  autoComplete="new-password"
                  pattern="\d*"
                  minLength={4}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
                  placeholder="Enter at least 4 digits"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-200">Confirm PIN</label>
                <input
                  type="password"
                  value={confirmPin}
                  onChange={(event) => {
                    setConfirmPin(event.target.value)
                    setPinError('')
                  }}
                  inputMode="numeric"
                  autoComplete="new-password"
                  pattern="\d*"
                  minLength={4}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
                  placeholder="Repeat your PIN"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-600 dark:text-slate-200">Hint (optional)</label>
                  <span className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">Shown on lock screen</span>
                </div>
                <input
                  type="text"
                  value={pinHint}
                  onChange={(event) => setPinHint(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
                  placeholder="Something only the adults understand"
                />
              </div>
              {pinError && (
                <p className="text-sm font-medium text-rose-500 dark:text-rose-300">{pinError}</p>
              )}
              <button
                type="submit"
                disabled={pinLoading}
                className="w-full rounded-full bg-famboard-primary px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-famboard-dark focus:outline-none focus:ring-4 focus:ring-famboard-accent/40 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {pinLoading ? 'Saving PIN…' : 'Save PIN and continue'}
              </button>
            </form>
          </div>
        </main>
      )
    }

    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-16">
        <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-8 shadow-2xl dark:border-slate-700/70 dark:bg-slate-900/90">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Enter PIN to unlock settings</h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Only adults with the PIN can update chores, rewards, and family members. Once you unlock the settings you can stay signed in until you close this tab.
          </p>
          {settingsPin?.hint && (
            <p className="mt-4 rounded-2xl bg-famboard-primary/10 px-4 py-3 text-sm text-famboard-primary dark:bg-sky-400/10 dark:text-sky-200">
              Hint: {settingsPin.hint}
            </p>
          )}
          <form onSubmit={handleVerifyPin} className="mt-8 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-200">PIN</label>
              <input
                type="password"
                value={pinEntry}
                onChange={(event) => {
                  setPinEntry(event.target.value)
                  setPinError('')
                }}
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\d*"
                minLength={4}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
                placeholder="Enter your PIN"
              />
            </div>
            {pinError && (
              <p className="text-sm font-medium text-rose-500 dark:text-rose-300">{pinError}</p>
            )}
            <button
              type="submit"
              disabled={pinLoading}
              className="w-full rounded-full bg-famboard-primary px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-famboard-dark focus:outline-none focus:ring-4 focus:ring-famboard-accent/40 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {pinLoading ? 'Checking…' : 'Unlock settings'}
            </button>
          </form>
        </div>
      </main>
    )
  }

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

  const focusCreationTab = (tab) => {
    setCreationTab(tab)
    if (typeof document !== 'undefined') {
      document.getElementById('creation-lab')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleCreateChore = (event) => {
    event.preventDefault()
    if (!choreForm.title.trim()) return
    addChore({
      title: choreForm.title.trim(),
      description: choreForm.description.trim(),
      assignedTo: [...choreForm.assignedTo],
      points: Number(choreForm.points) || 0,
      imageId: choreForm.imageId ?? null,
      imageUrl: choreForm.imageUrl.trim(),
      recurrence: choreForm.recurrence,
      rotateAssignment: choreForm.rotateAssignment,
      schedule: {
        anchorDate: parseInputDateToISO(choreForm.scheduleAnchor),
        allDay: true,
      },
    })
    setChoreForm({
      title: '',
      description: '',
      assignedTo: [],
      points: 10,
      imageId: null,
      imageUrl: '',
      recurrence: 'none',
      rotateAssignment: false,
      scheduleAnchor: formatDateForInput(toStartOfDayISOString(new Date())),
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
                to={ROUTES.rewards}
                className="inline-flex items-center justify-center rounded-full border border-white/70 px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                Preview rewards
              </Link>
            </div>
          </div>
          <nav className="flex w-full max-w-xl flex-wrap gap-3 text-sm font-semibold">
            {[
              {
                href: '#family-roster',
                label: 'Family members',
                value: familyMembers.length,
                helper: 'Jump to roster',
              },
              {
                href: '#chore-workshop',
                label: 'Chores tracked',
                value: chores.length,
                helper: 'Review tasks',
              },
              {
                href: '#reward-workshop',
                label: 'Points in circulation',
                value: totalPoints,
                helper: `Avg reward ${averageRewardCost} pts`,
              },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="group inline-flex items-center gap-3 rounded-full border border-white/40 bg-white/10 px-4 py-2 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-lg font-bold text-white">
                  {item.value}
                </span>
                <span className="flex flex-col text-left text-white/80 group-hover:text-white">
                  <span className="text-xs font-semibold uppercase tracking-wide text-white/70 group-hover:text-white/90">
                    {item.label}
                  </span>
                  <span className="text-xs">{item.helper}</span>
                </span>
              </a>
            ))}
          </nav>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-card dark:border-slate-700/70 dark:bg-slate-900/80">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h2 className="font-display text-2xl text-slate-900 dark:text-white">Settings lock</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Your PIN lives only on this device as a salted, hashed value. Update it whenever you need a fresh start.
            </p>
            {settingsPin?.hint && !showChangePin && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Current hint:{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-200">{settingsPin.hint}</span>
              </p>
            )}
          </div>
          {!showChangePin && (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowChangePin(true)
                  setChangePinError('')
                }}
                className="inline-flex items-center justify-center rounded-full bg-famboard-primary px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-famboard-dark focus:outline-none focus:ring-2 focus:ring-famboard-accent focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              >
                Change PIN
              </button>
            </div>
          )}
        </div>
        {showChangePin && (
          <form onSubmit={handleChangePin} className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-200">Current PIN</label>
                <input
                  type="password"
                  value={changePinForm.current}
                  onChange={(event) => {
                    setChangePinForm((prev) => ({ ...prev, current: event.target.value }))
                    setChangePinError('')
                  }}
                  inputMode="numeric"
                  autoComplete="current-password"
                  pattern="\d*"
                  minLength={4}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
                  placeholder="Enter current PIN"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-200">New PIN</label>
                <input
                  type="password"
                  value={changePinForm.next}
                  onChange={(event) => {
                    setChangePinForm((prev) => ({ ...prev, next: event.target.value }))
                    setChangePinError('')
                  }}
                  inputMode="numeric"
                  autoComplete="new-password"
                  pattern="\d*"
                  minLength={4}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
                  placeholder="At least 4 digits"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-200">Confirm new PIN</label>
                <input
                  type="password"
                  value={changePinForm.confirm}
                  onChange={(event) => {
                    setChangePinForm((prev) => ({ ...prev, confirm: event.target.value }))
                    setChangePinError('')
                  }}
                  inputMode="numeric"
                  autoComplete="new-password"
                  pattern="\d*"
                  minLength={4}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
                  placeholder="Repeat the PIN"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-600 dark:text-slate-200">Update hint (optional)</label>
                  <span className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">Shown when locked</span>
                </div>
                <input
                  type="text"
                  value={changePinForm.hint}
                  onChange={(event) => {
                    setChangePinForm((prev) => ({ ...prev, hint: event.target.value }))
                    setChangePinError('')
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
                  placeholder="Optional hint to jog your memory"
                />
              </div>
            </div>
            {changePinError && (
              <p className="text-sm font-medium text-rose-500 dark:text-rose-300">{changePinError}</p>
            )}
            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowChangePin(false)
                  setChangePinError('')
                }}
                className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={changePinLoading}
                className="rounded-full bg-famboard-primary px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-famboard-dark focus:outline-none focus:ring-2 focus:ring-famboard-accent focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:focus:ring-offset-slate-900"
              >
                {changePinLoading ? 'Updating…' : 'Save new PIN'}
              </button>
            </div>
          </form>
        )}
      </section>

      <section
        id="creation-lab"
        className="rounded-3xl bg-slate-50/80 p-8 shadow-card ring-1 ring-slate-100/80 backdrop-blur dark:bg-slate-900/70 dark:ring-slate-800"
      >
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-3xl text-slate-900 dark:text-white">Create something new</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Add people, chores, or rewards from a single workspace. Everything shares the same familiar controls.
            </p>
          </div>
          <span className="rounded-full bg-famboard-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-famboard-primary dark:bg-sky-500/10 dark:text-sky-200">
            Creation hub
          </span>
        </header>
        <div className="mt-4 flex flex-wrap gap-3">
          {[
            { id: 'family', label: 'Family member', emoji: '👪' },
            { id: 'chore', label: 'Chore', emoji: '🧽' },
            { id: 'reward', label: 'Reward', emoji: '🎉' },
          ].map((tab) => {
            const isActive = creationTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCreationTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
                  isActive
                    ? 'border-famboard-primary bg-famboard-primary text-white shadow-lg focus:ring-famboard-accent'
                    : 'border-slate-200 bg-white/70 text-slate-600 hover:border-famboard-primary/40 hover:text-famboard-primary focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:border-sky-400/60 dark:hover:text-sky-200'
                }`}
              >
                <span>{tab.emoji}</span>
                {tab.label}
              </button>
            )
          })}
        </div>
        <div className="mt-6">
          {creationTab === 'family' && (
            <form
              onSubmit={handleAddMember}
              className="space-y-6 rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-inner dark:border-slate-700/70 dark:bg-slate-900/80"
            >
              <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600 dark:text-slate-200">Family member name</label>
                  <input
                    value={memberName}
                    onChange={(event) => setMemberName(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
                    placeholder="Add a name"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-200">Photo</label>
                    <span className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">Optional</span>
                  </div>
                  <MediaPicker
                    label="Profile photo"
                    description="Add a friendly face so kids can spot their card at a glance."
                    imageId={memberImageId}
                    imageUrl={memberImageUrl}
                    onChange={(next) => {
                      setMemberImageId(next.imageId ?? null)
                      setMemberImageUrl(next.imageUrl ?? '')
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-famboard-primary px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-famboard-dark focus:outline-none focus:ring-4 focus:ring-famboard-accent/40"
                >
                  Add member
                </button>
              </div>
            </form>
          )}
          {creationTab === 'chore' && (
            <>
              <form
                onSubmit={handleCreateChore}
                className="space-y-6 rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-inner dark:border-slate-700/70 dark:bg-slate-900/80"
              >
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-200">Chore title</label>
                    <input
                      value={choreForm.title}
                      onChange={(event) => setChoreForm((prev) => ({ ...prev, title: event.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
                      placeholder="Tidy the playroom"
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-200">Description</label>
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
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-200">Assign to</label>
                    <div className="flex flex-wrap gap-2">
                      {familyMembers.length === 0 && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Add family members to assign this chore.
                        </p>
                      )}
                      {familyMembers.map((member) => {
                        const isChecked = choreForm.assignedTo.includes(member.id)
                        return (
                          <label
                            key={member.id}
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition ${
                              isChecked
                                ? 'border-famboard-primary bg-famboard-primary/10 text-famboard-primary dark:border-sky-500 dark:bg-sky-500/10 dark:text-sky-200'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-famboard-primary/40 hover:bg-famboard-primary/5 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-slate-300 text-famboard-primary focus:ring-famboard-primary dark:border-slate-600"
                              checked={isChecked}
                              onChange={() =>
                                setChoreForm((prev) => {
                                  const current = new Set(prev.assignedTo)
                                  if (current.has(member.id)) {
                                    current.delete(member.id)
                                  } else {
                                    current.add(member.id)
                                  }
                                  const nextAssigned = Array.from(current)
                                  return {
                                    ...prev,
                                    assignedTo: nextAssigned,
                                    rotateAssignment: nextAssigned.length > 1 ? false : prev.rotateAssignment,
                                  }
                                })
                              }
                            />
                            <span>{member.name}</span>
                          </label>
                        )
                      })}
                      {choreForm.assignedTo.length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setChoreForm((prev) => ({
                              ...prev,
                              assignedTo: [],
                            }))
                          }
                          className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    {choreForm.rotateAssignment && choreForm.assignedTo.length <= 1 && (
                      <p className="text-xs text-slate-400 dark:text-slate-500">Assignment rotates automatically.</p>
                    )}
                    {choreForm.assignedTo.length > 1 && (
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        Rotation is disabled while multiple helpers are selected.
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-200">Points</label>
                    <input
                      type="number"
                      min="0"
                      value={choreForm.points}
                      onChange={(event) => setChoreForm((prev) => ({ ...prev, points: event.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-200">Repeats</label>
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
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-200">Rotation</label>
                    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-inner dark:border-slate-700 dark:bg-slate-900">
                      <input
                        id="create-rotate"
                        type="checkbox"
                        checked={choreForm.rotateAssignment}
                        onChange={(event) =>
                          setChoreForm((prev) => ({
                            ...prev,
                            rotateAssignment: event.target.checked,
                            assignedTo:
                              event.target.checked && prev.assignedTo.length === 0 && familyMembers.length > 0
                                ? [familyMembers[0].id]
                                : prev.assignedTo,
                          }))
                        }
                        className="h-4 w-4 rounded border-slate-300 text-famboard-primary focus:ring-famboard-primary"
                        disabled={choreForm.assignedTo.length > 1 || familyMembers.length <= 1}
                      />
                      <label htmlFor="create-rotate" className="flex-1 cursor-pointer select-none">
                        Rotate between family members
                      </label>
                    </div>
                    {choreForm.rotateAssignment && familyMembers.length === 0 && (
                      <p className="text-xs text-rose-500">Add family members to enable rotation.</p>
                    )}
                    {choreForm.assignedTo.length > 1 && (
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        Select one helper to re-enable rotation.
                      </p>
                    )}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-200">Starts on</label>
                    <input
                      type="date"
                      value={choreForm.scheduleAnchor}
                      onChange={(event) =>
                        setChoreForm((prev) => ({
                          ...prev,
                          scheduleAnchor: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
                    />
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      We’ll use this anchor date to power the new calendar views and upcoming sync exports.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-full bg-famboard-primary px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-famboard-dark focus:outline-none focus:ring-4 focus:ring-famboard-accent/40"
                  >
                    Add chore
                  </button>
                </div>
              </form>
              <IdeaGallery
                title="Need a spark?"
                description="Pick a ready-made idea to prefill the form, then tweak the details so it fits your crew."
                items={choreIdeaCards}
                actionLabel="Use this chore"
                onSelect={handleApplyChoreIdea}
              />
            </>
          )}
          {creationTab === 'reward' && (
            <>
            <form
              onSubmit={handleCreateReward}
              className="space-y-6 rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-inner dark:border-slate-700/70 dark:bg-slate-900/80"
            >
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-600 dark:text-slate-200">Reward title</label>
                  <input
                    value={rewardForm.title}
                    onChange={(event) => setRewardForm((prev) => ({ ...prev, title: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
                    placeholder="Family movie marathon"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-600 dark:text-slate-200">Description</label>
                  <textarea
                    value={rewardForm.description}
                    onChange={(event) => setRewardForm((prev) => ({ ...prev, description: event.target.value }))}
                    className="min-h-[140px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
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
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600 dark:text-slate-200">Cost (points)</label>
                  <input
                    type="number"
                    min="0"
                    value={rewardForm.cost}
                    onChange={(event) => setRewardForm((prev) => ({ ...prev, cost: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-famboard-primary px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-famboard-dark focus:outline-none focus:ring-4 focus:ring-famboard-accent/40"
                >
                  Add reward
                </button>
              </div>
            </form>
              <IdeaGallery
                title="Reward inspiration"
                description="Browse family-favorite treats and fill the form with one tap."
                items={rewardIdeaCards}
                actionLabel="Use this reward"
                onSelect={handleApplyRewardIdea}
              />
            </>
          )}
        </div>
      </section>

      <section className="rounded-3xl bg-white/85 p-8 shadow-card ring-1 ring-white/30 backdrop-blur dark:bg-slate-900/75 dark:ring-slate-800" id="family-roster">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-3xl text-slate-800 dark:text-white">Family roster</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Add everyone who helps out and keep names up to date as kids grow.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-famboard-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-famboard-primary dark:bg-sky-500/10 dark:text-sky-200">
              Team management
            </span>
            <button
              type="button"
              onClick={() => focusCreationTab('family')}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-famboard-primary/50 hover:text-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:text-slate-300 dark:hover:border-sky-400/60 dark:hover:text-sky-200"
            >
              + Add member
            </button>
          </div>
        </header>
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

      <section
        id="chore-workshop"
        className="rounded-3xl bg-slate-50/80 p-8 shadow-card ring-1 ring-slate-100/80 backdrop-blur dark:bg-slate-900/75 dark:ring-slate-800"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl space-y-2">
            <h2 className="font-display text-3xl text-slate-800 dark:text-white">Chore workshop</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Create new chores, adjust assignments, and remove tasks that have run their course. Kids will see updates instantly in their view.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-famboard-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-famboard-primary dark:bg-sky-500/10 dark:text-sky-200">
              Admin tools
            </span>
            <button
              type="button"
              onClick={() => focusCreationTab('chore')}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-famboard-primary/50 hover:text-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:text-slate-300 dark:hover:border-sky-400/60 dark:hover:text-sky-200"
            >
              + Add chore
            </button>
          </div>
        </div>
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

      <section
        id="reward-workshop"
        className="rounded-3xl bg-white/85 p-8 shadow-card ring-1 ring-white/30 backdrop-blur dark:bg-slate-900/75 dark:ring-slate-800"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl space-y-2">
            <h2 className="font-display text-3xl text-slate-800 dark:text-white">Reward workshop</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Curate the experiences your family works toward. Update descriptions, adjust point costs, and remove retired ideas.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-famboard-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-famboard-primary dark:bg-sky-500/10 dark:text-sky-200">
              Admin tools
            </span>
            <button
              type="button"
              onClick={() => focusCreationTab('reward')}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-famboard-primary/50 hover:text-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:text-slate-300 dark:hover:border-sky-400/60 dark:hover:text-sky-200"
            >
              + Add reward
            </button>
          </div>
        </div>
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

      <section className="rounded-3xl border border-rose-200/70 bg-rose-50/70 p-8 shadow-card ring-1 ring-rose-100/60 backdrop-blur dark:border-rose-900/60 dark:bg-rose-950/40 dark:ring-rose-900/40">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-2xl dark:bg-rose-900/60">⚠️</span>
          <div className="space-y-2">
            <h2 className="font-display text-3xl text-rose-700 dark:text-rose-200">Reset Famboard</h2>
            <p className="text-sm text-rose-700/80 dark:text-rose-200/80">
              This clears every chore, reward, and point tally. Use when you truly want to wipe the slate clean.
            </p>
          </div>
        </div>
        <ul className="mt-4 list-disc space-y-1 pl-12 text-xs text-rose-700/80 dark:text-rose-200/70">
          <li>Family members stay, but their points return to zero.</li>
          <li>All chores and rewards are permanently removed.</li>
        </ul>
        <button
          onClick={handleReset}
          className="mt-6 w-full rounded-full bg-rose-500 px-6 py-3 text-lg font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-rose-600 focus:outline-none focus:ring-4 focus:ring-rose-300/70 focus:ring-offset-2 dark:bg-rose-600 dark:hover:bg-rose-500"
        >
          Reset all data
        </button>
        <p className="mt-6 text-xs font-medium uppercase tracking-wide text-rose-700/70 dark:text-rose-200/60">
          App version <span className="font-semibold text-rose-800 dark:text-rose-100">{APP_VERSION}</span>
        </p>
      </section>
    </div>
  )
}
