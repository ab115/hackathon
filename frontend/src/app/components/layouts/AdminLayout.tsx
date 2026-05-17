import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { LayoutDashboard, Plus, Settings, Trophy, Gavel, Sparkles, LogOut, ShieldCheck, ChevronRight, BookOpen, Users, HelpCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../../context/AuthContext';
import { startAdminTour } from '../../../services/tourService';

export function AdminLayout() {
  const location = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard',       path: '/admin', id: 'sidebar-dashboard' },
    { icon: Plus,            label: 'Create Hackathon', path: '/admin/create', id: 'sidebar-create' },
    { icon: Settings,        label: 'Manage Hackathons',path: '/admin/manage', id: 'sidebar-manage' },
    { icon: BookOpen,        label: 'Resources',        path: '/admin/resources', id: 'sidebar-resources' },
    { icon: Users,           label: 'Mentors',          path: '/admin/mentors', id: 'sidebar-mentors' },
    { icon: Trophy,          label: 'Leaderboard',      path: '/admin/leaderboard', id: 'sidebar-leaderboard' },
    { icon: Gavel,           label: 'Judging',          path: '/admin/judging', id: 'sidebar-judging' },
    { icon: Users,           label: 'User Management',  path: '/admin/users', id: 'sidebar-users' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#12121a] to-[#0a0a0f] text-white">
      {/* Grid background */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(#a855f720 1px, transparent 1px), linear-gradient(90deg, #a855f720 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />
      </div>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }} animate={{ x: 0 }}
        className="fixed left-0 top-0 h-screen w-64 border-r border-white/10 bg-black/50 backdrop-blur-xl z-50 flex flex-col"
      >
        {/* Logo */}
        <div className="p-6 pb-4" id="sidebar-logo">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center shrink-0">
              <img src="/icon.svg" alt="Scalegrad Icon" className="w-8 h-8" />
            </div>
            <div>
              <div className="font-bold text-lg leading-tight">Scalegrad</div>
              <div className="text-xs text-gray-400 leading-tight">Admin Portal</div>
            </div>
          </Link>
        </div>

        {/* Role badge */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 w-fit">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs text-purple-300 font-semibold uppercase tracking-wide">{user?.role || 'Admin'}</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 pb-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link key={item.path} to={item.path} id={item.id}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border border-purple-500/30'
                      : 'hover:bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span className="text-sm flex-1">{item.label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-sm font-bold shrink-0">
              {user?.full_name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.full_name || 'Admin'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={() => startAdminTour(navigate)}
            className="w-full justify-start text-purple-400 border-purple-500/30 hover:bg-purple-500/10 mb-2"
          >
            <HelpCircle className="w-4 h-4 mr-3" /> Take a Tour
          </Button>

          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-gray-400 hover:text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4 mr-3" /> Exit Admin Portal
          </Button>
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
