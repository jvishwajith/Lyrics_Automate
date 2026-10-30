import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { VERTICAL_GLASS_CONFIG } from "./config";

interface VerticalGlassBackgroundProps {
  imageName?: string;
  introDurationSeconds?: number;
  textColor?: string;
}

function lcgSeq(seed: number, count: number): number[] {
  const out: number[] = [];
  let s = seed;
  for (let i = 0; i < count; i++) {
    s = (s * 9301 + 49297) % 233280;
    out.push(s / 233280);
  }
  return out;
}

export const VerticalGlassBackground: React.FC<VerticalGlassBackgroundProps> = ({
  imageName,
  introDurationSeconds = 0,
  textColor = "#FFFFFF",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const eff = VERTICAL_GLASS_CONFIG.effects;
  const targetImage = imageName || VERTICAL_GLASS_CONFIG.defaultImage;

  const IMAGE_FADE_FRAMES = Math.min(fps * 1.2, introDurationSeconds * fps * 0.6);
  const imageOpacity =
    IMAGE_FADE_FRAMES > 0
      ? interpolate(frame, [0, IMAGE_FADE_FRAMES], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: (t) => t * (2 - t),
        })
      : 1;

  const particles = React.useMemo(() => {
    return Array.from({ length: eff.particleCount }, (_, i) => {
      const [r1, r2, r3, r4, r5, r6] = lcgSeq(i * 7 + 1, 6);
      const angle = r4 * Math.PI * 2;
      return {
        id: i,
        x: r1 * 1080,
        y: r2 * 1920,
        size: 2 + r3 * 4,
        vx: Math.cos(angle) * (0.25 + r5 * 0.45),
        vy: Math.sin(angle) * (0.25 + r5 * 0.45),
        opacity: 0.12 + r6 * 0.22,
        blur: r3 > 0.65 ? 1.5 : 0.4,
        wobbleAmp: 12 + r2 * 28,
        wobbleFreq: 0.018 + r1 * 0.022,
        wobblePhase: r6 * Math.PI * 2,
      };
    });
  }, [eff.particleCount]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000", overflow: "hidden" }}>
      <Img
        src={staticFile(`backgrounds/${targetImage}`)}
        style={{ width: "100%", height: "100%", objectFit: "cover", opacity: imageOpacity }}
      />

      {particles.map((p) => {
        const rawX = (p.x + p.vx * frame) % 1080;
        const rawY = (p.y + p.vy * frame) % 1920;
        const px = rawX < 0 ? rawX + 1080 : rawX;
        const py = rawY < 0 ? rawY + 1920 : rawY;
        const wobble = Math.sin(frame * p.wobbleFreq + p.wobblePhase) * p.wobbleAmp;
        const finalX = px + wobble * (p.vy / (Math.abs(p.vx) + Math.abs(p.vy) + 0.001));
        const finalY = py - wobble * (p.vx / (Math.abs(p.vx) + Math.abs(p.vy) + 0.001));

        return (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: `${finalX}px`,
              top: `${finalY}px`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: "50%",
              backgroundColor: textColor,
              opacity: p.opacity,
              filter: `blur(${p.blur}px)`,
              pointerEvents: "none",
              boxShadow: `0 0 ${p.size * 3}px ${p.size * 0.6}px ${textColor}, 0 0 ${p.size * 6}px ${textColor}`,
            }}
          />
        );
      })}

      <Img
        src="data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          opacity: eff.filmGrainOpacity,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />

      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0, 0, 0, ${eff.vignetteStrength}) 100%)`,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
