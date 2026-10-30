import React from "react";
import { useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/google-fonts/PlusJakartaSans";
import { SAD_CONFIG } from "./config";

const { fontFamily } = loadFont("normal", { weights: ["600"], subsets: ["latin"] });

interface SadHeaderProps { title: string; subtitle: string; }

export const SadHeader: React.FC<SadHeaderProps> = ({ title, subtitle }) => {
  const frame = useCurrentFrame();
  const t = SAD_CONFIG.theme;
  const ty = SAD_CONFIG.typography;
  const l = SAD_CONFIG.layout;

  const pulseScale = 1 + Math.sin(frame / 12) * 0.15;
  const pulseOpacity = 0.6 + Math.sin(frame / 12) * 0.3;

  return (
    <div style={{ position: "absolute", top: `${l.headerCenterY}px`, left: "50%", transform: "translate(-50%, -50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", width: "80%", pointerEvents: "none", zIndex: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: t.primaryTextColor, boxShadow: `0 0 10px ${t.primaryTextColor}`, transform: `scale(${pulseScale})`, opacity: pulseOpacity }} />
        <span style={{ fontFamily, fontSize: `${ty.metaFontSize}px`, fontWeight: ty.metaFontWeight, letterSpacing: ty.metaLetterSpacing, color: t.secondaryTextColor, textTransform: "uppercase", textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}>
          {title}
        </span>
      </div>
      <div style={{ fontFamily, fontSize: "18px", fontWeight: 500, letterSpacing: "0.16em", color: t.tertiaryTextColor, textTransform: "uppercase" }}>
        {subtitle}
      </div>
    </div>
  );
};
