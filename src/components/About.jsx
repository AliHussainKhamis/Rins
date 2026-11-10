import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import clsx from "clsx";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

import AnimatedTitle from "./AnimatedTitle";
import { useLanguage } from "../utils/i18n";

gsap.registerPlugin(ScrollTrigger);

// Swap these paths to change the pictures; the copy lives under about.slides in translations.js
const SLIDES = [
  {
    id: "restroom",
    problemImage: "/img/about/problem-restroom.jpg",
    solutionImage: "/img/about/solution-rinse.jpg",
  },
  {
    id: "flight",
    problemImage: "/img/about/problem-flight.jpg",
    solutionImage: "/img/about/solution-pocket.jpg",
  },
  {
    id: "outdoors",
    problemImage: "/img/about/problem-outdoors.jpg",
    solutionImage: "/img/contact-blue.jpg",
  },
];

const SLIDE_DURATION = 4500;
const TURN_DURATION = 0.9;
const DRAG_START = 12; // px of sideways movement before a drag picks up the page
const TURN_COMMIT = 0.3; // Share of a turn past which letting go finishes it

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Pages sit side by side from Tailwind's md breakpoint up, and stack below it
const isDesktopSpread = () => window.matchMedia("(min-width: 768px)").matches;

const nextIndex = (index, direction) =>
  (index + direction + SLIDES.length) % SLIDES.length;

// One side of the spread: the problem (dark, grey) or the RINS answer (full colour)
const Page = ({ slide, side }) => {
  const { t } = useLanguage();
  const isProblem = side === "problem";

  return (
    <>
      <img
        src={isProblem ? slide.problemImage : slide.solutionImage}
        alt={t(`about.slides.${slide.id}.${side}Alt`)}
        draggable={false}
        className={clsx(
          "absolute left-0 top-0 size-full object-cover",
          isProblem && "grayscale"
        )}
      />
      <span
        className={clsx(
          "absolute inset-0",
          isProblem
            ? "bg-black/60"
            : "bg-gradient-to-t from-navy-900/90 via-transparent to-transparent"
        )}
      />
      <div className="about-slide-text">
        <p
          className={clsx(
            "about-slide-label",
            isProblem ? "text-red-400" : "text-lime-300"
          )}
        >
          {t(isProblem ? "about.problemLabel" : "about.solutionLabel")}
        </p>
        <p
          className={clsx(
            "font-bold",
            isProblem
              ? "text-2xl leading-tight md:text-5xl"
              : "text-lg leading-snug md:text-2xl"
          )}
        >
          {t(`about.slides.${slide.id}.${side}`)}
        </p>
      </div>
      <span className="about-page-shade" />
    </>
  );
};

const About = () => {
  const { t } = useLanguage();
  const [activeSlide, setActiveSlide] = useState(0);
  // The page being turned: { from, to, direction }, or null while the book lies open
  const [turn, setTurn] = useState(null);

  const bookRef = useRef(null);
  const leafRef = useRef(null);
  const tweenRef = useRef(null);
  const dragRef = useRef(null);
  const queuedTurnRef = useRef(null);

  const turnTo = (to, direction) => {
    if (turn || to === activeSlide) return;

    if (prefersReducedMotion()) {
      setActiveSlide(to);
    } else {
      setTurn({ from: activeSlide, to, direction });
    }
  };

  const turnBy = (direction) => {
    // Pressed mid-turn: hurry that page along, then turn again so the press still counts
    if (turn) {
      queuedTurnRef.current = direction;
      tweenRef.current?.timeScale(3);
      return;
    }

    turnTo(nextIndex(activeSlide, direction), direction);
  };

  // Fetch every picture up front so a turning page never shows a blank
  useEffect(() => {
    SLIDES.forEach(({ problemImage, solutionImage }) => {
      new Image().src = problemImage;
      new Image().src = solutionImage;
    });
  }, []);

  // Keeps the pages turning; off screen it skips the animation to save work
  useEffect(() => {
    if (turn || prefersReducedMotion()) return;

    const direction = queuedTurnRef.current;
    if (direction) {
      queuedTurnRef.current = null;
      setTurn({ from: activeSlide, to: nextIndex(activeSlide, direction), direction });
      return;
    }

    const timer = setTimeout(() => {
      const { top, bottom } = bookRef.current.getBoundingClientRect();
      const next = nextIndex(activeSlide, 1);

      if (bottom > 0 && top < window.innerHeight) {
        setTurn({ from: activeSlide, to: next, direction: 1 });
      } else {
        setActiveSlide(next);
      }
    }, SLIDE_DURATION);

    return () => clearTimeout(timer);
  }, [activeSlide, turn]);

  // Runs the turn. It always plays forwards, so a drag can scrub it and letting
  // go early just reverses it back to where it started.
  useLayoutEffect(() => {
    if (!turn) return;

    const leaf = leafRef.current;
    const isRtl = document.documentElement.dir === "rtl";

    // The spread's page lands flat on the other side; a phone's whole sheet swings out of view
    const swing = isDesktopSpread() ? 180 : 100;
    const flat = isRtl ? swing : -swing;
    const [start, end] = turn.direction > 0 ? [0, flat] : [flat, 0];

    const tween = gsap.fromTo(
      leaf,
      { rotationY: start },
      {
        rotationY: end,
        duration: TURN_DURATION,
        ease: "power1.inOut",
        paused: Boolean(dragRef.current),
        // A method for `this`: GSAP's first update fires before `tween` is assigned
        onUpdate() {
          leaf.style.setProperty(
            "--page-shade",
            Math.sin(this.progress() * Math.PI) * 0.45
          );
        },
        onComplete: () => {
          setActiveSlide(turn.to);
          setTurn(null);
        },
        onReverseComplete: () => setTurn(null),
      }
    );
    tweenRef.current = tween;

    return () => {
      tween.kill();
      tweenRef.current = null;
    };
  }, [turn]);

  const handlePointerDown = (event) => {
    if (event.button === 0 && !turn) {
      dragRef.current = { x: event.clientX, started: false };
    }
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag) return;

    const distance = event.clientX - drag.x;

    if (drag.started) {
      const width = bookRef.current.offsetWidth;
      tweenRef.current?.progress(Math.min(Math.abs(distance) / (width * 0.6), 1));
    } else if (Math.abs(distance) >= DRAG_START) {
      // Pages lift from the outer edge: leftwards is forward, unless the page reads right to left
      const isRtl = document.documentElement.dir === "rtl";
      drag.started = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      turnBy(distance < 0 !== isRtl ? 1 : -1);
    }
  };

  const handlePointerUp = () => {
    const tween = tweenRef.current;
    const wasDragging = dragRef.current?.started;
    dragRef.current = null;

    if (!wasDragging || !tween) return;

    if (tween.progress() >= TURN_COMMIT) {
      tween.play();
    } else {
      tween.reverse();
    }
  };

  useGSAP(() => {
    const clipAnimation = gsap.timeline({
      scrollTrigger: {
        trigger: "#clip",
        start: "center center",
        end: "+=1800 center",
        scrub: true,
        pin: true,
        pinSpacing: true,
      },
    });

    clipAnimation
      .to(".mask-clip-path", {
        width: "100vw",
        height: "100vh",
        borderRadius: 0,
        ease: "power2.inOut",
      })
      // A variable, not opacity on the text itself, because turning pages add new text
      .to(".about-image", { "--about-text": 1, ease: "none", duration: 0.2 })
      // Holds the full-screen book in place so several pages get turned
      .to({}, { duration: 0.9 });
  });

  // While a page turns, the pages beneath show what it uncovers or will land on
  const earlier = SLIDES[turn ? (turn.direction > 0 ? turn.from : turn.to) : activeSlide];
  const later = SLIDES[turn ? (turn.direction > 0 ? turn.to : turn.from) : activeSlide];
  // On phones one sheet holds both stacked pages, so the next sheet waits whole beneath it
  const isSpread = isDesktopSpread();

  return (
    <div id="about" className="min-h-screen w-screen">
      <div className="relative mb-8 mt-36 flex flex-col items-center gap-5">
        <p className="font-general text-sm uppercase text-lime-300 md:text-[10px]">
          {t("about.eyebrow")}
        </p>

        <AnimatedTitle
          title={t("about.title")}
          containerClass="mt-5 !text-white text-center"
        />
      </div>

      <div className="relative h-dvh w-screen" id="clip">
        <div className="mask-clip-path about-image">
          <div
            ref={bookRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="about-book"
          >
            <div className="about-page">
              <Page slide={isSpread ? earlier : later} side="problem" />
            </div>
            <div className="about-page">
              <Page slide={later} side="solution" />
            </div>

            <span className="about-spine" />

            {turn && (
              <div ref={leafRef} className="about-leaf" aria-hidden="true">
                <div className="about-leaf-face">
                  {!isSpread && (
                    <div className="about-page">
                      <Page slide={earlier} side="problem" />
                    </div>
                  )}
                  <div className="about-page">
                    <Page slide={earlier} side="solution" />
                  </div>
                </div>
                {isSpread && (
                  <div className="about-leaf-face about-leaf-back">
                    <Page slide={later} side="problem" />
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            aria-label={t("about.previousPage")}
            onClick={() => turnBy(-1)}
            className="about-page-arrow start-3 md:start-6"
          >
            <FiChevronLeft className="rtl:rotate-180" />
          </button>

          <button
            type="button"
            aria-label={t("about.nextPage")}
            onClick={() => turnBy(1)}
            className="about-page-arrow end-3 md:end-6"
          >
            <FiChevronRight className="rtl:rotate-180" />
          </button>

          <div className="about-slide-text about-slide-controls">
            {SLIDES.map(({ id }, index) => (
              <button
                key={id}
                type="button"
                aria-label={t("about.slideLabel", { number: index + 1 })}
                aria-current={index === activeSlide}
                onClick={() => turnTo(index, index > activeSlide ? 1 : -1)}
                className={clsx(
                  "h-1.5 w-8 rounded-full transition-colors duration-300",
                  index === activeSlide ? "bg-lime-300" : "bg-white/40"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="about-subtext">
        <p className="text-2xl leading-snug md:text-4xl">
          {t("about.lead")}
        </p>

        <span className="mx-auto my-8 block h-1 w-16 rounded-full bg-lime-300" />

        <p className="text-lg leading-relaxed text-white/90 md:text-xl">
          {t("about.body")}
        </p>

        {/* Divider before the next section */}
        <span className="mx-auto mt-16 block h-0.5 w-full max-w-xl bg-gradient-to-r from-transparent via-lime-300 to-transparent" />
      </div>
    </div>
  );
};

export default About;
