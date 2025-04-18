
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
      // If auth state is still loading, wait
      if (isLoading) {
        return;
      }
      
      // If we have user in the context, use that
      if (user && session) {
        console.log("User is already authenticated in context", user.id);
        
        // If user has already completed profile, redirect to dashboard
        const hasCompletedProfile = localStorage.getItem("hasCompletedProfile") === "true";
        if (hasCompletedProfile) {
          navigate("/dashboard");
          return;
        }
        
        setPageLoading(false);
        return;
      }
      
      // Double-check with localStorage and Supabase
      const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
      
      if (!isAuthenticated) {
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
      } else {
        // User is authenticated according to localStorage but might not have completed profile
        const hasCompletedProfile = localStorage.getItem("hasCompletedProfile") === "true";
        if (hasCompletedProfile) {
          navigate("/dashboard");
          return;
        }
      }
      
      setPageLoading(false);
    };
    
    checkAuth();
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
