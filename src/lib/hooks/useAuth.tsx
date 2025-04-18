
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { type Session, type User } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.email);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          localStorage.setItem('isAuthenticated', 'true');
          
          // Check if profile setup is complete after signing in
          if (currentSession) {
            await checkProfileCompletion(currentSession.user.id);
          }
        } else if (event === 'SIGNED_OUT') {
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('hasCompletedProfile');
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      console.log("Initial session check:", initialSession?.user?.email);
      
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      
      if (initialSession) {
        localStorage.setItem('isAuthenticated', 'true');
        await checkProfileCompletion(initialSession.user.id);
      }
      
      setIsLoading(false);
    };
    
    initializeAuth();

    return () => subscription.unsubscribe();
  }, []);

  const checkProfileCompletion = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('has_completed_profile')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      const hasCompletedProfile = data?.has_completed_profile || false;
      console.log("Profile completion check:", hasCompletedProfile);
      localStorage.setItem('hasCompletedProfile', hasCompletedProfile.toString());
    } catch (error) {
      console.error('Profile check error:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: 'Login failed',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Login successful',
        description: 'Welcome to Healthify Patient Portal',
      });

      // Check profile completion and redirect accordingly
      if (data.session) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('has_completed_profile')
          .eq('id', data.session.user.id)
          .maybeSingle();

        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('hasCompletedProfile', (profileData?.has_completed_profile || false).toString());
        
        if (profileData?.has_completed_profile) {
          navigate('/dashboard');
        } else {
          navigate('/profile-setup');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login failed',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log("Signing up user:", email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        toast({
          title: 'Registration failed',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }

      if (data.user) {
        console.log("User created successfully:", data.user.id);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('hasCompletedProfile', 'false');
        
        // Also set the session and user state immediately
        setSession(data.session);
        setUser(data.user);
        
        toast({
          title: 'Registration successful',
          description: 'Welcome to Healthify Patient Portal',
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration failed',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('hasCompletedProfile');
      setUser(null);
      setSession(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });

      if (error) {
        toast({
          title: 'Request failed',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      return;
    } catch (error) {
      console.error('Reset password error:', error);
      toast({
        title: 'Request failed',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
