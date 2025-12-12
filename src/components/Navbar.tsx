import { motion } from "framer-motion";
import { Sparkles, History, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  onHistoryClick?: () => void;
}

export const Navbar = ({ onHistoryClick }: NavbarProps) => {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-4"
    >
      <div className="max-w-7xl mx-auto">
        <div className="glass rounded-2xl px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-foreground">
                ThumbGen
              </h1>
              <p className="text-xs text-muted-foreground">AI Thumbnail Generator</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onHistoryClick}
              className="text-muted-foreground hover:text-foreground"
            >
              <History className="w-4 h-4 mr-2" />
              History
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};
