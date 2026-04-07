import { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Sparkles, UserPlus, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Progress } from '../../ui/progress';
import { toast } from 'sonner';

const mockUsers = [
  {
    id: 1,
    name: 'Sarah Chen',
    avatar: 'Sarah',
    skills: ['React', 'Node.js', 'UI/UX'],
    interests: ['FinTech', 'AI/ML'],
    matchScore: 95,
    hackathons: 12,
    wins: 3,
  },
  {
    id: 2,
    name: 'Michael Park',
    avatar: 'Michael',
    skills: ['Python', 'Machine Learning', 'Data Science'],
    interests: ['AI/ML', 'DeepTech'],
    matchScore: 92,
    hackathons: 8,
    wins: 2,
  },
  {
    id: 3,
    name: 'Emma Rodriguez',
    avatar: 'Emma',
    skills: ['Solidity', 'Web3.js', 'Smart Contracts'],
    interests: ['Web3', 'FinTech'],
    matchScore: 88,
    hackathons: 15,
    wins: 4,
  },
  {
    id: 4,
    name: 'David Kim',
    avatar: 'David',
    skills: ['React Native', 'Flutter', 'Mobile Dev'],
    interests: ['FinTech', 'HealthTech'],
    matchScore: 85,
    hackathons: 10,
    wins: 1,
  },
];

const myTeams = [
  {
    id: 1,
    name: 'Team Quantum',
    hackathon: 'FinTech Innovation Challenge',
    members: 4,
    maxMembers: 4,
    status: 'active',
  },
];

export function TeamFormation() {
  const [searchTerm, setSearchTerm] = useState('');
  const [recommendations] = useState(mockUsers);

  const handleInvite = (name: string) => {
    toast.success(`Invitation sent to ${name}!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Team Formation
        </h1>
        <p className="text-gray-400 mt-2">Find perfect teammates with AI-powered matching</p>
      </div>

      {/* My Teams */}
      <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            My Teams
          </CardTitle>
        </CardHeader>
        <CardContent>
          {myTeams.length > 0 ? (
            <div className="space-y-3">
              {myTeams.map((team) => (
                <div
                  key={team.id}
                  className="p-4 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold mb-1">{team.name}</h3>
                      <p className="text-sm text-gray-400">{team.hackathon}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {team.members}/{team.maxMembers} members
                      </p>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      {team.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">
              You're not in any team yet. Find teammates below!
            </p>
          )}
        </CardContent>
      </Card>

      {/* AI-Powered Recommendations */}
      <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              AI-Powered Recommendations
            </CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-white/5 border-white/10 w-64"
                />
              </div>
              <Button variant="outline" size="icon" className="border-white/10">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {recommendations.map((user, i) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/0 hover:from-white/10 hover:to-white/5 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-16 h-16 border-2 border-cyan-500/30">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatar}`}
                        />
                        <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold">{user.name}</h3>
                            <p className="text-xs text-gray-400">
                              {user.hackathons} hackathons · {user.wins} wins
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleInvite(user.name)}
                            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white"
                          >
                            <UserPlus className="w-4 h-4 mr-1" />
                            Invite
                          </Button>
                        </div>

                        {/* Match Score */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-400">Match Score</span>
                            <span className="font-semibold text-cyan-400">{user.matchScore}%</span>
                          </div>
                          <Progress value={user.matchScore} className="h-2" />
                        </div>

                        {/* Skills */}
                        <div className="mb-2">
                          <p className="text-xs text-gray-400 mb-1">Skills:</p>
                          <div className="flex flex-wrap gap-1">
                            {user.skills.map((skill, j) => (
                              <Badge
                                key={j}
                                className="text-xs bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Interests */}
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Interests:</p>
                          <div className="flex flex-wrap gap-1">
                            {user.interests.map((interest, j) => (
                              <Badge
                                key={j}
                                className="text-xs bg-purple-500/20 text-purple-400 border-purple-500/30"
                              >
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* How it Works */}
      <Card className="border-white/10 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            How AI Matching Works
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-300">
            <div>
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold mb-2">
                1
              </div>
              <p>
                <strong className="text-white">Skills Analysis</strong>
                <br />
                We analyze your technical skills and match you with complementary teammates
              </p>
            </div>
            <div>
              <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold mb-2">
                2
              </div>
              <p>
                <strong className="text-white">Interest Matching</strong>
                <br />
                Find people passionate about the same domains and technologies
              </p>
            </div>
            <div>
              <div className="w-8 h-8 rounded-full bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 font-bold mb-2">
                3
              </div>
              <p>
                <strong className="text-white">Success Prediction</strong>
                <br />
                Our AI predicts team compatibility based on past hackathon performance
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
