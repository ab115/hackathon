import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Sparkles, UserPlus, Search, Filter, Mail, Check, X, Edit2, Trash2, UserMinus, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Progress } from '../../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { toast } from 'sonner';

import { teamAPI, userAPI, hackathonAPI } from '../../../../services/api';

export function TeamFormation() {
  const [searchTerm, setSearchTerm] = useState('');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [myTeams, setMyTeams] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create Team State
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedHackathonId, setSelectedHackathonId] = useState<string>('');
  
  // Edit Team State
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null);
  const [editTeamName, setEditTeamName] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [recs, teams, invites, hacks] = await Promise.all([
        userAPI.getRecommendations(),
        teamAPI.listMyTeams(),
        teamAPI.listInvitations(),
        hackathonAPI.list({ limit: 10 }),
      ]);
      setRecommendations(recs);
      setMyTeams(teams);
      setInvitations(invites);
      setHackathons(hacks.items || hacks);
      if ((hacks.items || hacks).length > 0) {
        setSelectedHackathonId(String((hacks.items || hacks)[0].id));
      }
    } catch (error) {
      toast.error('Failed to load team data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    if (hackathons.length === 0) {
      toast.error('No active hackathons found to create a team for.');
      return;
    }
    if (!selectedHackathonId) {
      toast.error('Please select a hackathon.');
      return;
    }
    try {
      await teamAPI.createTeam({ 
        hackathon_id: parseInt(selectedHackathonId), 
        name: newTeamName 
      });
      toast.success('Team created!');
      setNewTeamName('');
      fetchData();
    } catch (error) {
      toast.error('Failed to create team');
    }
  };

  const handleEditTeam = async (teamId: number) => {
    try {
      await teamAPI.updateTeam(teamId, { name: editTeamName });
      toast.success('Team updated!');
      setEditingTeamId(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to update team');
    }
  };

  const handleInvite = async (userId: number, name: string) => {
    if (myTeams.length === 0) {
      toast.error('You must create a team first before inviting others!');
      return;
    }
    // Default to the first team they are a leader of
    const leadTeam = myTeams.find(t => t.members.find((m: any) => m.role === 'leader'));
    if (!leadTeam) {
      toast.error('You must be a team leader to invite members.');
      return;
    }

    try {
      await teamAPI.inviteUser(leadTeam.id, userId);
      toast.success(`Invitation sent to ${name}!`);
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to send invite');
    }
  };

  const handleAccept = async (memberId: number) => {
    try {
      await teamAPI.acceptInvitation(memberId);
      toast.success('Invitation accepted!');
      fetchData();
    } catch (error) {
      toast.error('Failed to accept');
    }
  };

  const handleReject = async (memberId: number) => {
    try {
      await teamAPI.rejectInvitation(memberId);
      toast.success('Invitation rejected');
      fetchData();
    } catch (error) {
      toast.error('Failed to reject');
    }
  };

  const handleDeleteTeam = async (teamId: number) => {
    if (!window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) return;
    try {
      await teamAPI.deleteTeam(teamId);
      toast.success('Team deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete team');
    }
  };

  const handleRemoveMember = async (teamId: number, userId: number, userName: string) => {
    if (!window.confirm(`Remove ${userName} from the team?`)) return;
    try {
      await teamAPI.removeMember(teamId, userId);
      toast.success('Member removed');
      fetchData();
    } catch (error) {
      toast.error('Failed to remove member');
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
          Team Formation
        </h1>
        <p className="text-gray-400 mt-2">Find perfect teammates with AI-powered matching</p>
      </div>

      {/* Invitations Inbox */}
      {invitations.length > 0 && (
        <Card className="border-cyan-500/30 bg-cyan-500/5 backdrop-blur-sm shadow-lg shadow-cyan-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-cyan-400" />
              Pending Invitations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {invitations.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                <div>
                  <h3 className="font-semibold text-lg">{invite.team_name}</h3>
                  <p className="text-sm text-gray-400">Invited to join as {invite.role}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleAccept(invite.id)}
                    className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30"
                  >
                    <Check className="w-4 h-4 mr-1" /> Accept
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleReject(invite.id)}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <X className="w-4 h-4 mr-1" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Create Team Card */}
      <Card id="create-team-card" className="border-cyan-500/30 bg-gradient-to-r from-cyan-500/5 to-purple-500/5">
        <CardHeader>
          <CardTitle className="text-xl">Create a New Team</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2 w-full">
              <label className="text-sm font-medium text-gray-400">Select Hackathon</label>
              <Select value={selectedHackathonId} onValueChange={setSelectedHackathonId}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Choose a hackathon" />
                </SelectTrigger>
                <SelectContent className="bg-[#12121a] border-white/10">
                  {hackathons.map((h) => (
                    <SelectItem key={h.id} value={String(h.id)}>
                      {h.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-2 w-full">
              <label className="text-sm font-medium text-gray-400">Team Name</label>
              <Input
                placeholder="Enter a cool team name..."
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                className="bg-white/5 border-white/10"
              />
            </div>
            <Button onClick={handleCreateTeam} className="bg-cyan-500 hover:bg-cyan-600 px-8">
              Create Team
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* My Teams */}
      <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
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
                  className="p-4 rounded-lg border border-white/10 hover:bg-white/5 transition-all group"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        {editingTeamId === team.id ? (
                          <div className="flex gap-2 items-center">
                            <Input
                              value={editTeamName}
                              onChange={(e) => setEditTeamName(e.target.value)}
                              className="bg-white/5 border-white/10 h-8"
                              autoFocus
                            />
                            <Button size="sm" variant="ghost" onClick={() => handleEditTeam(team.id)}>
                              <Check className="w-4 h-4 text-green-400" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingTeamId(null)}>
                              <X className="w-4 h-4 text-red-400" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{team.name}</h3>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => {
                                  setEditingTeamId(team.id);
                                  setEditTeamName(team.name);
                                }}
                                className="p-1 hover:bg-white/10 rounded"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-gray-400 hover:text-cyan-400" />
                              </button>
                              <button 
                                onClick={() => handleDeleteTeam(team.id)}
                                className="p-1 hover:bg-red-500/10 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-400" />
                              </button>
                            </div>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Trophy className="w-3 h-3" />
                          {team.hackathon_name || 'Hackathon ID: ' + team.hackathon_id}
                        </p>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 capitalize">
                        Active
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Members</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {team.members.map((m: any) => (
                          <div key={m.user_id} className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m.full_name}`} />
                                <AvatarFallback>{m.full_name.slice(0, 1)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{m.full_name}</p>
                                <p className="text-[10px] text-gray-500 capitalize">{m.role}</p>
                              </div>
                            </div>
                            {m.role !== 'leader' && (
                              <button 
                                onClick={() => handleRemoveMember(team.id, m.user_id, m.full_name)}
                                className="p-1 hover:bg-red-500/10 rounded text-gray-500 hover:text-red-400 transition-colors"
                              >
                                <UserMinus className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">
              You're not in any team yet. Create one or wait for an invitation!
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
        <CardContent id="ai-recommendations">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <p className="text-gray-400">Loading AI Recommendations...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {recommendations.length === 0 ? (
                <p className="text-gray-400 col-span-2 text-center py-4">No recommendations found. Try adding more skills to your profile!</p>
              ) : (
                recommendations.map((user, i) => (
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
                            onClick={() => handleInvite(user.id, user.name)}
                            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white shadow-lg shadow-cyan-500/20"
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
                ))
              )}
            </div>
          )}
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
