import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Eye, EyeOff, Crown, Medal, Award, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Switch } from '../../ui/switch';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { toast } from 'sonner';
import { hackathonAPI, submissionAPI } from '../../../../services/api';

export function AdminLeaderboard() {
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [selectedHackathonId, setSelectedHackathonId] = useState<string>('');
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(true); // Default to public

  // Load hackathons
  useEffect(() => {
    const load = async () => {
      try {
        const data = await hackathonAPI.list({ limit: 100 });
        const list = data.items || data;
        setHackathons(list);
        if (list.length > 0) setSelectedHackathonId(String(list[0].id));
      } catch {
        toast.error('Failed to load hackathons');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Load leaderboard when selection changes
  useEffect(() => {
    if (!selectedHackathonId) return;
    const load = async () => {
      setEntriesLoading(true);
      try {
        const hackathon = hackathons.find(h => String(h.id) === selectedHackathonId);
        const isJirathon = hackathon?.category?.startsWith('jirathon-');

        if (isJirathon) {
          const module = hackathon.category.replace('jirathon-', '');
          const res = await fetch(`http://localhost:8000/leaderboard/${module}`);
          if (!res.ok) throw new Error('Failed to fetch jirathon leaderboard');
          const data = await res.json();
          const mapped = data.map((item: any, i: number) => ({
            rank: i + 1,
            team_id: item.team_name,
            title: item.team_name,
            score: item.score,
            tech_stack: `Stage ${item.stage - 1} Cleared`
          }));
          setEntries(mapped);
        } else {
          const data = await submissionAPI.getLeaderboard(parseInt(selectedHackathonId));
          setEntries(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Leaderboard load error:', err);
        setEntries([]);
      } finally {
        setEntriesLoading(false);
      }
    };
    load();
  }, [selectedHackathonId, hackathons]);

  const togglePublic = () => {
    setIsPublic(!isPublic);
    toast.success(
      isPublic ? 'Leaderboard is now private' : 'Leaderboard is now public'
    );
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2: return <Medal className="w-5 h-5 text-gray-300" />;
      case 3: return <Award className="w-5 h-5 text-amber-600" />;
      default: return <span className="text-gray-400">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30';
      case 2: return 'from-gray-400/20 to-slate-400/20 border-gray-400/30';
      case 3: return 'from-amber-600/20 to-orange-600/20 border-amber-600/30';
      default: return 'from-white/5 to-white/5 border-white/10';
    }
  };

  const selectedHackathon = hackathons.find(h => String(h.id) === selectedHackathonId);

  return (
    <motion.div
      id="admin-leaderboard-view"
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
              {loading ? (
                <div className="flex items-center gap-2 text-gray-400 text-sm mt-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading hackathons...
                </div>
              ) : (
                <Select value={selectedHackathonId} onValueChange={setSelectedHackathonId}>
                  <SelectTrigger className="bg-white/5 border-white/10 mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f0f1a] border-white/10">
                    {hackathons.map((l) => (
                      <SelectItem key={l.id} value={String(l.id)}>
                        {l.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {selectedHackathonId && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {isPublic ? (
                    <Eye className="w-5 h-5 text-green-400" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-400">
                    {isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="public-toggle">Make Public</Label>
                  <Switch
                    id="public-toggle"
                    checked={isPublic}
                    onCheckedChange={togglePublic}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Display */}
      {selectedHackathonId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                {selectedHackathon?.title} Leaderboard
                {entriesLoading && <RefreshCw className="w-4 h-4 text-gray-500 animate-spin ml-auto" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {entriesLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin mb-3" />
                  Loading rankings...
                </div>
              ) : entries.length === 0 ? (
                <p className="text-center text-gray-400 py-10">No submissions found for this hackathon.</p>
              ) : (
                entries.map((entry, i) => (
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
                      <div className="flex items-center justify-center w-12">
                        {getRankIcon(entry.rank)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-lg">{entry.title || `Team ${entry.team_id}`}</h3>
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
                        {entry.tech_stack && (
                           <p className="text-sm text-gray-400 mb-1">{entry.tech_stack}</p>
                        )}
                        <div className="flex flex-wrap gap-1">
                           <span className="text-xs px-2 py-1 rounded bg-white/5 text-gray-300">
                             Team ID: {entry.team_id}
                           </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                          {entry.score ?? '—'}
                        </div>
                        <p className="text-xs text-gray-400">points</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
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
                <p className="text-2xl font-bold">{entries.length}</p>
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
                  {entries[0]?.score || 0}
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
                {isPublic ? (
                  <Eye className="w-6 h-6 text-white" />
                ) : (
                  <EyeOff className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {isPublic ? 'Public' : 'Private'}
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
