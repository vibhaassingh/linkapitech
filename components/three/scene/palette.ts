/** Scene colors — mirrors the CSS tokens in globals.css (:root, Figma Purple). */
export const PALETTE = {
  plum950: 0x1a0620,
  plum900: 0x250d29,
  plum700: 0x42174c,
  plum600: 0x62216f,
  violet: 0x8e24aa,
  lavender: 0xc9b8d8,
  inkInv: 0xf7f3f9,
  /* TEMP compat names — createHeroScene/createMeshField still read these
     until the Phase-5 scene rebuild. Mapped into the plum palette. */
  navy900: 0x42174c,
  navy600: 0x8e24aa,
  steel: 0xc9b8d8,
  steel2: 0xe9dfeb,
  ink: 0x1a0620,
} as const;
