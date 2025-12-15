import { motion } from "framer-motion";
import { Sparkles, History, Settings, LogIn, LogOut, User, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreditBadge } from "@/components/CreditBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  onHistoryClick?: () => void;
  onUpgradeClick?: () => void;
}

export const Navbar = ({ onHistoryClick, onUpgradeClick }: NavbarProps) => {
  const { user, userStatus, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

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
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg text-foreground">
                  ThumbGen
                </h1>
                <p className="text-xs text-muted-foreground">AI Thumbnail Generator</p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/pricing")}
              className="text-muted-foreground hover:text-foreground"
            >
              <Crown className="w-4 h-4 mr-2" />
              Pricing
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {/* Credit Badge - Only show for logged in users */}
            {user && userStatus && (
              <button onClick={onUpgradeClick} className="cursor-pointer">
                <CreditBadge />
              </button>
            )}

            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onHistoryClick}
                  className="text-muted-foreground hover:text-foreground hidden sm:flex"
                >
                  <History className="w-4 h-4 mr-2" />
                  History
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <User className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user.email}
                      </p>
                      {userStatus && (
                        <p className="text-xs text-muted-foreground">
                          {userStatus.hasActivePlan
                            ? `${userStatus.planType} plan`
                            : `${userStatus.credits} credits`}
                        </p>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                      <User className="w-4 h-4 mr-2" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onHistoryClick} className="sm:hidden">
                      <History className="w-4 h-4 mr-2" />
                      History
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onUpgradeClick}>
                      <Settings className="w-4 h-4 mr-2" />
                      Upgrade Plan
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate("/auth")}
                className="bg-gradient-to-r from-primary to-secondary text-primary-foreground"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};
