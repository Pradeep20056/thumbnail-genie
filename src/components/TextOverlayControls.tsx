import { motion } from "framer-motion";
import { useState } from "react";
import { Type, AlignLeft, AlignCenter, AlignRight, Palette } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

export type TextPosition = "top" | "center" | "bottom";

interface TextStyle {
  fontSize: number;
  color: string;
  shadowColor: string;
  shadowBlur: number;
}

interface TextOverlayControlsProps {
  overlayText: string;
  setOverlayText: (text: string) => void;
  textPosition: TextPosition;
  setTextPosition: (position: TextPosition) => void;
  textStyle: TextStyle;
  setTextStyle: (style: TextStyle) => void;
}

const colorPresets = [
  { name: "White", value: "#ffffff" },
  { name: "Yellow", value: "#fbbf24" },
  { name: "Cyan", value: "#22d3ee" },
  { name: "Red", value: "#ef4444" },
  { name: "Green", value: "#22c55e" },
  { name: "Purple", value: "#a855f7" },
];

export const TextOverlayControls = ({
  overlayText,
  setOverlayText,
  textPosition,
  setTextPosition,
  textStyle,
  setTextStyle,
}: TextOverlayControlsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-4 space-y-4"
    >
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Type className="w-4 h-4 text-primary" />
        Text Overlay (Optional)
      </div>

      {/* Text Input */}
      <Input
        value={overlayText}
        onChange={(e) => setOverlayText(e.target.value)}
        placeholder="Add text to your thumbnail..."
        className="bg-muted/50"
      />

      {/* Position Controls */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Position</label>
        <div className="flex gap-2">
          {[
            { id: "top", icon: AlignLeft, label: "Top" },
            { id: "center", icon: AlignCenter, label: "Center" },
            { id: "bottom", icon: AlignRight, label: "Bottom" },
          ].map((pos) => (
            <Button
              key={pos.id}
              variant={textPosition === pos.id ? "default" : "glass"}
              size="sm"
              onClick={() => setTextPosition(pos.id as TextPosition)}
              className="flex-1"
            >
              {pos.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Font Size</span>
          <span>{textStyle.fontSize}px</span>
        </div>
        <Slider
          value={[textStyle.fontSize]}
          onValueChange={([value]) => setTextStyle({ ...textStyle, fontSize: value })}
          min={24}
          max={120}
          step={4}
          className="w-full"
        />
      </div>

      {/* Color Presets */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground flex items-center gap-1">
          <Palette className="w-3 h-3" />
          Text Color
        </label>
        <div className="flex gap-2 flex-wrap">
          {colorPresets.map((color) => (
            <button
              key={color.value}
              onClick={() => setTextStyle({ ...textStyle, color: color.value })}
              className={cn(
                "w-8 h-8 rounded-lg border-2 transition-all",
                textStyle.color === color.value
                  ? "border-primary scale-110"
                  : "border-transparent hover:scale-105"
              )}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Shadow Controls */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Shadow Intensity</span>
          <span>{textStyle.shadowBlur}px</span>
        </div>
        <Slider
          value={[textStyle.shadowBlur]}
          onValueChange={([value]) => setTextStyle({ ...textStyle, shadowBlur: value })}
          min={0}
          max={30}
          step={2}
          className="w-full"
        />
      </div>
    </motion.div>
  );
};
