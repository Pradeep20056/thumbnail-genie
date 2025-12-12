import { motion } from "framer-motion";
import { Download, RefreshCw, Share2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface PreviewCardProps {
  imageUrl: string | null;
  title: string;
  template: string;
  isLoading: boolean;
  onRegenerate: () => void;
}

export const PreviewCard = ({
  imageUrl,
  title,
  template,
  isLoading,
  onRegenerate,
}: PreviewCardProps) => {
  const [copied, setCopied] = useState(false);

  const handleDownload = async () => {
    if (!imageUrl) return;
    
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `thumbnail-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Thumbnail downloaded!");
    } catch {
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
          <motion.img
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
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

        {/* Overlay gradient for title visibility */}
        {imageUrl && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        )}
      </div>

      {/* Title Preview */}
      {title && (
        <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
          <p className="text-xs text-muted-foreground mb-1">Title</p>
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
