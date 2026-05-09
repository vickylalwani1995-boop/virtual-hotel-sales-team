import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

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
          background: "#0B2447",
          color: "#D4A537",
          fontFamily: "Georgia, serif",
          fontWeight: 700,
          fontSize: 44,
          letterSpacing: "-2px",
          lineHeight: 1,
        }}
      >
        M
      </div>
    ),
    { ...size }
  );
}
