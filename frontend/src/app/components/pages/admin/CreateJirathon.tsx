import { useState } from 'react';
import { motion } from 'motion/react';
import { Zap, Calendar, Users, Upload, X, FileCode, Loader2, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Switch } from '../../ui/switch';
import { toast } from 'sonner';
import { hackathonAPI } from '../../../../services/api';

export function CreateJirathon() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isJarUploading, setIsJarUploading] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    challengeModule: 'rogue_override',
    startDate: '',
    endDate: '',
    teamSize: '4',
    maxTeams: '',
    isPublic: true,
    banner_image: '',
    rules: '',
    timeline: '',
    skills: [] as string[],
    jarFiles: [] as string[],
    jirathonStages: '10',
    difficulty: 'intermediate',
  });

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const result = await hackathonAPI.uploadBanner(file);
      setFormData(f => ({ ...f, banner_image: (result as any).banner_url }));
      toast.success('Banner uploaded!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload banner');
    } finally { setIsUploading(false); }
  };

  const handleJarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setIsJarUploading(true);
    try {
      // Upload each file using the doc upload endpoint (reuse for ZIP/JAR)
      const uploads = await Promise.all(files.map(f => hackathonAPI.uploadProblemStatement(f)));
      const urls = uploads.map((r: any) => r.file_url);
      setFormData(f => ({ ...f, jarFiles: [...f.jarFiles, ...urls] }));
      toast.success(`${files.length} file(s) uploaded!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload files');
    } finally { setIsJarUploading(false); }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(f => ({ ...f, skills: [...f.skills, skillInput.trim()] }));
      setSkillInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.name,
        description: formData.description,
        category: `jirathon-${formData.challengeModule}`,
        start_date: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        end_date: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        registration_start: new Date().toISOString(),
        registration_end: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        registration_fee: 0,
        prize_pool: 0,
        team_size: parseInt(formData.teamSize) || 4,
        max_teams: formData.maxTeams ? parseInt(formData.maxTeams) : undefined,
        is_public: formData.isPublic,
        banner_image: formData.banner_image,
        rules: formData.rules,
        timeline: formData.timeline,
        problem_statement: formData.description,
        problem_statement_file: formData.jarFiles[0] || undefined, // Store primary challenge file
      };
      await hackathonAPI.create(payload as any);
      toast.success('Jirathon challenge created!', { description: `${formData.name} is now live.` });
    } catch (err: any) {
      toast.error(err.message || 'Failed to create Jirathon.');
    } finally { setIsSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            Jirathon Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Challenge Name *</Label>
            <Input required value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g., Rogue Override — Season 2" className="bg-white/5 border-white/10 mt-1" />
          </div>
          <div>
            <Label>Description *</Label>
            <Textarea required rows={3} value={formData.description}
              onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
              placeholder="Describe the challenge, its theme, and what participants will debug/solve..."
              className="bg-white/5 border-white/10 mt-1" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Challenge Module *</Label>
              <Select value={formData.challengeModule} onValueChange={v => setFormData(f => ({ ...f, challengeModule: v }))}>
                <SelectTrigger className="bg-white/5 border-white/10 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rogue_override">Rogue Override Protocol</SelectItem>
                  <SelectItem value="project_chronos">Project Chronos: Temporal Heist</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Difficulty</Label>
              <Select value={formData.difficulty} onValueChange={v => setFormData(f => ({ ...f, difficulty: v }))}>
                <SelectTrigger className="bg-white/5 border-white/10 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Number of Stages</Label>
            <Input type="number" min="1" max="20" value={formData.jirathonStages}
              onChange={e => setFormData(f => ({ ...f, jirathonStages: e.target.value }))}
              className="bg-white/5 border-white/10 mt-1" />
          </div>
        </CardContent>
      </Card>

      {/* Schedule */}
      <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Start Date & Time *</Label>
            <Input type="datetime-local" required value={formData.startDate}
              onChange={e => setFormData(f => ({ ...f, startDate: e.target.value }))}
              className="bg-white/5 border-white/10 mt-1" />
          </div>
          <div>
            <Label>End Date & Time *</Label>
            <Input type="datetime-local" required value={formData.endDate}
              onChange={e => setFormData(f => ({ ...f, endDate: e.target.value }))}
              className="bg-white/5 border-white/10 mt-1" />
          </div>
        </CardContent>
      </Card>

      {/* Participants */}
      <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-pink-400" />Participants
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Max Teams</Label>
            <Input type="number" value={formData.maxTeams}
              onChange={e => setFormData(f => ({ ...f, maxTeams: e.target.value }))}
              placeholder="e.g., 50" className="bg-white/5 border-white/10 mt-1" />
          </div>
          <div>
            <Label>Team Size</Label>
            <Input type="number" value={formData.teamSize}
              onChange={e => setFormData(f => ({ ...f, teamSize: e.target.value }))}
              placeholder="e.g., 4" className="bg-white/5 border-white/10 mt-1" />
          </div>
        </CardContent>
      </Card>

      {/* Challenge Files (JARs / ZIPs) */}
      <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-400" />Challenge Files (JAR / ZIP)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-400">Upload the project JARs, ZIPs, or any starter files students will download.</p>
          {formData.jarFiles.length > 0 && (
            <div className="space-y-2">
              {formData.jarFiles.map((url, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                  <FileCode className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span className="text-sm text-gray-300 truncate flex-1">{url.split('/').pop()}</span>
                  <button type="button" onClick={() => setFormData(f => ({ ...f, jarFiles: f.jarFiles.filter((_, j) => j !== i) }))}>
                    <X className="w-4 h-4 text-gray-400 hover:text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <label className="flex items-center gap-3 p-4 rounded-lg border border-dashed border-white/20 hover:border-cyan-500/50 transition-colors cursor-pointer group">
            <input type="file" className="hidden" accept=".jar,.zip,.tar.gz" multiple onChange={handleJarUpload} disabled={isJarUploading} />
            {isJarUploading ? <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" /> : <Upload className="w-5 h-5 text-gray-400 group-hover:text-cyan-400" />}
            <span className="text-sm text-gray-400">{isJarUploading ? 'Uploading...' : 'Click to upload JAR / ZIP files'}</span>
          </label>
        </CardContent>
      </Card>

      {/* Required Skills */}
      <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
        <CardHeader><CardTitle>Required Skills</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input value={skillInput} onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              placeholder="e.g., Java, React, Debugging" className="bg-white/5 border-white/10" />
            <Button type="button" onClick={addSkill} variant="outline" className="border-white/10">Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.skills.map(skill => (
              <span key={skill} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-sm">
                {skill}
                <button type="button" onClick={() => setFormData(f => ({ ...f, skills: f.skills.filter(s => s !== skill) }))}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
        <CardHeader><CardTitle>Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Make Public</Label>
              <p className="text-sm text-gray-400">Visible in Browse Hackathons and student dashboards</p>
            </div>
            <Switch checked={formData.isPublic} onCheckedChange={checked => setFormData(f => ({ ...f, isPublic: checked }))} />
          </div>
          <div className="border-t border-white/10 pt-4">
            <Label>Banner Image</Label>
            {formData.banner_image ? (
              <div className="relative w-full h-40 rounded-lg overflow-hidden mt-2 group">
                <img src={formData.banner_image} alt="Banner" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button type="button" variant="destructive" size="sm" onClick={() => setFormData(f => ({ ...f, banner_image: '' }))}>
                    <X className="w-4 h-4 mr-2" /> Remove
                  </Button>
                </div>
              </div>
            ) : (
              <label className="mt-2 w-full border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-cyan-500/30 transition-colors cursor-pointer group flex flex-col items-center">
                <input type="file" className="hidden" accept="image/*" onChange={handleBannerUpload} disabled={isUploading} />
                {isUploading ? <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-2" /> : <Upload className="w-8 h-8 text-gray-400 mb-2 group-hover:text-cyan-400" />}
                <p className="text-sm text-gray-400">{isUploading ? 'Uploading...' : 'Click to upload banner'}</p>
              </label>
            )}
          </div>
          <div>
            <Label>Rules & Guidelines</Label>
            <Textarea value={formData.rules} onChange={e => setFormData(f => ({ ...f, rules: e.target.value }))}
              placeholder="Stage rules, scoring criteria, what constitutes a valid key..." rows={3}
              className="bg-white/5 border-white/10 mt-1" />
          </div>
          <div>
            <Label>Event Timeline</Label>
            <Textarea value={formData.timeline} onChange={e => setFormData(f => ({ ...f, timeline: e.target.value }))}
              placeholder="Key milestones (e.g., 9:00 AM - Challenge Begins)..." rows={3}
              className="bg-white/5 border-white/10 mt-1" />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}
          className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white min-w-[160px]">
          {isSubmitting ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Creating...</span> : 'Launch Jirathon'}
        </Button>
        <Button type="button" variant="outline" className="border-white/10">Save as Draft</Button>
      </div>
    </form>
  );
}
