import { motion } from 'motion/react';
import { Trophy, Crown, Medal, Award, Filter, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { useState } from 'react';

const leaderboardData = [
  { rank: 1, team: 'Team Quantum', score: 98, members: ['Alice', 'Bob', 'Charlie'], project: 'AI Trading Bot', hackathon: 'FinTech Innovation' },
  { rank: 2, team: 'Code Warriors', score: 95, members: ['Dave', 'Eve', 'Frank'], project: 'Blockchain Payment', hackathon: 'FinTech Innovation' },
  { rank: 3, team: 'Innovators', score: 92, members: ['Grace', 'Henry', 'Ivy'], project: 'Smart Banking', hackathon: 'FinTech Innovation' },
  { rank: 4, team: 'Tech Titans', score: 89, members: ['Jack', 'Kate', 'Leo'], project: 'Fraud Detection', hackathon: 'FinTech Innovation' },
  { rank: 5, team: 'Future Builders', score: 87, members: ['Mike', 'Nina', 'Oscar'], project: 'Crypto Wallet', hackathon: 'FinTech Innovation' },
  { rank: 6, team: 'Neural Networks', score: 85, members: ['Paul', 'Quinn', 'Rita'], project: 'ML Analytics', hackathon: 'AI Revolution' },
  { rank: 7, team: 'Deep Learning', score: 82, members: ['Sam', 'Tina', 'Uma'], project: 'NLP Engine', hackathon: 'AI Revolution' },
  { rank: 8, team: 'AI Masters', score: 80, members: ['Victor', 'Wendy', 'Xander'], project: 'Computer Vision', hackathon: 'AI Revolution' },
];

export function PublicLeaderboard() {
  const [selectedHackathon, setSelectedHackathon] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = leaderboardData.filter(
    (entry) =>
      (selectedHackathon === 'all' || entry.hackathon === selectedHackathon) &&
      (entry.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.project.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-gray-400 text-lg font-bold">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30';
      case 2:
        return 'from-gray-400/20 to-slate-400/20 border-gray-400/30';
      case 3:
        return 'from-amber-600/20 to-orange-600/20 border-amber-600/30';
      default:
        return 'from-white/5 to-white/5 border-white/10';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Leaderboard
        </h1>
        <p className="text-gray-400 mt-2">See where you rank among the best</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { label: 'Your Best Rank', value: '#12', color: 'from-cyan-500 to-blue-500' },
          { label: 'Total Points', value: '845', color: 'from-purple-500 to-pink-500' },
          { label: 'Competitions', value: '6', color: 'from-yellow-500 to-orange-500' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="relative overflow-hidden border-white/10 bg-black/40 backdrop-blur-sm">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`} />
              <CardContent className="relative p-6 text-center">
                <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                <p className="text-4xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search teams or projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/10"
              />
            </div>
            <Select value={selectedHackathon} onValueChange={setSelectedHackathon}>
              <SelectTrigger className="w-64 bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Hackathons</SelectItem>
                <SelectItem value="FinTech Innovation">FinTech Innovation</SelectItem>
                <SelectItem value="AI Revolution">AI Revolution</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-white/10">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Rankings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredData.map((entry, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`relative p-4 rounded-lg border bg-gradient-to-r ${getRankColor(
                entry.rank
              )}`}
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="flex items-center justify-center w-16">
                  {getRankIcon(entry.rank)}
                </div>

                {/* Team Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-lg">{entry.team}</h3>
                    {entry.rank <= 3 && (
                      <Badge
                        className={`${
                          entry.rank === 1
                            ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                            : entry.rank === 2
                            ? 'bg-gray-400/20 text-gray-300 border-gray-400/30'
                            : 'bg-amber-600/20 text-amber-400 border-amber-600/30'
                        }`}
                      >
                        {entry.rank === 1 ? '🏆 Winner' : entry.rank === 2 ? '🥈 2nd Place' : '🥉 3rd Place'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mb-1">{entry.project}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{entry.hackathon}</span>
                    <span>•</span>
                    <span>{entry.members.join(', ')}</span>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    {entry.score}
                  </div>
                  <p className="text-xs text-gray-400">points</p>
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
