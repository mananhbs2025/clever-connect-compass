
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-bg p-4">
      <div className="text-center max-w-3xl animate-fadeIn">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Connect with AI, Simplified
        </h1>
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
            variant="outline" 
            className="border-white text-white hover:bg-white/10"
          >
            Learn More
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
