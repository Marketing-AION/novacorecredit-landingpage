import { Check } from "lucide-react";
import { useEnrollCopy } from "./copy";

type Pt = { x: number; y: number };
type Variant = "hero" | "compact";

/**
 * The ascending trajectory of the NovaCore isotype: a curve that starts flat
 * and climbs toward the star. Each enrollment step is a milestone on it, and
 * the green stroke is drawn up to the step the client is on.
 */
const GEO: Record<Variant, { w: number; h: number; p: [Pt, Pt, Pt, Pt] }> = {
  hero: {
    w: 600,
    h: 240,
    p: [
      { x: 30, y: 206 },
      { x: 290, y: 204 },
      { x: 468, y: 150 },
      { x: 556, y: 52 },
    ],
  },
  compact: {
    w: 600,
    h: 92,
    p: [
      { x: 20, y: 76 },
      { x: 290, y: 75 },
      { x: 470, y: 58 },
      { x: 562, y: 20 },
    ],
  },
};

const NODE_T = [0.17, 0.5, 0.8];
const SAMPLES = 160;

function bez([a, b, c, d]: [Pt, Pt, Pt, Pt], t: number): Pt {
  const u = 1 - t;
  return {
    x: u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * d.x,
    y: u * u * u * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t * t * t * d.y,
  };
}

function measure(p: [Pt, Pt, Pt, Pt]) {
  const cum = [0];
  let prev = bez(p, 0);
  for (let i = 1; i <= SAMPLES; i++) {
    const cur = bez(p, i / SAMPLES);
    cum.push((cum[i - 1] ?? 0) + Math.hypot(cur.x - prev.x, cur.y - prev.y));
    prev = cur;
  }
  return { cum, total: cum[SAMPLES] ?? 0 };
}

const pct = (v: number, of: number) => `${(v / of) * 100}%`;

export function Trajectory({
  step,
  variant = "hero",
}: {
  /** 0 = bienvenida, 1-3 = paso actual, 4 = terminado */
  step: number;
  variant?: Variant;
}) {
  const t = useEnrollCopy();
  const g = GEO[variant];
  const [a, b, c, d] = g.p;
  const path = `M${a.x} ${a.y} C${b.x} ${b.y} ${c.x} ${c.y} ${d.x} ${d.y}`;
  const { cum, total } = measure(g.p);
  const nodes = NODE_T.map((t) => bez(g.p, t));
  const drawn =
    step <= 0 ? 0 : step >= 4 ? total : (cum[Math.round((NODE_T[step - 1] ?? 0) * SAMPLES)] ?? 0);
  const hero = variant === "hero";
  const size = hero ? 32 : 24;
  const star = { x: d.x + (hero ? 18 : 14), y: d.y - (hero ? 16 : 10) };
  const finished = step >= 4;

  const label =
    step <= 0
      ? t.trajectory.intro
      : finished
        ? t.trajectory.done
        : t.trajectory.step(step, t.steps[step - 1]?.title ?? "");

  return (
    <div
      className="relative w-full select-none"
      style={{ aspectRatio: `${g.w} / ${g.h}` }}
      role="img"
      aria-label={label}
    >
      <svg
        viewBox={`0 0 ${g.w} ${g.h}`}
        className="absolute inset-0 h-full w-full overflow-visible"
        aria-hidden="true"
      >
        <path
          d={path}
          fill="none"
          stroke="rgb(255 255 255 / 0.16)"
          strokeWidth={hero ? 3 : 2.5}
          strokeLinecap="round"
        />
        <path
          d={path}
          fill="none"
          stroke="var(--green)"
          strokeWidth={hero ? 5 : 4}
          strokeLinecap="round"
          strokeDasharray={total}
          strokeDashoffset={total - drawn}
          style={{ transition: "stroke-dashoffset 1.1s var(--ease-out)" }}
        />
        <circle cx={a.x} cy={a.y} r={hero ? 5 : 4} fill="var(--green)" />
      </svg>

      {nodes.map((pt, i) => {
        const n = i + 1;
        const state = step > n ? "done" : step === n || (step <= 0 && n === 1) ? "current" : "next";
        return (
          <div
            key={n}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: pct(pt.x, g.w), top: pct(pt.y, g.h) }}
          >
            <span
              className={[
                "relative grid place-items-center rounded-full font-display font-bold transition-colors duration-500",
                state === "done" && "bg-green text-navy",
                state === "current" && "nc-ring bg-white text-navy",
                state === "next" && "border border-white/30 bg-navy-2 text-white/75",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{ width: size, height: size, fontSize: hero ? 14 : 11 }}
            >
              {state === "done" ? <Check size={hero ? 17 : 13} strokeWidth={3} /> : n}
            </span>
            {hero && (
              <span
                className={[
                  "absolute left-1/2 top-full mt-2.5 -translate-x-1/2 whitespace-nowrap text-[13px] font-semibold tracking-[0.01em] transition-colors duration-500",
                  state === "done"
                    ? "text-green"
                    : state === "current"
                      ? "text-white"
                      : "text-white/60",
                ].join(" ")}
              >
                {t.steps[i]?.short}
              </span>
            )}
          </div>
        );
      })}

      <svg
        viewBox="0 0 24 24"
        className={["absolute -translate-x-1/2 -translate-y-1/2", finished && "nc-star-on"]
          .filter(Boolean)
          .join(" ")}
        style={{
          left: pct(star.x, g.w),
          top: pct(star.y, g.h),
          width: hero ? 34 : 22,
          height: hero ? 34 : 22,
        }}
        aria-hidden="true"
      >
        <path
          d="M12 0 C12.9 6.6 17.4 11.1 24 12 C17.4 12.9 12.9 17.4 12 24 C11.1 17.4 6.6 12.9 0 12 C6.6 11.1 11.1 6.6 12 0 Z"
          fill={finished ? "var(--green)" : "rgb(255 255 255 / 0.28)"}
          style={{ transition: "fill 0.6s var(--ease-out)" }}
        />
      </svg>
    </div>
  );
}
