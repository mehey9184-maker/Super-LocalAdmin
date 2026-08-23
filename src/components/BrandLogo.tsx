import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: number;
  variant?: 'emblem' | 'full';
  textColor?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = 'w-8 h-8',
  size,
  variant = 'emblem',
  textColor,
}) => {
  const styleOverride = size
    ? {
        width: `${size}px`,
        height: variant === 'full' ? `${Math.round(size * (64 / 240))}px` : `${size}px`,
      }
    : undefined;

  if (variant === 'full') {
    return (
      <svg
        width={size ? size : 240}
        height={size ? Math.round(size * (64 / 240)) : 64}
        style={styleOverride}
        className={className}
        viewBox="0 0 240 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="brandGradientFull" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF5400" />
            <stop offset="1" stopColor="#FF8C00" />
          </linearGradient>
          
          <linearGradient id="metallicWhiteFull" x1="0" y1="0" x2="0" y2="64">
            <stop stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#F0F0F0" stopOpacity="0.8" />
          </linearGradient>

          <filter id="softShadowFull" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#FF5400" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Flame / Spoon Emblem */}
        <g filter="url(#softShadowFull)">
          <path
            d="M32 12C20.9543 12 12 20.9543 12 32C12 43.0457 20.9543 52 32 52C43.0457 52 52 43.0457 52 32C52 24 46 16 32 12Z"
            fill="url(#brandGradientFull)"
          />
          <path
            d="M32 18C25.3726 18 20 24.268 20 32C20 39.732 25.3726 46 32 46C38.6274 46 44 39.732 44 32C44 26 39 20 32 18ZM32 40C27.5817 40 24 36.4183 24 32C24 27.5817 27.5817 24 32 24C36.4183 24 40 27.5817 40 32C40 36.4183 36.4183 40 32 40Z"
            fill="url(#metallicWhiteFull)"
          />
          <path
            d="M32 24C34.2091 24 36 25.7909 36 28C36 30.2091 34.2091 32 32 32C29.7909 32 28 30.2091 28 28C28 25.7909 29.7909 24 32 24Z"
            fill="#FFFFFF"
          />
        </g>

        {/* Typography: LocalEats */}
        <text
          x="68"
          y="42"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="800"
          fontSize="28"
          letterSpacing="-0.5"
          fill={textColor || '#000000'}
        >
          Local<tspan fill="url(#brandGradientFull)">Eats</tspan>
        </text>
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      style={styleOverride}
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="brandGradientEmblem" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF5400" />
          <stop offset="1" stopColor="#FF8C00" />
        </linearGradient>
        
        <linearGradient id="metallicWhiteEmblem" x1="0" y1="0" x2="0" y2="64">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#F0F0F0" stopOpacity="0.8" />
        </linearGradient>

        <filter id="softShadowEmblem" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#FF5400" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Flame / Spoon Emblem */}
      <g filter="url(#softShadowEmblem)">
        <path
          d="M32 12C20.9543 12 12 20.9543 12 32C12 43.0457 20.9543 52 32 52C43.0457 52 52 43.0457 52 32C52 24 46 16 32 12Z"
          fill="url(#brandGradientEmblem)"
        />
        <path
          d="M32 18C25.3726 18 20 24.268 20 32C20 39.732 25.3726 46 32 46C38.6274 46 44 39.732 44 32C44 26 39 20 32 18ZM32 40C27.5817 40 24 36.4183 24 32C24 27.5817 27.5817 24 32 24C36.4183 24 40 27.5817 40 32C40 36.4183 36.4183 40 32 40Z"
          fill="url(#metallicWhiteEmblem)"
        />
        <path
          d="M32 24C34.2091 24 36 25.7909 36 28C36 30.2091 34.2091 32 32 32C29.7909 32 28 30.2091 28 28C28 25.7909 29.7909 24 32 24Z"
          fill="#FFFFFF"
        />
      </g>
    </svg>
  );
};


