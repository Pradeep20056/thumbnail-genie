import { motion } from "framer-motion";

export const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12">
      {/* Animated orbs */}
      <div className="relative w-32 h-32">
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-secondary opacity-20 blur-2xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full bg-gradient-to-r from-primary to-secondary"
            style={{
              marginLeft: -8,
              marginTop: -8,
            }}
            animate={{
              x: [0, 30, 0, -30, 0],
              y: [-30, 0, 30, 0, -30],
              scale: [1, 1.2, 1, 0.8, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: index * 0.3,
              ease: "easeInOut",
            }}
          />
        ))}

        <motion.div
          className="absolute inset-4 border-2 border-primary/30 rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        
        <motion.div
          className="absolute inset-8 border-2 border-secondary/30 rounded-full"
          animate={{ rotate: -360 }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Loading text */}
      <div className="text-center space-y-2">
        <motion.p
          className="text-lg font-display font-semibold gradient-text"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Generating your thumbnail
        </motion.p>
        <p className="text-sm text-muted-foreground">
          AI is crafting the perfect visual...
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2">
        {[0, 1, 2, 3, 4].map((index) => (
          <motion.div
            key={index}
            className="w-2 h-2 rounded-full bg-primary/50"
            animate={{
              backgroundColor: [
                "hsl(187 100% 50% / 0.3)",
                "hsl(187 100% 50% / 1)",
                "hsl(187 100% 50% / 0.3)",
              ],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: index * 0.15,
            }}
          />
        ))}
      </div>
    </div>
  );
};
