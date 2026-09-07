import React from 'react';

/**
 * Official Google Gemini AI Sparkle Icon Component
 * Renders the iconic 4-point organic curved star geometry of Google Gemini AI.
 */
export default function GeminiIcon({ 
  className = "w-6 h-6", 
  variant = "gradient", // 'gradient' | 'white' | 'currentColor'
  size = 24,
  sparkles = true,
  ...props 
}) {
  const gradientId = React.useId ? React.useId().replace(/:/g, '') : 'gemini-sparkle-grad';

  if (variant === 'white') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        width={size}
        height={size}
        {...props}
      >
        <path
          d="M12 0C12 6.62742 6.62742 12 0 12C6.62742 12 12 17.3726 12 24C12 17.3726 17.3726 12 24 12C17.3726 12 12 6.62742 12 0Z"
          fill="#FFFFFF"
        />
        {sparkles && (
          <path
            d="M19 1C19 2.65685 17.6569 4 16 4C17.6569 4 19 5.34315 19 7C19 5.34315 20.3431 4 22 4C20.3431 4 19 2.65685 19 1Z"
            fill="#FFFFFF"
            opacity="0.9"
          />
        )}
      </svg>
    );
  }

  if (variant === 'currentColor') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        width={size}
        height={size}
        {...props}
      >
        <path
          d="M12 0C12 6.62742 6.62742 12 0 12C6.62742 12 12 17.3726 12 24C12 17.3726 17.3726 12 24 12C17.3726 12 12 6.62742 12 0Z"
          fill="currentColor"
        />
        {sparkles && (
          <path
            d="M19 1C19 2.65685 17.6569 4 16 4C17.6569 4 19 5.34315 19 7C19 5.34315 20.3431 4 22 4C20.3431 4 19 2.65685 19 1Z"
            fill="currentColor"
            opacity="0.85"
          />
        )}
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      {...props}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="35%" stopColor="#7C3AED" />
          <stop offset="70%" stopColor="#9333EA" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      <path
        d="M12 0C12 6.62742 6.62742 12 0 12C6.62742 12 12 17.3726 12 24C12 17.3726 17.3726 12 24 12C17.3726 12 12 6.62742 12 0Z"
        fill={`url(#${gradientId})`}
      />
      {sparkles && (
        <path
          d="M19 1C19 2.65685 17.6569 4 16 4C17.6569 4 19 5.34315 19 7C19 5.34315 20.3431 4 22 4C20.3431 4 19 2.65685 19 1Z"
          fill={`url(#${gradientId})`}
          opacity="0.9"
        />
      )}
    </svg>
  );
}
