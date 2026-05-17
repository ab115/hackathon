import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, User, Mail, Lock, ArrowRight, ShieldCheck, GraduationCap, Phone, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '../../../context/AuthContext';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError, isAuthenticated, user } = useAuth();
  const [role, setRole] = useState<'STUDENT' | 'ADMIN'>('STUDENT');
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', college: '', password: '', confirmPassword: '',
  });

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      const role = user.role.toUpperCase();
      navigate(role === 'ADMIN' || role === 'JUDGE' ? '/admin' : '/student', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        role,
        phone: formData.phone || undefined,
        college: formData.college || undefined,
      });
      toast.success('Registration successful! Welcome to Scalegrad 🚀');
      // Navigation handled by useEffect
    } catch {
      toast.error(error || 'Registration failed. Please try again.');
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-white p-6 relative overflow-hidden">
      <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 flex items-center justify-center mb-4">
            <img src="/icon.svg" alt="Scalegrad Icon" className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Join Scalegrad
          </h1>
          <p className="text-gray-400 text-sm mt-1">India's Premier Hackathon Platform</p>
        </div>

        <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
          <CardHeader className="pb-4 pt-6 px-6">
            {/* Role Toggle */}
            <div className="flex gap-2 p-1 bg-white/5 rounded-lg border border-white/10">
              {(['STUDENT', 'ADMIN'] as const).map(r => (
                <button
                  key={r} type="button" onClick={() => setRole(r)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md transition-all ${
                    role === r
                      ? r === 'STUDENT'
                        ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                        : 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {r === 'STUDENT' ? <GraduationCap className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                  <span className="text-sm font-medium">{r === 'STUDENT' ? 'Student' : 'Organiser'}</span>
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <Input id="fullName" placeholder="Arjun Sharma" required
                    className="bg-white/5 border-white/10 pl-10 h-11"
                    value={formData.fullName} onChange={update('fullName')} />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <Input id="email" type="email" placeholder="arjun@example.com" required
                    className="bg-white/5 border-white/10 pl-10 h-11"
                    value={formData.email} onChange={update('email')} />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-gray-300">Mobile Number</Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500 text-sm font-medium">+91</span>
                  <Input id="phone" type="tel" placeholder="98765 43210"
                    className="bg-white/5 border-white/10 pl-12 h-11"
                    value={formData.phone} onChange={update('phone')} />
                </div>
              </div>

              {/* College */}
              <div className="space-y-1.5">
                <Label htmlFor="college" className="text-gray-300">College / Institution</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <Input id="college" placeholder="IIT Delhi, NIT Trichy..."
                    className="bg-white/5 border-white/10 pl-10 h-11"
                    value={formData.college} onChange={update('college')} />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <Input id="password" type="password" placeholder="Min. 8 chars with a number" required
                    className="bg-white/5 border-white/10 pl-10 h-11"
                    value={formData.password} onChange={update('password')} />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <Input id="confirmPassword" type="password" placeholder="••••••••" required
                    className="bg-white/5 border-white/10 pl-10 h-11"
                    value={formData.confirmPassword} onChange={update('confirmPassword')} />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit" disabled={isLoading}
                className={`w-full h-11 mt-2 text-white font-semibold transition-all shadow-xl disabled:opacity-60 ${
                  role === 'STUDENT'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-cyan-500/20'
                    : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-purple-500/20'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </div>
                ) : (
                  <span className="flex items-center gap-2">Create Account <ArrowRight className="w-4 h-4" /></span>
                )}
              </Button>

              <p className="text-center text-sm text-gray-400 pt-4 border-t border-white/5">
                Already have an account?{' '}
                <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                  Sign In
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
