import React from "react";
import { Shuffle, MoreHorizontal, Music2, Heart } from "lucide-react";

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
  strokeWidth = 2.2,
  style,
}) => (
  <Shuffle
    size={size}
    color={color}
    strokeWidth={strokeWidth}
    style={{ display: "block", flexShrink: 0, ...style }}
  />
);

export const MoreHorizontalIcon: React.FC<IconProps> = ({
  size = 28,
  color = "currentColor",
  strokeWidth = 2.2,
  style,
}) => (
  <MoreHorizontal
    size={size}
    color={color}
    strokeWidth={strokeWidth}
    style={{ display: "block", flexShrink: 0, ...style }}
  />
);

export const MusicNoteIcon: React.FC<IconProps> = ({
  size = 40,
  color = "currentColor",
  strokeWidth = 2.2,
  style,
}) => (
  <Music2
    size={size}
    color={color}
    strokeWidth={strokeWidth}
    style={{ display: "block", flexShrink: 0, ...style }}
  />
);

export const FavoriteHeartIcon: React.FC<IconProps> = ({
  size = 38,
  color = "currentColor",
  strokeWidth = 2.2,
  style,
}) => (
  <Heart
    size={size}
    color={color}
    strokeWidth={strokeWidth}
    style={{ display: "block", flexShrink: 0, ...style }}
  />
);
