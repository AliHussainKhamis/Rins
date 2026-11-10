import { useState, useRef } from "react";
import { TiLocationArrow } from "react-icons/ti";

import BahrainScene from "./BahrainScene";
import Media from "./Media";
import { useLanguage } from "../utils/i18n";

export const BentoTilt = ({ children, className = "" }) => {
  const [transformStyle, setTransformStyle] = useState("");
  const itemRef = useRef(null);

  const handleMouseMove = (event) => {
    if (!itemRef.current) return;

    const { left, top, width, height } =
      itemRef.current.getBoundingClientRect();

    const relativeX = (event.clientX - left) / width;
    const relativeY = (event.clientY - top) / height;

    const tiltX = (relativeY - 0.5) * 5;
    const tiltY = (relativeX - 0.5) * -5;

    const newTransform = `perspective(700px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(.95, .95, .95)`;
    setTransformStyle(newTransform);
  };

  const handleMouseLeave = () => {
    setTransformStyle("");
  };

  return (
    <div
      ref={itemRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform: transformStyle }}
    >
      {children}
    </div>
  );
};

export const BentoCard = ({
  src,
  title,
  description,
  isComingSoon,
  badge,
  background,
}) => {
  const { t } = useLanguage();
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [hoverOpacity, setHoverOpacity] = useState(0);
  const hoverButtonRef = useRef(null);

  const handleMouseMove = (event) => {
    if (!hoverButtonRef.current) return;
    const rect = hoverButtonRef.current.getBoundingClientRect();

    setCursorPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  const handleMouseEnter = () => setHoverOpacity(1);
  const handleMouseLeave = () => setHoverOpacity(0);

  return (
    <div className="relative size-full">
      {background ? (
        <>
          <div className="absolute left-0 top-0 size-full">{background}</div>
          {/* Darkens the top so the title stays readable */}
          <div className="absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b from-navy-950/80 to-transparent" />
        </>
      ) : (
        <Media src={src} className="absolute left-0 top-0 size-full" />
      )}
      <div className="relative z-10 flex size-full flex-col justify-between p-5 text-navy-50">
        <div>
          <h1
            className="bento-title special-font"
            dangerouslySetInnerHTML={{ __html: title }}
          />
          {description && (
            <p className="mt-3 max-w-64 text-xs md:text-base">{description}</p>
          )}
        </div>

        {badge && (
          <img
            src={badge.src}
            alt={badge.alt}
            className="absolute bottom-5 end-5 w-24 rotate-3 rounded-xl shadow-xl shadow-black/40 transition-transform duration-500 hover:rotate-0 hover:scale-105 md:w-32 lg:w-40"
          />
        )}

        {isComingSoon && (
          <div
            ref={hoverButtonRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="border-hsla relative flex w-fit cursor-pointer items-center gap-1 overflow-hidden rounded-full bg-navy-950 px-5 py-2 text-xs uppercase text-lime-300/40"
          >
            {/* Radial gradient hover effect */}
            <div
              className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
              style={{
                opacity: hoverOpacity,
                background: `radial-gradient(100px circle at ${cursorPosition.x}px ${cursorPosition.y}px, #a4e40088, #00123326)`,
              }}
            />
            <TiLocationArrow className="relative z-20" />
            <p className="relative z-20">{t("features.comingSoon")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Features = () => {
  const { t } = useLanguage();

  return (
  <section className="bg-navy-900 pb-52">
    <div className="container mx-auto px-3 md:px-10">
      <div className="px-5 py-32">
        <p className="font-circular-web text-lg text-navy-50">
          {t("features.intro")}
        </p>
        <p className="max-w-md font-circular-web text-lg text-navy-50 opacity-50">
          {t("features.subtitle")}
        </p>
      </div>

      <BentoTilt className="border-hsla relative mb-7 h-96 w-full overflow-hidden rounded-md md:h-[65vh]">
        {/* Light background matches the how-to photo so the image blends into the card */}
        <div className="flex size-full flex-col bg-[#F9F9F9] md:flex-row md:items-center">
          <div className="p-5 text-navy-700 md:w-1/3 md:p-10">
            <h1
              className="bento-title special-font"
              dangerouslySetInnerHTML={{ __html: t("features.pocketTitle") }}
            />
            <p className="mt-3 max-w-64 text-xs md:text-base">
              {t("features.pocketText")}
            </p>
          </div>
          <img
            src="/img/pocket-bidet-steps.png"
            alt={t("features.pocketSteps")}
            loading="lazy"
            decoding="async"
            className="min-h-0 w-full flex-1 object-contain md:h-full md:w-2/3"
          />
        </div>
      </BentoTilt>

      {/* Photo cards are locked to the photos' own shape, so each picture fills its
          card exactly at every screen size with nothing cropped */}
      <div className="grid w-full gap-7 md:grid-cols-2">
        <BentoTilt className="border-hsla relative aspect-[1024/572] w-full overflow-hidden rounded-md transition-transform duration-300 ease-out">
          <img
            src="/img/disposable-uses.jpg"
            alt={t("features.disposableImage")}
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
          />
          <div className="sr-only">
            <h2 dangerouslySetInnerHTML={{ __html: t("features.disposableTitle") }} />
            <p>{t("features.disposableText")}</p>
          </div>
        </BentoTilt>

        <BentoTilt className="border-hsla relative aspect-[1024/572] w-full overflow-hidden rounded-md transition-transform duration-300 ease-out">
          <img
            src="/img/travel-ready.jpg"
            alt={t("features.travelImage")}
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
          />
          <div className="sr-only">
            <h2 dangerouslySetInnerHTML={{ __html: t("features.travelTitle") }} />
            <p>{t("features.travelText")}</p>
          </div>
        </BentoTilt>
      </div>

      <div className="mt-7 grid w-full grid-cols-2 gap-7 md:grid-cols-3">
        <BentoTilt className="border-hsla relative col-span-2 h-80 overflow-hidden rounded-md transition-transform duration-300 ease-out md:col-span-1 md:h-96">
          <BentoCard
            title={t("features.bahrainTitle")}
            description={t("features.bahrainText")}
            badge={{ src: "/img/made-in-bahrain.png", alt: t("features.bahrainBadge") }}
            background={<BahrainScene />}
          />
        </BentoTilt>

        <BentoTilt className="bento-tilt_2 h-64 md:h-96">
          <div className="flex size-full flex-col justify-between bg-lime-300 p-5">
            <h1
              className="bento-title special-font max-w-64 !text-[1.6rem] text-navy-700 sm:!text-4xl md:!text-6xl"
              dangerouslySetInnerHTML={{ __html: t("features.more") }}
            />

            <TiLocationArrow className="m-5 scale-[5] self-end" />
          </div>
        </BentoTilt>

        <BentoTilt className="bento-tilt_2 h-64 md:h-96">
          <Media className="size-full" />
        </BentoTilt>
      </div>
    </div>
  </section>
  );
};

export default Features;
