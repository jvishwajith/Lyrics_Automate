import React, { useMemo } from "react";
import { AbsoluteFill, Img, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { LyricWord } from "../../shared/types";
import { SAD_CONFIG } from "./config";

interface SadBackgroundProps { currentWord?: LyricWord; }

export const SadBackground: React.FC<SadBackgroundProps> = ({ currentWord }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = SAD_CONFIG.theme;

  const particles = useMemo(() => {
    return Array.from({ length: t.particleCount }, (_, i) => {
      const seed = (i * 9301 + 49297) % 233280;
      const r1 = seed / 233280;
      const r2 = ((seed * 9301 + 49297) % 233280) / 233280;
      const r3 = ((seed * 9301 + 12345) % 233280) / 233280;
      return { id: i, x: r1 * 1080, y: r2 * 1920, size: 3 + r3 * 6, speed: 0.15 + r1 * 0.25, opacity: 0.12 + r2 * 0.22, blur: r3 > 0.6 ? 4 : 1, driftRadius: 20 + r2 * 40, driftPhase: r1 * Math.PI * 2 };
    });
  }, [t.particleCount]);

  const light1X = Math.sin(frame / 150) * 120 + Math.cos(frame / 220) * 60;
  const light1Y = Math.cos(frame / 180) * 160 + Math.sin(frame / 260) * 80;
  const light2X = Math.cos(frame / 140) * 140 - Math.sin(frame / 200) * 70;
  const light2Y = Math.sin(frame / 160) * 130 - Math.cos(frame / 240) * 90;
  const ambientBreathe = Math.sin(frame / 75) * 0.05 + 0.95;

  const startFrame = currentWord ? Math.round(currentWord.start * fps) : 0;
  const localFrame = currentWord ? Math.max(0, frame - startFrame) : 0;
  const vocalPulseProgress = spring({ frame: localFrame, fps, config: { damping: 20, stiffness: 60, mass: 1 } });
  const vocalPulse = currentWord ? interpolate(vocalPulseProgress, [0, 0.4, 1], [0, 0.4, 0.15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  const { lyricStageCenterY } = SAD_CONFIG.layout;

  return (
    <AbsoluteFill style={{ backgroundColor: t.backgroundColor, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: t.backgroundGradient }} />

      <div style={{ position: "absolute", top: "35%", left: "50%", width: 900, height: 900, borderRadius: "50%", background: `radial-gradient(circle, ${t.ambientLight1} 0%, transparent 70%)`, filter: "blur(100px)", opacity: 0.85 * ambientBreathe, transform: `translate(-50%, -50%) translate(${light1X}px, ${light1Y}px)`, willChange: "transform, opacity" }} />
      <div style={{ position: "absolute", top: "60%", left: "50%", width: 800, height: 800, borderRadius: "50%", background: `radial-gradient(circle, ${t.ambientLight2} 0%, transparent 65%)`, filter: "blur(120px)", opacity: 0.75 * ambientBreathe, transform: `translate(-50%, -50%) translate(${light2X}px, ${light2Y}px)`, willChange: "transform, opacity" }} />
      <div style={{ position: "absolute", top: `${lyricStageCenterY}px`, left: "50%", width: 750, height: 450, borderRadius: "50%", background: `radial-gradient(ellipse, ${t.accentVocalGlow} 0%, transparent 70%)`, filter: "blur(80px)", opacity: vocalPulse, transform: `translate(-50%, -50%) scale(${1 + vocalPulse * 0.3})`, willChange: "transform, opacity" }} />

      {particles.map((p) => {
        const cy = (p.y - frame * p.speed) % 1920;
        const ny = cy < 0 ? cy + 1920 : cy;
        const dx = Math.sin(frame / 60 + p.driftPhase) * p.driftRadius;
        return <div key={p.id} style={{ position: "absolute", left: `${p.x + dx}px`, top: `${ny}px`, width: `${p.size}px`, height: `${p.size}px`, borderRadius: "50%", backgroundColor: t.particleColor, opacity: p.opacity, filter: `blur(${p.blur}px)`, pointerEvents: "none", boxShadow: `0 0 ${p.size * 2}px ${t.particleGlow}` }} />;
      })}

      <Img
        src="data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          opacity: t.filmGrainOpacity,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(0,0,0,${t.vignetteStrength}) 100%)`, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
