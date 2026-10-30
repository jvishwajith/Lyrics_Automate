import React from "react";
import { AbsoluteFill } from "remotion";
import { Watermark } from "../components/Watermark";

export const WatermarkOnly: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: "transparent",
      pointerEvents: "none",
    }}
  >
    <Watermark
      handle="@LetsBreakup-2k26"
      position="bottom"
      bottomY={120}
    />
  </AbsoluteFill>
);
