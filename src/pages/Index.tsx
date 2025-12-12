import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { InputForm } from "@/components/InputForm";
import { PreviewCard } from "@/components/PreviewCard";
import { HistoryPanel } from "@/components/HistoryPanel";
import { BackgroundEffects } from "@/components/BackgroundEffects";
import { Loader } from "@/components/Loader";
import { type TemplateType } from "@/components/TemplateSelector";
import { toast } from "sonner";

interface HistoryItem {
  id: string;
  imageUrl: string;
  title: string;
  template: string;
  createdAt: Date;
}

// Sample thumbnails for demo (these will be replaced with AI-generated ones when backend is connected)
const sampleImages = [
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1280&h=720&fit=crop",
  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1280&h=720&fit=crop",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1280&h=720&fit=crop",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1280&h=720&fit=crop",
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1280&h=720&fit=crop",
];

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentTitle, setCurrentTitle] = useState("");
  const [currentTemplate, setCurrentTemplate] = useState<TemplateType>("cinematic");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const generateThumbnail = useCallback(async (text: string, template: TemplateType) => {
    setIsLoading(true);
    setCurrentTitle(text);
    setCurrentTemplate(template);

    // Simulate AI generation delay
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // For demo, use sample images (replace with actual AI call when backend is ready)
    const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];
    
    setCurrentImage(randomImage);
    setIsLoading(false);

    // Add to history
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      imageUrl: randomImage,
      title: text,
      template,
      createdAt: new Date(),
    };
    setHistory((prev) => [newItem, ...prev]);
    
    toast.success("Thumbnail generated successfully!");
  }, []);

  const handleRegenerate = () => {
    if (currentTitle) {
      generateThumbnail(currentTitle, currentTemplate);
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

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <BackgroundEffects />
      <Navbar onHistoryClick={() => setIsHistoryOpen(true)} />

      <main className="relative z-10 pt-32 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-muted-foreground">Powered by AI</span>
            </motion.div>
            
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-4">
              <span className="text-foreground">Create Stunning</span>
              <br />
              <span className="gradient-text">Thumbnails in Seconds</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transform your video titles into eye-catching thumbnails with AI-powered 
              generation. Choose from cinematic, gaming, tech, and more styles.
            </p>
          </motion.div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Input Form */}
            <div>
              <InputForm onGenerate={generateThumbnail} isLoading={isLoading} />
              
              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-6 grid grid-cols-3 gap-4"
              >
                {[
                  { label: "Generated", value: history.length.toString() },
                  { label: "Templates", value: "5" },
                  { label: "Avg Time", value: "3s" },
                ].map((stat, index) => (
                  <div
                    key={stat.label}
                    className="glass rounded-xl p-4 text-center"
                  >
                    <p className="text-2xl font-display font-bold gradient-text">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
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
                />
              )}
            </div>
          </div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-20 grid md:grid-cols-3 gap-6"
          >
            {[
              {
                icon: "🎨",
                title: "Multiple Styles",
                description: "Choose from minimal, gaming, tech, cinematic, or let AI decide",
              },
              {
                icon: "⚡",
                title: "Instant Generation",
                description: "Get professional thumbnails in just a few seconds",
              },
              {
                icon: "📥",
                title: "Easy Download",
                description: "Download in high resolution, ready for YouTube and more",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="glass rounded-2xl p-6 text-center group hover:bg-card/80 transition-colors"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-muted/50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
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
    </div>
  );
};

export default Index;
