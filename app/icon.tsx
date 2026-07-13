import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Favicon — lime "L" on ink (Next.js icon convention, auto cache-busted). */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d0d0d",
          color: "#C6FB50",
          fontSize: 22,
          fontWeight: 700,
          fontFamily: "serif",
          fontStyle: "italic",
          borderRadius: 6,
        }}
      >
        L
      </div>
    ),
    { ...size },
  );
}
