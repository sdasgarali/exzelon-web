import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.brand} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0a1024 0%, #16203f 55%, #1a54e0 140%)",
          padding: 80,
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "linear-gradient(135deg, #2f6ff3, #1642b5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              fontWeight: 800,
            }}
          >
            X
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 34, fontWeight: 800 }}>Exzelon</span>
            <span style={{ fontSize: 18, letterSpacing: 4, color: "#8ebdff" }}>NEXTGEN HIRES</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, maxWidth: 900 }}>
            Find Your Next Career Move
          </span>
          <span style={{ marginTop: 24, fontSize: 30, color: "#bcd7ff", maxWidth: 900 }}>
            Recruitment & staffing across healthcare, construction, electrical, tax & legal, and IT.
          </span>
        </div>

        <div style={{ display: "flex", gap: 16, fontSize: 24, color: "#8ebdff" }}>
          <span>25,000+ opportunities</span>
          <span>·</span>
          <span>1,200+ employers</span>
          <span>·</span>
          <span>4.4/5 rated</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
