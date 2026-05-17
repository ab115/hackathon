import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Users, Upload, Download, Shield, UserCheck, UserX,
  ChevronLeft, ChevronRight, RefreshCw, Loader2, X, AlertTriangle,
  Edit2, Check, Building2, Phone, MapPin, Calendar, BookOpen, Plus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Label } from '../../ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../ui/select';
import { toast } from 'sonner';
import { adminAPI } from '../../../../services/api';

const ROLES = ['student', 'admin', 'judge', 'mentor'];
const PAGE_SIZE = 25;

const roleBadge = (role: string) => ({
  admin:   'bg-red-500/20 text-red-400 border-red-500/30',
  judge:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  mentor:  'bg-purple-500/20 text-purple-400 border-purple-500/30',
  student: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
} as Record<string, string>)[role] ?? 'bg-gray-500/20 text-gray-400';

// ── Inline Edit Cell ──────────────────────────────────────────────────────────
function RoleSelect({ userId, currentRole, onUpdated }: { userId: number; currentRole: string; onUpdated: () => void }) {
  const [saving, setSaving] = useState(false);
  const onChange = async (role: string) => {
    setSaving(true);
    try {
      await adminAPI.updateUser(userId, { role });
      toast.success('Role updated');
      onUpdated();
    } catch {
      toast.error('Failed to update role');
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="flex items-center gap-2">
      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" /> : null}
      <Select value={currentRole} onValueChange={onChange} disabled={saving}>
        <SelectTrigger className="h-7 text-xs bg-white/5 border-white/10 w-[90px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ROLES.map((r) => <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

// ── User Detail Drawer ────────────────────────────────────────────────────────
function UserDrawer({ user, onClose, onUpdated }: { user: any; onClose: () => void; onUpdated: () => void }) {
  const [deactivating, setDeactivating] = useState(false);

  const handleDeactivate = async () => {
    if (!confirm(`Deactivate ${user.full_name}? They will lose login access.`)) return;
    setDeactivating(true);
    try {
      await adminAPI.deactivateUser(user.id);
      toast.success(`${user.full_name} deactivated`);
      onUpdated();
      onClose();
    } catch (e: any) {
      toast.error(e.message || 'Failed to deactivate user');
    } finally {
      setDeactivating(false);
    }
  };

  const handleReactivate = async () => {
    try {
      await adminAPI.updateUser(user.id, { is_active: true });
      toast.success(`${user.full_name} reactivated`);
      onUpdated();
      onClose();
    } catch {
      toast.error('Failed to reactivate user');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex justify-end"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative w-full max-w-md h-full bg-[#0d0d1a] border-l border-white/10 flex flex-col shadow-2xl"
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-lg font-bold">User Details</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-md text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 flex items-center justify-center text-xl font-bold text-cyan-300">
              {user.full_name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <p className="text-lg font-semibold">{user.full_name}</p>
              <p className="text-sm text-gray-400">{user.email}</p>
              <div className="mt-1 flex items-center gap-2">
                <Badge className={`text-xs ${roleBadge(user.role)}`}>{user.role}</Badge>
                {!user.is_active && <Badge className="text-xs bg-red-500/20 text-red-400 border-red-500/30">Inactive</Badge>}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3 text-sm">
            {[
              { icon: Phone, label: 'Phone', value: user.phone },
              { icon: Building2, label: 'College', value: user.college },
              { icon: MapPin, label: 'Location', value: [user.city, user.state].filter(Boolean).join(', ') },
              { icon: Calendar, label: 'Joined', value: user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A' },
              { icon: BookOpen, label: 'Hackathons', value: `${user.hackathons_count || 0} registered` },
            ].map(({ icon: Icon, label, value }) => value ? (
              <div key={label} className="flex items-start gap-3 text-gray-300">
                <Icon className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p>{value}</p>
                </div>
              </div>
            ) : null)}

            {user.skills && (
              <div className="flex items-start gap-3 text-gray-300">
                <BookOpen className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Skills</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {user.skills.split(',').filter(Boolean).map((s: string) => (
                      <span key={s} className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs">{s.trim()}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Role change */}
          <div className="border-t border-white/10 pt-4">
            <p className="text-xs text-gray-400 mb-2">Change Role</p>
            <RoleSelect userId={user.id} currentRole={user.role} onUpdated={onUpdated} />
          </div>
        </div>

        <div className="p-5 border-t border-white/10">
          {user.is_active ? (
            <Button
              variant="destructive"
              className="w-full"
              disabled={deactivating}
              onClick={handleDeactivate}
            >
              {deactivating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserX className="w-4 h-4 mr-2" />}
              Deactivate Account
            </Button>
          ) : (
            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleReactivate}>
              <UserCheck className="w-4 h-4 mr-2" /> Reactivate Account
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Add User Modal ──────────────────────────────────────────────────────────
function AddUserModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'student',
    college: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminAPI.createUser(formData);
      toast.success('User created successfully');
      onDone();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="relative bg-[#0d0d1a] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Plus className="w-5 h-5 text-cyan-400" /> Add New User
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-md text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="bg-white/5 border-white/10"
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-white/5 border-white/10"
              placeholder="john@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Initial Password *</Label>
            <Input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="bg-white/5 border-white/10"
              placeholder="••••••••"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-white/5 border-white/10"
                placeholder="10-digit number"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="college">College / Organization</Label>
            <Input
              id="college"
              value={formData.college}
              onChange={(e) => setFormData({ ...formData, college: e.target.value })}
              className="bg-white/5 border-white/10"
              placeholder="e.g., Stanford University"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              Create User
            </Button>
            <Button type="button" variant="outline" className="border-white/10" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Bulk Import Modal ──────────────────────────────────────────────────────────
function BulkImportModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const csv = 'full_name,email,password,role,college,phone,city,state\nJane Doe,jane@example.com,pass123,student,MIT,9876543210,Mumbai,Maharashtra';
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'scalegrad_users_template.csv';
    a.click();
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await adminAPI.bulkImportUsers(file);
      setResult(res);
      toast.success(res.message);
    } catch (e: any) {
      toast.error(e.message || 'Import failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="relative bg-[#0d0d1a] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Upload className="w-5 h-5 text-cyan-400" /> Bulk Import Users
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-md text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-sm text-gray-400">
            Upload a CSV file to create multiple user accounts at once.
            Duplicate emails are automatically skipped.
          </p>

          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <Download className="w-4 h-4" /> Download CSV template
          </button>

          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-white/10 hover:border-cyan-500/40 rounded-xl p-8 text-center cursor-pointer transition-colors"
          >
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".csv,text/csv"
              onChange={(e) => { setFile(e.target.files?.[0] ?? null); setResult(null); }}
            />
            <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            {file ? (
              <p className="text-sm text-cyan-400 font-medium">{file.name}</p>
            ) : (
              <>
                <p className="text-sm text-gray-400">Click to select a CSV file</p>
                <p className="text-xs text-gray-600 mt-1">Max 5MB</p>
              </>
            )}
          </div>

          {/* Result */}
          {result && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2 text-sm">
              <p className="font-medium text-white">{result.message}</p>
              {result.errors?.length > 0 && (
                <div className="text-red-400">
                  <p className="flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> {result.errors.length} row errors</p>
                  <ul className="mt-1 space-y-0.5 text-xs text-gray-400">
                    {result.errors.slice(0, 5).map((e: any, i: number) => (
                      <li key={i}>Row {e.row}: {e.reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t border-white/10">
          <Button
            className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
            disabled={!file || uploading}
            onClick={handleUpload}
          >
            {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importing...</> : 'Import Users'}
          </Button>
          {result && (
            <Button variant="outline" className="border-white/10" onClick={() => { onDone(); onClose(); }}>
              Done
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main ManageUsers ──────────────────────────────────────────────────────────
export function ManageUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { skip: page * PAGE_SIZE, limit: PAGE_SIZE };
      if (search) params.search = search;
      if (roleFilter !== 'all') params.role = roleFilter;
      if (statusFilter === 'active') params.is_active = true;
      if (statusFilter === 'inactive') params.is_active = false;
      const data = await adminAPI.listUsers(params);
      setUsers(data.users);
      setTotal(data.total);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Debounce search
  useEffect(() => {
    setPage(0);
  }, [search, roleFilter, statusFilter]);

  const exportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Role', 'College', 'Phone', 'City', 'State', 'Active', 'Hackathons', 'Joined'];
    const rows = users.map((u) => [
      u.id, u.full_name, u.email, u.role, u.college, u.phone,
      u.city, u.state, u.is_active ? 'Yes' : 'No', u.hackathons_count,
      u.created_at ? new Date(u.created_at).toLocaleDateString() : '',
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v: any) => `"${v ?? ''}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `scalegrad_users_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast.success('Users exported');
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              User Management
            </h1>
            <p className="text-gray-400 mt-2">
              {total.toLocaleString()} total users · search, filter, edit roles, and bulk import
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="border-white/10 text-gray-300 hover:text-white" onClick={exportCSV}>
              <Download className="w-4 h-4 mr-1.5" /> Export CSV
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-white/10 text-gray-300 hover:text-white"
              onClick={() => setShowAddUser(true)}
            >
              <Plus className="w-4 h-4 mr-1.5" /> Add User
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white"
              onClick={() => setShowImport(true)}
            >
              <Upload className="w-4 h-4 mr-1.5" /> Bulk Import
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
          <CardContent className="p-4 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search name, email, college..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white/5 border-white/10 pl-9 h-9"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-2.5 text-gray-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(0); }}>
              <SelectTrigger className="w-[130px] h-9 bg-white/5 border-white/10 text-sm">
                <Shield className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {ROLES.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
              <SelectTrigger className="w-[130px] h-9 bg-white/5 border-white/10 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-9" onClick={fetchUsers}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                <p className="text-gray-400 text-sm">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-20 text-gray-500">No users found matching your filters.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm" id="admin-users-table">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">User</th>
                      <th className="text-left text-xs text-gray-500 font-medium px-4 py-3 hidden md:table-cell">College</th>
                      <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Role</th>
                      <th className="text-left text-xs text-gray-500 font-medium px-4 py-3 hidden lg:table-cell">Hackathons</th>
                      <th className="text-left text-xs text-gray-500 font-medium px-4 py-3 hidden lg:table-cell">Joined</th>
                      <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Status</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, i) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b border-white/5 hover:bg-white/3 transition-colors cursor-pointer"
                        onClick={() => setSelectedUser(user)}
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 flex items-center justify-center text-xs font-bold text-cyan-300 shrink-0">
                              {user.full_name?.[0]?.toUpperCase() ?? '?'}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate max-w-[160px]">{user.full_name}</p>
                              <p className="text-xs text-gray-500 truncate max-w-[160px]">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-400 hidden md:table-cell text-xs">
                          {user.college || '—'}
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <RoleSelect userId={user.id} currentRole={user.role} onUpdated={fetchUsers} />
                        </td>
                        <td className="px-4 py-3 text-gray-400 hidden lg:table-cell text-xs">
                          {user.hackathons_count || 0}
                        </td>
                        <td className="px-4 py-3 text-gray-400 hidden lg:table-cell text-xs">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`text-xs ${user.is_active ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            className="p-1.5 hover:bg-white/10 rounded-md text-gray-500 hover:text-white transition-colors"
                            onClick={(e) => { e.stopPropagation(); setSelectedUser(user); }}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}</span>
            <div className="flex gap-2">
              <Button
                size="sm" variant="outline"
                className="border-white/10 h-8 w-8 p-0"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="flex items-center px-3">Page {page + 1} / {totalPages}</span>
              <Button
                size="sm" variant="outline"
                className="border-white/10 h-8 w-8 p-0"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Drawers / Modals */}
      <AnimatePresence>
        {selectedUser && (
          <UserDrawer
            key="user-drawer"
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
            onUpdated={() => { fetchUsers(); setSelectedUser(null); }}
          />
        )}
        {showImport && (
          <BulkImportModal
            key="bulk-import"
            onClose={() => setShowImport(false)}
            onDone={fetchUsers}
          />
        )}
        {showAddUser && (
          <AddUserModal
            key="add-user"
            onClose={() => setShowAddUser(false)}
            onDone={fetchUsers}
          />
        )}
      </AnimatePresence>
    </>
  );
}
