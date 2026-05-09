'use client'

import { useEffect, useId, useRef, useState } from 'react'

interface Option {
  value: string
  label: string
}

interface Props {
  name: string
  options: Option[]
  defaultValue?: string
  className?: string
  wrapperClassName?: string
  id?: string
  disabled?: boolean
  'aria-label'?: string
}

export function SelectInput({
  name,
  options,
  defaultValue = '',
  className = '',
  wrapperClassName = '',
  id,
  disabled = false,
  'aria-label': ariaLabel,
}: Props) {
  const generatedId = useId()
  const triggerId = id ?? generatedId
  const listboxId = `${triggerId}-listbox`

  const [value, setValue] = useState(defaultValue)
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const wrapperRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listboxRef = useRef<HTMLUListElement>(null)

  const currentOption = options.find((o) => o.value === value)
  const displayLabel = currentOption?.label ?? ''

  function openDropdown() {
    const idx = options.findIndex((o) => o.value === value)
    setHighlightedIndex(idx >= 0 ? idx : 0)
    setIsOpen(true)
  }

  function closeDropdown() {
    setIsOpen(false)
  }

  function toggleDropdown() {
    if (isOpen) closeDropdown()
    else openDropdown()
  }

  // Close on outside click.
  useEffect(() => {
    if (!isOpen) return
    function onMouseDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [isOpen])

  // Keep the highlighted option scrolled into view during keyboard navigation.
  useEffect(() => {
    if (!isOpen || highlightedIndex < 0) return
    const item = listboxRef.current?.children[highlightedIndex] as HTMLElement | undefined
    item?.scrollIntoView({ block: 'nearest' })
  }, [isOpen, highlightedIndex])

  function selectOption(opt: Option) {
    setValue(opt.value)
    closeDropdown()
    triggerRef.current?.focus()
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    switch (e.key) {
      case 'Escape':
        if (isOpen) {
          e.preventDefault()
          closeDropdown()
        }
        return
      case 'ArrowDown':
        e.preventDefault()
        if (!isOpen) openDropdown()
        else setHighlightedIndex((i) => Math.min(options.length - 1, i + 1))
        return
      case 'ArrowUp':
        e.preventDefault()
        if (!isOpen) openDropdown()
        else setHighlightedIndex((i) => Math.max(0, i - 1))
        return
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (!isOpen) {
          openDropdown()
        } else if (highlightedIndex >= 0) {
          const opt = options[highlightedIndex]
          if (opt) selectOption(opt)
        }
        return
      case 'Home':
        if (isOpen) {
          e.preventDefault()
          setHighlightedIndex(0)
        }
        return
      case 'End':
        if (isOpen) {
          e.preventDefault()
          setHighlightedIndex(options.length - 1)
        }
        return
      case 'Tab':
        if (isOpen) closeDropdown()
        return
    }
  }

  return (
    <div
      ref={wrapperRef}
      className={`select-wrap relative inline-block w-full ${wrapperClassName}`}
      data-open={isOpen}
    >
      <input type="hidden" name={name} value={value} />
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={
          isOpen && highlightedIndex >= 0 ? `${listboxId}-opt-${highlightedIndex}` : undefined
        }
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={toggleDropdown}
        onKeyDown={onKeyDown}
        className={`w-full text-left ${className}`}
      >
        {displayLabel || <span className="text-slate-400">Select…</span>}
      </button>
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
      {isOpen && (
        <ul ref={listboxRef} id={listboxId} role="listbox" tabIndex={-1} className="select-listbox">
          {options.map((opt, i) => (
            <li
              key={opt.value}
              id={`${listboxId}-opt-${i}`}
              role="option"
              aria-selected={opt.value === value}
              data-highlighted={i === highlightedIndex}
              // Prevent button blur on mousedown so the click that picks the
              // option fires before the trigger loses focus.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => selectOption(opt)}
              onMouseEnter={() => setHighlightedIndex(i)}
              className="select-option"
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
