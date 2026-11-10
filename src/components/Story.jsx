import gsap from "gsap";
import { useRef } from "react";

import Button from "./Button";
import AnimatedTitle from "./AnimatedTitle";
import { MediaPlaceholder } from "./Media";
import { useLanguage } from "../utils/i18n";

const FloatingImage = () => {
  const { t } = useLanguage();
  const frameRef = useRef(null);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const element = frameRef.current;

    if (!element) return;

    const rect = element.getBoundingClientRect();
    const xPos = clientX - rect.left;
    const yPos = clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((yPos - centerY) / centerY) * -10;
    const rotateY = ((xPos - centerX) / centerX) * 10;

    gsap.to(element, {
      duration: 0.3,
      rotateX,
      rotateY,
      transformPerspective: 500,
      ease: "power1.inOut",
    });
  };

  const handleMouseLeave = () => {
    const element = frameRef.current;

    if (element) {
      gsap.to(element, {
        duration: 0.3,
        rotateX: 0,
        rotateY: 0,
        ease: "power1.inOut",
      });
    }
  };

  return (
    <div id="story" className="min-h-dvh w-screen bg-navy-900 text-navy-50">
      <div className="flex size-full flex-col items-center py-10 pb-24">
        <p className="font-general text-sm uppercase md:text-[10px]">
          {t("story.eyebrow")}
        </p>

        <div className="relative size-full">
          <AnimatedTitle
            title={t("story.title")}
            containerClass="mt-5 pointer-events-none relative z-10"
          />

          <div className="story-img-container">
            <div className="story-img-mask">
              <div className="story-img-content">
                {/* Placeholder: swap for <img src="/img/your-photo.jpg" ... /> */}
                <div
                  ref={frameRef}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  onMouseUp={handleMouseLeave}
                  onMouseEnter={handleMouseLeave}
                  className="size-full"
                >
                  <MediaPlaceholder label={t("media.storyPlaceholder")} />
                </div>
              </div>
            </div>

            {/* for the rounded corner */}
            <svg
              className="invisible absolute size-0"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <filter id="flt_tag">
                  <feGaussianBlur
                    in="SourceGraphic"
                    stdDeviation="8"
                    result="blur"
                  />
                  <feColorMatrix
                    in="blur"
                    mode="matrix"
                    values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
                    result="flt_tag"
                  />
                  <feComposite
                    in="SourceGraphic"
                    in2="flt_tag"
                    operator="atop"
                  />
                </filter>
              </defs>
            </svg>
          </div>
        </div>

        {/* On phones the text starts just below the picture (which ends at 50dvh + 4rem) */}
        <div className="relative z-10 -mt-[calc(40vh-5.5rem)] flex w-full justify-center px-5 md:-mt-64 md:me-44 md:justify-end md:px-0">
          <div className="flex h-full w-fit flex-col items-center md:items-start">
            <p className="mt-3 max-w-sm text-center font-circular-web text-navy-100 md:text-start">
              {t("story.body")}
            </p>

            <Button
              id="realm-btn"
              title={t("story.button")}
              href="/products"
              containerClass="mt-5"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingImage;
