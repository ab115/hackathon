import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Calendar, DollarSign, Users, Award, Upload, X, Loader2, FileCode, Zap, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Switch } from '../../ui/switch';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { hackathonAPI } from '../../../../services/api';
import { CreateJirathon } from './CreateJirathon';

type View = null | 'hackathon' | 'jirathon';

export function CreateHackathon() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    startDate: '',
    endDate: '',
    registrationFee: '',
    prizePool: '',
    maxTeams: '',
    teamSize: '4',
    isPublic: true,
    skills: [] as string[],
    banner_image: '',
    problem_statement: '',
    problem_statement_file: '',
    rules: '',
    timeline: '',
  });

  const [skillInput, setSkillInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDocUploading, setIsDocUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await hackathonAPI.uploadBanner(file);
      setFormData({ ...formData, banner_image: (result as any).banner_url });
      toast.success('Banner uploaded successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload banner');
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
      setFormData({ ...formData, problem_statement_file: (result as any).file_url });
      toast.success('Document uploaded successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload document');
    } finally {
      setIsDocUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Map frontend fields to backend schema
      // Backend expects: title, description, category, start_date, end_date, 
      // registration_start, registration_end, registration_fee, prize_pool, team_size
      const payload = {
        title: formData.name,
        description: formData.description,
        category: formData.category,
        start_date: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        end_date: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        registration_start: new Date().toISOString(), // Default to now
        registration_end: formData.startDate ? new Date(formData.startDate).toISOString() : undefined, // Default to start of event
        registration_fee: parseFloat(formData.registrationFee) || 0,
        prize_pool: parseFloat(formData.prizePool) || 0,
        team_size: parseInt(formData.teamSize) || 4,
        max_teams: formData.maxTeams ? parseInt(formData.maxTeams) : undefined,
        is_public: formData.isPublic,
        banner_image: formData.banner_image,
        problem_statement: formData.problem_statement,
        problem_statement_file: formData.problem_statement_file,
        rules: formData.rules,
        timeline: formData.timeline,
      };

      await hackathonAPI.create(payload as any);
      
      toast.success('Hackathon created successfully!', {
        description: `${formData.name} is now live and accepting registrations.`,
      });
      
      // Redirect to management page after brief delay
      setTimeout(() => navigate('/admin/manage'), 1500);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create hackathon. Please check your input.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter((s) => s !== skill) });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        {view && (
          <button onClick={() => setView(null)} className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        )}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            {view === null ? 'Create New Event' : view === 'hackathon' ? 'Create Hackathon' : 'Create Jirathon'}
          </h1>
          <p className="text-gray-400 mt-1">
            {view === null ? 'Choose the type of event you want to host' : view === 'hackathon' ? 'Set up a new hackathon for participants' : 'Launch a multi-stage debugging challenge'}
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === null && (
          <motion.div key="picker" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="grid md:grid-cols-2 gap-6">
            <button onClick={() => setView('hackathon')} className="text-left group">
              <Card className="border-white/10 bg-black/40 backdrop-blur-sm hover:border-cyan-500/40 hover:bg-black/60 transition-all duration-200 h-full">
                <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center group-hover:bg-cyan-500/25 transition-colors">
                    <Plus className="w-8 h-8 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white mb-2">Hackathon</h2>
                    <p className="text-gray-400 text-sm">Host a standard project-based competition. Teams submit projects, demos, and repos for judging.</p>
                  </div>
                  <span className="text-cyan-400 text-sm font-medium group-hover:underline">Create Hackathon →</span>
                </CardContent>
              </Card>
            </button>

            <button onClick={() => setView('jirathon')} className="text-left group">
              <Card className="border-white/10 bg-black/40 backdrop-blur-sm hover:border-purple-500/40 hover:bg-black/60 transition-all duration-200 h-full">
                <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center group-hover:bg-purple-500/25 transition-colors">
                    <Zap className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white mb-2">Jirathon Challenge</h2>
                    <p className="text-gray-400 text-sm">Launch a multi-stage treasure hunt. Students debug code sequentially to unlock keys and progress.</p>
                  </div>
                  <span className="text-purple-400 text-sm font-medium group-hover:underline">Create Jirathon →</span>
                </CardContent>
              </Card>
            </button>
          </motion.div>
        )}

        {view === 'hackathon' && (
          <motion.div key="hackathon" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
            <form id="create-hackathon-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-cyan-400" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Hackathon Name *</Label>
              <Input
                id="hackathon-name-input"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., FinTech Innovation Challenge 2026"
                className="bg-white/5 border-white/10"
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your hackathon, its goals, and what participants can expect..."
                rows={4}
                className="bg-white/5 border-white/10"
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
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
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date & Time *</Label>
              <Input
                id="startDate"
                type="datetime-local"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="bg-white/5 border-white/10"
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date & Time *</Label>
              <Input
                id="endDate"
                type="datetime-local"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="bg-white/5 border-white/10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Participants & Fees */}
        <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-pink-400" />
              Participants & Registration
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="registrationFee">Registration Fee (₹) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 w-4 h-4 text-gray-400">₹</span>
                <Input
                  id="hackathon-fee-input"
                  type="number"
                  required
                  value={formData.registrationFee}
                  onChange={(e) => setFormData({ ...formData, registrationFee: e.target.value })}
                  placeholder="0"
                  className="bg-white/5 border-white/10 pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="prizePool">Prize Pool (₹) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 w-4 h-4 text-gray-400">₹</span>
                <Input
                  id="prizePool"
                  type="number"
                  required
                  value={formData.prizePool}
                  onChange={(e) => setFormData({ ...formData, prizePool: e.target.value })}
                  placeholder="0"
                  className="bg-white/5 border-white/10 pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="maxTeams">Maximum Teams *</Label>
              <Input
                id="maxTeams"
                type="number"
                required
                value={formData.maxTeams}
                onChange={(e) => setFormData({ ...formData, maxTeams: e.target.value })}
                placeholder="e.g., 50"
                className="bg-white/5 border-white/10"
              />
            </div>
            <div>
              <Label htmlFor="teamSize">Team Size (Max Members) *</Label>
              <Input
                id="teamSize"
                type="number"
                required
                value={formData.teamSize}
                onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                placeholder="e.g., 4"
                className="bg-white/5 border-white/10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Required Skills */}
        <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Required Skills</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="Add a skill (e.g., React, Python, ML)"
                className="bg-white/5 border-white/10"
              />
              <Button type="button" onClick={addSkill} variant="outline" className="border-white/10">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="hover:text-cyan-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
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
                onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
              />
            </div>
            <div className="border-t border-white/10 pt-4">
              <Label>Banner Image</Label>
              <div className="mt-2 flex flex-col items-center">
                {formData.banner_image ? (
                  <div className="relative w-full h-40 rounded-lg overflow-hidden mb-4 group">
                    <img src={formData.banner_image} alt="Banner Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button 
                        type="button" 
                        variant="destructive" 
                        size="sm"
                        onClick={() => setFormData({ ...formData, banner_image: '' })}
                      >
                        <X className="w-4 h-4 mr-2" /> Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <label className="w-full border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-cyan-500/30 transition-colors cursor-pointer group">
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
                    {isUploading ? (
                      <Loader2 className="w-8 h-8 text-cyan-400 mx-auto animate-spin mb-2" />
                    ) : (
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2 group-hover:text-cyan-400 transition-colors" />
                    )}
                    <p className="text-sm text-gray-400">{isUploading ? 'Uploading...' : 'Click to upload or drag and drop'}</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                  </label>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Extended Details */}
        <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Extended Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="problem_statement">Problem Statement</Label>
              <Textarea
                id="problem_statement"
                value={formData.problem_statement}
                onChange={(e) => setFormData({ ...formData, problem_statement: e.target.value })}
                placeholder="The core challenge participants need to solve..."
                className="bg-white/5 border-white/10 h-32"
              />
              <div className="mt-4">
                <Label>Problem Statement Document (PDF/DOCX)</Label>
                <div className="mt-2">
                  {formData.problem_statement_file ? (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                      <FileCode className="w-5 h-5 text-cyan-400" />
                      <span className="text-sm text-gray-300 truncate flex-1">
                        {formData.problem_statement_file.split('/').pop()}
                      </span>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setFormData({ ...formData, problem_statement_file: '' })}
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
                        <Upload className="w-4 h-4 text-gray-400 group-hover:text-cyan-400" />
                      )}
                      <span className="text-sm text-gray-400">{isDocUploading ? 'Uploading...' : 'Upload document'}</span>
                    </label>
                  )}
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="rules">Rules & Guidelines</Label>
              <Textarea
                id="rules"
                value={formData.rules}
                onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                placeholder="Guidelines, judging criteria, and conduct rules..."
                className="bg-white/5 border-white/10 h-32"
              />
            </div>
            <div>
              <Label htmlFor="timeline">Event Timeline</Label>
              <Textarea
                id="timeline"
                value={formData.timeline}
                onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                placeholder="Key milestones (e.g., 9:00 AM - Opening Ceremony)..."
                className="bg-white/5 border-white/10 h-32"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white min-w-[140px]"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Creating...
              </span>
            ) : (
              'Create Hackathon'
            )}
          </Button>
          <Button type="button" variant="outline" className="border-white/10">
            Save as Draft
          </Button>
        </div>
          </form>
          </motion.div>
        )}

        {view === 'jirathon' && (
          <motion.div key="jirathon" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
            <CreateJirathon />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
