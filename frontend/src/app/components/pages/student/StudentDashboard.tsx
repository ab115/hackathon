import { motion } from 'motion/react';
import { Calendar, Users, Trophy, BookOpen, Zap, TrendingUp, Award, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { Link } from 'react-router';

const upcomingHackathons = [
  {
    id: 1,
    name: 'FinTech Innovation Challenge',
    date: 'May 1-3, 2026',
    prize: '₹4,000,000',
    teams: 342,
    category: 'FinTech',
    status: 'Registered',
  },
  {
    id: 2,
    name: 'AI Revolution 2026',
    date: 'May 15-17, 2026',
    prize: '₹3,200,000',
    teams: 289,
    category: 'AI/ML',
    status: 'Open',
  },
];

const myAchievements = [
  { icon: '🏆', title: 'Winner', desc: 'Web3 Summit 2025' },
  { icon: '🥈', title: 'Runner-up', desc: 'DeepTech Challenge' },
  { icon: '⚡', title: 'Fast Coder', desc: 'Completed in 24h' },
  { icon: '🤝', title: 'Team Player', desc: '5 Successful Teams' },
];

export function StudentDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Welcome Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Welcome back, Alex!
        </h1>
        <p className="text-gray-400 mt-2">Ready to build something amazing?</p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        {[
          {
            icon: Calendar,
            label: 'Active Hackathons',
            value: '2',
            color: 'from-cyan-500 to-blue-500',
          },
          {
            icon: Users,
            label: 'Team Members',
            value: '8',
            color: 'from-purple-500 to-pink-500',
          },
          {
            icon: Trophy,
            label: 'Competitions Won',
            value: '3',
            color: 'from-yellow-500 to-orange-500',
          },
          {
            icon: Award,
            label: 'Total Earnings',
            value: '₹1M',
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
        >
          <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                My Hackathons
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingHackathons.map((hackathon, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="p-4 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold mb-1">{hackathon.name}</h3>
                      <p className="text-sm text-gray-400">{hackathon.date}</p>
                    </div>
                    {hackathon.status === 'Registered' ? (
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
                      <span>💰 {hackathon.prize}</span>
                      <span>👥 {hackathon.teams} teams</span>
                      <span>📁 {hackathon.category}</span>
                    </div>
                    {hackathon.status === 'Registered' ? (
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
              ))}

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
