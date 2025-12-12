import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HistoryItem {
  id: string;
  imageUrl: string;
  title: string;
  template: string;
  createdAt: Date;
}

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
}

export const HistoryPanel = ({
  isOpen,
  onClose,
  history,
  onSelect,
  onDelete,
}: HistoryPanelProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 glass-strong border-l border-border"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div>
                  <h2 className="font-display font-bold text-lg text-foreground">
                    Generation History
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {history.length} thumbnail{history.length !== 1 ? "s" : ""} generated
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Content */}
              <ScrollArea className="flex-1 p-4">
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                      <Clock className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No thumbnails yet</p>
                    <p className="text-sm text-muted-foreground/70">
                      Generate your first thumbnail!
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {history.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group glass rounded-xl overflow-hidden cursor-pointer hover:bg-card/80 transition-colors"
                        onClick={() => onSelect(item)}
                      >
                        <div className="aspect-video relative">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          
                          {/* Hover actions */}
                          <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="glass"
                              size="icon"
                              className="h-8 w-8 bg-black/50"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Download logic
                              }}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="glass"
                              size="icon"
                              className="h-8 w-8 bg-black/50 hover:bg-destructive/80"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(item.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="p-3">
                          <p className="text-sm font-medium text-foreground line-clamp-1">
                            {item.title}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-muted-foreground capitalize">
                              {item.template}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {item.createdAt.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
