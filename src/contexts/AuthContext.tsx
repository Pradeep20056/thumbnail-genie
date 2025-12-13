import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface UserStatus {
  credits: number;
  planType: string;
  planExpiry: string | null;
  hasActivePlan: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userStatus: UserStatus | null;
  refreshUserStatus: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);

  const fetchUserStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc("get_user_status", {
        _user_id: userId,
      });

      if (error) {
        console.error("Error fetching user status:", error);
        return;
      }

      if (data && data.length > 0) {
        const status = data[0];
        setUserStatus({
          credits: status.credits,
          planType: status.plan_type,
          planExpiry: status.plan_expiry,
          hasActivePlan: status.has_active_plan,
        });
      }
    } catch (error) {
      console.error("Error fetching user status:", error);
    }
  };

  const refreshUserStatus = async () => {
    if (user) {
      await fetchUserStatus(user.id);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserStatus(null);
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Fetch user status when logged in (deferred to avoid deadlock)
        if (session?.user) {
          setTimeout(() => {
            fetchUserStatus(session.user.id);
          }, 0);
        } else {
          setUserStatus(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        fetchUserStatus(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        userStatus,
        refreshUserStatus,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
