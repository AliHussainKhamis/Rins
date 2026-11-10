import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { FaQuoteLeft, FaStar } from "react-icons/fa";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

import AnimatedTitle from "./AnimatedTitle";
import { useLanguage } from "../utils/i18n";
import { siteReviews } from "../utils/reviews";

const SLIDE_DELAY = 5000;

// Slides a card to the middle of the track. Measuring on screen rather than
// using scroll positions keeps this working in both reading directions.
const centerCard = (track, index) => {
  const card = track.children[index].getBoundingClientRect();
  const { left, width } = track.getBoundingClientRect();

  track.scrollBy({
    left: card.left + card.width / 2 - (left + width / 2),
    behavior: "smooth",
  });
};

export const StarRating = ({ rating, className }) => {
  const { t } = useLanguage();

  return (
    <div
      role="img"
      aria-label={t("reviews.stars", { rating: rating.toFixed(1) })}
      className={clsx("flex gap-1", className)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          className={star <= Math.round(rating) ? "text-lime-300" : "text-white/20"}
        />
      ))}
    </div>
  );
};

const ReviewCard = ({ review, isActive }) => {
  const { t, lang } = useLanguage();
  const name = review.name[lang] ?? review.name.en;
  const place = review.place?.[lang] ?? review.place?.en;

  return (
    <figure
      className={clsx(
        "review-card",
        isActive ? "opacity-100" : "scale-95 opacity-40"
      )}
    >
      {review.isSample && (
        <span className="absolute end-5 top-5 rounded-full bg-red-400 px-3 py-1 font-general text-[10px] font-bold uppercase text-navy-950">
          {t("reviews.sample")}
        </span>
      )}

      <FaQuoteLeft className="text-4xl text-lime-300 rtl:-scale-x-100" />
      <StarRating rating={review.rating} className="text-lg" />

      {review.photo && (
        <img
          src={review.photo}
          alt=""
          loading="lazy"
          decoding="async"
          className="aspect-video w-full rounded-2xl object-cover"
        />
      )}

      <blockquote className="flex-1 font-circular-web text-xl leading-relaxed text-white md:text-2xl">
        {review.quote[lang]}
      </blockquote>

      <figcaption className="flex items-center gap-3">
        <span className="flex-center size-12 shrink-0 rounded-full bg-lime-300 font-general text-lg font-bold text-navy-900">
          {name.charAt(0)}
        </span>
        <span className="min-w-0">
          <span className="block truncate font-general text-sm font-bold text-white">
            {name}
          </span>
          {place && (
            <span className="block truncate font-general text-xs text-navy-100">
              {place}
            </span>
          )}
        </span>
      </figcaption>
    </figure>
  );
};

const ReviewsSlider = ({ reviews }) => {
  const { t } = useLanguage();
  const [active, setActive] = useState(0);
  const trackRef = useRef(null);
  const activeRef = useRef(0);
  const pausedRef = useRef(false);

  // Whichever card sits nearest the middle counts as active, however it got there
  const handleScroll = () => {
    const track = trackRef.current;
    const { left, width } = track.getBoundingClientRect();
    const middle = left + width / 2;
    const distances = [...track.children].map((card) => {
      const rect = card.getBoundingClientRect();
      return Math.abs(rect.left + rect.width / 2 - middle);
    });

    activeRef.current = distances.indexOf(Math.min(...distances));
    setActive(activeRef.current);
  };

  const goBy = (step) => {
    centerCard(
      trackRef.current,
      (active + step + reviews.length) % reviews.length
    );
  };

  // Keeps sliding, unless someone is reading a card or the section is off screen
  useEffect(() => {
    if (
      reviews.length < 2 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const timer = setInterval(() => {
      const track = trackRef.current;
      const { top, bottom } = track.getBoundingClientRect();

      if (!pausedRef.current && bottom > 0 && top < window.innerHeight) {
        centerCard(track, (activeRef.current + 1) % reviews.length);
      }
    }, SLIDE_DELAY);

    return () => clearInterval(timer);
  }, [reviews.length]);

  return (
    <div
      onPointerEnter={() => (pausedRef.current = true)}
      onPointerLeave={() => (pausedRef.current = false)}
    >
      <div ref={trackRef} onScroll={handleScroll} className="review-track">
        {reviews.map((review, index) => (
          <ReviewCard
            key={review.name.en}
            review={review}
            isActive={index === active}
          />
        ))}
      </div>

      {reviews.length > 1 && (
        <div className="flex-center mt-8 gap-4">
          <button
            type="button"
            aria-label={t("reviews.previous")}
            onClick={() => goBy(-1)}
            className="review-arrow"
          >
            <FiChevronLeft className="rtl:rotate-180" />
          </button>

          {reviews.map((review, index) => (
            <button
              key={review.name.en}
              type="button"
              aria-label={t("reviews.goTo", { number: index + 1 })}
              aria-current={index === active}
              onClick={() => centerCard(trackRef.current, index)}
              className={clsx(
                "dot-hit h-1.5 w-8 rounded-full transition-colors duration-300",
                index === active ? "bg-lime-300" : "bg-white/30"
              )}
            />
          ))}

          <button
            type="button"
            aria-label={t("reviews.next")}
            onClick={() => goBy(1)}
            className="review-arrow"
          >
            <FiChevronRight className="rtl:rotate-180" />
          </button>
        </div>
      )}
    </div>
  );
};

// Renders nothing until there are reviews in the current language
const Reviews = ({ limit, className }) => {
  const { t, lang } = useLanguage();
  const reviews = siteReviews.filter(({ quote }) => quote[lang]).slice(0, limit);

  if (!reviews.length) return null;

  return (
    <section className={clsx("w-screen overflow-hidden py-24", className)}>
      <div className="mb-14 flex flex-col items-center gap-5 px-5">
        <p className="font-general text-sm uppercase text-lime-300 md:text-[10px]">
          {t("reviews.eyebrow")}
        </p>

        <AnimatedTitle
          title={t("reviews.title")}
          containerClass="!text-white text-center !text-[2.5rem] sm:!text-[3rem] md:!text-[3.75rem]"
        />
      </div>

      {/* Remounts on language change, because the card order and direction both change */}
      <ReviewsSlider key={lang} reviews={reviews} />
    </section>
  );
};

export default Reviews;
