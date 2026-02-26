import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@shared/auth";
import LanguagePicker from "./LanguagePicker";
import ThemeToggle from "./ThemeToggle";
import logoIcon from "../assets/icons/R-picto-seul-blanc.png";

const primaryNavItems: { label: string; hasDropdown?: boolean }[] = [
  { label: "Ticketing", hasDropdown: true },
  { label: "Administrative", hasDropdown: true },
  { label: "Sales", hasDropdown: true },
  { label: "Contracts" },
  { label: "Security" },
  { label: "Resources" },
];

const Navbar = () => {
  const location = useLocation();
  const { t } = useTranslation("common");
  const { user, logout, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path: string): boolean => location.pathname === path;

  const navLinkClass = (path: string) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive(path)
        ? "bg-secondary text-white"
        : "text-white/80 hover:text-white hover:bg-white/10"
    }`;

  return (
    <header className="bg-surface dark:bg-surface-dark border-b border-border/20 dark:border-border-dark sticky top-0 z-50 shadow-sm font-sans text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-md text-white/80 hover:bg-white/10"
              aria-label="Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Brand */}
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2">
                <span className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shadow-sm overflow-hidden">
                  <img
                    src={logoIcon}
                    alt="MyR Panel"
                    className="w-7 h-7 object-contain"
                  />
                </span>
                <span className="text-lg font-bold tracking-tight text-white">
                  MyR<span className="text-primary"> Panel</span>
                </span>
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                {primaryNavItems.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    className="inline-flex items-center gap-1 px-2 py-1 text-sm font-medium text-white/90 hover:text-white"
                  >
                    <span>{item.label}</span>
                    {item.hasDropdown && (
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <LanguagePicker />
              {/* Theme toggle only in header on desktop; on mobile it lives in the sidebar */}
              <div className="hidden md:block">
                <ThemeToggle />
              </div>
            </div>
            {!loading && user ? (
              <div ref={profileRef} className="relative flex items-center gap-3">
                <button
                  onClick={() => setProfileOpen((o) => !o)}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-transparent"
                  aria-label="Profile menu"
                  aria-expanded={profileOpen}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-1 w-56 bg-surface dark:bg-surface-dark rounded-lg shadow-lg border border-border dark:border-border-dark z-50">
                    <div className="px-4 py-3 border-b border-border/60 dark:border-border-dark/60">
                      <p className="text-xs text-textSecondary dark:text-textSecondary-dark">
                        {t("auth.signedInAs")}
                      </p>
                      <p
                        className="mt-0.5 text-sm font-medium text-textPrimary dark:text-textPrimary-dark truncate"
                        title={user.email}
                      >
                        {user.email}
                      </p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/info"
                        onClick={() => setProfileOpen(false)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-textSecondary dark:text-textSecondary-dark hover:bg-background dark:hover:bg-background-dark"
                      >
                        <span className="w-4 h-4 rounded-full bg-secondary/20 flex items-center justify-center text-[10px] text-secondary-on-light">
                          i
                        </span>
                        <span>{t("nav.info")}</span>
                      </Link>
                      <a
                        href="http://localhost:8080"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setProfileOpen(false)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-textSecondary dark:text-textSecondary-dark hover:bg-background dark:hover:bg-background-dark"
                      >
                        <svg
                          className="w-4 h-4 text-textSecondary dark:text-textSecondary-dark"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                        <span>{t("nav.admin")}</span>
                      </a>
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-textSecondary dark:text-textSecondary-dark hover:bg-background dark:hover:bg-background-dark flex items-center gap-2"
                      >
                        <svg
                          className="w-4 h-4 text-textSecondary dark:text-textSecondary-dark"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {t("auth.logout")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              !loading && (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="px-3 py-1.5 text-sm font-medium text-white/90 rounded-lg border border-white/30 hover:bg-white/10 transition-colors"
                  >
                    {t("auth.signIn")}
                  </Link>
                  <Link
                    to="/register"
                    className="px-3 py-1.5 text-sm font-medium text-secondary-on-light bg-secondary rounded-lg hover:opacity-90 transition-colors"
                  >
                    {t("auth.signUp")}
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Mobile sidebar (hamburger menu) */}
      {mobileOpen && (
        <div className="fixed inset-x-0 top-16 bottom-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />

          {/* Sidebar panel */}
          <div className="relative h-full w-72 bg-surface dark:bg-surface-dark border-r border-border dark:border-border-dark shadow-lg flex flex-col">
            <div className="px-4 py-3 flex items-center justify-between border-b border-border dark:border-border-dark">
              <span className="text-sm font-medium text-textPrimary dark:text-textPrimary-dark">
                {t("nav.menu", "Menu")}
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 rounded-md text-textSecondary dark:text-textSecondary-dark hover:bg-background dark:hover:bg-background-dark"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {/* Main navigation items (mirror of header nav) */}
              <div className="space-y-1">
                {primaryNavItems.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    className="flex w-full items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-textPrimary dark:text-textPrimary-dark hover:bg-background dark:hover:bg-background-dark"
                  >
                    <span>{item.label}</span>
                    {item.hasDropdown && (
                      <svg
                        className="w-4 h-4 text-textSecondary dark:text-textSecondary-dark"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>

              {/* Theme selector (only here on mobile; language lives in header) */}
              <div className="pt-4 border-t border-border/70 dark:border-border-dark/70 flex items-center justify-end">
                <ThemeToggle />
              </div>

              {/* Auth actions */}
              {!loading && !user && (
                <div className="pt-4 border-t border-border/70 dark:border-border-dark/70 space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className={navLinkClass("/login")}
                  >
                    {t("auth.signIn")}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className={navLinkClass("/register")}
                  >
                    {t("auth.signUp")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
