import React from 'react';

/**
 * Foxtail Orchid (Kopou Phool / Rhynchostylis retusa) Icon
 * Iconic North-East Indian flora (State flower of Assam & Arunachal Pradesh, 
 * revered across Meghalaya and the North-East).
 * Rendered in clean scalable vectors for crisp small-size and favicon legibility.
 */
export default function FoxtailOrchidIcon({ className = "w-6 h-6", color = "currentColor", fill = "currentColor" }) {
  return (
    <svg 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      aria-hidden="true"
    >
      {/* Graceful Arching Central Rachis / Stem */}
      <path 
        d="M8 28C10 21 13 14 18 8C20 5.5 22.5 4 25 4" 
        stroke={color} 
        strokeWidth="2.2" 
        strokeLinecap="round" 
      />
      {/* Cascading Foxtail Orchid Florets */}
      <circle cx="24" cy="5.5" r="2.2" fill={fill} />
      
      {/* Upper Florets */}
      <ellipse cx="19.5" cy="8.5" rx="2.5" ry="2.2" transform="rotate(-15 19.5 8.5)" fill={fill} />
      <ellipse cx="23" cy="11" rx="2.4" ry="2" transform="rotate(20 23 11)" fill={fill} />
      
      {/* Middle Florets Cluster */}
      <ellipse cx="16" cy="13.5" rx="2.8" ry="2.3" transform="rotate(-25 16 13.5)" fill={fill} />
      <ellipse cx="20.5" cy="15.5" rx="2.6" ry="2.2" transform="rotate(15 20.5 15.5)" fill={fill} />
      <circle cx="18" cy="14.5" r="1" fill="#FFF7ED" />
      
      {/* Lower Mid Cluster */}
      <ellipse cx="13" cy="18.5" rx="3" ry="2.4" transform="rotate(-30 13 18.5)" fill={fill} />
      <ellipse cx="17.5" cy="20.5" rx="2.7" ry="2.3" transform="rotate(20 17.5 20.5)" fill={fill} />
      <circle cx="15" cy="19.5" r="1.1" fill="#FFF7ED" />
      
      {/* Bottom Cascading Florets */}
      <ellipse cx="10.5" cy="23.5" rx="2.6" ry="2.2" transform="rotate(-35 10.5 23.5)" fill={fill} />
      <ellipse cx="14" cy="25" rx="2.3" ry="2" transform="rotate(15 14 25)" fill={fill} />
      
      {/* Base Leaf */}
      <path 
        d="M6 28C6 24 8 22 11 21C9 24 8.5 26.5 8 28H6Z" 
        fill={fill} 
        opacity="0.85" 
      />
    </svg>
  );
}
