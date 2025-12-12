import { motion } from "framer-motion";
import { Palette, Gamepad2, Monitor, Film, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type TemplateType = "minimal" | "gaming" | "tech" | "cinematic" | "custom";

interface Template {
  id: TemplateType;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  description: string;
}

const templates: Template[] = [
  {
    id: "minimal",
    name: "Minimal",
    icon: Palette,
    gradient: "from-slate-400 to-slate-600",
    description: "Clean & modern",
  },
  {
    id: "gaming",
    name: "Gaming",
    icon: Gamepad2,
    gradient: "from-purple-500 to-pink-500",
    description: "Bold & vibrant",
  },
  {
    id: "tech",
    name: "Tech",
    icon: Monitor,
    gradient: "from-cyan-400 to-blue-500",
    description: "Futuristic",
  },
  {
    id: "cinematic",
    name: "Cinematic",
    icon: Film,
    gradient: "from-amber-500 to-orange-600",
    description: "Dramatic",
  },
  {
    id: "custom",
    name: "Custom",
    icon: Wand2,
    gradient: "from-primary to-secondary",
    description: "AI decides",
  },
];

interface TemplateSelectorProps {
  selected: TemplateType;
  onSelect: (template: TemplateType) => void;
}

export const TemplateSelector = ({ selected, onSelect }: TemplateSelectorProps) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-muted-foreground">
        Choose Style
      </label>
      <div className="grid grid-cols-5 gap-3">
        {templates.map((template, index) => {
          const Icon = template.icon;
          const isSelected = selected === template.id;
          
          return (
            <motion.button
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelect(template.id)}
              className={cn(
                "relative group flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300",
                isSelected
                  ? "glass-strong gradient-border"
                  : "glass hover:bg-card/80"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                  template.gradient
                )}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-center">
                <p className={cn(
                  "text-sm font-medium transition-colors",
                  isSelected ? "text-foreground" : "text-muted-foreground"
                )}>
                  {template.name}
                </p>
                <p className="text-xs text-muted-foreground/70 hidden sm:block">
                  {template.description}
                </p>
              </div>
              
              {isSelected && (
                <motion.div
                  layoutId="template-indicator"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-gradient-to-r from-primary to-secondary"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
