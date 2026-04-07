import { Outlet, Link, useLocation } from 'react-router';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Calendar,
  User,
  Users,
  FileCode,
  Trophy,
  BookOpen,
  MessageCircle,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { Button } from '../ui/button';

export function StudentLayout() {
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/student' },
    { icon: Calendar, label: 'Hackathons', path: '/student/hackathons' },
    { icon: Users, label: 'Team Formation', path: '/student/teams' },
    { icon: FileCode, label: 'Submissions', path: '/student/submissions' },
    { icon: Trophy, label: 'Leaderboard', path: '/student/leaderboard' },
    { icon: MessageCircle, label: 'Mentorship', path: '/student/mentorship' },
    { icon: BookOpen, label: 'Resources', path: '/student/resources' },
    { icon: User, label: 'Profile', path: '/student/profile' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#12121a] to-[#0a0a0f] text-white">
      {/* Grid Background */}
      <div className="fixed inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(#00d9ff20 1px, transparent 1px), linear-gradient(90deg, #00d9ff20 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="fixed left-0 top-0 h-screen w-64 border-r border-white/10 bg-black/40 backdrop-blur-xl z-50 overflow-y-auto"
      >
        <div className="p-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-lg">HackFusion</div>
              <div className="text-xs text-gray-400">Student Portal</div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'hover:bg-white/5 text-gray-400'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="absolute bottom-6 left-6 right-6">
            <Link to="/">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/5"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sign Out
              </Button>
            </Link>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="ml-64">
        <div className="relative z-10 p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
