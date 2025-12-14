import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Zap, Crown, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: "insufficient_credits" | "upgrade";
}

declare global {
  interface Window {
    Razorpay: any;
  }
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
  const { userStatus, refreshUserStatus } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async (planId: string) => {
    if (planId === "free") return;

    setLoadingPlan(planId);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load payment gateway");
      }

      const { data: orderData, error: orderError } = await supabase.functions.invoke(
        "create-razorpay-order",
        { body: { plan_type: planId } }
      );

      if (orderError || !orderData) {
        throw new Error(orderError?.message || "Failed to create order");
      }

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ThumbCraft AI",
        description: `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan Subscription`,
        order_id: orderData.order_id,
        handler: async (response: any) => {
          try {
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
              "verify-razorpay-payment",
              {
                body: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  plan_type: planId,
                },
              }
            );

            if (verifyError || !verifyData?.success) {
              throw new Error(verifyError?.message || "Payment verification failed");
            }

            await refreshUserStatus();
            toast.success("Payment successful! Your plan has been upgraded.");
            onClose();
          } catch (error: any) {
            console.error("Payment verification error:", error);
            toast.error(error.message || "Payment verification failed");
          }
        },
        prefill: {},
        theme: {
          color: "#7c3aed",
        },
        modal: {
          ondismiss: () => {
            setLoadingPlan(null);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Failed to initiate payment");
    } finally {
      setLoadingPlan(null);
    }
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
                  const isLoading = loadingPlan === plan.id;

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
                        disabled={plan.disabled || isCurrentPlan || isLoading}
                        onClick={() => handleUpgrade(plan.id)}
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isCurrentPlan ? (
                          "Current Plan"
                        ) : (
                          plan.cta
                        )}
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
