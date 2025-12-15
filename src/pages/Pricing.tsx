import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { BackgroundEffects } from "@/components/BackgroundEffects";
import { UpgradeModal } from "@/components/UpgradeModal";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  icon: React.ReactNode;
  features: PlanFeature[];
  popular?: boolean;
  buttonText: string;
  planType: "free" | "weekly" | "monthly";
}

const plans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Perfect for trying out ThumbGen",
    icon: <Sparkles className="w-6 h-6" />,
    planType: "free",
    buttonText: "Get Started",
    features: [
      { text: "50 one-time credits", included: true },
      { text: "All 5 template styles", included: true },
      { text: "Text overlays", included: true },
      { text: "HD downloads (1280x720)", included: true },
      { text: "Upload & edit images", included: true },
      { text: "Priority generation", included: false },
      { text: "Unlimited generations", included: false },
    ],
  },
  {
    id: "weekly",
    name: "Weekly",
    price: "₹30",
    period: "per week",
    description: "Great for short-term projects",
    icon: <Zap className="w-6 h-6" />,
    planType: "weekly",
    buttonText: "Subscribe Weekly",
    features: [
      { text: "Unlimited generations", included: true },
      { text: "All 5 template styles", included: true },
      { text: "Text overlays", included: true },
      { text: "HD downloads (1280x720)", included: true },
      { text: "Upload & edit images", included: true },
      { text: "Priority generation", included: true },
      { text: "7 days access", included: true },
    ],
  },
  {
    id: "monthly",
    name: "Monthly",
    price: "₹100",
    period: "per month",
    description: "Best value for creators",
    icon: <Crown className="w-6 h-6" />,
    planType: "monthly",
    buttonText: "Subscribe Monthly",
    popular: true,
    features: [
      { text: "Unlimited generations", included: true },
      { text: "All 5 template styles", included: true },
      { text: "Text overlays", included: true },
      { text: "HD downloads (1280x720)", included: true },
      { text: "Upload & edit images", included: true },
      { text: "Priority generation", included: true },
      { text: "30 days access", included: true },
    ],
  },
];

const comparisonFeatures = [
  { name: "Template Styles", free: "5", weekly: "5", monthly: "5" },
  { name: "Text Overlays", free: "✓", weekly: "✓", monthly: "✓" },
  { name: "HD Downloads", free: "✓", weekly: "✓", monthly: "✓" },
  { name: "Image Upload & Edit", free: "✓", weekly: "✓", monthly: "✓" },
  { name: "Credits", free: "50 one-time", weekly: "Unlimited", monthly: "Unlimited" },
  { name: "Priority Queue", free: "✗", weekly: "✓", monthly: "✓" },
  { name: "Cost per Thumbnail", free: "10 credits", weekly: "₹0", monthly: "₹0" },
  { name: "Validity", free: "Forever", weekly: "7 days", monthly: "30 days" },
];

const Pricing = () => {
  const { user, userStatus } = useAuth();
  const navigate = useNavigate();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"weekly" | "monthly">("monthly");

  const handlePlanSelect = (plan: PricingPlan) => {
    if (plan.planType === "free") {
      if (!user) {
        navigate("/auth");
      } else {
        navigate("/");
      }
      return;
    }

    if (!user) {
      navigate("/auth");
      return;
    }

    setSelectedPlan(plan.planType as "weekly" | "monthly");
    setIsUpgradeModalOpen(true);
  };

  const isCurrentPlan = (planType: string) => {
    if (!userStatus) return false;
    if (planType === "free" && !userStatus.hasActivePlan) return true;
    if (userStatus.hasActivePlan && userStatus.planType === planType) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <BackgroundEffects />
      <Navbar />

      <main className="relative z-10 pt-32 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
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
              <Crown className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Simple, transparent pricing</span>
            </motion.div>

            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              <span className="text-foreground">Choose Your</span>
              <br />
              <span className="gradient-text">Perfect Plan</span>
            </h1>

            <p className="text-base text-muted-foreground max-w-xl mx-auto">
              Start free with 50 credits or unlock unlimited generations with our affordable subscription plans.
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className={`relative glass-strong rounded-2xl p-6 ${
                  plan.popular ? "ring-2 ring-primary" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground text-xs font-semibold">
                    Most Popular
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    plan.popular 
                      ? "bg-gradient-to-br from-primary to-secondary text-primary-foreground" 
                      : "bg-muted text-foreground"
                  }`}>
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-foreground">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground">{plan.description}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <span className="font-display text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground text-sm ml-1">/{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        feature.included 
                          ? "bg-primary/20 text-primary" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {feature.included ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <span className="text-xs">✗</span>
                        )}
                      </div>
                      <span className={`text-sm ${
                        feature.included ? "text-foreground" : "text-muted-foreground line-through"
                      }`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handlePlanSelect(plan)}
                  disabled={isCurrentPlan(plan.planType)}
                  className={`w-full ${
                    plan.popular
                      ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90"
                      : ""
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {isCurrentPlan(plan.planType) ? "Current Plan" : plan.buttonText}
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-strong rounded-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-border">
              <h2 className="font-display text-2xl font-bold text-foreground">
                Feature Comparison
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Compare all features across plans
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-display font-semibold text-foreground">Feature</th>
                    <th className="text-center p-4 font-display font-semibold text-foreground">Free</th>
                    <th className="text-center p-4 font-display font-semibold text-foreground">Weekly</th>
                    <th className="text-center p-4 font-display font-semibold text-primary">Monthly</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, index) => (
                    <tr key={feature.name} className={index % 2 === 0 ? "bg-muted/20" : ""}>
                      <td className="p-4 text-sm text-foreground">{feature.name}</td>
                      <td className="p-4 text-center text-sm text-muted-foreground">{feature.free}</td>
                      <td className="p-4 text-center text-sm text-muted-foreground">{feature.weekly}</td>
                      <td className="p-4 text-center text-sm text-primary font-medium">{feature.monthly}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 text-center"
          >
            <h2 className="font-display text-2xl font-bold text-foreground mb-8">
              Frequently Asked Questions
            </h2>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              {[
                {
                  q: "What happens when I run out of credits?",
                  a: "You can upgrade to a weekly or monthly plan for unlimited generations, or wait until you earn more credits.",
                },
                {
                  q: "Can I cancel my subscription?",
                  a: "Yes, you can cancel anytime. Your plan remains active until the end of the billing period.",
                },
                {
                  q: "What payment methods do you accept?",
                  a: "We accept all major payment methods through Razorpay including UPI, cards, and net banking.",
                },
                {
                  q: "Is there a refund policy?",
                  a: "We offer a full refund within 24 hours of purchase if you're not satisfied.",
                },
              ].map((faq, index) => (
                <div key={index} className="glass rounded-xl p-4">
                  <h3 className="font-display font-semibold text-foreground mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        reason="upgrade"
      />
    </div>
  );
};

export default Pricing;
