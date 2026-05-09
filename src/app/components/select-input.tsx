'use client'

import { useState, type SelectHTMLAttributes } from 'react'

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  wrapperClassName?: string
}

export function SelectInput({
  wrapperClassName = '',
  className = '',
  children,
  onMouseDown,
  onKeyDown,
  onChange,
  onBlur,
  ...props
}: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <span
      className={`select-wrap relative inline-block w-full ${wrapperClassName}`}
      data-open={isOpen}
    >
      <select
        className={`w-full ${className}`}
        onMouseDown={(e) => {
          // Native dropdown toggles on mousedown — flip our state to match.
          setIsOpen((prev) => !prev)
          onMouseDown?.(e)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape' || e.key === 'Tab') {
            setIsOpen(false)
          } else if (
            e.key === ' ' ||
            e.key === 'Enter' ||
            e.key === 'ArrowDown' ||
            e.key === 'ArrowUp'
          ) {
            // These keys open the dropdown (when closed) or commit selection
            // (when open) — in the latter case `change` will close it for us.
            setIsOpen(true)
          }
          onKeyDown?.(e)
        }}
        onChange={(e) => {
          setIsOpen(false)
          onChange?.(e)
        }}
        onBlur={(e) => {
          setIsOpen(false)
          onBlur?.(e)
        }}
        {...props}
      >
        {children}
      </select>
      <svg
        className="select-chevron"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="m19.5 8.25-7.5 7.5-7.5-7.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}
