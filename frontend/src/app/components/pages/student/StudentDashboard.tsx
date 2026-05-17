import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Users, Trophy, BookOpen, Zap, TrendingUp, Award, Target, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../../../context/AuthContext';
import { hackathonAPI } from '../../../../services/api';
import { toast } from 'sonner';

export function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const myAchievements = [
    { icon: '🏆', title: 'Winner', desc: 'Web3 Summit 2025' },
    { icon: '🥈', title: 'Runner-up', desc: 'DeepTech Challenge' },
    { icon: '⚡', title: 'Fast Coder', desc: 'Completed in 24h' },
    { icon: '🤝', title: 'Team Player', desc: '5 Successful Teams' },
  ];

  const [hackathons, setHackathons] = useState<any[]>([]);
  const [userRegistrations, setUserRegistrations] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  
  const firstName = user?.full_name?.split(' ')[0] || 'Hacker';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [hackathonData, registrationData] = await Promise.all([
          hackathonAPI.list({ status: 'open', limit: 10 }),
          hackathonAPI.getMyRegistrations()
        ]);
        
        setHackathons(Array.isArray(hackathonData) ? hackathonData : []);
        setUserRegistrations((registrationData || []).map((r: any) => r.hackathon_id));
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) fetchData();
  }, [user]);

  const isRegistered = (hackathonId: number) => userRegistrations.includes(hackathonId);

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
        <p className="text-gray-400">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Welcome back, {firstName}!
        </h1>
        <p className="text-gray-400 mt-2">Ready to build something amazing? 🚀</p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6" id="student-stats">
        {[
          {
            icon: Calendar,
            label: 'My Registrations',
            value: userRegistrations.length.toString(),
            color: 'from-cyan-500 to-blue-500',
          },
          {
            icon: Users,
            label: 'Team Members',
            value: '0',
            color: 'from-purple-500 to-pink-500',
          },
          {
            icon: Trophy,
            label: 'Points Earned',
            value: '450',
            color: 'from-yellow-500 to-orange-500',
          },
          {
            icon: Award,
            label: 'Global Rank',
            value: '#42',
            color: 'from-green-500 to-teal-500',
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="relative overflow-hidden border-white/10 bg-black/40 backdrop-blur-sm">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`} />
              <CardContent className="relative p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
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

      <div className="grid md:grid-cols-3 gap-6">
        {/* My Hackathons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="md:col-span-2"
          id="student-hackathons"
        >
          <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                Latest Hackathons
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hackathons.length === 0 ? (
                <div className="py-12 text-center text-gray-500 italic">
                  No hackathons available right now.
                </div>
              ) : (
                hackathons.map((hackathon, i) => (
                  <motion.div
                    key={hackathon.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="p-4 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold mb-1">{hackathon.title}</h3>
                        <p className="text-sm text-gray-400">
                          {hackathon.start_date ? new Date(hackathon.start_date).toLocaleDateString() : 'TBD'}
                        </p>
                      </div>
                      {isRegistered(hackathon.id) ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          Registered
                        </Badge>
                      ) : (
                        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                          Open
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex gap-4 text-gray-400">
                        <span>💰 {formatINR(hackathon.prize_pool || 0)}</span>
                        <span>👥 {hackathon.registration_count || 0} joined</span>
                        <span>📁 {hackathon.category || 'General'}</span>
                      </div>
                      {isRegistered(hackathon.id) ? (
                        <Link to="/student/submissions">
                          <Button size="sm" variant="outline" className="border-white/10">
                            Submit Project
                          </Button>
                        </Link>
                      ) : (
                        <Link to="/student/hackathons">
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white"
                          >
                            Register Now
                          </Button>
                        </Link>
                      )}
                    </div>
                  </motion.div>
                ))
              )}

              <Link to="/student/hackathons">
                <Button variant="outline" className="w-full border-white/10">
                  Browse All Hackathons
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          {/* Skills Progress */}
          <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                Skill Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { skill: 'React', progress: 85, color: 'bg-cyan-500' },
                { skill: 'Python', progress: 70, color: 'bg-purple-500' },
                { skill: 'Web3', progress: 60, color: 'bg-pink-500' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-2">
                    <span>{item.skill}</span>
                    <span className="text-gray-400">{item.progress}%</span>
                  </div>
                  <Progress value={item.progress} className="h-2" />
                </div>
              ))}
              <Link to="/student/profile">
                <Button variant="outline" size="sm" className="w-full border-white/10">
                  Update Skills
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/student/teams">
                <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/5">
                  <Users className="w-4 h-4 mr-2" />
                  Find Teammates
                </Button>
              </Link>
              <Link to="/student/mentorship">
                <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/5">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Book Mentor
                </Button>
              </Link>
              <Link to="/student/leaderboard">
                <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/5">
                  <Trophy className="w-4 h-4 mr-2" />
                  View Leaderboard
                </Button>
              </Link>
              <Link to="/student/resources">
                <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/5">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Learning Resources
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              {myAchievements.map((achievement, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="p-4 rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-white/0 text-center"
                >
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <h4 className="font-semibold text-sm mb-1">{achievement.title}</h4>
                  <p className="text-xs text-gray-400">{achievement.desc}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Activity Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  action: 'Registered for hackathon',
                  detail: 'FinTech Innovation Challenge',
                  time: '2 hours ago',
                },
                {
                  action: 'Joined team',
                  detail: 'Team Quantum - 4 members',
                  time: '5 hours ago',
                },
                {
                  action: 'Earned badge',
                  detail: 'Fast Coder Achievement',
                  time: '1 day ago',
                },
                {
                  action: 'Submitted project',
                  detail: 'Web3 Future Summit',
                  time: '2 days ago',
                },
              ].map((activity, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-3 rounded-lg border border-white/5 hover:bg-white/5 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.action}</p>
                    <p className="text-xs text-gray-400">{activity.detail}</p>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
