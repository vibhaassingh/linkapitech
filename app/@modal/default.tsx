/**
 * Fallback for the `@modal` parallel slot. Renders nothing on hard navigation
 * (and on every route that isn't an intercepted /work/[slug]), so the real page
 * in `children` shows through unmodified.
 */
export default function ModalDefault() {
  return null;
}
