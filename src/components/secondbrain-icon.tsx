export function SecondBrainIcon({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="echo-grad" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="50%" stopColor="#d946ef" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <filter id="echo-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Background glow */}
      <rect x="4" y="5" width="24" height="23" rx="7" fill="url(#echo-grad)" opacity="0.12" />

      {/* Stylized E + cognitive spark */}
      <path
        d="M10 8h8c1.7 0 3.5 .9 3.5 3s-1.8 2.5-4.5 2.5c-1.3 0-2.3-.4-3-1.2C13 12 13.5 12.5 14 14v5c0 1-.5 1.5-1.5 1.5S11 20 11 19V12H10v8h3"
        stroke="url(#echo-grad)"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#echo-glow)"
      />

      {/* Mind sparks */}
      <circle cx="22" cy="9" r="1.7" fill="#22d3ee" opacity={0.9} />
      <circle cx="25" cy="17" r="1.15" fill="#d946ef" opacity={0.8} />
      <circle cx="18" cy="25" r="1.35" fill="#a78bfa" opacity={0.85} />

      {/* Inner pulse dot */}
      <circle cx="16" cy="12" r="1" fill="#f0abfc" opacity={0.65}>
        <animate attributeName="opacity" values="0.35; 0.8; 0.35" dur="2.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

/** Compact version for nav/tabs */
export function SecondMark({ className }: { className?: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="mg" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="50%" stopColor="#d946ef" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <rect x="2" y="3" width="28" height="27" rx="8" fill="url(#mg)" opacity="0.18" />
      <path d="M10 8h8c1.7 0 3.5 .9 3.5 3s-1.8 2.5-4.5 2.5c-1.3 0-2.3-.4-3-1.2C13 12 13.5 12.5 14 14v5c0 1-.5 1.5-1.5 1.5S11 20 11 19V12H10v8h3" stroke="url(#mg)" strokeWidth={2.75} strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="22" cy="9" r="1.9" fill="#22d3ee" />
      <circle cx="26" cy="17" r="1.3" fill="#d946ef" />
      <circle cx="18" cy="26" r="1.45" fill="#a78bfa" />
      <circle cx="16" cy="12" r="1.05" fill="#f0abfc" opacity={0.75} />
    </svg>
  );
}

/** Tiny favicon version */
export function SecondFavicon() {
  return (
    <svg width="48" height="48" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fv" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#a78bfa" /><stop offset="50%" stopColor="#d946ef" /><stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <rect width="28" height="27" x="2" y="3" rx="7" fill="url(#fv)" opacity="0.15" />
      <path d="M10 8h8c1.7 0 3.5 .9 3.5 3s-1.8 2.5-4.5 2.5c-1.3 0-2.3-.4-3-1.2C13 12 13.5 12.5 14 14v5c0 1-.5 1.5-1.5 1.5S11 20 11 19V12H10v8h3" stroke="url(#fv)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="22" cy="9" r="2" fill="#22d3ee" />
      <circle cx="26" cy="17" r="1.4" fill="#d946ef" />
      <circle cx="18" cy="26" r="1.55" fill="#a78bfa" />
      <circle cx="16" cy="12" r="1.15" fill="#f0abfc" opacity="0.8" />
    </svg>
  );
}
