import { motion } from 'motion/react';
import {
  Users,
  IndianRupee,
  Trophy,
  TrendingUp,
  Calendar,
  FileCode,
  Activity,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useState, useEffect } from 'react';
import { adminAPI } from '../../../../services/api';
import { Loader2 } from 'lucide-react';

const registrationData = [
  { month: 'Oct', count: 65 },
  { month: 'Nov', count: 89 },
  { month: 'Dec', count: 112 },
  { month: 'Jan', count: 158 },
  { month: 'Feb', count: 203 },
  { month: 'Mar', count: 287 },
];

const hackathonData = [
  { name: 'FinTech Innovate', participants: 342, submissions: 87, revenue: 25600 },
  { name: 'AI Revolution', participants: 289, submissions: 72, revenue: 21800 },
  { name: 'Web3 Future', participants: 256, submissions: 64, revenue: 19200 },
  { name: 'DeepTech Challenge', participants: 198, submissions: 51, revenue: 14900 },
];

const categoryData = [
  { name: 'FinTech', value: 35, color: '#00d9ff' },
  { name: 'AI/ML', value: 28, color: '#a855f7' },
  { name: 'Web3', value: 22, color: '#ec4899' },
  { name: 'IoT', value: 15, color: '#10b981' },
];

// Format number in Indian lakh/crore notation
const formatINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await adminAPI.getStats();
        setData(stats);
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
        <p className="text-gray-400 animate-pulse">Gathering real-time intelligence...</p>
      </div>
    );
  }

  const stats = [
    {
      icon: Users,
      label: 'Total Registrations',
      value: data?.summary?.total_users?.toLocaleString() || '0',
      change: '+12.5%',
      color: 'from-cyan-500 to-blue-500',
    },
    {
      icon: IndianRupee,
      label: 'Total Revenue',
      value: formatINR(data?.summary?.total_revenue || 0),
      change: '+23.1%',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Calendar,
      label: 'Active Hackathons',
      value: data?.summary?.active_hackathons?.toString() || '0',
      change: '+2',
      color: 'from-pink-500 to-orange-500',
    },
    {
      icon: FileCode,
      label: 'Submissions',
      value: data?.summary?.total_submissions?.toLocaleString() || '0',
      change: '+18.2%',
      color: 'from-green-500 to-teal-500',
    },
  ];

  const registrationData = data?.registration_trend || [];
  const categoryData = (data?.category_distribution || []).map((c: any, i: number) => ({
    ...c,
    color: ['#00d9ff', '#a855f7', '#ec4899', '#10b981', '#f59e0b'][i % 5]
  }));
  const hackathonData = data?.top_hackathons || [];
  const recentActivity = data?.recent_activity || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-400 mt-2">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/30">
          <Activity className="w-4 h-4 text-green-400" />
          <span className="text-sm text-green-400">All Systems Operational</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6" id="dashboard-stats">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="relative overflow-hidden border-white/10 bg-black/40 backdrop-blur-sm">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`}
              />
              <CardContent className="relative p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {stat.change}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6" id="dashboard-charts">
        {/* Registration Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                Registration Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={registrationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a2e',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#00d9ff"
                    strokeWidth={3}
                    dot={{ fill: '#00d9ff', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-purple-400" />
                Hackathon Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a2e',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Hackathon Performance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-pink-400" />
              Top Performing Hackathons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hackathonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="name" stroke="#888" angle={-15} textAnchor="end" height={80} />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="participants" fill="#00d9ff" name="Participants" />
                <Bar dataKey="submissions" fill="#a855f7" name="Submissions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity: any, i: number) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-lg border border-white/5 hover:bg-white/5 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2" />
                  <div className="flex-1">
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-gray-400">{activity.detail}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <p className="text-center text-gray-500 py-4">No recent activity detected.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
