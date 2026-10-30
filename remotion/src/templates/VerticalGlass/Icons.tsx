import React from "react";
import {
  Shuffle,
  SkipBack,
  SkipForward,
  Pause,
  Heart,
} from "lucide-react";

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  strokeWidth?: number;
}

export const ShuffleIcon: React.FC<IconProps> = ({
  size = 26,
  color = "currentColor",
  strokeWidth = 2.0,
  style,
}) => (
  <Shuffle
    size={size}
    color={color}
    strokeWidth={strokeWidth}
    style={{ display: "block", flexShrink: 0, ...style }}
  />
);

export const PrevIcon: React.FC<IconProps> = ({
  size = 28,
  color = "currentColor",
  strokeWidth = 2.2,
  style,
}) => (
  <SkipBack
    size={size}
    color={color}
    strokeWidth={strokeWidth}
    style={{ display: "block", flexShrink: 0, ...style }}
  />
);

export const NextIcon: React.FC<IconProps> = ({
  size = 28,
  color = "currentColor",
  strokeWidth = 2.2,
  style,
}) => (
  <SkipForward
    size={size}
    color={color}
    strokeWidth={strokeWidth}
    style={{ display: "block", flexShrink: 0, ...style }}
  />
);

export const PauseIcon: React.FC<IconProps> = ({
  size = 34,
  color = "currentColor",
  strokeWidth = 2.5,
  style,
}) => (
  <Pause
    size={size}
    color={color}
    strokeWidth={strokeWidth}
    style={{ display: "block", flexShrink: 0, ...style }}
  />
);

export const HeartIcon: React.FC<IconProps> = ({
  size = 26,
  color = "currentColor",
  strokeWidth = 2.0,
  style,
}) => (
  <Heart
    size={size}
    color={color}
    strokeWidth={strokeWidth}
    style={{ display: "block", flexShrink: 0, ...style }}
  />
);
