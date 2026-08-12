import { ImageResponse } from "next/og";

// Branded OG cover — Figma Purple, connected-banking positioning.
export const alt = "LinkAPI Tech — Banking That Lives Inside Your Business";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background:
          "linear-gradient(165deg, #250D29 0%, #42174C 55%, #1A0620 100%)",
        color: "#F7F3F9",
        padding: "80px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: 999,
            background: "#C9B8D8",
          }}
        />
        <div style={{ fontSize: 24, letterSpacing: 4, color: "#CDBBD4" }}>
          LINKAPI TECH PVT. LTD.
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontSize: 84,
            lineHeight: 1.05,
            fontWeight: 700,
            letterSpacing: -2,
          }}
        >
          Banking That Lives
        </div>
        <div
          style={{
            fontSize: 84,
            lineHeight: 1.05,
            fontWeight: 700,
            letterSpacing: -2,
          }}
        >
          Inside Your Business.
        </div>
        <div style={{ marginTop: 28, fontSize: 26, color: "#CDBBD4" }}>
          ERP-native banking infrastructure for banks, NBFCs and enterprises
        </div>
      </div>

      <div style={{ display: "flex", gap: 40, fontSize: 23, color: "#CDBBD4" }}>
        <span>70,000+ businesses onboarded</span>
        {/* No ₹ here: ImageResponse fetches glyphs per-character and the
              rupee sign 400s, which would render as tofu in the social card. */}
        <span>INR 60,000 Cr+ monthly volume</span>
        <span>35+ APIs · 5+ banks live</span>
      </div>
    </div>,
    { ...size },
  );
}
