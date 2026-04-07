import { useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Eye, EyeOff, Crown, Medal, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Switch } from '../../ui/switch';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { toast } from 'sonner';

const mockLeaderboards = [
  {
    id: 1,
    hackathon: 'FinTech Innovation Challenge',
    isPublic: true,
    entries: [
      { rank: 1, team: 'Team Quantum', score: 98, members: ['Alice', 'Bob', 'Charlie'], project: 'AI Trading Bot' },
      { rank: 2, team: 'Code Warriors', score: 95, members: ['Dave', 'Eve', 'Frank'], project: 'Blockchain Payment' },
      { rank: 3, team: 'Innovators', score: 92, members: ['Grace', 'Henry', 'Ivy'], project: 'Smart Banking' },
      { rank: 4, team: 'Tech Titans', score: 89, members: ['Jack', 'Kate', 'Leo'], project: 'Fraud Detection' },
      { rank: 5, team: 'Future Builders', score: 87, members: ['Mike', 'Nina', 'Oscar'], project: 'Crypto Wallet' },
    ],
  },
  {
    id: 2,
    hackathon: 'AI Revolution 2026',
    isPublic: false,
    entries: [
      { rank: 1, team: 'Neural Networks', score: 96, members: ['Paul', 'Quinn', 'Rita'], project: 'Computer Vision' },
      { rank: 2, team: 'Deep Learning', score: 93, members: ['Sam', 'Tina', 'Uma'], project: 'NLP Engine' },
      { rank: 3, team: 'AI Masters', score: 91, members: ['Victor', 'Wendy', 'Xander'], project: 'Recommendation System' },
    ],
  },
];

export function AdminLeaderboard() {
  const [leaderboards, setLeaderboards] = useState(mockLeaderboards);
  const [selectedHackathon, setSelectedHackathon] = useState(mockLeaderboards[0].id.toString());

  const togglePublic = (id: number) => {
    setLeaderboards(
      leaderboards.map((l) =>
        l.id === id ? { ...l, isPublic: !l.isPublic } : l
      )
    );
    const leaderboard = leaderboards.find((l) => l.id === id);
    toast.success(
      leaderboard?.isPublic
        ? 'Leaderboard is now private'
        : 'Leaderboard is now public'
    );
  };

  const currentLeaderboard = leaderboards.find(
    (l) => l.id === parseInt(selectedHackathon)
  );

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-300" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-gray-400">#{rank}</span>;
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
          Leaderboard Management
        </h1>
        <p className="text-gray-400 mt-2">Manage leaderboards and control visibility</p>
      </div>

      {/* Hackathon Selector */}
      <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <Label>Select Hackathon</Label>
              <Select value={selectedHackathon} onValueChange={setSelectedHackathon}>
                <SelectTrigger className="bg-white/5 border-white/10 mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {leaderboards.map((l) => (
                    <SelectItem key={l.id} value={l.id.toString()}>
                      {l.hackathon}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currentLeaderboard && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {currentLeaderboard.isPublic ? (
                    <Eye className="w-5 h-5 text-green-400" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-400">
                    {currentLeaderboard.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="public-toggle">Make Public</Label>
                  <Switch
                    id="public-toggle"
                    checked={currentLeaderboard.isPublic}
                    onCheckedChange={() => togglePublic(currentLeaderboard.id)}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Display */}
      {currentLeaderboard && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                {currentLeaderboard.hackathon} Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentLeaderboard.entries.map((entry, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative p-4 rounded-lg border bg-gradient-to-r ${getRankColor(
                    entry.rank
                  )}`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex items-center justify-center w-12">
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
                            {entry.rank === 1
                              ? '🏆 Winner'
                              : entry.rank === 2
                              ? '🥈 2nd Place'
                              : '🥉 3rd Place'}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mb-1">{entry.project}</p>
                      <div className="flex flex-wrap gap-1">
                        {entry.members.map((member, j) => (
                          <span
                            key={j}
                            className="text-xs px-2 py-1 rounded bg-white/5 text-gray-300"
                          >
                            {member}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
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
      )}

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{currentLeaderboard?.entries.length || 0}</p>
                <p className="text-sm text-gray-400">Total Teams</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {currentLeaderboard?.entries[0]?.score || 0}
                </p>
                <p className="text-sm text-gray-400">Highest Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                {currentLeaderboard?.isPublic ? (
                  <Eye className="w-6 h-6 text-white" />
                ) : (
                  <EyeOff className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {currentLeaderboard?.isPublic ? 'Public' : 'Private'}
                </p>
                <p className="text-sm text-gray-400">Visibility</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
