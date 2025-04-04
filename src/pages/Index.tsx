
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-bg p-4">
      <div className="text-center max-w-3xl animate-fadeIn">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Connect with AI, Simplified
        </h1>
        
        {isAuthenticated && user ? (
          <>
            <p className="text-xl text-white/80 mb-8">
              Welcome back, {user.user_metadata?.name || user.email?.split('@')[0]}! You're now logged in to our state-of-the-art platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={handleLogout}
                className="bg-white text-indigo-600 hover:bg-white/90"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10"
                onClick={() => navigate("/dashboard")}
              >
                Go to Dashboard
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-xl text-white/80 mb-8">
              Experience seamless AI interactions with our state-of-the-art platform.
              Sign up today to get started!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate("/signup")}
                className="bg-white text-indigo-600 hover:bg-white/90"
              >
                Sign Up
              </Button>
              <Button 
                size="lg" 
                onClick={() => navigate("/login")}
                variant="outline" 
                className="border-white text-white hover:bg-white/10"
              >
                Log In
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
