import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

// Smooth, eased page scrolling driven by GSAP's ticker, so scroll-linked
// animations (hero clip, About image growth) move fluidly instead of in wheel steps
const useSmoothScroll = () => {
  useEffect(() => {
    // Respect users who ask the OS for less motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ lerp: 0.14, anchors: true });
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);
};

export default useSmoothScroll;
