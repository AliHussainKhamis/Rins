import createGlobe from "cobe";
import { useEffect, useRef, useState } from "react";
import { TiLocationArrow } from "react-icons/ti";

import AnimatedTitle from "./AnimatedTitle";
import Button from "./Button";
import { useLanguage } from "../utils/i18n";

// Bahrain (Manama) coordinates
const BAHRAIN = [26.0667, 50.5577];

// Google Maps search listing every Alosra branch in Bahrain
const ALOSRA_MAP_URL =
  "https://www.google.com/maps/search/Alosra+Supermarket+Bahrain";

// Globe rotation that brings a lat/long to the front
const locationToAngles = (lat, long) => [
  Math.PI - ((long * Math.PI) / 180 - Math.PI / 2),
  (lat * Math.PI) / 180,
];

// Runs `draw(dt)` every frame, but only while `container` is on screen,
// so the globe costs nothing during the rest of the page. Returns a stop function.
const animateWhileVisible = (container, draw) => {
  let frame = null;
  let last;

  const loop = (now) => {
    draw((now - last) / 1000);
    last = now;
    frame = requestAnimationFrame(loop);
  };

  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && frame === null) {
      last = performance.now();
      frame = requestAnimationFrame(loop);
    } else if (!entry.isIntersecting && frame !== null) {
      cancelAnimationFrame(frame);
      frame = null;
    }
  });
  observer.observe(container);

  return () => {
    observer.disconnect();
    cancelAnimationFrame(frame);
  };
};

// Draws the live WebGL globe into `container` and returns a cleanup function,
// or calls onFail if the browser can't run WebGL (e.g. hardware acceleration off)
const startGlobe = (container, onFail) => {
  // cobe fails silently without WebGL, so probe for it on a throwaway canvas first
  const probe = document.createElement("canvas");
  if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) {
    onFail();
    return () => {};
  }

  // A fresh canvas per mount: destroying a globe kills its WebGL context,
  // so a reused canvas would stay blank (e.g. after React StrictMode remounts)
  const canvas = document.createElement("canvas");
  canvas.className = "size-full opacity-0 transition-opacity duration-1000";
  container.appendChild(canvas);
  canvas.addEventListener("webglcontextlost", onFail);

  const [phi, theta] = locationToAngles(...BAHRAIN);
  const size = container.offsetWidth;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  let globe;
  try {
    globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: size * dpr,
      height: size * dpr,
      phi,
      theta: theta * 0.6,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.11, 0.25, 0.55], // navy
      markerColor: [0.643, 0.894, 0], // lime #A4E400
      glowColor: [0.1, 0.22, 0.5],
      markers: [{ location: BAHRAIN, size: 0.1 }],
    });
  } catch {
    container.replaceChildren();
    onFail();
    return () => {};
  }

  // Hovering zooms in on Bahrain; leaving zooms back out
  let zoomTarget = 0;
  let zoom = 0; // 0 = zoomed out, 1 = fully zoomed in
  const zoomIn = () => (zoomTarget = 1);
  const zoomOut = () => (zoomTarget = 0);
  container.addEventListener("pointerenter", zoomIn);
  container.addEventListener("pointerleave", zoomOut);

  // Gently sway around Bahrain, settling on it as the globe zooms in
  let swayTime = 0;
  const stopAnimating = animateWhileVisible(container, (dt) => {
    zoom += (zoomTarget - zoom) * Math.min(dt * 4, 1);
    swayTime += dt * (1 - zoom);

    globe.update({
      phi: phi + Math.sin(swayTime * 0.4) * 0.5 * (1 - zoom),
      theta: theta * (0.6 + 0.4 * zoom),
      scale: 1 + zoom * 1.5,
      markers: [{ location: BAHRAIN, size: 0.1 - zoom * 0.06 }],
    });
  });

  // Fade in once the first frame is drawn
  const fadeIn = setTimeout(() => (canvas.style.opacity = "1"), 100);

  return () => {
    clearTimeout(fadeIn);
    stopAnimating();
    canvas.removeEventListener("webglcontextlost", onFail);
    container.removeEventListener("pointerenter", zoomIn);
    container.removeEventListener("pointerleave", zoomOut);
    globe.destroy();
    container.replaceChildren();
  };
};

// Unit vector for a lat/long, with +z facing the viewer at long 0
const toVector = (lat, long) => {
  const la = (lat * Math.PI) / 180;
  const lo = (long * Math.PI) / 180;
  return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)];
};

// Same dotted globe drawn with the 2D canvas, for browsers without WebGL.
// Land dots come from cobe's own world map (white = land).
const startCanvasGlobe = (container) => {
  const canvas = document.createElement("canvas");
  canvas.className = "size-full opacity-0 transition-opacity duration-1000";
  container.appendChild(canvas);

  const size = container.offsetWidth;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  // Spread points evenly over the sphere and keep the ones on land
  let dots = [];
  const map = new Image();
  map.onload = () => {
    const sampler = document.createElement("canvas");
    sampler.width = map.width;
    sampler.height = map.height;
    const sctx = sampler.getContext("2d");
    sctx.drawImage(map, 0, 0);
    const { data } = sctx.getImageData(0, 0, map.width, map.height);

    const count = 12000;
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const y = 1 - ((i + 0.5) / count) * 2;
      const r = Math.sqrt(1 - y * y);
      const x = Math.cos(i * golden) * r;
      const z = Math.sin(i * golden) * r;
      const lat = (Math.asin(y) * 180) / Math.PI;
      const long = (Math.atan2(x, z) * 180) / Math.PI;
      const px = Math.min(map.width - 1, Math.floor(((long + 180) / 360) * map.width));
      const py = Math.min(map.height - 1, Math.floor(((90 - lat) / 180) * map.height));
      if (data[(py * map.width + px) * 4] > 128) dots.push([x, y, z]);
    }
  };
  map.src = "/img/world-mask.png";

  const marker = toVector(...BAHRAIN);
  const [bahrainLat, bahrainLong] = BAHRAIN.map((d) => (d * Math.PI) / 180);

  let zoomTarget = 0;
  let zoom = 0;
  const zoomIn = () => (zoomTarget = 1);
  const zoomOut = () => (zoomTarget = 0);
  container.addEventListener("pointerenter", zoomIn);
  container.addEventListener("pointerleave", zoomOut);

  const center = size / 2;
  let swayTime = 0;
  const stopAnimating = animateWhileVisible(container, (dt) => {
    zoom += (zoomTarget - zoom) * Math.min(dt * 4, 1);
    swayTime += dt * (1 - zoom);

    // Turn so Bahrain faces the viewer (swaying a little), tilted towards its latitude
    const spin = bahrainLong + Math.sin(swayTime * 0.4) * 0.5 * (1 - zoom);
    const tilt = bahrainLat * (0.6 + 0.4 * zoom);
    const cosS = Math.cos(spin);
    const sinS = Math.sin(spin);
    const cosT = Math.cos(tilt);
    const sinT = Math.sin(tilt);
    const project = ([x, y, z]) => {
      const x1 = x * cosS - z * sinS;
      const z1 = x * sinS + z * cosS;
      return [x1, y * cosT - z1 * sinT, y * sinT + z1 * cosT];
    };

    const radius = size * 0.4 * (1 + zoom * 1.5);
    ctx.clearRect(0, 0, size, size);

    // Dark sphere with a soft navy glow
    ctx.save();
    ctx.shadowColor = "rgba(40, 80, 170, 0.8)";
    ctx.shadowBlur = size * 0.04;
    const shade = ctx.createRadialGradient(
      center - radius * 0.3, center - radius * 0.3, radius * 0.1,
      center, center, radius
    );
    shade.addColorStop(0, "#0b1630");
    shade.addColorStop(1, "#02050d");
    ctx.fillStyle = shade;
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Land dots, brighter towards the front of the globe
    const dotSize = Math.max(1, radius / 160);
    ctx.fillStyle = "#5aa2ff";
    for (const dot of dots) {
      const [x, y, z] = project(dot);
      if (z <= 0) continue;
      ctx.globalAlpha = 0.15 + 0.85 * z;
      ctx.fillRect(center + x * radius, center - y * radius, dotSize, dotSize);
    }
    ctx.globalAlpha = 1;

    // Bahrain marker
    const [mx, my, mz] = project(marker);
    if (mz > 0) {
      ctx.fillStyle = "#a4e400";
      ctx.beginPath();
      ctx.arc(
        center + mx * radius,
        center - my * radius,
        radius * (0.035 - zoom * 0.015),
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  });

  const fadeIn = setTimeout(() => (canvas.style.opacity = "1"), 100);

  return () => {
    clearTimeout(fadeIn);
    stopAnimating();
    map.onload = null;
    dots = [];
    container.removeEventListener("pointerenter", zoomIn);
    container.removeEventListener("pointerleave", zoomOut);
    container.replaceChildren();
  };
};

const Globe = () => {
  const containerRef = useRef(null);
  // Switches to the 2D canvas globe when WebGL isn't available
  const [useCanvas, setUseCanvas] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const onFail = () => setUseCanvas(true);
    let stop;

    // Wait until the container has a real width; drawing at 0px leaves it blank
    const start = () => {
      if (!stop && container.offsetWidth > 0) {
        stop = useCanvas
          ? startCanvasGlobe(container)
          : startGlobe(container, onFail);
      }
    };
    const observer = new ResizeObserver(start);
    observer.observe(container);
    start();

    return () => {
      observer.disconnect();
      stop?.();
    };
  }, [useCanvas]);

  return (
    <div
      ref={containerRef}
      className="relative mx-auto aspect-square w-full max-w-[34rem] cursor-zoom-in overflow-hidden rounded-full"
    />
  );
};

const Locations = () => {
  const { t } = useLanguage();

  return (
  <section id="locations" className="w-screen overflow-hidden pb-32 pt-8">
    <div className="container mx-auto flex flex-col items-center gap-16 px-5 sm:px-10 lg:flex-row lg:gap-10">
      <div className="flex flex-1 flex-col items-center gap-6 text-center lg:items-start lg:text-start">
        <p className="font-general text-sm uppercase text-lime-300 md:text-[10px]">
          {t("locations.eyebrow")}
        </p>

        <AnimatedTitle
          title={t("locations.title")}
          containerClass="!text-white !px-0 [&>div]:!px-0 lg:[&>div]:!justify-start"
        />

        <p className="max-w-md font-circular-web text-lg text-navy-100">
          {t("locations.body")}
        </p>

        <Button
          title={t("locations.button")}
          rightIcon={<TiLocationArrow />}
          href={ALOSRA_MAP_URL}
          containerClass="flex-center gap-1"
        />
      </div>

      <div className="flex w-full flex-1 flex-col items-center gap-6">
        <Globe />

        <p className="font-general text-xs uppercase text-navy-100">
          {t("locations.availableAt")}
        </p>
        <a href={ALOSRA_MAP_URL} target="_blank" rel="noopener noreferrer">
          <img
            src="/img/alosra-logo.png"
            alt="Alosra"
            className="w-28 rounded-2xl transition-transform hover:scale-105"
          />
        </a>
      </div>
    </div>
  </section>
  );
};

export default Locations;
