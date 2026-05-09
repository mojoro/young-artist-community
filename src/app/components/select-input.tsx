import type { SelectHTMLAttributes } from 'react'

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  wrapperClassName?: string
}

export function SelectInput({ wrapperClassName = '', className = '', children, ...props }: Props) {
  return (
    <span className={`select-wrap relative inline-block w-full ${wrapperClassName}`}>
      <select className={`w-full ${className}`} {...props}>
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
