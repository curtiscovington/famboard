import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useFamboard } from '../context/FamboardContext.jsx'
import { MediaPicker } from '../components/MediaPicker.jsx'
import { MediaImage } from '../components/MediaImage.jsx'
import { ROUTES } from '../constants/routes.js'

function RewardCard({ reward, members, onRedeem, onDelete, onSave, canManage = true }) {
  const [selectedMember, setSelectedMember] = useState(members[0]?.id ?? '')
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    title: reward.title,
    description: reward.description,
    cost: reward.cost,
    imageId: reward.imageId ?? null,
    imageUrl: reward.imageUrl ?? '',
  })

  const selectedMemberData = useMemo(
    () => members.find((member) => member.id === selectedMember),
    [members, selectedMember],
  )

  const progress = useMemo(() => {
    if (!selectedMemberData) return 0
    if (reward.cost === 0) return 100
    return Math.min(100, Math.round((selectedMemberData.points / reward.cost) * 100))
  }, [reward.cost, selectedMemberData])

  useEffect(() => {
    setForm({
      title: reward.title,
      description: reward.description,
      cost: reward.cost,
      imageId: reward.imageId ?? null,
      imageUrl: reward.imageUrl ?? '',
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

  useEffect(() => {
    if (!canManage) {
      setIsEditing(false)
    }
  }, [canManage])

  const canRedeem = selectedMember
    ? (members.find((member) => member.id === selectedMember)?.points ?? 0) >= reward.cost
    : false

  const handleSubmit = (event) => {
    event.preventDefault()
    onSave(reward.id, {
      title: form.title.trim(),
      description: form.description.trim(),
      cost: Number(form.cost) || 0,
      imageId: form.imageId ?? null,
      imageUrl: form.imageUrl.trim(),
    })
    setIsEditing(false)
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-transparent bg-white/95 shadow-card transition hover:-translate-y-1 hover:border-famboard-primary/50 hover:shadow-2xl dark:bg-slate-900/90">
      <div className="pointer-events-none absolute -right-16 -top-24 h-48 w-48 rounded-full bg-famboard-primary/10 blur-3xl transition group-hover:bg-famboard-primary/20" aria-hidden />
      {isEditing && canManage ? (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <MediaPicker
            label="Reward photo"
            description="Add a picture so kids can cheer for this reward instantly."
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
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Reward title
            </label>
            <input
              required
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
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
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-base shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 dark:border-slate-700 dark:bg-slate-900"
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
        <>
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/10 via-transparent to-slate-900/20 opacity-30 transition-opacity group-hover:opacity-50" aria-hidden />
            {reward.imageId ? (
              <MediaImage
                mediaId={reward.imageId}
                alt={reward.title}
                className="h-full w-full object-cover"
                fallback={<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-famboard-primary/30 to-emerald-400/30 text-5xl">🎁</div>}
              />
            ) : reward.imageUrl ? (
              <img src={reward.imageUrl} alt={reward.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-famboard-primary/30 to-emerald-400/30 text-5xl">🎁</div>
            )}
            <div className="absolute inset-x-0 bottom-0 flex justify-between p-4 text-white">
              <div className="max-w-[70%]">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/80">Reward spotlight</p>
                <p className="mt-1 text-lg font-semibold leading-tight drop-shadow">{reward.title}</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-white/95 px-3 py-1 text-sm font-semibold text-famboard-dark shadow-lg">
                {reward.cost} pts
              </span>
            </div>
          </div>
          <div className="space-y-5 p-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold text-slate-900 transition group-hover:text-famboard-primary dark:text-white">
                {reward.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {reward.description || 'Add a fun description to get everyone excited!'}
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Claim for
              </p>
              {members.length === 0 ? (
                <div className="rounded-full border border-dashed border-slate-300/80 bg-white/70 px-4 py-2 text-sm text-slate-500 shadow-inner dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-400">
                  Add family members first
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {members.map((member) => {
                    const isSelected = member.id === selectedMember
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => setSelectedMember(member.id)}
                        className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-famboard-primary/30 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
                          isSelected
                            ? 'border-transparent bg-famboard-primary text-white shadow-lg'
                            : 'border-slate-200 bg-white/80 text-slate-600 hover:border-famboard-primary/60 hover:text-famboard-primary dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300'
                        }`}
                      >
                        <span>{member.name}</span>
                        <span className={`ml-2 text-xs font-medium ${isSelected ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                          {member.points} pts
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          {selectedMemberData && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <span>Progress</span>
                <span>
                  {Math.min(selectedMemberData.points, reward.cost)} / {reward.cost || 0} pts
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-700/80">
                <div
                  className={`h-full rounded-full bg-gradient-to-r from-famboard-primary via-sky-500 to-emerald-400 transition-all duration-500`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
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
              {canManage && (
                <>
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
                </>
              )}
            </div>
            {!canRedeem && selectedMember && (
              <p className="text-xs font-medium text-rose-500 dark:text-rose-300">
                {members.find((member) => member.id === selectedMember)?.name ?? 'They'}
                {' needs more points to redeem this reward.'}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default function RewardsScreen() {
  const { state, redeemReward, removeReward, updateReward } = useFamboard()
  const { familyMembers, rewards, activeView } = state

  const selectedMember = activeView === 'family' ? null : familyMembers.find((member) => member.id === activeView)
  const isMemberView = Boolean(selectedMember)

  const totalPoints = useMemo(() => {
    if (isMemberView) {
      return selectedMember.points
    }
    return familyMembers.reduce((sum, member) => sum + member.points, 0)
  }, [familyMembers, isMemberView, selectedMember?.points])

  const readyToRedeem = useMemo(() => {
    if (isMemberView) {
      if (!selectedMember) return 0
      return rewards.filter((reward) => reward.cost === 0 || selectedMember.points >= reward.cost).length
    }
    return rewards.filter((reward) =>
      familyMembers.some((member) => reward.cost === 0 || member.points >= reward.cost),
    ).length
  }, [familyMembers, isMemberView, rewards, selectedMember])

  const averageCost = useMemo(() => {
    if (rewards.length === 0) return 0
    const totalCost = rewards.reduce((sum, reward) => sum + reward.cost, 0)
    return Math.round(totalCost / rewards.length)
  }, [rewards])

  const topMember = useMemo(() => {
    if (isMemberView || familyMembers.length === 0) return null
    return familyMembers.reduce((prev, current) => (current.points > prev.points ? current : prev))
  }, [familyMembers, isMemberView])

  const membersForCards = isMemberView ? (selectedMember ? [selectedMember] : []) : familyMembers

  return (
    <div className="space-y-10 pb-16">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-famboard-primary via-sky-500 to-emerald-500 p-8 text-white shadow-xl">
        <div className="absolute -left-24 top-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" aria-hidden />
        <div className="absolute -right-10 -bottom-10 h-60 w-60 rounded-full bg-emerald-400/20 blur-3xl" aria-hidden />
        <div className="relative space-y-8">
          <div className="max-w-3xl space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
              {isMemberView ? 'Celebrate your wins' : 'Celebration station'}
            </p>
            <h2 className="font-display text-4xl leading-tight sm:text-5xl">
              {isMemberView
                ? `Ready to redeem, ${selectedMember.name}?`
                : 'Turn points into unforgettable family moments'}
            </h2>
            <p className="text-base text-white/80">
              {isMemberView
                ? 'See which rewards are within reach and decide how to spend your hard-earned points.'
                : 'Browse the current reward shelf, see who is closest to cashing in, and cheer everyone on.'}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-4 shadow-inner backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
                {isMemberView ? 'Rewards you can redeem' : 'Rewards ready to redeem'}
              </p>
              <p className="mt-2 text-3xl font-bold">{readyToRedeem}</p>
              <p className="text-xs text-white/70">
                {isMemberView ? 'Pick a favorite and celebrate your effort.' : 'Family treats are within reach right now.'}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 shadow-inner backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
                {isMemberView ? 'Your point balance' : 'Points in circulation'}
              </p>
              <p className="mt-2 text-3xl font-bold">{totalPoints}</p>
              <p className="text-xs text-white/70">
                {isMemberView
                  ? 'Spend them now or keep saving for something big.'
                  : 'Earned by your hard-working crew.'}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 shadow-inner backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Average reward cost</p>
              <p className="mt-2 text-3xl font-bold">{averageCost} pts</p>
              <p className="text-xs text-white/70">
                {isMemberView
                  ? 'Aim for rewards that match your balance or keep stacking points.'
                  : 'Plan chores that match the excitement.'}
              </p>
            </div>
          </div>
          {isMemberView ? (
            <Link
              to={ROUTES.chores}
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-famboard-primary shadow-lg transition hover:-translate-y-0.5 hover:bg-famboard-accent hover:text-famboard-dark"
            >
              Earn more points on the chore board
            </Link>
          ) : (
            <div className="flex flex-col gap-4 rounded-2xl bg-white/10 p-4 shadow-inner backdrop-blur sm:flex-row sm:items-center sm:justify-between">
              <div>
                {topMember ? (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Points leader</p>
                    <p className="text-lg font-semibold">{topMember.name}</p>
                    <p className="text-sm text-white/70">{topMember.points} points earned and ready to celebrate.</p>
                  </>
                ) : (
                  <p className="text-sm text-white/80">Add family members to start tracking who’s closest to a reward.</p>
                )}
              </div>
              <Link
                to={ROUTES.settings}
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-famboard-primary shadow-lg transition hover:-translate-y-0.5 hover:bg-famboard-accent hover:text-famboard-dark"
              >
                Manage rewards in settings
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-6">
        <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="font-display text-3xl text-slate-800 dark:text-white">
              {isMemberView ? 'Your reward shelf' : 'Reward shelf'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isMemberView
                ? 'Choose a reward to redeem with your points. Ask a grown-up if you need help.'
                : 'Pick who redeems the reward and watch their points sparkle away in real time.'}
            </p>
          </div>
          {!isMemberView && (
            <Link
              to={ROUTES.settings}
              className="inline-flex items-center justify-center rounded-full border border-famboard-primary/60 px-4 py-2 text-sm font-semibold text-famboard-primary transition hover:bg-famboard-primary hover:text-white"
            >
              Manage rewards in settings
            </Link>
          )}
        </header>
        <div className="grid gap-5 lg:grid-cols-2">
          {rewards.length === 0 && (
            <p className="rounded-3xl border border-dashed border-slate-300/80 bg-white/70 p-6 text-sm text-slate-500 shadow-inner dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-400">
              {isMemberView
                ? 'No rewards available yet—check back after an adult adds some in settings.'
                : 'The shelf is empty—visit the settings admin page to dream up your first reward.'}
            </p>
          )}
          {rewards.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              members={membersForCards}
              onRedeem={redeemReward}
              onDelete={removeReward}
              onSave={updateReward}
              canManage={!isMemberView}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
