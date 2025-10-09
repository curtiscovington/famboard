import { useEffect, useMemo, useState } from 'react'
import { NavLink, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import HomeScreen from './pages/HomeScreen.jsx'
import ChoresScreen from './pages/ChoresScreen.jsx'
import RewardsScreen from './pages/RewardsScreen.jsx'
import SettingsScreen from './pages/SettingsScreen.jsx'
import { MediaImage } from './components/MediaImage.jsx'
import { useFamboard } from './context/FamboardContext.jsx'
import { isMemberAssignedToChore } from './utils/choreAssignments.js'
import { ROUTES } from './constants/routes.js'

const navigation = [
  { to: ROUTES.home, label: 'Home', emoji: '🏡' },
  { to: ROUTES.chores, label: 'Chores', emoji: '🧹' },
  { to: ROUTES.rewards, label: 'Rewards', emoji: '🎁' },
  { to: ROUTES.settings, label: 'Settings', emoji: '⚙️' },
]

function ThemeToggle() {
  const { state, setTheme } = useFamboard()
  const isDark = state.theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="flex items-center gap-2 rounded-full bg-slate-900/10 px-4 py-2 text-sm font-semibold text-slate-700 shadow-inner transition hover:bg-slate-900/20 focus:outline-none focus:ring-2 focus:ring-famboard-primary focus:ring-offset-2 dark:bg-slate-100/10 dark:text-slate-100 dark:hover:bg-slate-100/20"
    >
      {isDark ? '🌙 Dark' : '☀️ Light'}
    </button>
  )
}

function UserSwitcher() {
  const { state, setActiveView } = useFamboard()
  const { familyMembers, chores, activeView } = state

  const activeMember = useMemo(
    () => (activeView === 'family' ? null : familyMembers.find((member) => member.id === activeView) ?? null),
    [activeView, familyMembers],
  )

  const activeMemberInitial = activeMember?.name ? activeMember.name.charAt(0).toUpperCase() : '🙂'
  const activeMemberFallback = (
    <div className="flex h-full w-full items-center justify-center text-2xl font-semibold">{activeMemberInitial}</div>
  )

  const getMemberChoreCount = (memberId) =>
    chores.filter((chore) => !chore.completed && isMemberAssignedToChore(chore, memberId)).length

  const activeMemberOpenChores = activeMember ? getMemberChoreCount(activeMember.id) : 0

  const totalFamilyPoints = useMemo(
    () => familyMembers.reduce((sum, member) => sum + member.points, 0),
    [familyMembers],
  )

  const familyOpenChores = useMemo(
    () => chores.filter((chore) => !chore.completed).length,
    [chores],
  )

  const familySummary = activeMember
    ? `${activeMember.points} pts · ${activeMemberOpenChores} chore${
        activeMemberOpenChores === 1 ? '' : 's'
      } waiting`
    : `${familyMembers.length} member${familyMembers.length === 1 ? '' : 's'} · ${familyOpenChores} open chore${
        familyOpenChores === 1 ? '' : 's'
      } · ${totalFamilyPoints} pts`

  const tileBaseClasses =
    'group relative flex items-center gap-3 rounded-2xl border px-4 py-3 text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-famboard-primary/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900'

  return (
    <section className="mx-auto mt-4 mb-6 w-full max-w-6xl px-4 sm:mb-8">
      <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-card backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`${
                  activeMember
                    ? 'border border-famboard-primary/50 bg-white text-famboard-primary shadow-inner dark:border-sky-500/40 dark:bg-slate-900/70 dark:text-sky-200'
                    : 'border border-famboard-primary/40 bg-famboard-primary/10 text-famboard-primary dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-200'
                } flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl text-3xl`}
                aria-hidden
              >
                {activeMember ? (
                  activeMember.imageId ? (
                    <MediaImage
                      mediaId={activeMember.imageId}
                      alt={activeMember.name ?? ''}
                      className="h-full w-full object-cover"
                      fallback={activeMemberFallback}
                    />
                  ) : activeMember.imageUrl ? (
                    <img src={activeMember.imageUrl} alt={activeMember.name ?? ''} className="h-full w-full object-cover" />
                  ) : (
                    activeMemberFallback
                  )
                ) : (
                  '👨‍👩‍👧‍👦'
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Currently showing</p>
                <h2 className="font-display text-2xl text-slate-900 dark:text-white">
                  {activeMember ? activeMember.name : 'Whole family board'}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">{familySummary}</p>
              </div>
            </div>
            <p className="rounded-2xl bg-slate-900/5 px-4 py-3 text-sm text-slate-600 shadow-inner dark:bg-white/5 dark:text-slate-300">
              Tap anyone below to jump into their chores, cheer on their progress, or switch back to the whole crew.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Quick switch</p>
            <div
              role="radiogroup"
              aria-label="Choose whose board to view"
              className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
            >
            <button
              type="button"
              role="radio"
              aria-checked={activeView === 'family'}
              onClick={() => setActiveView('family')}
              className={`${tileBaseClasses} ${
                activeView === 'family'
                  ? 'border-famboard-primary/90 bg-famboard-primary/10 text-famboard-dark shadow-lg dark:border-sky-500 dark:bg-sky-500/10 dark:text-sky-100'
                  : 'border-white/60 bg-white/70 text-slate-600 hover:border-famboard-primary/40 hover:bg-famboard-primary/5 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200'
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-famboard-primary/15 text-2xl dark:bg-sky-500/15" aria-hidden>
                👪
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Whole crew</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {familyMembers.length === 0
                    ? 'Add your family in settings'
                    : `${familyMembers.length} member${familyMembers.length === 1 ? '' : 's'} ready`}
                </p>
              </div>
            </button>
            {familyMembers.map((member) => {
              const upcoming = getMemberChoreCount(member.id)
              const isActive = activeView === member.id
              const initial = member.name ? member.name.charAt(0).toUpperCase() : '🙂'
              const fallback = (
                <div className="flex h-full w-full items-center justify-center text-base font-semibold text-slate-500 dark:text-slate-300">
                  {initial}
                </div>
              )
              return (
                <button
                  type="button"
                  key={member.id}
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => setActiveView(member.id)}
                  className={`${tileBaseClasses} ${
                    isActive
                      ? 'border-famboard-primary/90 bg-famboard-primary/10 text-famboard-dark shadow-lg dark:border-sky-500 dark:bg-sky-500/10 dark:text-sky-100'
                      : 'border-white/60 bg-white/70 text-slate-600 hover:border-famboard-primary/40 hover:bg-famboard-primary/5 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200'
                  }`}
                >
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/60 bg-slate-100 shadow-inner dark:border-slate-700 dark:bg-slate-800">
                    {member.imageId ? (
                      <MediaImage
                        mediaId={member.imageId}
                        alt={member.name ?? ''}
                        className="h-full w-full object-cover"
                        fallback={fallback}
                      />
                    ) : member.imageUrl ? (
                      <img src={member.imageUrl} alt={member.name ?? ''} className="h-full w-full object-cover" />
                    ) : (
                      fallback
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{member.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {member.points} pts · {upcoming} chore{upcoming === 1 ? '' : 's'}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
          {familyMembers.length === 0 && (
            <div className="mt-3 flex items-center gap-3 rounded-2xl border border-dashed border-slate-300/70 bg-white/60 px-4 py-3 text-slate-500 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-400">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-200/80 text-xl dark:bg-slate-700/80" aria-hidden>
                ➕
              </div>
              <p className="text-xs">Add family members in settings to personalize the board.</p>
            </div>
          )}
          </div>
        </div>
      </div>
    </section>
  )
}

function Layout() {
  const { isHydrated } = useFamboard()
  const [updateStatus, setUpdateStatus] = useState('hidden')

  useEffect(() => {
    if (window.__famboardUpdateReady) {
      setUpdateStatus('available')
    }

    const handleUpdateAvailable = () => {
      setUpdateStatus('available')
    }

    window.addEventListener('famboard:sw-update-available', handleUpdateAvailable)

    return () => {
      window.removeEventListener('famboard:sw-update-available', handleUpdateAvailable)
    }
  }, [])

  const applyUpdate = () => {
    if (updateStatus === 'updating') return
    setUpdateStatus('updating')
    window.dispatchEvent(new Event('famboard:sw-apply-update'))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-famboard-surface text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <header className="border-b border-white/60 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-famboard-primary dark:text-sky-300">
              Famboard
            </p>
            <h1 className="font-display text-3xl text-slate-900 dark:text-white sm:text-4xl">
              Chores, rewards, and high-fives for the whole family
            </h1>
          </div>
          <ThemeToggle />
        </div>
        <UserSwitcher />
        <nav className="mx-auto w-full max-w-6xl px-4 pb-6">
          <div className="grid grid-cols-2 gap-3 sm:flex sm:justify-between">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-center gap-2 rounded-full px-4 py-2 text-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    isActive
                      ? 'bg-famboard-primary text-white shadow-lg ring-famboard-accent'
                      : 'bg-white/70 text-slate-600 shadow ring-1 ring-white/60 hover:bg-famboard-primary/10 hover:text-famboard-primary dark:bg-slate-900/70 dark:text-slate-300 dark:ring-slate-800'
                  }`
                }
                end={item.to === '/'}
              >
                <span className="text-2xl" aria-hidden>
                  {item.emoji}
                </span>
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>
      {updateStatus !== 'hidden' && (
        <div className="border-b border-amber-200 bg-amber-50/90 text-amber-900 backdrop-blur dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-wide">Update available</p>
              <p className="text-sm text-amber-800 dark:text-amber-100/80">
                A fresh version of Famboard is ready. Refresh to grab the latest chores magic.
              </p>
            </div>
            <button
              type="button"
              onClick={applyUpdate}
              disabled={updateStatus === 'updating'}
              className="inline-flex items-center justify-center rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-amber-50 shadow transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-75 dark:bg-amber-400 dark:text-slate-900 dark:hover:bg-amber-300"
            >
              {updateStatus === 'updating' ? 'Refreshing…' : 'Refresh now'}
            </button>
          </div>
        </div>
      )}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {isHydrated ? (
          <Outlet />
        ) : (
          <div className="flex h-64 items-center justify-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-famboard-primary border-t-transparent" aria-label="Loading" />
          </div>
        )}
      </main>
      <footer className="border-t border-white/60 bg-white/70 py-6 text-center text-sm text-slate-500 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
        Built with ❤️ for busy families. Works offline on your favorite tablet.
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomeScreen />} />
        <Route path="chores" element={<ChoresScreen />} />
        <Route path="rewards" element={<RewardsScreen />} />
        <Route path="settings" element={<SettingsScreen />} />
      </Route>
      <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
    </Routes>
  )
}
