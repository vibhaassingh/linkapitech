import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Favicon — white monogram on brand plum. */
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#62216F",
        color: "#F7F3F9",
        fontSize: 20,
        fontWeight: 700,
        fontFamily: "sans-serif",
        borderRadius: 7,
      }}
    >
      L
    </div>,
    { ...size },
  );
}
