import React from "react";

export type MascotState = "idle" | "analyzing" | "alert" | "success";
export type MascotSize = "xs" | "sm" | "md" | "lg" | "xl";

interface SentinelMascotProps {
  state?: MascotState;
  size?: MascotSize;
  className?: string;
  glow?: boolean;
}

const sizeDimensions: Record<MascotSize, number> = {
  xs: 20,
  sm: 28,
  md: 40,
  lg: 56,
  xl: 80,
};

export const SentinelMascot: React.FC<SentinelMascotProps> = ({
  state = "idle",
  size = "md",
  className = "",
  glow = true,
}) => {
  const dim = sizeDimensions[size];

  // Colors based on state
  const stateColors = {
    idle: {
      primary: "#6366F1",    // Indigo
      secondary: "#06B6D4",  // Cyan
      accent: "#818CF8",     // Light indigo
      eye: "#38BDF8",        // Bright Sky
      glow: "rgba(99, 102, 241, 0.35)",
    },
    analyzing: {
      primary: "#8B5CF6",    // Violet
      secondary: "#06B6D4",  // Cyan
      accent: "#A78BFA",     // Light purple
      eye: "#F43F5E",        // Scanning Rose/Cyan
      glow: "rgba(139, 92, 246, 0.45)",
    },
    alert: {
      primary: "#F43F5E",    // Rose
      secondary: "#F59E0B",  // Amber
      accent: "#FDA4AF",
      eye: "#EF4444",
      glow: "rgba(244, 63, 94, 0.45)",
    },
    success: {
      primary: "#10B981",    // Emerald
      secondary: "#06D6A0",  // Mint
      accent: "#6EE7B7",
      eye: "#34D399",
      glow: "rgba(16, 185, 129, 0.45)",
    },
  }[state];

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: dim, height: dim }}
    >
      {/* Subtle back-glow */}
      {glow && (
        <div
          className="absolute inset-0 rounded-full blur-md opacity-70 transition-all duration-700 pointer-events-none"
          style={{ background: stateColors.glow }}
        />
      )}

      {/* Cybernetic Sentinel Guardian Vector Mascot */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 transition-transform duration-300 hover:scale-105"
      >
        <defs>
          <linearGradient id={`sg-body-${state}`} x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop stopColor={stateColors.primary} />
            <stop offset="0.5" stopColor={stateColors.secondary} />
            <stop offset="1" stopColor={stateColors.accent} />
          </linearGradient>

          <linearGradient id={`sg-core-${state}`} x1="30" y1="30" x2="70" y2="70" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0E1015" />
            <stop offset="1" stopColor="#1A1E29" />
          </linearGradient>

          <radialGradient id={`sg-eye-glow-${state}`} cx="50" cy="48" r="14" gradientUnits="userSpaceOnUse">
            <stop stopColor={stateColors.eye} stopOpacity="1" />
            <stop offset="0.6" stopColor={stateColors.eye} stopOpacity="0.5" />
            <stop offset="1" stopColor={stateColors.eye} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Hexagonal Shield Frame */}
        <polygon
          points="50,6 88,24 88,68 50,94 12,68 12,24"
          fill={`url(#sg-core-${state})`}
          stroke={`url(#sg-body-${state})`}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Angular Wing / Shoulder Armor Insets */}
        <polygon
          points="50,14 80,29 80,62 50,84 20,62 20,29"
          fill="none"
          stroke={stateColors.primary}
          strokeWidth="1.2"
          strokeOpacity="0.4"
        />

        {/* Guardian Forehead Crest */}
        <polygon
          points="50,18 64,28 50,33 36,28"
          fill={stateColors.primary}
          fillOpacity="0.4"
          stroke={stateColors.accent}
          strokeWidth="1.5"
        />

        {/* Central Visor / Cybernetic Eye Housing */}
        <path
          d="M 32 46 C 32 42, 40 38, 50 38 C 60 38, 68 42, 68 46 C 68 54, 60 58, 50 58 C 40 58, 32 54, 32 46 Z"
          fill="#0A0B0E"
          stroke={`url(#sg-body-${state})`}
          strokeWidth="2"
        />

        {/* Eye Glow Radial */}
        <circle cx="50" cy="47" r="12" fill={`url(#sg-eye-glow-${state})`} />

        {/* Cybernetic Pupil with Animation */}
        <circle
          cx="50"
          cy="47"
          r="4.5"
          fill={stateColors.eye}
          className={
            state === "analyzing"
              ? "animate-pulse"
              : state === "idle"
              ? "animate-pulse-slow"
              : ""
          }
        />
        <circle cx="51" cy="45.5" r="1.5" fill="#FFFFFF" opacity="0.9" />

        {/* Horizontal Scanner Beam Line */}
        <line
          x1="36"
          y1="47"
          x2="64"
          y2="47"
          stroke={stateColors.eye}
          strokeWidth="1"
          strokeOpacity="0.7"
          strokeDasharray="2 2"
        />

        {/* Lower Chin Armor Plate */}
        <polygon
          points="42,65 58,65 50,76"
          fill={stateColors.primary}
          fillOpacity="0.3"
          stroke={stateColors.accent}
          strokeWidth="1.5"
        />

        {/* Micro Circuit Nodes */}
        <circle cx="28" cy="36" r="1.5" fill={stateColors.secondary} />
        <circle cx="72" cy="36" r="1.5" fill={stateColors.secondary} />
        <circle cx="50" cy="88" r="1.8" fill={stateColors.accent} />
      </svg>
    </div>
  );
};
