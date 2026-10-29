import React from 'react';

/**
 * Sherpal Lion Icon - Clean Vector Line-Art Lion Head Icon
 * Based on Flaticon Lion Head Line Art (ID 15006161 style).
 */
export default function LionIcon({ className = "w-6 h-6", glow = false }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${glow ? 'drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : ''} transition-all duration-300`}
    >
      {/* Mane Scallop Circles Outline */}
      <path
        d="M32 6 
           C36 6, 40 8, 43 11 
           C47 10, 52 13, 53 17 
           C57 19, 58 24, 57 28 
           C60 32, 59 37, 56 40 
           C57 45, 54 50, 49 52 
           C46 56, 40 57, 36 57 
           L32 58 L28 57 
           C24 57, 18 56, 15 52 
           C10 50, 7 45, 8 40 
           C5 37, 4 32, 7 28 
           C6 24, 7 19, 11 17 
           C12 13, 17 10, 21 11 
           C24 8, 28 6, 32 6 Z"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Lion Ears */}
      <path
        d="M18 18 Q14 12 22 13 Z"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M46 18 Q50 12 42 13 Z"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Face Inner Outline */}
      <path
        d="M23 23 C23 20, 41 20, 41 23 C43 33, 40 45, 32 49 C24 45, 21 33, 23 23 Z"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Eyes */}
      <circle cx="26" cy="30" r="2.5" fill="currentColor" />
      <circle cx="38" cy="30" r="2.5" fill="currentColor" />

      {/* Nose Triangle */}
      <path
        d="M32 35 L36 39 C36 41, 28 41, 28 39 Z"
        fill="currentColor"
      />

      {/* Muzzle / Smile Lines */}
      <path
        d="M32 40 L32 44 M32 44 Q28 47 25 44 M32 44 Q36 47 39 44"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Forehead Crown Sparkle */}
      <path
        d="M32 21 L33.5 24.5 L37 25 L34.2 27.2 L35.2 30.5 L32 28.5 L28.8 30.5 L29.8 27.2 L27 25 L30.5 24.5 Z"
        fill="currentColor"
        opacity="0.85"
      />
    </svg>
  );
}
