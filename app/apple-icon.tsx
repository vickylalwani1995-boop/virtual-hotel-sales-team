import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1B6EB7",
          color: "#FFFFFF",
          fontFamily: "Georgia, serif",
          fontWeight: 700,
          fontSize: 120,
          letterSpacing: "-4px",
          lineHeight: 1,
        }}
      >
        M
      </div>
    ),
    { ...size }
  );
}
