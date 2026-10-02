"use client";

import { useEffect, useRef } from "react";

/**
 * Anima descendentes com data-reveal quando entram na área visível.
 * Não recebe parâmetros; T indica o elemento HTML do contêiner cliente.
 * @returns Ref a conectar ao contêiner. Os alvos são coletados apenas na montagem;
 * conteúdo inicialmente visível não é animado. Respeita movimento reduzido,
 * cancela animações ao interagir e limpa eventos/observer na desmontagem.
 * data-reveal aceita up, down, left ou right; em telas pequenas usa up.
 * data-reveal-delay é limitado a 0–180 ms.
 * @example
 * const ref = useReveal<HTMLDivElement>();
 * return <div ref={ref}><section data-reveal="left" data-reveal-delay="100">...</section></div>;
 */

export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || typeof window.matchMedia !== "function") return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches || typeof IntersectionObserver === "undefined") return;

    const animations = new Map<HTMLElement, Animation>();
    let observer: IntersectionObserver | undefined;

    function stop() {
      observer?.disconnect();
      animations.forEach((animation) => animation.cancel());
      animations.clear();
    }

    function preference() {
      if (motion.matches) stop();
    }

    function interact(event: Event) {
      if (!(event.target instanceof Element)) return;
      const target = event.target;
      animations.forEach((animation, element) => {
        if (element.contains(target)) animation.cancel();
      });
    }

    try {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            observer?.unobserve(entry.target);
            const element = entry.target as HTMLElement;
            if (
              motion.matches ||
              typeof element.animate !== "function" ||
              element.contains(document.activeElement)
            ) {
              return;
            }

            const desktop = window.matchMedia("(min-width: 768px)").matches;
            const direction = desktop ? element.dataset.reveal : "up";
            const delay = Number(element.dataset.revealDelay ?? 0);
            const translate =
              direction === "left"
                ? "-12px 0"
                : direction === "right"
                  ? "12px 0"
                  : direction === "down"
                    ? "0 -12px"
                    : "0 12px";

            try {
              const animation = element.animate(
                [
                  { opacity: 0.2, translate },
                  { opacity: 1, translate: "0 0" },
                ],
                {
                  duration: 550,
                  delay: Number.isFinite(delay)
                    ? Math.min(180, Math.max(0, delay))
                    : 0,
                  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                  fill: "backwards",
                },
              );
              animations.set(element, animation);
              animation.onfinish = animation.oncancel = () => {
                animations.delete(element);
              };
            } catch {}
          });
        },
        { threshold: 0.08 },
      );

      root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => {
        // Keep initial viewport content immediate (including LCP and 3D loading).
        // If markup accidentally nests targets, animate only the outer target.
        if (
          !element.parentElement?.closest("[data-reveal]") &&
          element.getBoundingClientRect().top >= window.innerHeight
        ) {
          observer?.observe(element);
        }
      });

      motion.addEventListener("change", preference);
      root.addEventListener("focusin", interact);
      root.addEventListener("pointerdown", interact);
    } catch {
      stop();
    }

    return () => {
      stop();
      motion.removeEventListener("change", preference);
      root.removeEventListener("focusin", interact);
      root.removeEventListener("pointerdown", interact);
    };
  }, []);

  return ref;
}
