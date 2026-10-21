import { useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "../enroll/ui";
import { useCopy } from "./content";
import { NovaStar } from "./parts";

type Pt = { x: number; y: number };

/**
 * Altura de cada paso en escritorio: la línea arranca plana abajo a la
 * izquierda y sube hacia la estrella, como en el isotipo. El título de la
 * sección ocupa el hueco de arriba a la izquierda.
 */
const RISE = [262, 250, 222, 168, 90, 0];
/** Momento en que la línea llega a cada paso (segundos). */
const NODE_DELAY = [0.2, 0.62, 0.95, 1.22, 1.48, 1.72];
const STAR_DELAY = 2;

/** Curva suave (Catmull-Rom) que pasa por todos los puntos. */
function smoothPath(p: Pt[]) {
  const first = p[0];
  if (!first || p.length < 2) return "";
  let d = `M${first.x} ${first.y}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p1 = p[i] ?? first;
    const p2 = p[i + 1] ?? p1;
    const p0 = p[i - 1] ?? p1;
    const p3 = p[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`;
  }
  return d;
}

/**
 * Los 6 pasos de NovaCore sobre la trayectoria del isotipo, en fondo azul.
 * En escritorio la línea sube hacia la estrella; en el celular baja en
 * vertical. La línea se dibuja al entrar en pantalla, con un halo verde, y
 * cada paso se enciende cuando ella llega.
 */
export function ProcessPath({ heading }: { heading: ReactNode }) {
  const t = useCopy();
  const steps = t.process.steps;
  const wrapRef = useRef<HTMLDivElement>(null);
  const points = useRef<(HTMLElement | null)[]>([]);
  const [geo, setGeo] = useState<{ w: number; h: number; d: string } | null>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const measure = () => {
      const r = wrap.getBoundingClientRect();
      const pts: Pt[] = [];
      for (const el of points.current) {
        if (!el) continue;
        const b = el.getBoundingClientRect();
        pts.push({ x: b.left + b.width / 2 - r.left, y: b.top + b.height / 2 - r.top });
      }
      setGeo({ w: r.width, h: r.height, d: smoothPath(pts) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDrawn(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setDrawn(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(wrap);
    return () => io.disconnect();
  }, []);

  const draw = {
    pathLength: 1,
    strokeDasharray: 1,
    strokeDashoffset: drawn ? 0 : 1,
    style: { transition: "stroke-dashoffset 2s cubic-bezier(0.65, 0, 0.35, 1)" },
  };

  return (
    <div ref={wrapRef} className="relative lg:pt-16">
      {geo && (
        <svg
          viewBox={`0 0 ${geo.w} ${geo.h}`}
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <filter id="process-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="7" />
            </filter>
          </defs>
          <path
            d={geo.d}
            fill="none"
            stroke="rgb(255 255 255 / 0.12)"
            strokeWidth={2}
            strokeLinecap="round"
          />
          <path
            d={geo.d}
            fill="none"
            stroke="var(--green)"
            strokeOpacity={0.55}
            strokeWidth={12}
            strokeLinecap="round"
            filter="url(#process-glow)"
            {...draw}
          />
          <path
            d={geo.d}
            fill="none"
            stroke="var(--green)"
            strokeWidth={3.5}
            strokeLinecap="round"
            {...draw}
          />
        </svg>
      )}

      {/* Título: arriba a la izquierda en escritorio, donde la línea todavía no sube */}
      <div className="relative mb-12 lg:absolute lg:left-0 lg:top-0 lg:mb-0 lg:max-w-[36%]">
        {heading}
      </div>

      <ol className="relative grid lg:grid-cols-6 lg:gap-5">
        {steps.map((s, i) => (
          <li
            key={s.title}
            className="grid grid-cols-[44px_minmax(0,1fr)] gap-x-4 pb-5 lg:block lg:pb-0 lg:pt-[var(--rise)]"
            style={{ ["--rise" as string]: `${RISE[i] ?? 0}px` }}
          >
            <span
              ref={(el) => {
                points.current[i] = el;
              }}
              className={cx(
                "relative grid h-11 w-11 place-items-center rounded-full font-display text-[15px] font-bold transition-[background-color,color,box-shadow] duration-500",
                drawn
                  ? "bg-green text-navy shadow-[0_0_0_6px_var(--navy-deep),0_0_30px_2px_oklch(0.788_0.203_130.3/0.5)]"
                  : "bg-navy-2 text-white/70 shadow-[0_0_0_6px_var(--navy-deep),inset_0_0_0_1.5px_rgb(255_255_255/0.18)]",
              )}
              style={{ transitionDelay: drawn ? `${NODE_DELAY[i] ?? 0}s` : "0s" }}
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <div
              className={cx(
                "rounded-[18px] bg-white/[0.045] p-4 ring-1 ring-white/10 transition-[transform,box-shadow,background-color] duration-500 [transition-timing-function:var(--ease-out)] hover:-translate-y-1 hover:bg-white/[0.07] hover:ring-green/40 lg:mt-5 lg:p-4 xl:p-5",
              )}
            >
              <h3 className="font-display text-[18px] font-bold leading-tight text-white lg:text-[16px] xl:text-[18px]">
                <span className="sr-only">
                  {t.process.stepLabel} {i + 1}:{" "}
                </span>
                {s.title}
              </h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-white/65 lg:text-[14px] xl:text-[15px]">
                {s.text}
              </p>
            </div>
          </li>
        ))}
      </ol>

      {/* La estrella: meta de la trayectoria */}
      <div
        ref={(el) => {
          points.current[steps.length] = el;
        }}
        className="relative mt-2 grid w-11 place-items-center lg:absolute lg:right-1 lg:top-0 lg:mt-0"
        aria-hidden="true"
      >
        <NovaStar
          className={cx(
            "h-9 w-9 transition-colors duration-700",
            drawn
              ? "nc-star-on text-green [filter:drop-shadow(0_0_14px_oklch(0.788_0.203_130.3/0.8))]"
              : "text-white/20",
          )}
          style={{
            animationDelay: `${STAR_DELAY}s`,
            transitionDelay: drawn ? `${STAR_DELAY}s` : "0s",
          }}
        />
      </div>
    </div>
  );
}
