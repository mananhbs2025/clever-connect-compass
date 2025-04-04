
import SignUpForm from '@/components/SignUpForm';

const SignUp = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-bg p-4">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to AIConnect</h1>
          <p className="text-white/80">Your gateway to AI-powered conversations</p>
        </div>
        
        <SignUpForm />
        
        <div className="mt-8 text-center text-white/60 text-sm">
          <p>© 2025 AIConnect. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
