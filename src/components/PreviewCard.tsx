import { motion } from "framer-motion";
import { Download, RefreshCw, Share2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { type TextPosition } from "./TextOverlayControls";

interface TextStyle {
  fontSize: number;
  color: string;
  shadowColor: string;
  shadowBlur: number;
}

interface PreviewCardProps {
  imageUrl: string | null;
  title: string;
  template: string;
  isLoading: boolean;
  onRegenerate: () => void;
  overlayText?: string;
  textPosition?: TextPosition;
  textStyle?: TextStyle;
}

export const PreviewCard = ({
  imageUrl,
  title,
  template,
  isLoading,
  onRegenerate,
  overlayText = "",
  textPosition = "center",
  textStyle = { fontSize: 48, color: "#ffffff", shadowColor: "#000000", shadowBlur: 10 },
}: PreviewCardProps) => {
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getTextPositionStyle = (): string => {
    switch (textPosition) {
      case "top":
        return "items-start pt-8";
      case "bottom":
        return "items-end pb-8";
      default:
        return "items-center";
    }
  };

  const handleDownload = async () => {
    if (!imageUrl) return;
    
    try {
      // Create a canvas to composite the image with text
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      // Set thumbnail dimensions (YouTube optimal: 1280x720)
      canvas.width = 1280;
      canvas.height = 720;

      // Load and draw the background image
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      // Draw the background image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Add gradient overlay for text visibility
      const gradient = ctx.createLinearGradient(0, canvas.height * 0.5, 0, canvas.height);
      gradient.addColorStop(0, "rgba(0,0,0,0)");
      gradient.addColorStop(1, "rgba(0,0,0,0.6)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw text overlay if present
      if (overlayText) {
        ctx.font = `bold ${textStyle.fontSize * 2}px "Space Grotesk", sans-serif`;
        ctx.textAlign = "center";
        ctx.fillStyle = textStyle.color;
        ctx.shadowColor = textStyle.shadowColor;
        ctx.shadowBlur = textStyle.shadowBlur * 2;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;

        let yPos = canvas.height / 2;
        if (textPosition === "top") yPos = 120;
        if (textPosition === "bottom") yPos = canvas.height - 80;

        // Word wrap for long text
        const words = overlayText.split(" ");
        const lines: string[] = [];
        let currentLine = "";
        const maxWidth = canvas.width - 100;

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) lines.push(currentLine);

        const lineHeight = textStyle.fontSize * 2.5;
        const startY = yPos - ((lines.length - 1) * lineHeight) / 2;

        lines.forEach((line, i) => {
          ctx.fillText(line, canvas.width / 2, startY + i * lineHeight);
        });
      }

      // Download the composite image
      const dataUrl = canvas.toDataURL("image/png", 1.0);
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `thumbnail-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success("Thumbnail downloaded!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download image");
    }
  };

  const handleCopyUrl = async () => {
    if (!imageUrl) return;
    
    try {
      await navigator.clipboard.writeText(imageUrl);
      setCopied(true);
      toast.success("Image URL copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-strong rounded-2xl p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-semibold text-foreground">Preview</h3>
          <p className="text-sm text-muted-foreground capitalize">{template} style</p>
        </div>
        {imageUrl && (
          <div className="flex gap-2">
            <Button
              variant="glass"
              size="icon"
              onClick={handleCopyUrl}
              className="h-8 w-8"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="glass"
              size="icon"
              onClick={() => {}}
              className="h-8 w-8"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Preview Area */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-muted/50 border border-border/30">
        {imageUrl ? (
          <>
            <motion.img
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            
            {/* Text overlay */}
            {overlayText && (
              <div className={`absolute inset-0 flex justify-center px-4 ${getTextPositionStyle()}`}>
                <p
                  className="font-display font-bold text-center max-w-[90%] leading-tight"
                  style={{
                    fontSize: `${textStyle.fontSize / 2}px`,
                    color: textStyle.color,
                    textShadow: `${textStyle.shadowBlur / 2}px ${textStyle.shadowBlur / 2}px ${textStyle.shadowBlur}px ${textStyle.shadowColor}`,
                  }}
                >
                  {overlayText}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-xl bg-muted/50 flex items-center justify-center">
                <span className="text-3xl">🖼️</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your thumbnail will appear here
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Title Preview */}
      {title && (
        <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
          <p className="text-xs text-muted-foreground mb-1">Topic</p>
          <p className="text-sm font-medium text-foreground line-clamp-2">{title}</p>
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="glass"
          onClick={onRegenerate}
          disabled={isLoading}
          className="w-full"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Regenerate
        </Button>
        <Button
          variant="gradient"
          onClick={handleDownload}
          disabled={!imageUrl || isLoading}
          className="w-full"
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>
    </motion.div>
  );
};
