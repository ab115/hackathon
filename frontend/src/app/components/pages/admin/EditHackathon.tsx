import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Edit, Calendar, Users, Loader2, Upload, X, FileCode, FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Switch } from '../../ui/switch';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router';
import { hackathonAPI } from '../../../../services/api';

export function EditHackathon() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDocUploading, setIsDocUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    status: 'open',
    startDate: '',
    endDate: '',
    registrationStart: '',
    registrationEnd: '',
    registrationFee: '0',
    prizePool: '0',
    maxTeams: '',
    teamSize: '4',
    isPublic: true,
    bannerImage: '',
    problemStatement: '',
    problemStatementFile: '',
    rules: '',
    timeline: '',
  });

  useEffect(() => {
    const fetchHackathon = async () => {
      try {
        if (!id) return;
        const data = await hackathonAPI.getById(parseInt(id));
        const toLocal = (iso: string | null | undefined) =>
          iso ? new Date(iso).toISOString().slice(0, 16) : '';
        setFormData({
          name: data.title || '',
          description: data.description || '',
          category: data.category || '',
          status: data.status || 'open',
          startDate: toLocal(data.start_date),
          endDate: toLocal(data.end_date),
          registrationStart: toLocal(data.registration_start),
          registrationEnd: toLocal(data.registration_end),
          registrationFee: data.registration_fee?.toString() ?? '0',
          prizePool: data.prize_pool?.toString() ?? '0',
          maxTeams: data.max_teams?.toString() ?? '',
          teamSize: data.team_size?.toString() ?? '4',
          isPublic: data.is_public ?? true,
          bannerImage: data.banner_image || '',
          problemStatement: data.problem_statement || '',
          problemStatementFile: data.problem_statement_file || '',
          rules: data.rules || '',
          timeline: data.timeline || '',
        });
      } catch {
        toast.error('Failed to load hackathon details.');
        navigate('/admin/manage');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHackathon();
  }, [id, navigate]);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData((f) => ({ ...f, [key]: e.target.value }));

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const result = await hackathonAPI.uploadBanner(file);
      setFormData((f) => ({ ...f, bannerImage: (result as any).banner_url }));
      toast.success('Banner uploaded!');
    } catch {
      toast.error('Failed to upload banner');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsDocUploading(true);
    try {
      const result = await hackathonAPI.uploadProblemStatement(file);
      setFormData((f) => ({ ...f, problemStatementFile: (result as any).file_url }));
      toast.success('Document uploaded!');
    } catch {
      toast.error('Failed to upload document');
    } finally {
      setIsDocUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsSubmitting(true);
    try {
      const toISO = (s: string) => (s ? new Date(s).toISOString() : undefined);
      const payload: any = {
        title: formData.name,
        description: formData.description,
        category: formData.category,
        status: formData.status,
        start_date: toISO(formData.startDate),
        end_date: toISO(formData.endDate),
        registration_start: toISO(formData.registrationStart),
        registration_end: toISO(formData.registrationEnd),
        registration_fee: parseFloat(formData.registrationFee) || 0,
        prize_pool: parseFloat(formData.prizePool) || 0,
        team_size: parseInt(formData.teamSize) || 4,
        max_teams: formData.maxTeams ? parseInt(formData.maxTeams) : undefined,
        is_public: formData.isPublic,
        banner_image: formData.bannerImage || undefined,
        problem_statement: formData.problemStatement || undefined,
        problem_statement_file: formData.problemStatementFile || undefined,
        rules: formData.rules || undefined,
        timeline: formData.timeline || undefined,
      };

      await hackathonAPI.update(parseInt(id), payload);
      toast.success('Hackathon updated successfully!');
      setTimeout(() => navigate('/admin/manage'), 1200);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update hackathon.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
        <p className="text-gray-400">Loading hackathon details...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Edit Hackathon
        </h1>
        <p className="text-gray-400 mt-2">Update event details and settings</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Basic Information ──────────────────── */}
        <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-cyan-400" /> Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Hackathon Name *</Label>
              <Input id="name" required value={formData.name} onChange={set('name')} className="bg-white/5 border-white/10" />
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea id="description" required rows={4} value={formData.description} onChange={set('description')} className="bg-white/5 border-white/10" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData((f) => ({ ...f, category: v }))}>
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fintech">FinTech</SelectItem>
                    <SelectItem value="ai-ml">AI/ML</SelectItem>
                    <SelectItem value="web3">Web3/Blockchain</SelectItem>
                    <SelectItem value="iot">IoT</SelectItem>
                    <SelectItem value="deeptech">DeepTech</SelectItem>
                    <SelectItem value="healthtech">HealthTech</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData((f) => ({ ...f, status: v }))}>
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Schedule ───────────────────────────── */}
        <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" /> Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Hackathon Start *</Label>
              <Input id="startDate" type="datetime-local" required value={formData.startDate} onChange={set('startDate')} className="bg-white/5 border-white/10" />
            </div>
            <div>
              <Label htmlFor="endDate">Hackathon End *</Label>
              <Input id="endDate" type="datetime-local" required value={formData.endDate} onChange={set('endDate')} className="bg-white/5 border-white/10" />
            </div>
            <div>
              <Label htmlFor="registrationStart">Registration Opens</Label>
              <Input id="registrationStart" type="datetime-local" value={formData.registrationStart} onChange={set('registrationStart')} className="bg-white/5 border-white/10" />
            </div>
            <div>
              <Label htmlFor="registrationEnd">Registration Closes</Label>
              <Input id="registrationEnd" type="datetime-local" value={formData.registrationEnd} onChange={set('registrationEnd')} className="bg-white/5 border-white/10" />
            </div>
          </CardContent>
        </Card>

        {/* ── Participants & Fees ────────────────── */}
        <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-pink-400" /> Participants & Registration
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="registrationFee">Registration Fee (₹) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400 text-sm">₹</span>
                <Input id="registrationFee" type="number" required value={formData.registrationFee} onChange={set('registrationFee')} className="bg-white/5 border-white/10 pl-7" />
              </div>
            </div>
            <div>
              <Label htmlFor="prizePool">Prize Pool (₹) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400 text-sm">₹</span>
                <Input id="prizePool" type="number" required value={formData.prizePool} onChange={set('prizePool')} className="bg-white/5 border-white/10 pl-7" />
              </div>
            </div>
            <div>
              <Label htmlFor="maxTeams">Maximum Teams</Label>
              <Input id="maxTeams" type="number" value={formData.maxTeams} onChange={set('maxTeams')} className="bg-white/5 border-white/10" />
            </div>
            <div>
              <Label htmlFor="teamSize">Max Team Size *</Label>
              <Input id="teamSize" type="number" required value={formData.teamSize} onChange={set('teamSize')} className="bg-white/5 border-white/10" />
            </div>
          </CardContent>
        </Card>

        {/* ── Extended Details ───────────────────── */}
        <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-yellow-400" /> Extended Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Problem Statement */}
            <div>
              <Label htmlFor="problemStatement">Problem Statement</Label>
              <Textarea
                id="problemStatement"
                rows={5}
                value={formData.problemStatement}
                onChange={set('problemStatement')}
                placeholder="The core challenge participants need to solve..."
                className="bg-white/5 border-white/10 mt-1"
              />
            </div>

            {/* Problem Statement Document */}
            <div>
              <Label>Problem Statement Document (PDF/DOCX)</Label>
              <div className="mt-2">
                {formData.problemStatementFile ? (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                    <FileCode className="w-5 h-5 text-cyan-400 shrink-0" />
                    <span className="text-sm text-gray-300 truncate flex-1">
                      {formData.problemStatementFile.split('/').pop()}
                    </span>
                    <Button
                      type="button" variant="ghost" size="sm"
                      onClick={() => setFormData((f) => ({ ...f, problemStatementFile: '' }))}
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 p-3 rounded-lg border border-dashed border-white/20 hover:border-cyan-500/50 transition-colors cursor-pointer group">
                    <input type="file" className="hidden" accept=".pdf,.docx,.txt" onChange={handleDocUpload} disabled={isDocUploading} />
                    {isDocUploading ? (
                      <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                    )}
                    <span className="text-sm text-gray-400">{isDocUploading ? 'Uploading...' : 'Upload document (PDF/DOCX)'}</span>
                  </label>
                )}
              </div>
            </div>

            {/* Rules */}
            <div>
              <Label htmlFor="rules">Rules & Guidelines</Label>
              <Textarea
                id="rules"
                rows={4}
                value={formData.rules}
                onChange={set('rules')}
                placeholder="Guidelines, judging criteria, and conduct rules..."
                className="bg-white/5 border-white/10 mt-1"
              />
            </div>

            {/* Timeline */}
            <div>
              <Label htmlFor="timeline">Event Timeline</Label>
              <Textarea
                id="timeline"
                rows={4}
                value={formData.timeline}
                onChange={set('timeline')}
                placeholder="Key milestones (e.g., 9:00 AM – Opening Ceremony)..."
                className="bg-white/5 border-white/10 mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Settings ───────────────────────────── */}
        <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Make Hackathon Public</Label>
                <p className="text-sm text-gray-400">Allow anyone to view and register</p>
              </div>
              <Switch
                checked={formData.isPublic}
                onCheckedChange={(checked) => setFormData((f) => ({ ...f, isPublic: checked }))}
              />
            </div>

            <div className="border-t border-white/10 pt-4">
              <Label>Banner Image</Label>
              <div className="mt-2">
                {formData.bannerImage ? (
                  <div className="relative w-full h-40 rounded-lg overflow-hidden group">
                    <img src={formData.bannerImage} alt="Banner" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        type="button" variant="destructive" size="sm"
                        onClick={() => setFormData((f) => ({ ...f, bannerImage: '' }))}
                      >
                        <X className="w-4 h-4 mr-2" /> Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <label className="w-full border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-cyan-500/30 transition-colors cursor-pointer group flex flex-col items-center">
                    <input type="file" className="hidden" accept="image/*" onChange={handleBannerUpload} disabled={isUploading} />
                    {isUploading ? (
                      <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
                    ) : (
                      <Upload className="w-8 h-8 text-gray-400 mb-2 group-hover:text-cyan-400 transition-colors" />
                    )}
                    <p className="text-sm text-gray-400">{isUploading ? 'Uploading...' : 'Click to upload banner image'}</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                  </label>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Actions ────────────────────────────── */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white min-w-[140px]"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </span>
            ) : (
              'Save Changes'
            )}
          </Button>
          <Button type="button" variant="outline" className="border-white/10" onClick={() => navigate('/admin/manage')}>
            Cancel
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
