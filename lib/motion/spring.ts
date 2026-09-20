/**
 * Semi-implicit Euler springs, and the stability bound that governs them.
 *
 * Every animated craft on this site integrates by hand rather than reaching
 * for a physics library: the loops write `transform` straight to element refs
 * and never re-render, which no library API expresses well. What they all
 * need is the same three lines of integration and the same piece of hard-won
 * arithmetic about how large a timestep those three lines survive.
 *
 * No React, no DOM. Safe to import anywhere, including on the server.
 */

/** A single degree of freedom: where it is, how fast, and where it is headed. */
export type Spring = {
  x: number;
  v: number;
  target: number;
};

export type SpringConfig = {
  stiffness: number;
  damping: number;
  /**
   * Below this distance *and* this speed the spring snaps onto its target and
   * reports itself settled. Leave it undefined when the caller has its own
   * settle test — several do, because they fold other conditions into it.
   */
  epsilon?: number;
};

/**
 * Advance one spring by `dt` seconds. Mutates `s`. Returns whether it is still
 * moving, so a caller can use the return value directly as its loop condition.
 */
export function stepSpring(s: Spring, c: SpringConfig, dt: number): boolean {
  const accel = c.stiffness * (s.target - s.x) - c.damping * s.v;
  s.v += accel * dt;
  s.x += s.v * dt;

  const eps = c.epsilon;
  if (
    eps !== undefined &&
    Math.abs(s.target - s.x) < eps &&
    Math.abs(s.v) < eps
  ) {
    s.x = s.target;
    s.v = 0;
    return false;
  }
  return true;
}

/**
 * A list of springs held as three parallel arrays rather than an array of
 * objects. Index `i` is one degree of freedom across all three.
 */
export type SpringArrays = {
  x: number[];
  v: number[];
  target: number[];
};

/**
 * The same over three parallel arrays. Crafts that animate a list — the ticks
 * on the ruler, the prints in the pile — keep position, velocity and target as
 * separate `number[]`s rather than an array of `Spring` objects, because an
 * object per element per sub-step per frame is allocation the loop cannot
 * afford. Mutates all three. Returns whether *any* element is still moving.
 */
export function stepSprings(
  springs: SpringArrays,
  c: SpringConfig,
  dt: number,
): boolean {
  const { x, v, target } = springs;
  let moving = false;
  const eps = c.epsilon;
  for (let i = 0; i < x.length; i++) {
    const px = x[i] ?? 0;
    const pv = v[i] ?? 0;
    const pt = target[i] ?? 0;

    const accel = c.stiffness * (pt - px) - c.damping * pv;
    const nv = pv + accel * dt;
    const nx = px + nv * dt;

    if (eps !== undefined && Math.abs(pt - nx) < eps && Math.abs(nv) < eps) {
      x[i] = pt;
      v[i] = 0;
    } else {
      x[i] = nx;
      v[i] = nv;
      moving = true;
    }
  }
  return moving;
}

/**
 * How many equal sub-steps an elapsed frame must be split into to keep every
 * step at or under `maxStep`. Always at least one, so a short frame still
 * integrates once.
 */
export function subSteps(elapsed: number, maxStep: number): number {
  return Math.max(1, Math.ceil(elapsed / maxStep));
}

/** The damping that makes `stiffness` critically damped: no overshoot, no ring. */
export function criticalDamping(stiffness: number): number {
  return 2 * Math.sqrt(stiffness);
}

/**
 * The largest timestep for which semi-implicit Euler stays stable, from
 * `k·h² + 2c·h < 4`. Past it the integrator does not merely lose accuracy — it
 * diverges, and the symptom is a transform that goes to Infinity and then NaN,
 * which the browser silently drops. The element simply vanishes, with nothing
 * in the console.
 *
 * Solving for h: `h = (−c + √(c² + 4k)) / k`. For the photo pile's stiffest
 * spring (k = 1600, c = 80) that is 0.0207 s — under a 60 Hz frame, which is
 * why every loop here sub-steps rather than trusting the frame length.
 */
export function maxStableStep(stiffness: number, damping: number): number {
  return (-damping + Math.sqrt(damping * damping + 4 * stiffness)) / stiffness;
}

/**
 * Dev-only guard. Call it at module scope beside a tuning block, and the dev
 * server complains the moment someone raises a stiffness past what the loop's
 * sub-step can integrate. Compiles to nothing that runs in production.
 *
 * This exists because the failure it catches is invisible: no error, no warning,
 * just an element that disappears on slow frames and nowhere else.
 */
export function assertStable(
  name: string,
  stiffness: number,
  damping: number,
  maxStep: number,
): void {
  if (process.env.NODE_ENV === "production") return;
  const bound = maxStableStep(stiffness, damping);
  if (maxStep >= bound) {
    console.error(
      `[motion] "${name}" integrates at ${maxStep}s but diverges above ` +
        `${bound.toFixed(4)}s (k=${stiffness}, c=${damping}). Lower the ` +
        `stiffness or lower MAX_STEP, or transforms will go NaN on slow frames.`,
    );
  }
}
