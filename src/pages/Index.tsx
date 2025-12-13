import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { InputForm } from "@/components/InputForm";
import { PreviewCard } from "@/components/PreviewCard";
import { HistoryPanel } from "@/components/HistoryPanel";
import { BackgroundEffects } from "@/components/BackgroundEffects";
import { Loader } from "@/components/Loader";
import { UpgradeModal } from "@/components/UpgradeModal";
import { type TemplateType } from "@/components/TemplateSelector";
import { type TextPosition } from "@/components/TextOverlayControls";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface TextStyle {
  fontSize: number;
  color: string;
  shadowColor: string;
  shadowBlur: number;
}

interface HistoryItem {
  id: string;
  imageUrl: string;
  title: string;
  template: string;
  createdAt: Date;
}

const CREDITS_PER_GENERATION = 10;

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentTitle, setCurrentTitle] = useState("");
  const [currentTemplate, setCurrentTemplate] = useState<TemplateType>("cinematic");
  const [currentOverlayText, setCurrentOverlayText] = useState("");
  const [currentTextPosition, setCurrentTextPosition] = useState<TextPosition>("center");
  const [currentTextStyle, setCurrentTextStyle] = useState<TextStyle>({
    fontSize: 48,
    color: "#ffffff",
    shadowColor: "#000000",
    shadowBlur: 10,
  });
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<"insufficient_credits" | "upgrade">("upgrade");

  const { user, userStatus, refreshUserStatus } = useAuth();
  const navigate = useNavigate();

  const checkCredits = useCallback(() => {
    if (!user) {
      toast.error("Please sign in to generate thumbnails");
      navigate("/auth");
      return false;
    }

    if (!userStatus) {
      return false;
    }

    // If user has active plan, allow generation
    if (userStatus.hasActivePlan) {
      return true;
    }

    // Check if user has enough credits
    if (userStatus.credits < CREDITS_PER_GENERATION) {
      setUpgradeReason("insufficient_credits");
      setIsUpgradeModalOpen(true);
      return false;
    }

    return true;
  }, [user, userStatus, navigate]);

  const generateThumbnail = useCallback(async (
    text: string,
    template: TemplateType,
    overlayText: string,
    textPosition: TextPosition,
    textStyle: TextStyle
  ) => {
    // Check credits before generating
    if (!checkCredits()) {
      return;
    }

    setIsLoading(true);
    setCurrentTitle(text);
    setCurrentTemplate(template);
    setCurrentOverlayText(overlayText);
    setCurrentTextPosition(textPosition);
    setCurrentTextStyle(textStyle);

    try {
      // Deduct credits first
      if (user && userStatus && !userStatus.hasActivePlan) {
        const { data: deductResult, error: deductError } = await supabase.rpc(
          "deduct_credits",
          { _user_id: user.id, _amount: CREDITS_PER_GENERATION }
        );

        if (deductError || !deductResult) {
          toast.error("Failed to process credits. Please try again.");
          setIsLoading(false);
          return;
        }
      }

      console.log("Calling generate-thumbnail function...");
      
      const { data, error } = await supabase.functions.invoke("generate-thumbnail", {
        body: {
          textInput: text,
          template,
          overlayText,
          textPosition,
        },
      });

      if (error) {
        console.error("Function error:", error);
        throw new Error(error.message || "Failed to generate thumbnail");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.imageUrl) {
        throw new Error("No image was generated");
      }

      console.log("Thumbnail generated successfully!");
      setCurrentImage(data.imageUrl);

      // Refresh user status to update credits display
      await refreshUserStatus();

      // Add to history
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        imageUrl: data.imageUrl,
        title: text,
        template,
        createdAt: new Date(),
      };
      setHistory((prev) => [newItem, ...prev]);

      // Save to database
      if (user) {
        try {
          await supabase.from("thumbnails").insert([{
            user_id: user.id,
            text_input: text,
            image_url: data.imageUrl,
            template_used: template,
            overlay_text: overlayText || null,
            text_position: textPosition,
            text_style: JSON.parse(JSON.stringify(textStyle)),
            credits_used: CREDITS_PER_GENERATION,
          }]);
        } catch (dbError) {
          console.log("Could not save to database:", dbError);
        }
      }

      toast.success("Thumbnail generated successfully!");
    } catch (error) {
      console.error("Generation error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate thumbnail";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user, userStatus, checkCredits, refreshUserStatus]);

  const handleRegenerate = () => {
    if (currentTitle) {
      generateThumbnail(
        currentTitle,
        currentTemplate,
        currentOverlayText,
        currentTextPosition,
        currentTextStyle
      );
    }
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setCurrentImage(item.imageUrl);
    setCurrentTitle(item.title);
    setCurrentTemplate(item.template as TemplateType);
    setIsHistoryOpen(false);
  };

  const handleHistoryDelete = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    toast.success("Thumbnail removed from history");
  };

  const handleUpgradeClick = () => {
    setUpgradeReason("upgrade");
    setIsUpgradeModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <BackgroundEffects />
      <Navbar 
        onHistoryClick={() => setIsHistoryOpen(true)} 
        onUpgradeClick={handleUpgradeClick}
      />

      <main className="relative z-10 pt-32 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-muted-foreground">Powered by Lovable AI</span>
            </motion.div>

            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              <span className="text-foreground">Create Stunning</span>
              <br />
              <span className="gradient-text">Thumbnails in Seconds</span>
            </h1>

            <p className="text-base text-muted-foreground max-w-xl mx-auto">
              AI generates hyper-realistic backgrounds matching your exact description.
              Add custom text overlays for the perfect click-worthy thumbnail.
            </p>

            {/* Sign up prompt for non-logged in users */}
            {!user && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6"
              >
                <button
                  onClick={() => navigate("/auth")}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
                >
                  Get 50 Free Credits
                  <span className="text-xs opacity-80">→</span>
                </button>
              </motion.div>
            )}
          </motion.div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left: Input Form */}
            <div>
              <InputForm onGenerate={generateThumbnail} isLoading={isLoading} />
            </div>

            {/* Right: Preview */}
            <div>
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-strong rounded-2xl p-6"
                >
                  <Loader />
                </motion.div>
              ) : (
                <PreviewCard
                  imageUrl={currentImage}
                  title={currentTitle}
                  template={currentTemplate}
                  isLoading={isLoading}
                  onRegenerate={handleRegenerate}
                  overlayText={currentOverlayText}
                  textPosition={currentTextPosition}
                  textStyle={currentTextStyle}
                />
              )}

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-4 grid grid-cols-3 gap-3"
              >
                {[
                  { label: "Generated", value: history.length.toString() },
                  { label: "Templates", value: "5" },
                  { label: "Cost", value: "10 credits" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="glass rounded-xl p-3 text-center"
                  >
                    <p className="text-xl font-display font-bold gradient-text">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 grid md:grid-cols-4 gap-4"
          >
            {[
              {
                icon: "🎯",
                title: "100% Accurate",
                description: "AI matches your description precisely",
              },
              {
                icon: "✨",
                title: "Text Overlays",
                description: "Add custom text with shadows & colors",
              },
              {
                icon: "🎨",
                title: "5 Styles",
                description: "Minimal, Gaming, Tech, Cinematic, Custom",
              },
              {
                icon: "📥",
                title: "HD Download",
                description: "1280x720 optimized for YouTube",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="glass rounded-xl p-4 text-center group hover:bg-card/80 transition-colors"
              >
                <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-muted/50 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="font-display font-semibold text-sm text-foreground mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>

      {/* History Panel */}
      <HistoryPanel
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelect={handleHistorySelect}
        onDelete={handleHistoryDelete}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        reason={upgradeReason}
      />
    </div>
  );
};

export default Index;
