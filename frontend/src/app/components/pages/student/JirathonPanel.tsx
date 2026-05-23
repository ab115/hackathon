import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Unlock, Trophy, Star, Zap, Users, Plus, Loader2, Link2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Badge } from '../../ui/badge';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { hackathonAPI, teamAPI } from '../../../../services/api';

const JIRATHON_API = '/jirathon-api';

// Full ScaleGrad logo SVG paths (viewBox 0 0 229 31)
// Left door shows left half: viewBox="0 0 114.5 31"
// Right door shows right half: viewBox="114.5 0 114.5 31"
const SG_ALL_PATHS = `
  <path d="M53.0055 12.4316C52.8846 10.8003 51.5252 9.92422 49.5313 9.92422C48.3531 9.92422 46.9635 10.1659 46.9635 11.0722C46.9635 12.1598 48.6552 12.4921 50.8001 12.8848C54.4857 13.5796 59.4402 14.4255 59.4402 19.4707C59.4402 23.972 54.8785 25.5127 50.0147 25.5127C44.4258 25.5127 40.2266 23.3376 40.2266 18.504L46.3593 17.8998C46.7218 20.0145 48.2323 20.6791 50.3772 20.6791C51.5554 20.6791 53.0055 20.3468 53.0055 19.5612C53.0055 18.4738 51.0116 18.1715 48.625 17.6882C45.03 16.9329 40.5287 15.8454 40.5287 11.1326C40.5287 6.63131 45.8155 5.09063 49.6219 5.09063C54.3951 5.09063 59.1381 7.32622 59.1381 12.1295L53.0055 12.4316ZM67.5712 15.1505C67.5712 17.6882 68.9608 19.8935 72.0423 19.8935C74.2778 19.8935 75.4862 18.5643 76.0904 16.4798L81.77 17.2048C81.2564 22.7938 77.2082 25.271 71.8912 25.271C65.2752 25.271 61.3177 21.102 61.5594 15.1505C61.8011 9.25962 65.2752 5.03021 72.0423 5.03021C77.329 5.03021 81.3168 7.93042 81.8002 13.1265L76.1206 13.8515C75.607 12.0993 74.6403 10.4982 71.9214 10.468C69.1723 10.4378 67.5712 12.6733 67.5712 15.1505ZM88.8596 24.9689H82.5155L88.7388 5.36252H97.7413L103.965 24.9689H97.6205L96.6539 21.7364H89.8263L88.8596 24.9689ZM91.3972 16.5704H95.0829L93.2402 10.4378L91.3972 16.5704ZM121.294 24.9689H106.098V5.36252H112.14V19.8332H121.294V24.9689ZM139.471 24.9689H124.124V5.36252H139.38V10.4982H130.166V12.7337H139.018V17.2956H130.166V19.8332H139.471V24.9689ZM158.483 24.9991V22.6427C157.244 24.1532 155.553 25.3012 153.286 25.3012C147.214 25.3314 142.985 21.3739 142.985 15.1505C142.985 8.86692 147.668 5 153.679 5C158.665 5 163.014 7.05432 163.558 12.4921L157.848 13.2171C157.305 11.3139 156.005 10.4076 153.982 10.4076C150.417 10.4076 148.996 12.4921 148.996 15.1505C148.996 17.6882 150.447 19.8935 153.438 19.8935C155.19 19.8935 157.003 19.803 158.241 18.2019L158.483 17.8694H154.132V14.1838H163.83V24.9991H158.483ZM172.973 24.9689H166.931V5.33231H176.629C181.039 5.33231 184.06 7.53761 184.06 11.7368C184.06 14.5161 183.365 17.084 180.042 17.8998L185.177 24.9689H178.199L174.091 19.3801H172.973V24.9689ZM172.973 14.3349H175.178C176.931 14.3349 178.018 13.7609 178.018 12.1598C178.018 10.6493 176.87 10.4076 175.149 10.4076H172.973V14.3349ZM191.822 24.9689H185.478L191.7 5.36252H200.704L206.927 24.9689H200.583L199.616 21.7364H192.789L191.822 24.9689ZM194.36 16.5704H198.044L196.203 10.4378L194.36 16.5704ZM217.489 24.9689H209.061V5.36252H217.489C225.253 5.36252 228.697 10.468 228.697 15.1808C228.697 19.8935 225.253 24.9689 217.489 24.9689ZM215.103 10.4982V19.8332H217.489C220.843 19.8332 222.565 17.9903 222.565 15.1808C222.565 12.4014 220.843 10.4982 217.489 10.4982H215.103Z" fill="white"/>
  <path d="M23.0318 16.5767H22.9981L4.99181 16.5357C4.99181 16.5357 4.62413 12.7373 6.56803 9.66246C6.93534 9.07673 7.37867 8.54233 7.88642 8.07305C7.88642 8.07305 10.3313 5.14332 14.5355 5.01294C14.5355 5.01294 17.3188 4.46654 20.5489 6.52762L27.5802 6.47049C27.5802 6.47049 25.0094 2.26922 18.9374 0.545054C18.1318 0.315765 17.3116 0.141529 16.4823 0.0235574C16.4823 0.0235574 14.285 -0.175667 11.449 0.584606C10.7169 0.781128 9.99931 1.02831 9.3015 1.32437C8.97775 1.4606 8.65109 1.61734 8.32442 1.77994C5.16907 3.39131 1.92436 6.42215 0.279298 12.1337C0.279298 12.1337 -0.855985 17.7134 1.4512 21.5397H19.9527C20.7915 20.9814 21.5007 20.2494 22.0319 19.393C22.5632 18.5368 22.9042 17.5763 23.0318 16.5767Z" fill="white"/>
  <path d="M29.0871 8.83984H10.379C8.01917 10.6475 7.40978 13.841 7.40978 13.841H7.43908L25.3443 14.0504C25.3443 14.0577 25.3443 14.065 25.3443 14.0724C25.6724 15.6267 25.1304 17.7507 25.1304 17.7507C24.4581 22.2509 19.58 24.4789 19.58 24.4789C15.2073 27.0439 9.86642 24.0174 9.86642 24.0174L2.84375 24.0585C5.95515 28.979 12.0535 30.1978 12.0535 30.1978C18.3187 31.5016 23.8267 27.8437 23.8267 27.8437C29.2468 24.1435 30.0509 18.5505 30.0509 18.5505C31.2727 13.0441 29.0871 8.83984 29.0871 8.83984Z" fill="white"/>
`;



function VaultOverlay({ show, message, onDone }: { show: boolean; message: string; onDone: () => void }) {
  const [doorsOpen, setDoorsOpen] = useState(false);

  useEffect(() => {
    if (!show) { setDoorsOpen(false); return; }
    const t1 = setTimeout(() => setDoorsOpen(true), 900);
    const t2 = setTimeout(onDone, 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
        >
          {/* Left door — shows left half of full ScaleGrad logo (viewBox clips right half) */}
          <motion.div
            animate={{ x: doorsOpen ? '-100%' : '0%' }}
            transition={{ duration: 2.2, ease: [0.7, 0, 0.3, 1] }}
            className="absolute left-0 top-0 w-1/2 h-full bg-[#0f0f1a] border-r border-white/10 flex items-center justify-end overflow-hidden"
          >
            <div className="mr-0" style={{ width: 221.5, height: 60, overflow: 'hidden', position: 'relative' }}>
              <svg
                viewBox="0 0 229 31"
                width="443"
                height="60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ position: 'absolute', left: 0 }}
                dangerouslySetInnerHTML={{ __html: SG_ALL_PATHS }}
              />
            </div>
          </motion.div>

          {/* Right door — shows right half of full ScaleGrad logo */}
          <motion.div
            animate={{ x: doorsOpen ? '100%' : '0%' }}
            transition={{ duration: 2.2, ease: [0.7, 0, 0.3, 1] }}
            className="absolute right-0 top-0 w-1/2 h-full bg-[#0f0f1a] border-l border-white/10 flex items-center justify-start overflow-hidden"
          >
            <div className="ml-0" style={{ width: 221.5, height: 60, overflow: 'hidden', position: 'relative' }}>
              <svg
                viewBox="0 0 229 31"
                width="443"
                height="60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ position: 'absolute', right: 0 }}
                dangerouslySetInnerHTML={{ __html: SG_ALL_PATHS }}
              />
            </div>
          </motion.div>

          {/* Center message — visible after doors open */}
          <AnimatePresence>
            {doorsOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.0 }}
                className="text-center z-10"
              >
                <Trophy className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                <p className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  {message}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function JirathonPanel() {
  const [teamName, setTeamName] = useState('');
  const [projectId, setProjectId] = useState('');
  const [selectedJirathonId, setSelectedJirathonId] = useState<string>('');
  const [stageKey, setStageKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{ stage: number; score: number } | null>(null);
  const [vaultMsg, setVaultMsg] = useState('');
  const [showVault, setShowVault] = useState(false);
  const [connected, setConnected] = useState(false);

  // Platform Data
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [myTeams, setMyTeams] = useState<any[]>([]);
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');

  const registeredJirathons = useMemo(() => {
    const regIds = new Set(registrations.map(r => r.hackathon_id));
    return hackathons.filter(h => regIds.has(h.id) && h.category?.startsWith('jirathon-'));
  }, [hackathons, registrations]);

  const selectedTeam = useMemo(() => {
    if (!selectedJirathonId) return null;
    return myTeams.find(t => String(t.hackathon_id) === selectedJirathonId);
  }, [myTeams, selectedJirathonId]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [regs, teams, hacks] = await Promise.all([
          hackathonAPI.getMyRegistrations(),
          teamAPI.listMyTeams(),
          hackathonAPI.list({ limit: 100 })
        ]);
        setRegistrations(regs);
        setMyTeams(teams);
        setHackathons(hacks.items || hacks);
      } catch (err) {
        console.error('Failed to load platform data:', err);
      } finally {
        setIsInitialLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      setTeamName(selectedTeam.name);
    } else {
      setTeamName('');
    }
    
    const event = registeredJirathons.find(h => String(h.id) === selectedJirathonId);
    if (event) {
      const module = event.category?.split('jirathon-')[1] || '';
      setProjectId(module);
    } else {
      setProjectId('');
    }
  }, [selectedJirathonId, selectedTeam, registeredJirathons]);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim() || !selectedJirathonId) return;
    setIsCreatingTeam(true);
    try {
      await teamAPI.createTeam({
        hackathon_id: parseInt(selectedJirathonId),
        name: newTeamName.trim()
      });
      const updatedTeams = await teamAPI.listMyTeams();
      setMyTeams(updatedTeams);
      toast.success('Team formed successfully!');
      setNewTeamName('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create team');
    } finally {
      setIsCreatingTeam(false);
    }
  };

  const fireConfetti = () => {
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#00d9ff', '#a855f7', '#ffffff'] });
    setTimeout(() => confetti({ particleCount: 80, spread: 120, origin: { y: 0.5 }, angle: 60 }), 400);
    setTimeout(() => confetti({ particleCount: 80, spread: 120, origin: { y: 0.5 }, angle: 120 }), 600);
  };

  const fetchProgress = async (team: string, proj: string) => {
    try {
      const res = await fetch(`${JIRATHON_API}/progress/${proj}/${team}`);
      const data = await res.json();
      setProgress({ stage: Math.min(data.stage, 11), score: data.score });
    } catch (_) {}
  };

  const handleConnect = async () => {
    if (!teamName.trim()) return;
    setConnected(true);
    await fetchProgress(teamName.trim(), projectId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stageKey.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${JIRATHON_API}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_name: teamName, project_id: projectId, key: stageKey }),
      });
      const data = await res.json();
      if (res.ok) {
        setStageKey('');
        const cleared = data.next_stage - 1;
        setVaultMsg(data.next_stage > 10 ? 'MODULE COMPLETE!' : `STAGE ${cleared} CLEARED`);
        setShowVault(true);
        fireConfetti();
        await fetchProgress(teamName, projectId);
      } else {
        toast.error('Access Denied', { description: data.detail });
      }
    } catch (_) {
      toast.error('Cannot reach Jirathon server. Ensure it is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  const stagePct = progress ? Math.min(((progress.stage - 1) / 10) * 100, 100) : 0;

  return (
    <>
      <VaultOverlay show={showVault} message={vaultMsg} onDone={() => setShowVault(false)} />

      <div className="space-y-4">
        {/* Module connect */}
        {!connected ? (
          <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                Initialize Challenge
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isInitialLoading ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                  <p className="text-sm text-gray-400">Loading your challenges...</p>
                </div>
              ) : registeredJirathons.length === 0 ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-gray-500">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-white font-medium">No Jirathons Found</p>
                    <p className="text-sm text-gray-400 mt-1">You haven't registered for any Jirathon challenges yet.</p>
                  </div>
                  <Button variant="outline" className="border-white/10" asChild>
                    <a href="/browse"><Link2 className="w-4 h-4 mr-2" />Browse Challenges</a>
                  </Button>
                </div>
              ) : (
                <>
                  <div>
                    <Label>Select Your Challenge</Label>
                    <Select value={selectedJirathonId} onValueChange={setSelectedJirathonId}>
                      <SelectTrigger className="bg-white/5 border-white/10 mt-1.5 h-12">
                        <SelectValue placeholder="Choose a registered Jirathon" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0f0f1a] border-white/10">
                        {registeredJirathons.map(h => (
                          <SelectItem key={h.id} value={String(h.id)} className="py-3">
                            <div className="flex flex-col">
                              <span className="font-medium text-white">{h.title}</span>
                              <span className="text-[10px] text-gray-500 uppercase tracking-wider">{h.category?.replace('jirathon-', '').replace('_', ' ')}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedJirathonId && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-2 border-t border-white/5">
                      {selectedTeam ? (
                        <div className="space-y-2">
                          <Label className="text-gray-400">Team Name</Label>
                          <div className="flex items-center gap-3 p-4 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
                            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                              <Users className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-white leading-none">{selectedTeam.name}</p>
                              <p className="text-[10px] text-cyan-400/70 mt-1 uppercase tracking-widest">Active Team</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label className="text-purple-400">Form a Team</Label>
                            <Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/5 text-[10px]">REQUIRED</Badge>
                          </div>
                          <div className="flex gap-2">
                            <Input
                              value={newTeamName}
                              onChange={(e) => setNewTeamName(e.target.value)}
                              placeholder="Enter team name..."
                              className="bg-white/5 border-white/10 h-11"
                            />
                            <Button 
                              onClick={handleCreateTeam}
                              disabled={isCreatingTeam || !newTeamName.trim()}
                              className="bg-purple-500 hover:bg-purple-600 text-white"
                            >
                              {isCreatingTeam ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            </Button>
                          </div>
                          <p className="text-[10px] text-gray-500 italic">Forming a team is required to sync progress across members.</p>
                        </div>
                      )}

                      <Button
                        onClick={handleConnect}
                        disabled={!selectedTeam}
                        className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white w-full h-12 font-bold shadow-lg shadow-cyan-500/20 mt-2"
                      >
                        Enter Vault Connection
                      </Button>
                    </motion.div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Progress Card */}
            {progress && (
              <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm text-gray-400">{teamName} · {projectId === 'rogue_override' ? 'Rogue Override' : 'Project Chronos'}</p>
                      <p className="text-2xl font-bold text-white mt-1">
                        Stage <span className="text-cyan-400">{progress.stage > 10 ? '✓' : progress.stage}</span> / 10
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Score</p>
                      <p className="text-2xl font-bold text-purple-400">{progress.score}</p>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${stagePct}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Start</span><span>{stagePct.toFixed(0)}% Complete</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Key Submission */}
            {(progress?.stage ?? 1) <= 10 && (
              <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Unlock className="w-5 h-5 text-purple-400" />
                    Submit Stage Key
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-sm text-cyan-300">
                      Solve the puzzle for Stage {progress?.stage ?? 1} and enter the key below.
                    </div>
                    <div>
                      <Label>Override Key</Label>
                      <Input
                        value={stageKey}
                        onChange={(e) => setStageKey(e.target.value)}
                        placeholder="Enter the stage key..."
                        className="bg-white/5 border-white/10 mt-1 font-mono"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        disabled={loading || !stageKey.trim()}
                        className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white flex-1"
                      >
                        {loading ? 'Authenticating...' : 'Authenticate Payload'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="border-white/10"
                        onClick={() => { setConnected(false); setProgress(null); }}
                      >
                        Disconnect
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Completion */}
            {(progress?.stage ?? 0) > 10 && (
              <Card className="border-cyan-500/30 bg-cyan-500/10">
                <CardContent className="pt-6 text-center">
                  <Star className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-white">Module Complete!</p>
                  <p className="text-gray-400 mt-1">All stages cleared · Final Score: <span className="text-cyan-400 font-bold">{progress?.score}</span></p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </>
  );
}
