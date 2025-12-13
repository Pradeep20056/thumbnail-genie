import { motion } from "framer-motion";
import { Coins, Crown, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface CreditBadgeProps {
  className?: string;
  showLabel?: boolean;
}

export const CreditBadge = ({ className, showLabel = true }: CreditBadgeProps) => {
  const { userStatus, loading } = useAuth();

  if (loading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="w-16 h-6 bg-muted/50 rounded-full animate-pulse" />
      </div>
    );
  }

  if (!userStatus) {
    return null;
  }

  const isPaidPlan = userStatus.hasActivePlan;
  const planIcon = isPaidPlan ? Crown : Coins;
  const PlanIcon = planIcon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full",
        isPaidPlan
          ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30"
          : "bg-muted/50 border border-border/50",
        className
      )}
    >
      <PlanIcon
        className={cn(
          "w-4 h-4",
          isPaidPlan ? "text-amber-400" : "text-primary"
        )}
      />
      {isPaidPlan ? (
        <span className="text-sm font-medium text-amber-400">
          {userStatus.planType === "weekly" ? "Weekly" : "Monthly"} Plan
        </span>
      ) : (
        <span className="text-sm font-medium text-foreground">
          {userStatus.credits}
          {showLabel && <span className="text-muted-foreground ml-1">credits</span>}
        </span>
      )}
    </motion.div>
  );
};
