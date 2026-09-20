/**
 * The stability bound that governs every hand-rolled spring on this site.
 *
 * This file used to also export a spring integrator, in two shapes. Nothing
 * ever called either: semi-implicit Euler is three lines, and every craft
 * turned out to want them inlined among its own per-property state rather
 * than behind a call that would allocate or copy. The integrator went, and
 * with it a soft invariant nobody was checking.
 *
 * What survived is the part that was genuinely worth sharing, because it is
 * arithmetic rather than code: how large a timestep those three lines can
 * survive, and a dev-time guard that says so out loud.
 *
 * No React, no DOM. Safe to import anywhere, including on the server.
 */

/**
 * How many equal sub-steps an elapsed frame must be split into to keep every
 * step at or under `maxStep`. Always at least one, so a short frame still
 * integrates once.
 */
export function subSteps(elapsed: number, maxStep: number): number {
  return Math.max(1, Math.ceil(elapsed / maxStep));
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
