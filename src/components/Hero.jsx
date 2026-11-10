import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";

import VideoPreview from "./VideoPreview";
import { useLanguage } from "../utils/i18n";

gsap.registerPlugin(ScrollTrigger);

// Hero slides in order; each can be a video or an image
const heroMedia = [
  "videos/hero-1.mp4",
  "videos/english-story.mp4",
  "videos/hero-2.mp4",
];

const totalVideos = heroMedia.length;

const isImage = (src) => /\.(jpe?g|png|webp|avif|gif)$/i.test(src);

// Renders a hero slide as <img> or <video> depending on the file type
const HeroMedia = forwardRef(({ src, onLoad, autoPlay, ...props }, ref) => {
  // An image's load event can fire before React listens for it, which would
  // leave the loading screen up forever, so count images as ready right away
  useEffect(() => {
    if (isImage(src)) onLoad?.();
  }, [src, onLoad]);

  return isImage(src) ? (
    <img ref={ref} src={src} alt="" {...props} />
  ) : (
    <video
      ref={ref}
      src={src}
      loop
      muted
      autoPlay={autoPlay}
      onLoadedData={onLoad}
      {...props}
    />
  );
});
HeroMedia.displayName = "HeroMedia";

const Hero = () => {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(1);
  const [hasClicked, setHasClicked] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadedVideos, setLoadedVideos] = useState(0);

  const nextVdRef = useRef(null);

  const handleVideoLoad = useCallback(() => {
    setLoadedVideos((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (loadedVideos >= totalVideos - 1) {
      setLoading(false);
    }
  }, [loadedVideos]);

  const handleMiniVdClick = () => {
    setHasClicked(true);

    setCurrentIndex((prevIndex) => (prevIndex % totalVideos) + 1);
  };

  useGSAP(
    () => {
      if (hasClicked) {
        gsap.set("#next-video", { visibility: "visible" });
        gsap.to("#next-video", {
          transformOrigin: "center center",
          scale: 1,
          width: "100%",
          height: "100%",
          duration: 1,
          ease: "power1.inOut",
          onStart: () => nextVdRef.current?.play?.(),
        });
        gsap.from("#current-video", {
          transformOrigin: "center center",
          scale: 0,
          duration: 1.5,
          ease: "power1.inOut",
        });
      }
    },
    {
      dependencies: [currentIndex],
      revertOnUpdate: true,
    }
  );

  useGSAP(() => {
    gsap.set("#video-frame", {
      clipPath: "polygon(14% 0, 72% 0, 88% 90%, 0 95%)",
      borderRadius: "0% 0% 40% 10%",
    });
    gsap.from("#video-frame", {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      borderRadius: "0% 0% 0% 0%",
      ease: "power1.inOut",
      scrollTrigger: {
        trigger: "#video-frame",
        start: "center center",
        end: "bottom center",
        scrub: true,
      },
    });
  });

  // Pause playing videos once the hero scrolls off screen, and resume them on return
  useEffect(() => {
    const frame = document.getElementById("video-frame");
    let pausedVideos = [];

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        pausedVideos.forEach((video) => video.play().catch(() => {}));
        pausedVideos = [];
      } else {
        pausedVideos = [...frame.querySelectorAll("video")].filter(
          (video) => !video.paused
        );
        pausedVideos.forEach((video) => video.pause());
      }
    });
    observer.observe(frame);

    return () => observer.disconnect();
  }, []);

  const getVideoSrc = (index) => heroMedia[index - 1];

  return (
    <div className="relative h-dvh w-screen overflow-x-hidden">
      {loading && (
        <div className="flex-center absolute z-[100] h-dvh w-screen overflow-hidden bg-navy-700">
          {/* https://uiverse.io/G4b413l/tidy-walrus-92 */}
          <div className="three-body">
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
          </div>
        </div>
      )}

      <div
        id="video-frame"
        className="relative z-10 h-dvh w-screen overflow-hidden rounded-lg bg-navy-900"
      >
        <div>
          <div className="mask-clip-path absolute-center absolute z-50 size-64 cursor-pointer overflow-hidden rounded-lg">
            <VideoPreview>
              <div
                onClick={handleMiniVdClick}
                className="origin-center scale-50 opacity-0 transition-all duration-500 ease-in hover:scale-100 hover:opacity-100"
              >
                <HeroMedia
                  ref={nextVdRef}
                  src={getVideoSrc((currentIndex % totalVideos) + 1)}
                  id="current-video"
                  className="size-64 origin-center scale-150 object-cover object-center"
                  onLoad={handleVideoLoad}
                />
              </div>
            </VideoPreview>
          </div>

          <HeroMedia
            ref={nextVdRef}
            src={getVideoSrc(currentIndex)}
            id="next-video"
            className="absolute-center invisible absolute z-20 size-64 object-cover object-center"
            onLoad={handleVideoLoad}
          />
          <HeroMedia
            src={getVideoSrc(
              currentIndex === totalVideos - 1 ? 1 : currentIndex
            )}
            autoPlay
            className="absolute left-0 top-0 size-full object-cover object-center"
            onLoad={handleVideoLoad}
          />
        </div>

        <h1
          className="special-font hero-heading absolute bottom-5 right-5 z-40 text-lime-300 sm:bottom-10 sm:right-10"
          dangerouslySetInnerHTML={{ __html: t("hero.heading") }}
        />

      </div>

      <h1
        className="special-font hero-heading absolute bottom-5 right-5 text-lime-300 sm:bottom-10 sm:right-10"
        dangerouslySetInnerHTML={{ __html: t("hero.heading") }}
      />
    </div>
  );
};

export default Hero;
