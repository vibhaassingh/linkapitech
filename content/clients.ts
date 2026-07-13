/**
 * Client / partner trust marks. The source ships light-only PNG logos that are
 * invisible on white and legally sensitive to reproduce; per CONTENT-MAPPING §3
 * we render tasteful text wordmarks as an interim trust bar and flag the real
 * vector logos as a sourcing task.
 *
 * TODO: client to confirm — supply licensed vector logos (SVG) for each mark,
 * and confirm the exact name behind `aditya.png` (likely "Aditya Birla").
 */
export interface ClientMark {
  name: string;
  /** Optional path to a licensed vector logo once supplied. */
  logo?: string;
}

export const CLIENTS: ClientMark[] = [
  { name: "HSBC" },
  { name: "Axis Bank" },
  { name: "IndusInd Bank" },
  { name: "Aditya Birla" }, // TODO: confirm exact entity name with client.
];
