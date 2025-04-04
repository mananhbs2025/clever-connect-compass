
import LoginForm from '@/components/LoginForm';

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-bg p-4">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-white/80">Sign in to your AIConnect account</p>
        </div>
        
        <LoginForm />
        
        <div className="mt-8 text-center text-white/60 text-sm">
          <p>© 2025 AIConnect. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
