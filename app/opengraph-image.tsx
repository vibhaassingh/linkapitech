import { ImageResponse } from "next/og";

// Branded OG cover — institutional navy, bank-centric trust line.
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
          background: "#0A1F44",
          color: "#F2F5F9",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 12, height: 12, borderRadius: 999, background: "#8FA1BC" }} />
          <div style={{ fontSize: 24, letterSpacing: 4, color: "#A9B8CE" }}>
            LINKAPI TECH PVT. LTD.
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 82, lineHeight: 1.05, fontWeight: 600, letterSpacing: -2 }}>
            Bank-grade integration,
          </div>
          <div style={{ fontSize: 82, lineHeight: 1.05, fontWeight: 600, letterSpacing: -2 }}>
            delivered.
          </div>
          <div style={{ marginTop: 28, fontSize: 26, color: "#A9B8CE" }}>
            Powering integrations for HSBC · Axis Bank · IndusInd Bank
          </div>
        </div>

        <div style={{ display: "flex", gap: 40, fontSize: 23, color: "#A9B8CE" }}>
          <span>5000+ API implementations</span>
          <span>20,000 Cr / month processed</span>
          <span>45,000+ customers</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
