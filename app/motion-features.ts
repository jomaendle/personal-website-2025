import { domMax } from "framer-motion";

// Loaded through LazyMotion's async `features` prop (see providers.tsx), so
// the animation runtime ships in its own low-priority chunk instead of the
// critical bundle. domMax (not domAnimation) because the homepage's blog list
// uses `layout` animations for its Show More/Show Less choreography — the
// smaller bundle silently disables those. Until it arrives, `m` components
// render their final state without entrance animations — invisible in
// practice on a fast connection, and a graceful fallback on a slow one.
export default domMax;
