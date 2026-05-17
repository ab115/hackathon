import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Users, IndianRupee, Trophy, Search, Filter, ExternalLink, Clock, Loader2, UserPlus, Info, BookOpen, ListChecks, Timer, FileCode } from 'lucide-react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { ScrollArea } from '../../ui/scroll-area';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { hackathonAPI, paymentAPI, teamAPI } from '../../../../services/api';
import { useAuth } from '../../../../context/AuthContext';

interface Hackathon {
  id: number; title: string; description?: string; category?: string;
  status: string; start_date?: string; end_date?: string;
  registration_fee: number; prize_pool: number; max_teams?: number;
  team_size: number; is_public: boolean; banner_image?: string;
  problem_statement?: string; problem_statement_file?: string; rules?: string; timeline?: string;
}

export function BrowseHackathons() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [userRegistrations, setUserRegistrations] = useState<number[]>([]);
  const [myTeams, setMyTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null);
  const [viewDetailsHackathon, setViewDetailsHackathon] = useState<Hackathon | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [hackathonData, registrationData, teamData] = await Promise.all([
        hackathonAPI.list({ status: 'open', limit: 50 }),
        user ? hackathonAPI.getMyRegistrations() : Promise.resolve([]),
        user ? teamAPI.listMyTeams() : Promise.resolve([])
      ]);
      
      setHackathons(Array.isArray(hackathonData) ? hackathonData : []);
      setUserRegistrations((registrationData || []).map((r: any) => r.hackathon_id));
      setMyTeams(teamData || []);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const isRegistered = (hackathonId: number) => userRegistrations.includes(hackathonId);

  const filtered = hackathons.filter(h =>
    h.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (h.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTeamForHackathon = (hackathonId: number) => 
    myTeams.find(t => t.hackathon_id === hackathonId);

  const handleRegister = async () => {
    if (!selectedHackathon || !user) return;
    setRegistering(true);

    try {
      if (selectedHackathon.registration_fee === 0) {
        // Free registration
        await hackathonAPI.registerFree(selectedHackathon.id);
        toast.success('Registration Successful! 🎉', {
          description: `You're registered for ${selectedHackathon.title}.`,
        });
        setSelectedHackathon(null);
      } else {
        // Paid registration — initiate PayU flow
        toast.loading('Initialising payment...', { id: 'pay' });
        const result = await paymentAPI.initiatePayment({
          hackathon_id: selectedHackathon.id,
          amount: selectedHackathon.registration_fee,
          email: user.email,
          phone: user.phone || '9999999999',
        });
        toast.dismiss('pay');
        setSelectedHackathon(null);

        // Navigate to PayU simulator with all required params
        const params = new URLSearchParams({
          txnid:           result.transaction_id,
          registration_id: String(result.registration_id),
          amount:          result.amount_details.total_formatted.replace(/[^\d.]/g, ''),
          base_amount:     String(result.amount_details.base_amount),
          gst_amount:      String(result.amount_details.gst_amount),
          productinfo:     `${selectedHackathon.title} Registration`,
          email:           user.email,
        });
        navigate(`/payu-simulator?${params.toString()}`);
      }
    } catch (err: any) {
      toast.dismiss('pay');
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  const getCategoryStyle = (cat?: string) => {
    const map: Record<string, string> = {
      FinTech:    'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      'AI/ML':    'bg-purple-500/20 text-purple-400 border-purple-500/30',
      Web3:       'bg-pink-500/20 text-pink-400 border-pink-500/30',
      IoT:        'bg-green-500/20 text-green-400 border-green-500/30',
      HealthTech: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    };
    return map[cat || ''] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const formatINR = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
        <p className="text-gray-400">Loading hackathons...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Browse Hackathons
        </h1>
        <p className="text-gray-400 mt-2">Find and register for upcoming hackathons across India</p>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1" id="student-search-bar">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search by name or category..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/5 border-white/10"
          />
        </div>
        <Button variant="outline" className="border-white/10">
          <Filter className="w-4 h-4 mr-2" /> Filters
        </Button>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-20">
          <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No hackathons found. Check back soon!</p>
        </div>
      )}

      {/* Grid */}
      <div className="grid md:grid-cols-2 gap-6" id="student-hackathons-list">
        {filtered.map((hackathon, i) => (
          <motion.div
            key={hackathon.id}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Card className="relative overflow-hidden border-white/10 bg-black/40 backdrop-blur-sm h-full hover:border-cyan-500/30 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5 opacity-50" />
              <CardContent className="relative p-6 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {hackathon.category && (
                        <Badge className={getCategoryStyle(hackathon.category)}>{hackathon.category}</Badge>
                      )}
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
                    <h3 className="text-xl font-bold mb-2">{hackathon.title}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{hackathon.description}</p>
                  </div>
                    <Button 
                      size="sm" variant="ghost" 
                      id={i === 0 ? "hackathon-details-btn" : undefined}
                      onClick={() => setViewDetailsHackathon(hackathon)}
                      className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                    >
                      <Info className="w-4 h-4 mr-1" />
                      Details
                    </Button>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-4">
                  {hackathon.start_date && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Calendar className="w-4 h-4 text-cyan-400" />
                      {new Date(hackathon.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {hackathon.end_date && ` — ${new Date(hackathon.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      {formatINR(hackathon.prize_pool)} Prize
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <IndianRupee className="w-4 h-4 text-green-400" />
                      {hackathon.registration_fee === 0 ? 'Free Entry' : formatINR(hackathon.registration_fee)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Users className="w-4 h-4 text-purple-400" />
                    Teams of {hackathon.team_size}
                  </div>
                  {isRegistered(hackathon.id) && (
                    <div className="flex items-center gap-2 p-2 rounded bg-cyan-500/10 border border-cyan-500/20 mt-2">
                      <Users className="w-4 h-4 text-cyan-400" />
                      <div className="flex-1">
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Your Team</p>
                        <p className="text-sm font-semibold text-cyan-100">
                          {getTeamForHackathon(hackathon.id)?.name || 'No team yet'}
                        </p>
                      </div>
                    </div>
                  )}
                  {isRegistered(hackathon.id) && hackathon.problem_statement_file && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2 border-orange-500/30 text-orange-400 hover:bg-orange-500/10 gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(hackathon.problem_statement_file, '_blank');
                      }}
                    >
                      <FileCode className="w-4 h-4" />
                      Download Project Files
                    </Button>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-white/10">
                  {isRegistered(hackathon.id) ? (
                    <div className="grid grid-cols-2 gap-3">
                      {!getTeamForHackathon(hackathon.id) ? (
                        <Button
                          onClick={() => navigate('/student/teams')}
                          className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Form Team
                        </Button>
                      ) : (
                        <Button
                          onClick={() => navigate('/student/teams')}
                          variant="outline"
                          className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                        >
                          <Users className="w-4 h-4 mr-2" />
                          View Team
                        </Button>
                      )}
                      <Button
                        onClick={() => navigate('/student/submissions')}
                        variant="outline"
                        className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Submit Project
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setSelectedHackathon(hackathon)}
                      className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white"
                    >
                      Register Now
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Registration Modal */}
      <Dialog open={!!selectedHackathon} onOpenChange={(open) => !open && setSelectedHackathon(null)}>
        <DialogContent className="bg-[#12121a] border-white/10 max-w-lg">
          {selectedHackathon && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedHackathon.title}</DialogTitle>
                <DialogDescription>{selectedHackathon.description}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Registration Fee</Label>
                    <p className="font-bold text-green-400 text-lg">
                      {selectedHackathon.registration_fee === 0
                        ? '🎉 Free'
                        : formatINR(selectedHackathon.registration_fee)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Prize Pool</Label>
                    <p className="font-bold text-yellow-400 text-lg">
                      {formatINR(selectedHackathon.prize_pool)}
                    </p>
                  </div>
                </div>

                {selectedHackathon.registration_fee > 0 && (
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-sm text-gray-300">
                    <p className="text-blue-400 font-semibold mb-1">💳 Payment via PayU India</p>
                    <p>18% GST will be added. You'll be redirected to our secure payment simulator.</p>
                  </div>
                )}

                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-sm">
                  <div className="flex items-center gap-2 text-yellow-400 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="font-semibold">Team Formation</span>
                  </div>
                  <p className="text-gray-300">You can form or join a team after registration.</p>
                </div>

                <Button
                  onClick={handleRegister} disabled={registering}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white"
                >
                  {registering ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                    </span>
                  ) : (
                    selectedHackathon.registration_fee === 0 ? 'Confirm Free Registration' : `Pay ${formatINR(selectedHackathon.registration_fee)} & Register`
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Detail View Modal */}
      <Dialog open={!!viewDetailsHackathon} onOpenChange={(open) => !open && setViewDetailsHackathon(null)}>
        <DialogContent className="bg-[#0a0a0f] border-white/10 max-w-[95vw] w-full max-h-[95vh] p-0 overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-2xl">
          {viewDetailsHackathon && (
            <>
              <div className="relative h-48 w-full">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent z-10" />
                <img 
                  src={viewDetailsHackathon.banner_image || `https://api.dicebear.com/7.x/identicon/svg?seed=${viewDetailsHackathon.id}`} 
                  alt={viewDetailsHackathon.title}
                  className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute bottom-6 left-8 z-20">
                  <Badge className={getCategoryStyle(viewDetailsHackathon.category)}>{viewDetailsHackathon.category}</Badge>
                  <h2 className="text-3xl font-bold mt-2">{viewDetailsHackathon.title}</h2>
                </div>
              </div>
              <div className="flex-1 overflow-hidden" id="hackathon-details-popup">
                <ScrollArea className="h-[calc(95vh-200px)]" id="hackathon-details-scroll">
                  <div className="flex flex-col lg:flex-row h-full">
                    {/* Left Column: Core Info & Problem Statement (Main Content) */}
                    <div className="lg:w-2/3 p-8 lg:p-12 space-y-12 border-r border-white/5">
                      {/* About Section */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 text-cyan-400">
                          <BookOpen className="w-6 h-6" />
                          <h4 className="text-2xl font-bold uppercase tracking-widest">The Brief</h4>
                        </div>
                        <p className="text-gray-300 leading-relaxed text-lg font-normal">
                          {viewDetailsHackathon.description}
                        </p>
                        {viewDetailsHackathon.problem_statement_file && (
                          <div className="pt-4">
                             <Button 
                               onClick={() => window.open(viewDetailsHackathon.problem_statement_file, '_blank')}
                               className="bg-orange-600 hover:bg-orange-700 text-white gap-2 px-6 py-4 rounded-xl shadow-lg shadow-orange-500/20"
                             >
                               <Package className="w-5 h-5" />
                               Download Challenge Materials (.zip/.jar)
                             </Button>
                          </div>
                        )}
                      </div>

                      {/* Problem Statement Section */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 text-purple-400">
                          <Trophy className="w-6 h-6" />
                          <h4 className="text-2xl font-bold uppercase tracking-widest">Problem Statement</h4>
                        </div>
                        
                        {viewDetailsHackathon.problem_statement && (
                          <div className="text-gray-300 leading-relaxed whitespace-pre-wrap pl-6 border-l-2 border-purple-500/30 text-base">
                            {viewDetailsHackathon.problem_statement}
                          </div>
                        )}

                        {viewDetailsHackathon.problem_statement_file && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-gray-400">
                                <FileCode className="w-4 h-4" />
                                <span className="text-sm font-medium">Detailed Resource Documentation</span>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                                onClick={() => window.open(viewDetailsHackathon.problem_statement_file, '_blank')}
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Open in Tab
                              </Button>
                            </div>
                            <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-white/10 bg-black">
                              {viewDetailsHackathon.problem_statement_file.toLowerCase().endsWith('.pdf') ? (
                                <object 
                                  data={viewDetailsHackathon.problem_statement_file}
                                  type="application/pdf"
                                  className="w-full h-full"
                                >
                                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-gray-400 p-8 text-center">
                                    <FileCode className="w-12 h-12 opacity-20" />
                                    <p>Your browser does not support inline PDF viewing.</p>
                                    <Button 
                                      className="bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border-cyan-500/30"
                                      onClick={() => window.open(viewDetailsHackathon.problem_statement_file, '_blank')}
                                    >
                                      Download to View
                                    </Button>
                                  </div>
                                </object>
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-6 text-gray-500 p-12">
                                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                                    <FileCode className="w-10 h-10 opacity-40" />
                                  </div>
                                  <div className="text-center space-y-2">
                                    <p className="text-lg font-medium text-gray-300">Preview Unavailable</p>
                                    <p className="text-sm max-w-xs">This file type cannot be previewed in the browser. Please download it to view the content.</p>
                                    <Button 
                                      className="mt-4 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border-cyan-500/30"
                                      onClick={() => window.open(viewDetailsHackathon.problem_statement_file, '_blank')}
                                    >
                                      Download Asset
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {!viewDetailsHackathon.problem_statement && !viewDetailsHackathon.problem_statement_file && (
                          <div className="py-12 text-center text-gray-500 italic bg-white/5 rounded-2xl border border-dashed border-white/10">
                            The full challenge specifics will be unlocked at the event start.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Meta Info, Rules, Timeline (Sidebar) */}
                    <div className="lg:w-1/3 bg-white/[0.02] p-8 lg:p-12 space-y-10">
                      {/* Quick Stats Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                          <p className="text-[10px] text-gray-500 uppercase font-black tracking-tighter mb-1">Prize Pool</p>
                          <p className="text-2xl font-black text-yellow-400 leading-none">{formatINR(viewDetailsHackathon.prize_pool)}</p>
                        </div>
                        <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                          <p className="text-[10px] text-gray-500 uppercase font-black tracking-tighter mb-1">Entry Fee</p>
                          <p className="text-2xl font-black text-green-400 leading-none">
                            {viewDetailsHackathon.registration_fee === 0 ? 'FREE' : formatINR(viewDetailsHackathon.registration_fee)}
                          </p>
                        </div>
                        <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                          <p className="text-[10px] text-gray-500 uppercase font-black tracking-tighter mb-1">Team Size</p>
                          <p className="text-2xl font-black text-purple-400 leading-none">{viewDetailsHackathon.team_size}</p>
                        </div>
                        <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                          <p className="text-[10px] text-gray-500 uppercase font-black tracking-tighter mb-1">Start Date</p>
                          <p className="text-2xl font-black text-cyan-400 leading-none">
                            {viewDetailsHackathon.start_date ? new Date(viewDetailsHackathon.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'TBD'}
                          </p>
                        </div>
                      </div>

                      {/* Rules */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-gray-400">
                          <ListChecks className="w-5 h-5" />
                          <h4 className="text-sm font-bold uppercase tracking-widest">Ground Rules</h4>
                        </div>
                        <div className="text-gray-400 leading-relaxed text-sm space-y-3 bg-white/5 p-6 rounded-2xl border border-white/5">
                          {viewDetailsHackathon.rules ? (
                            <div className="whitespace-pre-wrap">{viewDetailsHackathon.rules}</div>
                          ) : (
                            <ul className="list-disc space-y-2 ml-4">
                              <li>Original project development</li>
                              <li>Strict adherence to Code of Conduct</li>
                              <li>Submissions must be on-time</li>
                            </ul>
                          )}
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Timer className="w-5 h-5" />
                          <h4 className="text-sm font-bold uppercase tracking-widest">Timeline</h4>
                        </div>
                        <div className="space-y-6 bg-white/5 p-6 rounded-2xl border border-white/5 relative">
                          {viewDetailsHackathon.timeline ? (
                            <div className="text-gray-400 text-sm whitespace-pre-wrap">{viewDetailsHackathon.timeline}</div>
                          ) : (
                            <div className="space-y-6">
                              <div className="flex gap-4">
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 ring-4 ring-cyan-500/20" />
                                <div>
                                  <p className="text-sm font-bold text-white">Registrations Open</p>
                                  <p className="text-xs text-gray-500">Live now</p>
                                </div>
                              </div>
                              <div className="flex gap-4 opacity-40">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5" />
                                <div>
                                  <p className="text-sm font-bold text-white">Hackathon Launch</p>
                                  <p className="text-xs text-gray-500">Starts {viewDetailsHackathon.start_date ? new Date(viewDetailsHackathon.start_date).toLocaleDateString() : 'soon'}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </div>

              <div className="p-8 border-t border-white/5 bg-black/60 backdrop-blur-md flex justify-between items-center">
                <div className="flex items-center gap-4">
                  {isRegistered(viewDetailsHackathon.id) && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-sm font-bold text-green-400 uppercase tracking-tighter">Registration Confirmed</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-4">
                  <Button variant="ghost" id="close-details-btn" onClick={() => setViewDetailsHackathon(null)} className="px-8 text-gray-400">Close</Button>
                  {!isRegistered(viewDetailsHackathon.id) && (
                    <Button 
                      className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-12 py-6 text-lg font-bold shadow-xl shadow-cyan-500/20 rounded-xl"
                      onClick={() => {
                        setSelectedHackathon(viewDetailsHackathon);
                        setViewDetailsHackathon(null);
                      }}
                    >
                      Secure Your Spot
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

