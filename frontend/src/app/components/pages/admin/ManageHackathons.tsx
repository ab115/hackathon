import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Edit, Trash2, Eye, EyeOff, Users, DollarSign, Calendar,
  MoreVertical, Loader2, X, Download, Building2, Phone,
  CreditCard, UserCheck, Trophy, ChevronRight, Search,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { hackathonAPI } from '../../../../services/api';

// ── Registrations Slide-Over ──────────────────────────────────────────────────
function RegistrationsPanel({
  hackathon,
  onClose,
}: {
  hackathon: any;
  onClose: () => void;
}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const result = await hackathonAPI.getRegistrations(hackathon.id);
        setData(result);
      } catch {
        toast.error('Failed to load registrations');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [hackathon.id]);

  const filtered = data?.registrations?.filter((r: any) => {
    const q = search.toLowerCase();
    return (
      !q ||
      r.full_name?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.college?.toLowerCase().includes(q) ||
      r.team?.team_name?.toLowerCase().includes(q)
    );
  }) ?? [];

  const exportCSV = () => {
    if (!data?.registrations?.length) return;
    const headers = ['Name', 'Email', 'Phone', 'College', 'Team', 'Team Role', 'Payment Status', 'Fee (₹)', 'Transaction ID', 'Registered At'];
    const rows = data.registrations.map((r: any) => [
      r.full_name, r.email, r.phone, r.college,
      r.team?.team_name ?? 'No Team', r.team?.role ?? '-',
      r.payment_status, r.registration_fee, r.transaction_id,
      r.registered_at ? new Date(r.registered_at).toLocaleString() : '',
    ]);
    const csv = [headers, ...rows].map((row) => row.map((v: any) => `"${v ?? ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${hackathon.title.replace(/\s+/g, '_')}_registrations.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  const paymentBadge = (status: string) => {
    const map: Record<string, string> = {
      SUCCESS: 'bg-green-500/20 text-green-400 border-green-500/30',
      FREE: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      FAILED: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return map[status] ?? 'bg-gray-500/20 text-gray-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex justify-end"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative w-full max-w-2xl h-full bg-[#0d0d1a] border-l border-white/10 flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/10 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              Registrations
            </h2>
            <p className="text-sm text-gray-400 mt-0.5 truncate max-w-sm">{hackathon.title}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-white/10 text-gray-300 hover:text-white"
              onClick={exportCSV}
              disabled={!data?.registrations?.length}
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export CSV
            </Button>
            <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-gray-400">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats row */}
        {data && (
          <div className="grid grid-cols-3 gap-3 p-4 border-b border-white/10 shrink-0">
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-cyan-400">{data.total}</p>
              <p className="text-xs text-gray-400 mt-0.5">Total Registered</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-400">
                {data.registrations.filter((r: any) => r.team).length}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">In a Team</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-purple-400">
                ₹{data.registrations.reduce((s: number, r: any) => s + (r.registration_fee || 0), 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Total Revenue</p>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="p-4 border-b border-white/10 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search by name, email, college, or team..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/5 border-white/10 pl-9 h-9 text-sm"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-gray-400 text-sm">Loading registrations...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              {search ? 'No results match your search.' : 'No registrations yet.'}
            </div>
          ) : (
            filtered.map((reg: any, i: number) => (
              <motion.div
                key={reg.registration_id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-xl border border-white/8 bg-white/3 p-4 space-y-3"
              >
                {/* Row 1: name + badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 flex items-center justify-center shrink-0 text-sm font-bold text-cyan-300">
                      {reg.full_name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">{reg.full_name}</p>
                      <p className="text-xs text-gray-400 truncate">{reg.email}</p>
                    </div>
                  </div>
                  <Badge className={`shrink-0 text-xs ${paymentBadge(reg.payment_status)}`}>
                    {reg.payment_status}
                  </Badge>
                </div>

                {/* Row 2: metadata */}
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                  {reg.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3" /> {reg.phone}
                    </span>
                  )}
                  {reg.college && (
                    <span className="flex items-center gap-1.5 truncate">
                      <Building2 className="w-3 h-3 shrink-0" />
                      <span className="truncate">{reg.college}</span>
                    </span>
                  )}
                  {reg.registration_fee > 0 && (
                    <span className="flex items-center gap-1.5">
                      <CreditCard className="w-3 h-3" /> ₹{reg.registration_fee}
                    </span>
                  )}
                  {reg.registered_at && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      {new Date(reg.registered_at).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Row 3: team */}
                {reg.team ? (
                  <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-2">
                    <Trophy className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="text-xs text-purple-300 font-medium">{reg.team.team_name}</span>
                    <span className="text-xs text-gray-500 ml-auto capitalize">{reg.team.role}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
                    <UserCheck className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    <span className="text-xs text-gray-500">No team yet</span>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main ManageHackathons ─────────────────────────────────────────────────────
export function ManageHackathons() {
  const navigate = useNavigate();
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingRegistrations, setViewingRegistrations] = useState<any | null>(null);

  const fetchHackathons = async () => {
    try {
      setLoading(true);
      const data = await hackathonAPI.list({ limit: 100, include_private: true });
      setHackathons(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load hackathons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHackathons(); }, []);

  const togglePublic = async (hackathon: any) => {
    try {
      await hackathonAPI.update(hackathon.id, { is_public: !hackathon.is_public } as any);
      toast.success('Visibility updated');
      fetchHackathons();
    } catch {
      toast.error('Failed to update visibility');
    }
  };

  const deleteHackathon = async (id: number) => {
    if (!confirm('Are you sure you want to delete this hackathon?')) return;
    try {
      await hackathonAPI.delete(id);
      setHackathons(hackathons.filter((h) => h.id !== id));
      toast.success('Hackathon deleted');
    } catch {
      toast.error('Failed to delete hackathon');
    }
  };

  const statusColor = (s: string) => ({
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    open: 'bg-green-500/20 text-green-400 border-green-500/30',
    upcoming: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    completed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    closed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    draft: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  } as Record<string, string>)[s] ?? 'bg-gray-500/20 text-gray-400';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
        <p className="text-gray-400">Loading your hackathons...</p>
      </div>
    );
  }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Manage Hackathons
            </h1>
            <p className="text-gray-400 mt-2">View, edit, and manage all your hackathon events</p>
          </div>
          <Button
            onClick={() => navigate('/admin/create')}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white"
          >
            Create New
          </Button>
        </div>

        <div className="space-y-4" id="manage-hackathons-list">
          {hackathons.length === 0 ? (
            <Card className="border-dashed border-white/10 bg-transparent p-12 text-center">
              <p className="text-gray-500">No hackathons created yet.</p>
            </Card>
          ) : (
            hackathons.map((hackathon, i) => (
              <motion.div
                key={hackathon.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <Card className="border-white/10 bg-black/40 backdrop-blur-sm hover:border-white/20 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {/* Title row */}
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <h3 className="text-xl font-bold truncate">{hackathon.title}</h3>
                          <Badge className={statusColor(hackathon.status)}>{hackathon.status}</Badge>
                          {hackathon.category && (
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">{hackathon.category}</Badge>
                          )}
                          {hackathon.is_public ? (
                            <Eye className="w-4 h-4 text-green-400" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          )}
                        </div>

                        {/* Stats row */}
                        <div className="grid md:grid-cols-4 gap-4 mt-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                            <div>
                              <p className="text-xs text-gray-400">Duration</p>
                              <p className="text-sm font-medium">
                                {hackathon.start_date ? new Date(hackathon.start_date).toLocaleDateString() : 'N/A'}
                                {' – '}
                                {hackathon.end_date ? new Date(hackathon.end_date).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-cyan-400 shrink-0" />
                            <div>
                              <p className="text-xs text-gray-400">Registrations</p>
                              <p className="text-sm font-medium">{hackathon.registration_count || 0}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-purple-400 shrink-0" />
                            <div>
                              <p className="text-xs text-gray-400">Submissions</p>
                              <p className="text-sm font-medium">{hackathon.submission_count || 0}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-400 shrink-0" />
                            <div>
                              <p className="text-xs text-gray-400">Revenue</p>
                              <p className="text-sm font-medium">₹{(hackathon.total_revenue || 0).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>

                        {/* View registrations inline CTA */}
                        <button
                          onClick={() => setViewingRegistrations(hackathon)}
                          className="mt-4 flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          <Users className="w-3.5 h-3.5" />
                          View {hackathon.registration_count || 0} registrations & teams
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Actions menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-2 hover:bg-white/10 rounded-md transition-colors outline-none ml-4">
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#1a1a2e] border-white/10 text-white min-w-[170px] z-[100] shadow-2xl">
                          <DropdownMenuItem
                            className="cursor-pointer focus:bg-white/10 focus:text-white"
                            onClick={() => setViewingRegistrations(hackathon)}
                          >
                            <Users className="w-4 h-4 mr-2 text-cyan-400" /> View Registrations
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer focus:bg-white/10 focus:text-white"
                            onClick={() => navigate(`/admin/edit/${hackathon.id}`)}
                          >
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer focus:bg-white/10 focus:text-white"
                            onClick={() => togglePublic(hackathon)}
                          >
                            {hackathon.is_public ? (
                              <><EyeOff className="w-4 h-4 mr-2" /> Make Private</>
                            ) : (
                              <><Eye className="w-4 h-4 mr-2" /> Make Public</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-400"
                            onClick={() => deleteHackathon(hackathon.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Registrations slide-over */}
      <AnimatePresence>
        {viewingRegistrations && (
          <RegistrationsPanel
            hackathon={viewingRegistrations}
            onClose={() => setViewingRegistrations(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
