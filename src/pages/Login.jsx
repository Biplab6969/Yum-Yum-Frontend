import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiLoader } from 'react-icons/fi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      const redirectPath = result.user.role === 'admin' 
        ? '/admin/dashboard' 
        : '/seller/dashboard';
      navigate(redirectPath);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7c2_0%,_#ffffff_40%,_#f5f5f5_100%)] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-[1.1fr_0.9fr] rounded-[2rem] overflow-hidden border border-black/10 shadow-2xl bg-white animate-popIn">
        <div className="hidden lg:flex flex-col justify-between bg-black text-white p-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(250,204,21,0.35),_transparent_35%)]" />
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-400 rounded-2xl shadow-lg mb-6 border border-yellow-300">
              <span className="text-3xl font-bold text-black">Y</span>
            </div>
            <h1 className="text-4xl font-bold leading-tight">Yum Yum</h1>
            <p className="text-white/80 mt-3 max-w-md text-base">
              Food business management with sharp visibility, fast daily tracking, and a clean operational dashboard.
            </p>
          </div>
          <div className="relative z-10 border-t border-yellow-400/30 pt-6 text-sm text-white/70">
            <p className="uppercase tracking-[0.25em] text-yellow-300 text-xs mb-2">Trusted daily workflow</p>
            <p>Inventory, sales, production, and reporting in one focused workspace.</p>
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10 bg-white">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl shadow-lg mb-4 border border-black">
              <span className="text-3xl font-bold text-yellow-400">Y</span>
            </div>
            <h1 className="text-3xl font-bold text-black">Yum Yum</h1>
            <p className="text-black/70 mt-2">Food Business Management System</p>
          </div>

          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.3em] text-black/50 font-semibold">Secure access</p>
            <h2 className="text-2xl font-bold text-black mt-2">Welcome Back</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-black/60 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-12"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-black/60 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-12"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <FiLoader className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-black/10">
            <p className="text-sm font-semibold text-black mb-2">Demo Credentials:</p>
            <div className="text-sm text-black/80 space-y-1">
              <p><strong>Admin:</strong> admin@yumyum.com / admin123</p>
              <p><strong>Seller:</strong> seller1@yumyum.com / seller123</p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-black/70 mt-6 text-sm absolute bottom-4">
        © 2024 Yum Yum. All rights reserved.
      </p>
    </div>
  );
};

export default Login;
