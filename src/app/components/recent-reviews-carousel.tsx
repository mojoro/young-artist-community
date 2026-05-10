'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

export type RecentReview = {
  id: string
  rating: number
  title: string | null
  body: string
  reviewer_name: string | null
  year_attended: number | null
  program_slug: string
  program_name: string
  program_average_rating: number | null
  program_review_count: number
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i < rating ? 'text-accent-500' : 'text-slate-200'}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function ReviewCard({ review, index }: { review: RecentReview; index: number }) {
  const reviewer = review.reviewer_name?.trim() || 'Anonymous'
  return (
    <article
      className="review-card flex h-full snap-start scroll-ml-4 flex-col rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5 transition hover:-translate-y-0.5 hover:shadow-md sm:scroll-ml-6 lg:scroll-ml-8"
      style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
    >
      <Stars rating={review.rating} />

      {review.title && (
        <h3 className="mt-3 text-base leading-snug font-semibold text-slate-900">{review.title}</h3>
      )}

      <p
        className="mt-2 text-sm leading-relaxed text-slate-700"
        style={{
          display: '-webkit-box',
          WebkitLineClamp: review.title ? 4 : 5,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {review.body}
      </p>

      <div className="relative mt-auto pt-4">
        <span aria-hidden="true" className="absolute top-0 left-0 h-px w-8 bg-brand-500/40" />
        <p className="truncate text-xs font-medium text-slate-500">
          {reviewer}
          {review.year_attended ? ` · ${review.year_attended}` : ''}
        </p>
        <Link
          href={`/programs/${review.program_slug}`}
          aria-label={`Read ${review.program_name}${
            review.program_average_rating !== null
              ? ` — rated ${review.program_average_rating} out of 5 from ${review.program_review_count} review${review.program_review_count === 1 ? '' : 's'}`
              : ''
          }`}
          className="group/program mt-1 flex items-center justify-between gap-3 rounded-md text-sm transition-colors"
        >
          <span className="min-w-0 truncate font-semibold text-brand-600 transition-colors group-hover/program:text-brand-700">
            {review.program_name}
          </span>
          {review.program_average_rating !== null ? (
            <span className="inline-flex shrink-0 items-center gap-1 text-xs text-slate-500">
              <svg
                className="h-3.5 w-3.5 text-accent-500"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-medium text-slate-700 tabular-nums">
                {review.program_average_rating.toFixed(1)}
              </span>
              <span className="text-slate-400 tabular-nums">({review.program_review_count})</span>
            </span>
          ) : (
            <span
              aria-hidden="true"
              className="shrink-0 text-xs text-brand-600 transition-transform group-hover/program:translate-x-0.5"
            >
              &rarr;
            </span>
          )}
        </Link>
      </div>
    </article>
  )
}

function ScrollButton({
  direction,
  disabled,
  onClick,
}: {
  direction: 'prev' | 'next'
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 'prev' ? 'Scroll to previous reviews' : 'Scroll to next reviews'}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-900/10 transition hover:text-brand-600 hover:shadow-md disabled:pointer-events-none disabled:opacity-30"
    >
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2.25}
        stroke="currentColor"
        aria-hidden="true"
      >
        {direction === 'prev' ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        )}
      </svg>
    </button>
  )
}

const DRAG_THRESHOLD_PX = 5
// Drag past this fraction of a card commits to advancing (browser default is ~50%).
const ADVANCE_FRACTION = 0.2
// How long flick velocity is allowed to "coast" past pointer-up — the rougher equivalent of iOS scroll inertia.
const MOMENTUM_MS = 220
// Velocity samples older than this window are dropped when computing release velocity.
const VELOCITY_WINDOW_MS = 90

type DragState = {
  pointerId: number
  startX: number
  startScrollLeft: number
  moved: boolean
  samples: { sl: number; t: number }[]
}

export function RecentReviewsCarousel({ reviews }: { reviews: RecentReview[] }) {
  const scrollerRef = useRef<HTMLUListElement>(null)
  const dragRef = useRef<DragState | null>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return

    const update = () => {
      const max = el.scrollWidth - el.clientWidth
      setAtStart(el.scrollLeft <= 1)
      setAtEnd(max <= 1 || el.scrollLeft >= max - 1)
    }

    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', update)
      ro.disconnect()
    }
  }, [reviews.length])

  const scrollByPage = (direction: 'prev' | 'next') => {
    const el = scrollerRef.current
    if (!el) return
    const firstCard = el.querySelector<HTMLElement>('[data-card]')
    const step = firstCard
      ? firstCard.getBoundingClientRect().width + 20 // matches gap-5
      : el.clientWidth * 0.9
    el.scrollBy({ left: direction === 'next' ? step : -step, behavior: 'smooth' })
  }

  const onPointerDown = (e: React.PointerEvent<HTMLUListElement>) => {
    // Native touch scrolling is already buttery — only intercept mouse pointers.
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    const el = scrollerRef.current
    if (!el) return
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startScrollLeft: el.scrollLeft,
      moved: false,
      samples: [{ sl: el.scrollLeft, t: performance.now() }],
    }
  }

  const onPointerMove = (e: React.PointerEvent<HTMLUListElement>) => {
    const drag = dragRef.current
    const el = scrollerRef.current
    if (!drag || !el || drag.pointerId !== e.pointerId) return
    const dx = e.clientX - drag.startX
    if (!drag.moved && Math.abs(dx) > DRAG_THRESHOLD_PX) {
      drag.moved = true
      setIsDragging(true)
      try {
        el.setPointerCapture(e.pointerId)
      } catch {
        // ignore — capture can fail if the pointer left the element
      }
    }
    if (drag.moved) {
      el.scrollLeft = drag.startScrollLeft - dx
      drag.samples.push({ sl: el.scrollLeft, t: performance.now() })
      if (drag.samples.length > 6) drag.samples.shift()
      e.preventDefault()
    }
  }

  const endDrag = (e: React.PointerEvent<HTMLUListElement>) => {
    const drag = dragRef.current
    const el = scrollerRef.current
    if (!drag || !el || drag.pointerId !== e.pointerId) return
    const moved = drag.moved
    dragRef.current = null
    if (!moved) return

    setIsDragging(false)
    try {
      el.releasePointerCapture(e.pointerId)
    } catch {
      // ignore
    }
    // Suppress the click that the browser fires after a drag-release on a link.
    const swallow = (clickEv: MouseEvent) => {
      clickEv.preventDefault()
      clickEv.stopPropagation()
    }
    el.addEventListener('click', swallow, { capture: true, once: true })
    // Belt-and-suspenders: drop the listener if no click follows (e.g. release on empty space).
    window.setTimeout(() => el.removeEventListener('click', swallow, true), 0)

    // ----- Custom snap with 20% commit threshold + flick momentum -----
    const cards = Array.from(el.querySelectorAll<HTMLElement>('[data-card]'))
    if (cards.length === 0) return
    const cardStep = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : el.clientWidth

    // Velocity in scrollLeft px/ms over the last ~90ms window.
    const now = performance.now()
    const recent = drag.samples.filter((s) => now - s.t < VELOCITY_WINDOW_MS)
    let velocity = 0
    if (recent.length >= 2) {
      const first = recent[0]
      const last = recent[recent.length - 1]
      const dt = last.t - first.t
      if (dt > 0) velocity = (last.sl - first.sl) / dt
    }

    const dragDelta = el.scrollLeft - drag.startScrollLeft
    const projectedDelta = dragDelta + velocity * MOMENTUM_MS

    const startIdx = Math.round(drag.startScrollLeft / cardStep)
    const fraction = projectedDelta / cardStep
    let advanceBy = 0
    if (Math.abs(fraction) >= ADVANCE_FRACTION) {
      advanceBy =
        fraction > 0 ? Math.max(1, Math.round(fraction)) : Math.min(-1, Math.round(fraction))
    }
    const targetIdx = Math.max(0, Math.min(cards.length - 1, startIdx + advanceBy))
    el.scrollTo({ left: targetIdx * cardStep, behavior: 'smooth' })
  }

  if (reviews.length === 0) return null

  const showButtons = !(atStart && atEnd)

  return (
    <div>
      <ul
        ref={scrollerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={`review-scroller -mx-4 flex gap-5 overflow-x-auto px-4 pt-1 pb-3 select-none sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab snap-x snap-mandatory scroll-smooth'
        }`}
      >
        {reviews.map((r, i) => (
          <li
            key={r.id}
            data-card
            className="w-[80%] shrink-0 sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]"
          >
            <ReviewCard review={r} index={i} />
          </li>
        ))}
      </ul>

      {showButtons && (
        <div className="mt-2 hidden justify-end gap-2 sm:flex">
          <ScrollButton direction="prev" disabled={atStart} onClick={() => scrollByPage('prev')} />
          <ScrollButton direction="next" disabled={atEnd} onClick={() => scrollByPage('next')} />
        </div>
      )}
    </div>
  )
}
