import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/PlusJakartaSans";
import { SAD_CONFIG } from "./config";
import { formatTime } from "../../shared/lyrics";

const { fontFamily } = loadFont("normal", { weights: ["500"], subsets: ["latin"] });

interface SadProgressProps { totalDurationSeconds: number; }

export const SadProgress: React.FC<SadProgressProps> = ({ totalDurationSeconds }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = SAD_CONFIG.theme;
  const l = SAD_CONFIG.layout;

  const currentSeconds = Math.min(totalDurationSeconds, frame / fps);
  const totalSeconds = totalDurationSeconds > 0 ? totalDurationSeconds : durationInFrames / fps;
  const pct = Math.min(100, Math.max(0, (currentSeconds / totalSeconds) * 100));

  return (
    <div style={{ position: "absolute", top: `${l.progressCenterY}px`, left: "50%", transform: "translate(-50%, -50%)", width: "68%", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", pointerEvents: "none", zIndex: 10 }}>
      <div style={{ width: "100%", height: "2px", backgroundColor: t.progressBarTrack, borderRadius: "2px", position: "relative", overflow: "visible" }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`, backgroundColor: t.progressBarColor, borderRadius: "2px", boxShadow: `0 0 10px ${t.progressBarColor}` }} />
        <div style={{ position: "absolute", left: `${pct}%`, top: "50%", transform: "translate(-50%, -50%)", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#ffffff", boxShadow: `0 0 8px #ffffff, 0 0 16px ${t.progressBarColor}` }} />
      </div>
      <div style={{ width: "100%", display: "flex", justifyContent: "space-between", fontFamily, fontSize: "16px", fontWeight: 500, letterSpacing: "0.12em", color: t.tertiaryTextColor }}>
        <span>{formatTime(currentSeconds)}</span>
        <span>{formatTime(totalSeconds)}</span>
      </div>
    </div>
  );
};
