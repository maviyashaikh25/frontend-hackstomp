export default function LogoIcon({ size = 44, color = 'var(--sage-dark)' }) {
  return (
    <svg
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className="logo-svg"
      style={{ color }}
    >
      <circle cx="30" cy="30" r="28" stroke="currentColor" strokeWidth="3" />
      <path d="M30 14v32M14 30h32" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <circle cx="30" cy="30" r="8" fill="currentColor" opacity="0.15" />
    </svg>
  )
}
