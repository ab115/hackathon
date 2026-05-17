import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Mail, Lock, ArrowRight, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '../../../context/AuthContext';
import { authAPI } from '../../../services/api';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError, isAuthenticated, user } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      const role = user.role.toUpperCase();
      if (role === 'ADMIN' || role === 'JUDGE') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/student', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(formData.email, formData.password);
      toast.success('Welcome back!');
      // Navigation handled by useEffect above after user state updates
    } catch {
      toast.error(error || 'Login failed. Please check your credentials.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      toast.error('Please enter your email address.');
      return;
    }
    setIsResetLoading(true);
    try {
      await authAPI.forgotPassword(formData.email);
      toast.success('Reset link sent!', {
        description: 'Check your email (or container logs) for the reset link.',
      });
      setIsForgotPassword(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reset link.');
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-white p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 -right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/3 -left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <Link to="/" className="flex flex-col items-center group">
            <div className="w-14 h-14 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <img src="/icon.svg" alt="Scalegrad Icon" className="w-12 h-12" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Scalegrad
            </h1>
            <p className="text-gray-500 text-xs mt-1 tracking-widest uppercase">India's Premier Hackathon Platform</p>
          </Link>
        </div>

        <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500" />
          <CardHeader className="pb-2 pt-6 px-8">
            <CardTitle className="text-2xl font-bold text-center">
              {isForgotPassword ? 'Reset Password' : 'Sign In'}
            </CardTitle>
            <p className="text-gray-400 text-center text-sm mt-1">
              {isForgotPassword ? 'Reset your portal password' : 'Login to your portal'}
            </p>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            {isForgotPassword ? (
              <form onSubmit={handleForgotPassword} className="space-y-5 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                    <Input
                      id="reset-email" type="email" placeholder="arjun@example.com" required
                      className="bg-white/5 border-white/10 pl-10 h-11"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 italic">
                    We'll send a password reset link to this email address.
                  </p>
                </div>

                <Button
                  type="submit" disabled={isResetLoading}
                  className="w-full h-11 mt-2 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold transition-all"
                >
                  {isResetLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>

                <button
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  className="w-full text-center text-sm text-gray-500 hover:text-white transition-colors"
                >
                  Back to Sign In
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                    <Input
                      id="email" type="email" placeholder="arjun@example.com" required
                      className="bg-white/5 border-white/10 pl-10 h-11"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-xs text-cyan-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                    <Input
                      id="password" type="password" placeholder="••••••••" required
                      className="bg-white/5 border-white/10 pl-10 h-11"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit" disabled={isLoading}
                  className="w-full h-11 mt-2 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold transition-all disabled:opacity-60"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </div>
                  ) : (
                    <span className="flex items-center gap-2">Sign In <ArrowRight className="w-4 h-4" /></span>
                  )}
                </Button>

                <p className="text-center text-sm text-gray-400 pt-4 border-t border-white/5">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                    Create Account
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
