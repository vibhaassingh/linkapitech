"use client";

import * as React from "react";

/**
 * Cross-route View Transitions — EXPERIMENTAL, and gated so that it can be
 * switched off from one line of next.config.ts.
 *
 * WHY A COMPONENT IS NEEDED AT ALL
 * `@view-transition { navigation: auto }` only covers cross-DOCUMENT
 * navigation; the App Router navigates client-side, so the browser never sees
 * one. Nothing in next/link calls `startViewTransition` either — the call
 * lives in React, and React only makes it when a <ViewTransition> boundary's
 * content changes. So the boundary is the whole mechanism.
 *
 * WHY THE EXPORT IS READ OFF THE NAMESPACE INSTEAD OF IMPORTED
 * `unstable_ViewTransition` exists only in React's experimental build, which
 * Next aliases `react` to when `experimental.viewTransition` is enabled (see
 * needs-experimental-react in next/dist). @types/react does not declare it, so
 * a named import would not typecheck — and, more importantly, reading it off
 * the namespace is what makes the revert free: flip the flag off, the export
 * is gone, this renders its children unchanged and nothing else in the tree
 * has to know. Same story for a browser without View Transitions: React skips
 * the transition and the navigation is a plain re-render.
 *
 * Reduced motion is handled in CSS (chrome.css §6) rather than by swapping
 * this wrapper out: changing the element type at this position would remount
 * the entire routed subtree once after hydration. With every
 * `::view-transition-*` animation set to `none`, the transition resolves on
 * the next frame — visually instant, no snapshot cross-fade.
 */
type ViewTransitionProps = {
  children: React.ReactNode;
  /** view-transition-class hooks; unused today, kept for the real signature. */
  name?: string;
  default?: string;
};

const ViewTransition = (
  React as unknown as {
    unstable_ViewTransition?: React.ComponentType<ViewTransitionProps>;
  }
).unstable_ViewTransition;

export function RouteTransition({ children }: { children: React.ReactNode }) {
  if (!ViewTransition) return <>{children}</>;
  return <ViewTransition>{children}</ViewTransition>;
}
