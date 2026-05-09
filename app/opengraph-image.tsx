import { ImageResponse } from "next/og";

export const alt =
  "my Sales TEAM AI — AI-powered virtual hotel sales department by My Hospitality Sales Pro";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0B2447",
          position: "relative",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Gold radial accent */}
        <div
          style={{
            position: "absolute",
            top: -200,
            left: -100,
            width: 900,
            height: 900,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(212,165,55,0.35), rgba(212,165,55,0) 60%)",
            display: "flex",
          }}
        />
        {/* Teal accent bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: -150,
            right: -150,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(25,167,206,0.20), rgba(25,167,206,0) 60%)",
            display: "flex",
          }}
        />

        {/* Top brand bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "60px 80px 0 80px",
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 18px",
              background: "#D4A537",
              borderRadius: 8,
            }}
          >
            <div
              style={{
                fontFamily: "Georgia, serif",
                fontSize: 28,
                fontWeight: 700,
                color: "#0B2447",
                letterSpacing: "-1px",
              }}
            >
              MHSP
            </div>
          </div>
          <div
            style={{
              marginLeft: 16,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#D4A537",
                letterSpacing: "3px",
                textTransform: "uppercase",
              }}
            >
              My Hospitality Sales Pro
            </div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.6)",
                marginTop: 2,
              }}
            >
              × Inntelligent CRM
            </div>
          </div>
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "0 80px",
            marginTop: 70,
            zIndex: 10,
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#D4A537",
              letterSpacing: "6px",
              textTransform: "uppercase",
              marginBottom: 24,
            }}
          >
            Introducing my Sales TEAM AI
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 78,
              fontWeight: 700,
              color: "#FFFFFF",
              lineHeight: 1.05,
              letterSpacing: "-2px",
            }}
          >
            Your virtual hotel sales
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 18,
              fontSize: 78,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-2px",
            }}
          >
            <span style={{ color: "#FFFFFF" }}>department,</span>
            <span style={{ color: "#D4A537", fontStyle: "italic" }}>
              powered by AI.
            </span>
          </div>
          <div
            style={{
              fontSize: 24,
              color: "rgba(255,255,255,0.7)",
              marginTop: 28,
              maxWidth: 900,
              lineHeight: 1.4,
            }}
          >
            11 specialist agents. One Director of Sales. Built on the MHSP method.
          </div>
        </div>

        {/* Footer strip */}
        <div
          style={{
            position: "absolute",
            bottom: 50,
            left: 80,
            right: 80,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 10,
            paddingTop: 30,
            borderTop: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 18,
              color: "rgba(255,255,255,0.6)",
              letterSpacing: "2px",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            myhospitalitysalespro.com
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 18,
              color: "#D4A537",
              fontWeight: 600,
            }}
          >
            📞 888-909-1678
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
