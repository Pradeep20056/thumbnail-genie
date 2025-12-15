import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Image as ImageIcon, Wand2, RotateCcw, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ImageUploadEditorProps {
  onImageReady?: (imageUrl: string) => void;
}

export const ImageUploadEditor = ({ onImageReady }: ImageUploadEditorProps) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancePrompt, setEnhancePrompt] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG, WebP)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedImage(result);
      setEnhancedImage(null);
      toast.success("Image uploaded successfully!");
    };
    reader.readAsDataURL(file);
  };

  const handleEnhance = async () => {
    if (!uploadedImage) {
      toast.error("Please upload an image first");
      return;
    }

    if (!user) {
      toast.error("Please sign in to enhance images");
      return;
    }

    setIsEnhancing(true);

    try {
      const { data, error } = await supabase.functions.invoke("enhance-image", {
        body: {
          imageData: uploadedImage,
          prompt: enhancePrompt || "Enhance this image for a YouTube thumbnail: improve lighting, increase sharpness, make colors more vibrant, and ensure professional quality suitable for thumbnails.",
        },
      });

      if (error) throw error;

      if (data?.enhancedImageUrl) {
        setEnhancedImage(data.enhancedImageUrl);
        toast.success("Image enhanced successfully!");
        onImageReady?.(data.enhancedImageUrl);
      } else {
        throw new Error("No enhanced image returned");
      }
    } catch (error) {
      console.error("Enhancement error:", error);
      toast.error("Failed to enhance image. Please try again.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleDownload = async () => {
    const imageToDownload = enhancedImage || uploadedImage;
    if (!imageToDownload) return;

    try {
      const link = document.createElement("a");
      link.href = imageToDownload;
      link.download = `thumbnail-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Image downloaded!");
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  const handleReset = () => {
    setUploadedImage(null);
    setEnhancedImage(null);
    setEnhancePrompt("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUseImage = () => {
    const imageToUse = enhancedImage || uploadedImage;
    if (imageToUse) {
      onImageReady?.(imageToUse);
      toast.success("Image ready to use!");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <ImageIcon className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-display font-bold text-lg text-foreground">Upload & Edit</h3>
          <p className="text-xs text-muted-foreground">Upload your image and enhance it with AI</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!uploadedImage ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50 hover:bg-muted/30"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileInput}
              className="hidden"
            />

            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                <Upload className={`w-8 h-8 ${dragActive ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="font-display font-semibold text-foreground mb-1">
                  {dragActive ? "Drop your image here" : "Upload your image"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Drag & drop or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Supports JPG, PNG, WebP (max 10MB)
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="editor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Image Preview */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
              <img
                src={enhancedImage || uploadedImage}
                alt="Uploaded"
                className="w-full h-full object-contain"
              />
              
              {/* Enhancement Overlay */}
              {isEnhancing && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-3" />
                    <p className="font-display font-semibold text-foreground">Enhancing...</p>
                    <p className="text-sm text-muted-foreground">AI is improving your image</p>
                  </div>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={handleReset}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Enhanced Badge */}
              {enhancedImage && (
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-semibold flex items-center gap-1">
                  <Wand2 className="w-3 h-3" />
                  Enhanced
                </div>
              )}
            </div>

            {/* Enhancement Prompt */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Enhancement Instructions (optional)
              </label>
              <Input
                value={enhancePrompt}
                onChange={(e) => setEnhancePrompt(e.target.value)}
                placeholder="e.g., Make it brighter, add warm tones, increase contrast..."
                className="bg-muted/50"
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleEnhance}
                disabled={isEnhancing}
                className="bg-gradient-to-r from-primary to-secondary text-primary-foreground"
              >
                {isEnhancing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enhancing...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Enhance with AI
                  </>
                )}
              </Button>

              <Button onClick={handleReset} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleDownload} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>

              <Button
                onClick={handleUseImage}
                variant="default"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Use as Thumbnail
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
