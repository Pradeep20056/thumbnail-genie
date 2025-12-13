import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Zap, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: "insufficient_credits" | "upgrade";
}

const plans = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    period: "one-time",
    credits: "50 credits",
    features: [
      "50 one-time credits",
      "5 thumbnail generations",
      "All templates",
      "HD downloads",
      "Text overlays",
    ],
    cta: "Current Plan",
    disabled: true,
    icon: Sparkles,
  },
  {
    id: "weekly",
    name: "Weekly",
    price: "₹30",
    period: "per week",
    credits: "Unlimited",
    features: [
      "Unlimited generations",
      "All templates",
      "HD downloads",
      "Text overlays",
      "Priority support",
    ],
    cta: "Upgrade to Weekly",
    popular: true,
    icon: Zap,
  },
  {
    id: "monthly",
    name: "Monthly",
    price: "₹100",
    period: "per month",
    credits: "Unlimited",
    features: [
      "Unlimited generations",
      "All templates",
      "HD downloads",
      "Text overlays",
      "Priority support",
      "Early access to new features",
    ],
    cta: "Upgrade to Monthly",
    icon: Crown,
  },
];

export const UpgradeModal = ({ isOpen, onClose, reason }: UpgradeModalProps) => {
  const { userStatus } = useAuth();

  const handleUpgrade = (planId: string) => {
    // This will be implemented with Stripe in the next phase
    console.log("Upgrading to:", planId);
    // TODO: Implement Stripe checkout
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-4xl z-50 max-h-[80vh] overflow-y-auto"
          >
            <div className="glass-strong rounded-2xl p-6 md:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    {reason === "insufficient_credits"
                      ? "You're out of credits!"
                      : "Upgrade Your Plan"}
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    {reason === "insufficient_credits"
                      ? "Get unlimited generations with a premium plan"
                      : "Unlock unlimited thumbnail generations"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Current Credits */}
              {userStatus && !userStatus.hasActivePlan && (
                <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-center">
                    <span className="text-destructive font-semibold">
                      {userStatus.credits} credits remaining
                    </span>
                    <span className="text-muted-foreground ml-2">
                      (10 credits per generation)
                    </span>
                  </p>
                </div>
              )}

              {/* Plans Grid */}
              <div className="grid md:grid-cols-3 gap-4">
                {plans.map((plan) => {
                  const Icon = plan.icon;
                  const isCurrentPlan =
                    userStatus?.planType === plan.id ||
                    (plan.id === "free" && !userStatus?.hasActivePlan);

                  return (
                    <motion.div
                      key={plan.id}
                      whileHover={{ y: -4 }}
                      className={`relative rounded-xl p-6 ${
                        plan.popular
                          ? "gradient-border bg-card"
                          : "glass border border-border/50"
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                            Most Popular
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mb-4">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            plan.popular
                              ? "bg-gradient-to-br from-primary to-secondary"
                              : "bg-muted"
                          }`}
                        >
                          <Icon
                            className={`w-5 h-5 ${
                              plan.popular
                                ? "text-primary-foreground"
                                : "text-foreground"
                            }`}
                          />
                        </div>
                        <h3 className="font-display font-semibold text-lg text-foreground">
                          {plan.name}
                        </h3>
                      </div>

                      <div className="mb-4">
                        <span className="font-display text-3xl font-bold text-foreground">
                          {plan.price}
                        </span>
                        <span className="text-muted-foreground ml-1">
                          /{plan.period}
                        </span>
                      </div>

                      <p className="text-sm font-medium text-primary mb-4">
                        {plan.credits}
                      </p>

                      <ul className="space-y-2 mb-6">
                        {plan.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-center gap-2 text-sm text-muted-foreground"
                          >
                            <Check className="w-4 h-4 text-primary flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <Button
                        className={`w-full ${
                          plan.popular
                            ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                            : ""
                        }`}
                        variant={plan.popular ? "default" : "outline"}
                        disabled={plan.disabled || isCurrentPlan}
                        onClick={() => handleUpgrade(plan.id)}
                      >
                        {isCurrentPlan ? "Current Plan" : plan.cta}
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
