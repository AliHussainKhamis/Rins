import clsx from "clsx";
import gsap from "gsap";
import { useWindowScroll } from "react-use";
import { useEffect, useRef, useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

import { useLanguage } from "../utils/i18n";

const navItems = [
  { key: "nav.products", href: "/products" },
  { key: "nav.about", href: "/#about" },
  { key: "nav.locations", href: "/#locations" },
  { key: "nav.contact", href: "/#contact" },
];

const languages = [
  { code: "en", label: "EN" },
  { code: "ar", label: "عربي" },
];

// Pill switch with a lime highlight that slides to the active language
const LanguageToggle = () => {
  const { lang, setLang, t } = useLanguage();
  const activeIndex = languages.findIndex((l) => l.code === lang);

  return (
    <div
      dir="ltr"
      role="group"
      aria-label={t("nav.language")}
      className="relative flex rounded-full border border-lime-300/30 bg-navy-950/60 p-1"
    >
      <span
        className="absolute inset-y-1 left-1 w-14 rounded-full bg-lime-300 shadow-md shadow-lime-300/30 transition-transform duration-300 ease-out"
        style={{ transform: `translateX(${activeIndex * 100}%)` }}
      />
      {languages.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          aria-pressed={lang === l.code}
          className={clsx(
            "relative z-10 w-14 rounded-full py-2.5 text-center text-xs transition-colors duration-300 md:py-1.5",
            l.code === "ar" ? "font-arabic font-bold" : "font-general",
            lang === l.code ? "text-navy-700" : "text-navy-100 hover:text-white"
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
};

const NavBar = () => {
  const { t } = useLanguage();

  // State for toggling audio and visual indicator
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isIndicatorActive, setIsIndicatorActive] = useState(false);

  // Refs for audio and navigation container
  const audioElementRef = useRef(null);
  const navContainerRef = useRef(null);

  const { y: currentScrollY } = useWindowScroll();
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Toggle audio and visual indicator
  const toggleAudioIndicator = () => {
    setIsAudioPlaying((prev) => !prev);
    setIsIndicatorActive((prev) => !prev);
  };

  // Manage audio playback
  useEffect(() => {
    if (isAudioPlaying) {
      audioElementRef.current.play();
    } else {
      audioElementRef.current.pause();
    }
  }, [isAudioPlaying]);

  useEffect(() => {
    if (currentScrollY === 0 || currentScrollY < lastScrollY) {
      // At the top or scrolling up: show navbar
      setIsNavVisible(true);
    } else if (currentScrollY > lastScrollY) {
      // Scrolling down: hide navbar and close the phone menu
      setIsNavVisible(false);
      setIsMenuOpen(false);
    }

    setLastScrollY(currentScrollY);
  }, [currentScrollY, lastScrollY]);

  useEffect(() => {
    gsap.to(navContainerRef.current, {
      y: isNavVisible ? 0 : -100,
      opacity: isNavVisible ? 1 : 0,
      duration: 0.2,
    });
  }, [isNavVisible]);

  return (
    <div
      ref={navContainerRef}
      className="fixed inset-x-0 top-4 z-50 h-16 transition-all duration-700 sm:inset-x-6"
    >
      <header className="absolute top-1/2 w-full -translate-y-1/2">
        <nav className="flex size-full items-center justify-between p-4">
          {/* Logo */}
          <div className="flex items-center gap-7">
            <a
              href="/"
              aria-label={t("nav.home")}
              className="flex-center size-14 shrink-0 overflow-hidden sm:size-[4.5rem] rounded-full transition-transform duration-300 hover:scale-105"
            >
              <img src="/img/logo-rins.png" alt="RINS" className="size-full object-cover" />
            </a>
          </div>

          {/* Navigation Links and Audio Button */}
          <div className="floating-nav flex h-full items-center px-3 py-3 md:px-6">
            <div className="hidden md:block">
              {navItems.map((item) => (
                <a
                  key={item.key}
                  href={item.href}
                  className="nav-hover-btn first:ms-0"
                >
                  {t(item.key)}
                </a>
              ))}
            </div>

            <div className="md:ms-10">
              <LanguageToggle />
            </div>

            <button
              onClick={toggleAudioIndicator}
              aria-label={t("nav.sound")}
              className="ms-1 flex h-10 items-center gap-0.5 px-3 md:ms-3"
            >
              <audio
                ref={audioElementRef}
                className="hidden"
                src="/audio/loop.mp3"
                loop
              />
              {[1, 2, 3, 4].map((bar) => (
                <div
                  key={bar}
                  className={clsx("indicator-line", {
                    active: isIndicatorActive,
                  })}
                  style={{
                    animationDelay: `${bar * 0.1}s`,
                  }}
                />
              ))}
            </button>

            {/* Phones: the links live in a drop-down panel instead */}
            <button
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-label={t(isMenuOpen ? "nav.closeMenu" : "nav.openMenu")}
              aria-expanded={isMenuOpen}
              className="flex-center size-10 rounded-full bg-lime-300 text-lg text-navy-900 md:hidden"
            >
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </nav>

        {isMenuOpen && (
          <div className="floating-nav absolute inset-x-4 top-full flex flex-col p-2 md:hidden">
            {navItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-md px-4 py-4 font-general text-sm uppercase text-navy-50 active:bg-lime-300 active:text-navy-900"
              >
                {t(item.key)}
              </a>
            ))}
          </div>
        )}
      </header>
    </div>
  );
};

export default NavBar;
