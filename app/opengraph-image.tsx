import { ImageResponse } from "next/og";

// A real branded OG cover (PLAN §6 — the reference's og-cover.jpg was missing).
export const alt = "LinkAPI Tech — BFSI API Integration & Technology Services";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0d0d0d",
          color: "#ffffff",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 14, height: 14, borderRadius: 999, background: "#C6FB50" }} />
          <div style={{ fontSize: 26, letterSpacing: 2, color: "#a3a099" }}>
            LINKAPI TECH PVT. LTD.
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, lineHeight: 1.02, fontWeight: 600, letterSpacing: -2 }}>
            Secure connections
          </div>
          <div style={{ display: "flex", fontSize: 84, lineHeight: 1.02, fontWeight: 600, letterSpacing: -2 }}>
            <span>that grow&nbsp;</span>
            <span style={{ color: "#C6FB50", fontStyle: "italic" }}>with you.</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 40, fontSize: 24, color: "#a3a099" }}>
          <span>5000+ API implementations</span>
          <span>20,000 Cr / month</span>
          <span>45,000+ customers</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
