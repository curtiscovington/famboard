import { useEffect, useMemo, useState } from 'react'
import { NavLink, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import HomeScreen from './pages/HomeScreen.jsx'
import ChoresScreen from './pages/ChoresScreen.jsx'
import RewardsScreen from './pages/RewardsScreen.jsx'
import SettingsScreen from './pages/SettingsScreen.jsx'
import { useFamboard } from './context/FamboardContext.jsx'

const navigation = [
  { to: '/', label: 'Home', emoji: '🏡' },
  { to: '/chores', label: 'Chores', emoji: '🧹' },
  { to: '/rewards', label: 'Rewards', emoji: '🎁' },
  { to: '/settings', label: 'Settings', emoji: '⚙️' },
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

  const totalFamilyPoints = useMemo(
    () => familyMembers.reduce((sum, member) => sum + member.points, 0),
    [familyMembers],
  )

  const familyOpenChores = useMemo(
    () => chores.filter((chore) => !chore.completed).length,
    [chores],
  )

  const getMemberChoreCount = (memberId) =>
    chores.filter((chore) => !chore.completed && chore.assignedTo === memberId).length

  const tileBaseClasses =
    'flex min-w-[15rem] flex-1 items-center gap-4 rounded-3xl border px-4 py-4 text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-famboard-primary/40 focus:ring-offset-2'

  return (
    <section className="mx-auto mt-4 w-full max-w-6xl px-4">
      <div className="flex snap-x gap-3 overflow-x-auto pb-2 md:flex-wrap md:pb-0">
        <button
          type="button"
          onClick={() => setActiveView('family')}
          className={`${tileBaseClasses} snap-center ${
            activeView === 'family'
              ? 'border-famboard-primary bg-famboard-primary/10 text-famboard-dark dark:border-sky-500 dark:bg-sky-500/10 dark:text-sky-100'
              : 'border-white/60 bg-white/80 text-slate-600 hover:border-famboard-primary/40 hover:bg-famboard-primary/10 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200'
          }`}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-famboard-primary/20 text-3xl dark:bg-sky-500/20" aria-hidden>
            👨‍👩‍👧‍👦
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-wide">Family view</p>
            <p className="text-lg font-display text-slate-900 dark:text-white">Everyone</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {familyMembers.length} members · {familyOpenChores} chores · {totalFamilyPoints} pts
            </p>
          </div>
        </button>
        {familyMembers.map((member) => {
          const upcoming = getMemberChoreCount(member.id)
          const isActive = activeView === member.id
          return (
            <button
              type="button"
              key={member.id}
              onClick={() => setActiveView(member.id)}
              className={`${tileBaseClasses} snap-center ${
                isActive
                  ? 'border-famboard-primary bg-famboard-primary/10 text-famboard-dark dark:border-sky-500 dark:bg-sky-500/10 dark:text-sky-100'
                  : 'border-white/60 bg-white/80 text-slate-600 hover:border-famboard-primary/40 hover:bg-famboard-primary/10 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200'
              }`}
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/80 bg-slate-100 shadow-inner dark:border-slate-700 dark:bg-slate-800">
                {member.imageUrl ? (
                  <img src={member.imageUrl} alt={member.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl">😊</div>
                )}
              </div>
              <div className="space-y-1 text-left">
                <p className="text-sm font-semibold uppercase tracking-wide">{member.name}</p>
                <p className="text-lg font-display text-famboard-primary dark:text-sky-300">{member.points} pts</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{upcoming} chore{upcoming === 1 ? '' : 's'} waiting</p>
              </div>
            </button>
          )
        })}
        {familyMembers.length === 0 && (
          <div className={`${tileBaseClasses} border-dashed border-slate-300/70 bg-white/60 text-slate-500 dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-400`}>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200/80 text-2xl dark:bg-slate-700/80" aria-hidden>
              ➕
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-wide">No members yet</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Add family members in settings to personalize the board.
              </p>
            </div>
          </div>
        )}
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
        <nav className="mx-auto w-full max-w-6xl px-4 pb-4">
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
      <UserSwitcher />
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
