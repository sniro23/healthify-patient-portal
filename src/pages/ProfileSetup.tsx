
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageContainer from "@/components/layout/PageContainer";
import ProfileSetupForm from "@/components/profile/ProfileSetupForm";
import { useAuth } from "@/lib/hooks/useAuth";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ProfileSetup = () => {
  const { user, session, isLoading } = useAuth();
  const navigate = useNavigate();
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    console.log("ProfileSetup: Auth state", { user, session, isLoading });
    
    // Check if user is authenticated
    const checkAuth = async () => {
      const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
      
      if (!isAuthenticated && !user) {
        // Double-check with Supabase directly if the user session exists
        const { data } = await supabase.auth.getSession();
        
        if (!data.session) {
          console.log("No active session found, redirecting to login");
          toast({
            title: "Authentication required",
            description: "Please log in to complete your profile setup",
            variant: "destructive",
          });
          navigate("/login");
          return;
        } else {
          // We found a session but our state doesn't have it, update localStorage
          console.log("Session found but state not updated, fixing...");
          localStorage.setItem("isAuthenticated", "true");
          localStorage.setItem("hasCompletedProfile", "false");
        }
      }
      
      // If user has already completed profile, redirect to dashboard
      const hasCompletedProfile = localStorage.getItem("hasCompletedProfile") === "true";
      if (user && hasCompletedProfile) {
        navigate("/dashboard");
        return;
      }
      
      setPageLoading(false);
    };
    
    if (!isLoading) {
      checkAuth();
    }
  }, [isLoading, user, session, navigate]);

  if (isLoading || pageLoading) {
    return (
      <PageContainer 
        title="Loading" 
        showBottomNav={false} 
        showNotification={false}
      >
        <div className="flex justify-center items-center h-[80vh]">
          <LoadingSpinner />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer 
      title="Profile Setup" 
      showBottomNav={false} 
      showNotification={false}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Set up your medical profile</h1>
        <p className="text-slate-600 mt-1">
          This information helps us provide personalized healthcare services
        </p>
      </div>
      
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <ProfileSetupForm />
      </div>
    </PageContainer>
  );
};

export default ProfileSetup;
