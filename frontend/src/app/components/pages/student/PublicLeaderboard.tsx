import { motion } from 'motion/react';
import { Trophy, Crown, Medal, Award, Search, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { useState, useEffect } from 'react';
import { hackathonAPI, submissionAPI } from '../../../../services/api';
import { toast } from 'sonner';

export function PublicLeaderboard() {
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [selectedHackathonId, setSelectedHackathonId] = useState<string>('');
  const [entries, setEntries] = useState<any[]>([]);
  const [hackLoading, setHackLoading] = useState(true);
  const [rankLoading, setRankLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load hackathon list once
  useEffect(() => {
    const load = async () => {
      try {
        const data = await hackathonAPI.list({ limit: 50 });
        const list = data.items || data;
        setHackathons(list);
        if (list.length > 0) setSelectedHackathonId(String(list[0].id));
      } catch {
        toast.error('Failed to load hackathons');
      } finally {
        setHackLoading(false);
      }
    };
    load();
  }, []);

  // Load leaderboard whenever hackathon selection changes
  useEffect(() => {
    if (!selectedHackathonId) return;
    const load = async () => {
      setRankLoading(true);
      try {
        const hackathon = hackathons.find(h => String(h.id) === selectedHackathonId);
        const isJirathon = hackathon?.category?.startsWith('jirathon-');

        if (isJirathon) {
          const module = hackathon.category.replace('jirathon-', '');
          const res = await fetch(`/jirathon-api/leaderboard/${module}`);
          if (!res.ok) throw new Error('Failed to fetch jirathon leaderboard');
          const data = await res.json();
          // Map Jirathon format to Leaderboard format
          const mapped = data.map((item: any, i: number) => ({
            rank: i + 1,
            team_id: item.team_name, // use name as ID for display
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
        setRankLoading(false);
      }
    };
    load();
  }, [selectedHackathonId, hackathons]);

  const filtered = entries.filter(e =>
    !searchTerm ||
    (e.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(e.team_id).includes(searchTerm)
  );

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2: return <Medal className="w-6 h-6 text-gray-300" />;
      case 3: return <Award className="w-6 h-6 text-amber-600" />;
      default: return <span className="text-gray-400 text-lg font-bold">#{rank}</span>;
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

  const topScore = entries[0]?.score ?? 0;
  const avgScore = entries.length
    ? Math.round(entries.reduce((s, e) => s + (e.score || 0), 0) / entries.length)
    : 0;

  return (
    <motion.div
      id="student-leaderboard-view"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Leaderboard
        </h1>
        <p className="text-gray-400 mt-2">Live rankings from the backend · cached every 5 minutes</p>
      </div>

      {/* Hackathon selector */}
      <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
        <CardContent className="p-4 flex gap-4 items-center">
          <div className="flex-1">
            {hackLoading ? (
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading hackathons...
              </div>
            ) : (
              <Select value={selectedHackathonId} onValueChange={setSelectedHackathonId}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Select a hackathon" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f0f1a] border-white/10">
                  {hackathons.map(h => (
                    <SelectItem key={h.id} value={String(h.id)}>{h.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white/5 border-white/10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats derived from live data */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { label: 'Total Teams', value: entries.length, color: 'from-cyan-500 to-blue-500' },
          { label: 'Top Score', value: topScore || '—', color: 'from-yellow-500 to-orange-500' },
          { label: 'Avg Score', value: avgScore || '—', color: 'from-purple-500 to-pink-500' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
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

      {/* Leaderboard */}
      <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Rankings
            {rankLoading && <RefreshCw className="w-4 h-4 text-gray-500 animate-spin ml-auto" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {rankLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mb-3" />
              Loading rankings...
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-10">
              {entries.length === 0
                ? 'No submissions yet for this hackathon.'
                : 'No results match your search.'}
            </p>
          ) : (
            filtered.map((entry, i) => (
              <motion.div
                key={entry.rank ?? i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`relative p-4 rounded-lg border bg-gradient-to-r ${getRankColor(entry.rank)}`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-16">
                    {getRankIcon(entry.rank)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-lg">{entry.title || `Team ${entry.team_id}`}</h3>
                      {entry.rank <= 3 && (
                        <Badge className={
                          entry.rank === 1 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                          : entry.rank === 2 ? 'bg-gray-400/20 text-gray-300 border-gray-400/30'
                          : 'bg-amber-600/20 text-amber-400 border-amber-600/30'
                        }>
                          {entry.rank === 1 ? '🏆 Winner' : entry.rank === 2 ? '🥈 2nd Place' : '🥉 3rd Place'}
                        </Badge>
                      )}
                    </div>
                    {entry.tech_stack && (
                      <p className="text-xs text-gray-500">{entry.tech_stack}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
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
  );
}
