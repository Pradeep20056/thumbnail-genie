import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TemplateSelector, type TemplateType } from "./TemplateSelector";

interface InputFormProps {
  onGenerate: (text: string, template: TemplateType) => void;
  isLoading: boolean;
}

export const InputForm = ({ onGenerate, isLoading }: InputFormProps) => {
  const [text, setText] = useState("");
  const [template, setTemplate] = useState<TemplateType>("cinematic");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onGenerate(text.trim(), template);
    }
  };

  const placeholders = [
    "10 AI Tools That Will Change Your Life in 2025",
    "I Built a $1M App in 30 Days",
    "The Dark Truth About Social Media",
    "Ultimate Guide to Productivity",
  ];

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="glass-strong rounded-2xl p-6 space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-primary" />
            Video Title or Description
          </label>
          <div className="relative">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={placeholders[Math.floor(Math.random() * placeholders.length)]}
              className="min-h-[120px] bg-muted/50 border-border/50 rounded-xl resize-none text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-primary/20"
              disabled={isLoading}
            />
            <div className="absolute bottom-3 right-3 text-xs text-muted-foreground/50">
              {text.length}/200
            </div>
          </div>
        </div>

        <TemplateSelector selected={template} onSelect={setTemplate} />

        <Button
          type="submit"
          variant="gradient"
          size="xl"
          className="w-full"
          disabled={!text.trim() || isLoading}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Thumbnail
            </>
          )}
        </Button>
      </div>
    </motion.form>
  );
};
