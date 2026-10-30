import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SunMedium, Volume2, ArrowDownRight, ArrowUpRight } from "lucide-react";

export interface IntroAnimationProps {
  introDurationSeconds: number;
  textColor?: "white" | "black";
}

export const IntroAnimation: React.FC<IntroAnimationProps> = ({
  introDurationSeconds,
  textColor = "white",
}) => {
  const isBlack = textColor === "black";
  const headerColor = isBlack ? "rgba(0,0,0,0.88)" : "rgba(255,255,255,0.88)";
  const headerShadow = isBlack
    ? "0 2px 16px rgba(255,255,255,0.55)"
    : "0 2px 16px rgba(0,0,0,0.6)";
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (introDurationSeconds <= 0) return null;

  const introFrames = introDurationSeconds * fps;

  if (frame >= introFrames) return null;

  const FADE_IN_END   = Math.min(18, introFrames * 0.2);
  const ANIMATE_START = FADE_IN_END;
  const ANIMATE_END   = Math.max(ANIMATE_START + 1, introFrames - 18);
  const FADE_OUT_START = ANIMATE_END;
  const FADE_OUT_END   = introFrames;

  const wrapperOpacity = (() => {
    if (frame <= FADE_IN_END) {
      return interpolate(frame, [0, FADE_IN_END], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
    }
    if (frame >= FADE_OUT_START) {
      return interpolate(frame, [FADE_OUT_START, FADE_OUT_END], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
    }
    return 1;
  })();

  const progress = interpolate(frame, [ANIMATE_START, ANIMATE_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  });

  const brightnessFill = 1 - progress * 0.82;
  const volumeFill = 0.15 + progress * 0.85;

  const BAR_WIDTH  = 130;
  const BAR_HEIGHT = 310;
  const BAR_RADIUS = 65;
  const GAP        = 60;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
        opacity: wrapperOpacity,
        pointerEvents: "none",
        zIndex: 100,
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: 52,
        }}
      >
        <div
          style={{
            fontFamily: "'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
            fontSize: "36px",
            fontWeight: 500,
            color: headerColor,
            letterSpacing: "0.01em",
            lineHeight: 1.55,
            textShadow: headerShadow,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "14px",
            marginBottom: "6px",
          }}
        >
          <span>Brightness down...</span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "12px",
              background: isBlack ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.12)",
              border: isBlack ? "1px solid rgba(0,0,0,0.10)" : "1px solid rgba(255,255,255,0.22)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
            }}
          >
            <SunMedium size={24} color="#FFD166" strokeWidth={2.4} />
            <ArrowDownRight size={22} color={headerColor} strokeWidth={2.6} />
          </span>
        </div>
        <div
          style={{
            fontFamily: "'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
            fontSize: "36px",
            fontWeight: 500,
            color: headerColor,
            letterSpacing: "0.01em",
            lineHeight: 1.55,
            textShadow: headerShadow,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "14px",
          }}
        >
          <span>Volume up...</span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "12px",
              background: isBlack ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.12)",
              border: isBlack ? "1px solid rgba(0,0,0,0.10)" : "1px solid rgba(255,255,255,0.22)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
            }}
          >
            <Volume2 size={24} color={headerColor} strokeWidth={2.4} />
            <ArrowUpRight size={22} color={isBlack ? "#0284C7" : "#38BDF8"} strokeWidth={2.6} />
          </span>
        </div>
      </div>

      <div style={{ display: "flex", gap: `${GAP}px`, alignItems: "flex-end" }}>
        <div
          style={{
            width: `${BAR_WIDTH}px`,
            height: `${BAR_HEIGHT}px`,
            borderRadius: `${BAR_RADIUS}px`,
            backgroundColor: "rgba(45, 45, 45, 0.92)",
            boxShadow:
              "0 8px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)",
            position: "relative",
            overflow: "hidden",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: `${brightnessFill * 100}%`,
              borderRadius: `${BAR_RADIUS}px`,
              background:
                "linear-gradient(to top, rgba(80,80,90,0.85), rgba(110,110,120,0.6))",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "22px",
              left: "50%",
              transform: "translateX(-50%)",
              opacity: 0.85,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              filter: "drop-shadow(0 0 8px rgba(255,220,100,0.5))",
            }}
          >
            <SunMedium size={36} color="#FFD166" strokeWidth={2.2} />
          </div>
        </div>

        <div
          style={{
            width: `${BAR_WIDTH}px`,
            height: `${BAR_HEIGHT}px`,
            borderRadius: `${BAR_RADIUS}px`,
            backgroundColor: isBlack
              ? "rgba(35, 35, 35, 0.92)"
              : "rgba(200, 200, 200, 0.15)",
            boxShadow: isBlack
              ? "0 8px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)"
              : "0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12)",
            position: "relative",
            overflow: "hidden",
            backdropFilter: "blur(12px)",
            border: isBlack
              ? "1px solid rgba(255,255,255,0.08)"
              : "1px solid rgba(255,255,255,0.18)",
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: `${volumeFill * 100}%`,
              borderRadius: `${BAR_RADIUS}px`,
              background: isBlack
                ? "linear-gradient(to top, rgba(220,220,220,0.95), rgba(180,190,200,0.80))"
                : "linear-gradient(to top, rgba(255,255,255,0.96), rgba(230,240,255,0.82))",
              boxShadow: isBlack
                ? "0 0 30px rgba(255,255,255,0.25)"
                : "0 0 30px rgba(255,255,255,0.35)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "22px",
              left: "50%",
              transform: "translateX(-50%)",
              opacity: 0.95,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              filter: isBlack
                ? "drop-shadow(0 2px 8px rgba(0,0,0,0.5))"
                : "drop-shadow(0 2px 10px rgba(0,0,0,0.4))",
            }}
          >
            <Volume2
              size={36}
              color={isBlack ? "#1A1A1A" : "#FFFFFF"}
              strokeWidth={2.2}
            />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
