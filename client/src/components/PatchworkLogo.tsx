import React from 'react';

interface PatchworkLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PatchworkIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="PATCHWORK Icon"
    >
      {/* Visual patch layer 1 */}
      <rect x="6" y="6" width="16" height="16" rx="4" fill="#1B133C" />
      {/* Visual patch layer 2 with weave accent */}
      <rect x="18" y="18" width="16" height="16" rx="4" fill="#1B133C" />
      {/* Interlocking patch junction */}
      <path
        d="M18 10C18 7.79086 19.7909 6 22 6H30C32.2091 6 34 7.79086 34 10V18C34 20.2091 32.2091 22 30 22H22C19.7909 22 18 20.2091 18 18V10Z"
        fill="#6366F1"
        fillOpacity="0.85"
      />
      <circle cx="14" cy="14" r="2.5" fill="#FFFFFF" />
      <circle cx="26" cy="26" r="2.5" fill="#FFFFFF" />
    </svg>
  );
}

export function PatchworkLogo({ className = '', iconOnly = false, size = 'md' }: PatchworkLogoProps) {
  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const textSizes = {
    sm: 'text-sm tracking-wider',
    md: 'text-base tracking-wider',
    lg: 'text-xl tracking-widest',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 font-semibold ${className}`}>
      <PatchworkIcon className={iconSizes[size]} />
      {!iconOnly && (
        <span className={`font-sans font-bold uppercase text-[#1B133C] ${textSizes[size]}`}>
          PATCHWORK
        </span>
      )}
    </div>
  );
}
