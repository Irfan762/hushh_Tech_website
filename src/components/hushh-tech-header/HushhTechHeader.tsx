/**
 * HushhTechHeader — Fixed header with hamburger menu + stock ticker
 * Always fixed to top of viewport. Includes spacer div to prevent
 * content from hiding behind it.
 *
 * Left: Hushh logo + brand name. Right: hamburger menu button.
 * Below: Scrolling stock ticker with live quotes (Google, Apple, etc.)
 */
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useBreakpointValue } from "@chakra-ui/react";
import HushhLogo from "../brand/HushhLogo";
import HushhTechNavDrawer from "../hushh-tech-nav-drawer/HushhTechNavDrawer";
import LanguageSwitcher from "../LanguageSwitcher";
import { useStockQuotes, StockQuote } from "../../hooks/useStockQuotes";
import { useAuthSession } from "../../auth/AuthSessionProvider";

/* ── Chip-based ticker component — matches Navbar design ── */
const TickerChip = ({ quote, isLoading }: { quote: StockQuote; isLoading?: boolean }) => (
  <div className="group flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-white border border-gray-200 shadow-sm pl-1.5 pr-3 hover:shadow-md transition-all">
    {/* Logo circle */}
    <div className="flex w-6 h-6 items-center justify-center rounded-full bg-gray-100 shrink-0 overflow-hidden">
      {quote.logo ? (
        <img
          src={quote.logo}
          alt={`${quote.displaySymbol} logo`}
          className="w-3.5 h-3.5 object-contain"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      ) : (
        <span className="text-[9px] font-bold text-gray-600">
          {quote.displaySymbol.charAt(0)}
        </span>
      )}
    </div>

    {/* Symbol */}
    <span className="text-[11px] font-bold text-gray-800 leading-none">
      {quote.displaySymbol}
    </span>

    {/* Change arrow + percent */}
    <div className={`ml-0.5 flex items-center gap-0.5 ${quote.isUp ? "text-green-600" : "text-red-500"}`}>
      <span className="text-[9px]">{quote.isUp ? "▲" : "▼"}</span>
      <span className={`text-[10px] font-semibold ${isLoading ? "animate-pulse" : ""}`}>
        {Math.abs(quote.percentChange).toFixed(1)}%
      </span>
    </div>
  </div>
);

interface HushhTechHeaderProps {
  /** Whether to show the stock ticker strip (default: true) */
  showTicker?: boolean;
  /** Extra classes on the root container */
  className?: string;
  /** Whether to show a back button on the left (default: false) */
  showBack?: boolean;
  /** Callback for the back button */
  onBackClick?: () => void;
}

const HushhTechHeader: React.FC<HushhTechHeaderProps> = ({
  showTicker = true,
  className = "",
  showBack = false,
  onBackClick,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { status, signOut } = useAuthSession();
  
  const isDesktop = useBreakpointValue({ base: false, lg: true });
  const isAuthenticated = status === "authenticated";

  // Fetch real-time stock quotes (refreshes every 2 minutes)
  const { quotes, loading: quotesLoading, lastUpdated } = useStockQuotes(120000);

  const isActive = (path: string) => location.pathname === path;

  const primaryNavLinks = [
    { path: "/", label: t('nav.home', 'Home') },
    { path: "/about/philosophy", label: t('nav.ourPhilosophy', 'Our Philosophy') },
    { path: "/discover-fund-a", label: t('nav.fundA', 'Fund A') },
    { path: "/community", label: t('nav.community', 'Community') },
    { path: "/a2a-playground", label: t('nav.kycStudio', 'KYC Studio') },
    { path: "/contact", label: t('nav.contact', 'Contact') },
    { path: "/faq", label: t('nav.faq', 'FAQ') },
  ];

  return (
    <>
      {/* Fixed header — always pinned to top */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-white shadow-sm transition-colors duration-300 ${className}`}
      >
        {/* ── Top bar: Logo + Links + Hamburger ── */}
        <div className="w-full px-6 md:px-12 h-16 flex items-center">
          {/* 1. Left: Logo (Fixed width for symmetry) */}
          <div className="w-[180px] lg:w-[240px] flex-shrink-0">
            <HushhLogo onClick={() => navigate("/")} />
          </div>

          {/* 2. Center: Desktop Navigation (Takes remaining space and centers content) */}
          <div className="hidden lg:flex items-center justify-center flex-1 gap-1 px-4 overflow-hidden">
            {primaryNavLinks.map(({ path, label }) => {
              const active = isActive(path);
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`rounded-full px-3 py-2 text-[13px] font-semibold transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-[#2F80ED]/10 text-[#1f6cc7]'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* 3. Right: Utilities (Same fixed width for symmetry) */}
          <div className="w-[180px] lg:w-[240px] flex items-center justify-end gap-2 shrink-0">
            {/* Language Selector */}
            <LanguageSwitcher variant="light" />

            {/* Desktop Utility Actions */}
            {isDesktop && (
              <>
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => navigate('/hushh-user-profile')}
                      className="hidden xl:inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      {t('nav.viewProfile', 'View Profile')}
                    </button>
                    <button
                      onClick={async () => await signOut()}
                      className="inline-flex items-center justify-center rounded-full bg-[#2F80ED] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1f6cc7] transition-colors"
                    >
                      {t('nav.logout', 'Log Out')}
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate('/Login')}
                      className="inline-flex items-center justify-center rounded-full bg-[#2F80ED] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1f6cc7] transition-colors"
                    >
                      {t('nav.login', 'Log In')}
                    </button>
                    <button
                      onClick={() => navigate('/Signup')}
                      className="inline-flex items-center justify-center rounded-full bg-white border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {t('nav.signUp', 'Sign Up')}
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Mobile Hamburger menu button */}
            {!isDesktop && (
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center justify-center w-11 h-11 rounded-full bg-[#1c1c1e] text-white active:scale-95 transition-transform hover:bg-[#2c2c2e]"
                aria-label="Toggle menu"
                tabIndex={0}
              >
                <span className="material-symbols-outlined text-white !text-[1.2rem]">
                  menu
                </span>
              </button>
            )}
          </div>
        </div>

        {/* ── Stock Ticker Strip — below header nav ── */}
        {showTicker && (
          <section className="relative w-full bg-[#F8F9FA] py-2 border-t border-b border-gray-200">
            {/* Fade-masked marquee */}
            <div className="hushh-ticker-mask relative flex w-full overflow-hidden">
              <div className="hushh-ticker-track flex items-center gap-2.5 px-3">
                {/* First set */}
                {quotes.map((quote, idx) => (
                  <TickerChip
                    key={`a-${quote.symbol}-${idx}`}
                    quote={quote}
                    isLoading={quotesLoading && quotes.length === 0}
                  />
                ))}
                {/* Duplicate for seamless loop */}
                {quotes.map((quote, idx) => (
                  <TickerChip
                    key={`b-${quote.symbol}-${idx}`}
                    quote={quote}
                    isLoading={quotesLoading && quotes.length === 0}
                  />
                ))}
              </div>
            </div>

            {/* Live indicator dot */}
            {lastUpdated && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] font-medium text-gray-400">
                  {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            )}
          </section>
        )}
      </header>

      {/* Spacer — prevents content from hiding behind the fixed header */}
      {/* Nav bar ~72px + ticker strip ~49px = ~121px when ticker shown */}
      <div className={showTicker ? "h-[121px]" : "h-[72px]"} />

      {/* Navigation Drawer */}
      <HushhTechNavDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      {/* Ticker animation styles */}
      <style>{`
        .hushh-ticker-mask {
          mask-image: linear-gradient(to right, transparent, black 4%, black 96%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 4%, black 96%, transparent);
        }
        .hushh-ticker-track {
          display: flex;
          animation: hushh-ticker-scroll 45s linear infinite;
          width: max-content;
        }
        @keyframes hushh-ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .hushh-ticker-mask:hover .hushh-ticker-track {
          animation-play-state: paused;
        }
      `}</style>
    </>
  );
};

export default HushhTechHeader;
