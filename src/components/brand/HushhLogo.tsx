import React from "react";
import hushhLogo from "../images/Hushhogo.png";

interface HushhLogoProps {
  className?: string;
  onClick?: () => void;
  /** Whether to show the text or just the icon (default: true) */
  showText?: boolean;
  /** Variant for different background themes */
  theme?: "light" | "dark";
}

/**
 * Standardized Hushh Logo component to ensure branding consistency
 * across all navigation headers and footers.
 */
const HushhLogo: React.FC<HushhLogoProps> = ({ 
  className = "", 
  onClick,
  showText = true,
  theme = "light"
}) => {
  const isDark = theme === "dark";

  const Wrapper = onClick ? 'button' : 'div';

  return (
    <Wrapper 
      type={onClick ? 'button' : undefined}
      className={`flex items-center gap-3 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`} 
      onClick={onClick}
      aria-label={onClick ? 'Hushh Technologies – Go to homepage' : undefined}
    >
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
        <img
          src={hushhLogo}
          alt="Hushh Logo"
          className="w-11 h-11 object-contain"
          loading="eager"
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`text-[18px] font-bold tracking-tight leading-none ${isDark ? "text-white" : "text-gray-900"}`}>
            hushh
          </span>
          <span className={`text-[11px] font-medium tracking-[0.08em] uppercase mt-0.5 ${isDark ? "text-white/60" : "text-gray-400"}`}>
            Technologies
          </span>
        </div>
      )}
    </Wrapper>
  );
};

export default HushhLogo;
