"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

// Safe client-side GSAP ScrollTrigger registration
if (typeof window !== "undefined") {
  import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
    gsap.registerPlugin(ScrollTrigger);
  });
}

export interface ScatterSet {
  heading: string;
  images: string[];
}

export interface ImageScatterProps extends React.HTMLAttributes<HTMLDivElement> {
  data: ScatterSet[];
  cardWidth?: number;
  cardHeight?: number;
  animationDuration?: number;
  animationOverlap?: number;
  headingFadeDuration?: number;
  intervalMs?: number;
  scroller?: string | Element | null;
}

export function ImageScatter({
  data,
  cardWidth           = 240,
  cardHeight          = 290,
  animationDuration   = 0.75,
  animationOverlap    = 0.5,
  headingFadeDuration = 0.45,
  intervalMs          = 3000,
  className,
  ...props
}: ImageScatterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const galleryRef   = useRef<HTMLDivElement>(null);
  const headingRef   = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (
      !containerRef.current ||
      !galleryRef.current   ||
      !headingRef.current   ||
      data.length === 0
    ) return;

    const gallery        = galleryRef.current;
    const galleryHeading = headingRef.current;

    let viewport = {
      centerX:  containerRef.current.clientWidth  / 2,
      centerY:  containerRef.current.clientHeight / 2,
      rangeMin: Math.min(containerRef.current.clientWidth, containerRef.current.clientHeight) * 0.32,
      rangeMax: Math.min(containerRef.current.clientWidth, containerRef.current.clientHeight) * 0.65,
    };

    let state = {
      activeCards:    [] as { element: HTMLDivElement; centerX: number; centerY: number }[],
      currentSection: 0,
      isAnimating:    false,
    };

    function updateViewport() {
      if (!containerRef.current) return;
      viewport.centerX  = containerRef.current.clientWidth  / 2;
      viewport.centerY  = containerRef.current.clientHeight / 2;
      viewport.rangeMin = Math.min(containerRef.current.clientWidth, containerRef.current.clientHeight) * 0.32;
      viewport.rangeMax = Math.min(containerRef.current.clientWidth, containerRef.current.clientHeight) * 0.65;
    }

    function getEdgePosition(centerX: number, centerY: number) {
      const W  = containerRef.current?.clientWidth  || window.innerWidth;
      const H  = containerRef.current?.clientHeight || window.innerHeight;
      const cx = cardWidth  / 2;
      const cy = cardHeight / 2;
      const jitter = () => (Math.random() - 0.5) * 380;
      const dists  = { left: centerX, right: W - centerX, top: centerY, bottom: H - centerY };
      const min    = Math.min(...Object.values(dists));

      if (min === dists.left)   return { x: -cardWidth  - 100 - Math.random() * 200, y: centerY - cy + jitter() };
      if (min === dists.right)  return { x: W + 50 + Math.random() * 200,            y: centerY - cy + jitter() };
      if (min === dists.top)    return { x: centerX - cx + jitter(),                 y: -cardHeight - 100 - Math.random() * 200 };
                                return { x: centerX - cx + jitter(),                 y: H + 50 + Math.random() * 200 };
    }

    function createCards(sectionIndex: number) {
      const cards: { element: HTMLDivElement; centerX: number; centerY: number }[] = [];
      const section = data[sectionIndex];
      if (!section?.images.length) return cards;

      section.images.forEach((src) => {
        const card = document.createElement("div");
        card.className =
          "absolute rounded-2xl border-[6px] border-white dark:border-neutral-800 shadow-2xl overflow-hidden will-change-transform";
        card.style.width  = `${cardWidth}px`;
        card.style.height = `${cardHeight}px`;

        const img       = document.createElement("img");
        img.src         = src;
        img.loading     = "lazy";
        img.alt         = section.heading;
        img.className   = "w-full h-full object-cover pointer-events-none";
        card.appendChild(img);

        const angle   = Math.random() * Math.PI * 2;
        const radius  = viewport.rangeMin + Math.random() * (viewport.rangeMax - viewport.rangeMin);
        const cX      = viewport.centerX + Math.cos(angle) * radius;
        const cY      = viewport.centerY + Math.sin(angle) * radius;

        gsap.set(card, {
          left:     cX - cardWidth  / 2,
          top:      cY - cardHeight / 2,
          rotation: Math.random() * 44 - 22,
        });

        gallery.appendChild(card);
        cards.push({ element: card, centerX: cX, centerY: cY });
      });

      return cards;
    }

    function animateHeading(newText: string) {
      return gsap
        .timeline()
        .to(galleryHeading, { opacity: 0, y: -8, duration: headingFadeDuration, ease: "power2.inOut" })
        .call(() => { galleryHeading.textContent = newText; })
        .to(galleryHeading, { opacity: 1, y: 0, duration: headingFadeDuration, ease: "power2.inOut" });
    }

    function animateCards(
      exiting:  { element: HTMLDivElement; centerX: number; centerY: number }[],
      entering: { element: HTMLDivElement; centerX: number; centerY: number }[]
    ) {
      const tl = gsap.timeline();

      exiting.forEach(({ element, centerX, centerY }) => {
        const edge = getEdgePosition(centerX, centerY);
        tl.to(element, {
          left:     edge.x,
          top:      edge.y,
          rotation: Math.random() * 180 - 90,
          duration: animationDuration,
          ease:     "power2.in",
          onComplete: () => element.remove(),
        }, 0);
      });

      entering.forEach(({ element, centerX, centerY }) => {
        const edge = getEdgePosition(centerX, centerY);
        gsap.set(element, { left: edge.x, top: edge.y, rotation: Math.random() * 180 - 90 });
        tl.to(element, {
          left:     centerX - cardWidth  / 2,
          top:      centerY - cardHeight / 2,
          rotation: Math.random() * 44 - 22,
          duration: animationDuration,
          ease:     "power2.out",
        }, animationOverlap);
      });

      return tl;
    }

    // Init first section
    state.activeCards = createCards(0);
    galleryHeading.textContent = data[0]?.heading || "";
    gsap.set(galleryHeading, { opacity: 1, y: 0 });

    function nextSection() {
      if (state.isAnimating) return;
      const target = (state.currentSection + 1) % data.length;
      state.isAnimating = true;
      const newCards = createCards(target);

      Promise.all([
        animateCards(state.activeCards, newCards).then(),
        animateHeading(data[target]?.heading || "").then(),
      ]).then(() => {
        state.activeCards    = newCards;
        state.currentSection = target;
        state.isAnimating    = false;
      });
    }

    const intervalId = setInterval(nextSection, intervalMs);
    const onResize   = () => { updateViewport(); };
    window.addEventListener("resize", onResize);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("resize", onResize);
      state.activeCards.forEach(({ element }) => { try { element.remove(); } catch {} });
    };
  }, [data, cardWidth, cardHeight, animationDuration, animationOverlap, headingFadeDuration, intervalMs]);

  return (
    <section
      ref={containerRef}
      className={cn(
        "relative w-full flex justify-center items-center overflow-hidden rounded-3xl",
        className
      )}
      style={{ minHeight: 480 }}
      {...props}
    >
      <div ref={galleryRef} className="absolute inset-0 pointer-events-none" />
      <h2
        ref={headingRef}
        className="w-[85%] md:w-[50%] text-center text-3xl md:text-5xl lg:text-6xl font-display font-semibold leading-tight tracking-tight z-10 will-change-[opacity,transform] text-neutral-900 dark:text-white drop-shadow-sm"
      />
    </section>
  );
}
