import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  CreditCard, 
  Image, 
  Crown, 
  Calendar, 
  ArrowLeft,
  Download,
  Trash2,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { BackgroundEffects } from "@/components/BackgroundEffects";
import { format } from "date-fns";
import { toast } from "sonner";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  plan_type: string;
  payment_status: string;
  created_at: string;
}

interface Thumbnail {
  id: string;
  text_input: string;
  image_url: string | null;
  template_used: string;
  overlay_text: string | null;
  created_at: string;
  credits_used: number | null;
}

export default function Dashboard() {
  const { user, userStatus, loading } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch payments
        const { data: paymentsData, error: paymentsError } = await supabase
          .from("payments")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);

        if (paymentsError) throw paymentsError;
        setPayments(paymentsData || []);

        // Fetch thumbnails
        const { data: thumbnailsData, error: thumbnailsError } = await supabase
          .from("thumbnails")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20);

        if (thumbnailsError) throw thumbnailsError;
        setThumbnails(thumbnailsData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoadingData(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleDeleteThumbnail = async (id: string) => {
    try {
      const { error } = await supabase
        .from("thumbnails")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setThumbnails((prev) => prev.filter((t) => t.id !== id));
      toast.success("Thumbnail deleted");
    } catch (error) {
      console.error("Error deleting thumbnail:", error);
      toast.error("Failed to delete thumbnail");
    }
  };

  const handleDownload = async (imageUrl: string, title: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.substring(0, 30)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const getPlanBadgeVariant = (planType: string) => {
    switch (planType) {
      case "monthly":
        return "default";
      case "weekly":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "pending":
        return "secondary";
      default:
        return "destructive";
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <BackgroundEffects />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your account and view your history
            </p>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Account Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Account
                </CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground truncate">
                    {user?.email}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Member since</p>
                  <p className="font-medium text-foreground">
                    {user?.created_at
                      ? format(new Date(user.created_at), "MMM dd, yyyy")
                      : "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Subscription Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  Subscription
                </CardTitle>
                <CardDescription>Your current plan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <Badge variant={getPlanBadgeVariant(userStatus?.planType || "free")}>
                    {userStatus?.planType === "free"
                      ? "Free"
                      : userStatus?.planType === "weekly"
                      ? "Weekly"
                      : "Monthly"}
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Credits</p>
                  <p className="font-medium text-foreground">
                    {userStatus?.hasActivePlan ? "Unlimited" : userStatus?.credits || 0}
                  </p>
                </div>
                {userStatus?.planExpiry && userStatus.hasActivePlan && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Expires</p>
                      <p className="font-medium text-foreground">
                        {format(new Date(userStatus.planExpiry), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Quick Stats
                </CardTitle>
                <CardDescription>Your usage overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Total Generations</p>
                  <p className="font-medium text-foreground">{thumbnails.length}</p>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Total Payments</p>
                  <p className="font-medium text-foreground">{payments.length}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Payment History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Payment History
              </CardTitle>
              <CardDescription>Your recent transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No payments yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground capitalize">
                            {payment.plan_type} Plan
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(payment.created_at), "MMM dd, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">
                          ₹{payment.amount}
                        </p>
                        <Badge variant={getStatusBadgeVariant(payment.payment_status)}>
                          {payment.payment_status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Thumbnail History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5 text-primary" />
                Thumbnail History
              </CardTitle>
              <CardDescription>Your generated thumbnails</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : thumbnails.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No thumbnails generated yet</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {thumbnails.map((thumbnail) => (
                    <div
                      key={thumbnail.id}
                      className="group relative rounded-lg overflow-hidden bg-muted/30"
                    >
                      {thumbnail.image_url ? (
                        <img
                          src={thumbnail.image_url}
                          alt={thumbnail.text_input}
                          className="w-full aspect-video object-cover"
                        />
                      ) : (
                        <div className="w-full aspect-video bg-muted flex items-center justify-center">
                          <Image className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-sm font-medium text-foreground line-clamp-2 mb-2">
                            {thumbnail.text_input}
                          </p>
                          <div className="flex gap-2">
                            {thumbnail.image_url && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() =>
                                  handleDownload(
                                    thumbnail.image_url!,
                                    thumbnail.text_input
                                  )
                                }
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteThumbnail(thumbnail.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(thumbnail.created_at), "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
