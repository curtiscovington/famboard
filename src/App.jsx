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

function Layout() {
  const { isHydrated } = useFamboard()

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
