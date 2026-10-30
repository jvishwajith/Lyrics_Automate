import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/google-fonts/Outfit";

const { fontFamily } = loadFont("normal", {
  weights: ["500"],
  subsets: ["latin"],
});

interface WatermarkProps {
  handle?: string;
  topY?: number;
  position?: "top" | "bottom";
  bottomY?: number;
}

export const Watermark: React.FC<WatermarkProps> = ({
  handle = "@LetsBreakup-2k26",
  topY = 175,
  position = "top",
  bottomY = 120,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 18], [0, 0.55], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(frame, [0, 18], [6, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const isBottom = position === "bottom";

  return (
    <div
      style={{
        position: "absolute",
        top: isBottom ? undefined : `${topY}px`,
        bottom: isBottom ? `${bottomY}px` : undefined,
        left: "50%",
        transform: `translate(-50%, ${isBottom ? "50%" : "-50%"}) translateY(${translateY}px)`,
        display: "flex",
        alignItems: "center",
        gap: "7px",
        padding: "6px 14px 6px 11px",
        opacity,
        pointerEvents: "none",
        zIndex: 50,
        willChange: "transform, opacity",
      }}
    >
      <svg
        width="20"
        height="15"
        viewBox="0 0 24 17"
        fill="none"
        style={{ opacity: 0.75, flexShrink: 0 }}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M23.498 2.625a3.008 3.008 0 0 0-2.118-2.129C19.512 0 12 0 12 0s-7.512 0-9.38.496A3.008 3.008 0 0 0 .502 2.625C0 4.509 0 8.437 0 8.437s0 3.928.502 5.812a3.008 3.008 0 0 0 2.118 2.13C4.488 16.875 12 16.875 12 16.875s7.512 0 9.38-.496a3.008 3.008 0 0 0 2.118-2.13c.502-1.884.502-5.812.502-5.812s0-3.928-.502-5.812zM9.6 4.821v7.233l6.257-3.617L9.6 4.821z"
          fill="rgba(255, 255, 255, 0.75)"
        />
      </svg>

      <span
        style={{
          fontFamily,
          fontSize: "20px",
          fontWeight: 500,
          letterSpacing: "0.06em",
          color: "rgba(255, 255, 255, 0.7)",
          textShadow: "0 1px 6px rgba(0, 0, 0, 0.35)",
          lineHeight: 1,
        }}
      >
        {handle}
      </span>
    </div>
  );
};
