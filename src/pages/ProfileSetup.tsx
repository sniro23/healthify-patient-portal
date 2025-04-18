
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageContainer from "@/components/layout/PageContainer";
import ProfileSetupForm from "@/components/profile/ProfileSetupForm";
import { useAuth } from "@/lib/hooks/useAuth";
import LoadingSpinner from "@/components/ui/loading-spinner";

const ProfileSetup = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
      
      if (!isAuthenticated && !user) {
        navigate("/login");
        return;
      }
      
      setPageLoading(false);
    };
    
    if (!isLoading) {
      checkAuth();
    }
  }, [isLoading, user, navigate]);

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
