import { MediaImage } from './MediaImage.jsx'

export function IdeaGallery({ title, description, items, actionLabel = 'Use this idea', onSelect }) {
  if (!items || items.length === 0) {
    return null
  }

  return (
    <div className="mt-10 space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
        {description && <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700/70 dark:bg-slate-900/70"
          >
            {item.imageId || item.imageUrl ? (
              <div className="relative h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                {item.imageId ? (
                  <MediaImage
                    mediaId={item.imageId}
                    alt={item.title}
                    className="h-full w-full object-cover"
                    fallback={<div className="flex h-full w-full items-center justify-center text-4xl">{item.emoji ?? '✨'}</div>}
                  />
                ) : (
                  <img src={item.imageUrl} alt={item.imageAlt ?? item.title} className="h-full w-full object-cover" />
                )}
              </div>
            ) : item.emoji ? (
              <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-famboard-primary/10 via-sky-400/10 to-violet-400/10 text-5xl">
                {item.emoji}
              </div>
            ) : null}
            <div className="flex flex-1 flex-col justify-between gap-4 p-5">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100">{item.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
                  </div>
                  {item.badge && (
                    <span className="shrink-0 rounded-full bg-famboard-primary/10 px-3 py-1 text-xs font-semibold text-famboard-primary dark:bg-sky-500/10 dark:text-sky-200">
                      {item.badge}
                    </span>
                  )}
                </div>
                {item.meta && (
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">{item.meta}</p>
                )}
                {item.tips && (
                  <p className="text-xs text-slate-400 dark:text-slate-500">{item.tips}</p>
                )}
              </div>
              <div className="flex">
                <button
                  type="button"
                  onClick={() => onSelect?.(item)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-famboard-primary px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-famboard-dark focus:outline-none focus:ring-2 focus:ring-famboard-accent focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                >
                  {actionLabel}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
