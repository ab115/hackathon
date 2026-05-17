import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileCode, Upload, Link2, Github, CheckCircle, Clock, Zap, ArrowLeft, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Badge } from '../../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { toast } from 'sonner';
import { JirathonPanel } from './JirathonPanel';

const mySubmissions = [
  { id: 1, hackathon: 'FinTech Innovation Challenge', project: 'AI Trading Bot', submittedAt: '2 hours ago', status: 'pending', score: null },
];

function HackathonSubmissionView() {
  const [formData, setFormData] = useState({ hackathon: '', projectName: '', description: '', demoUrl: '', githubUrl: '', videoUrl: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Project submitted successfully!', { description: 'Your submission is under review by judges.' });
    setFormData({ hackathon: '', projectName: '', description: '', demoUrl: '', githubUrl: '', videoUrl: '' });
  };

  return (
    <div className="max-w-4xl space-y-6">
      <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-cyan-400" />
            My Submissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mySubmissions.length > 0 ? (
            <div className="space-y-3">
              {mySubmissions.map((s) => (
                <div key={s.id} className="p-4 rounded-lg border border-white/10 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold mb-1">{s.project}</h3>
                      <p className="text-sm text-gray-400">{s.hackathon}</p>
                      <p className="text-xs text-gray-500 mt-1">Submitted {s.submittedAt}</p>
                    </div>
                    <div className="text-right">
                      {s.status === 'pending' ? (
                        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30"><Clock className="w-3 h-3 mr-1" />Under Review</Badge>
                      ) : (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" />Reviewed</Badge>
                      )}
                      {s.score && <p className="text-2xl font-bold text-cyan-400 mt-2">{s.score}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No submissions yet.</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-purple-400" />
            Submit New Project
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Select Hackathon *</Label>
              <Select value={formData.hackathon} onValueChange={(v) => setFormData({ ...formData, hackathon: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 mt-1"><SelectValue placeholder="Choose a hackathon" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fintech">FinTech Innovation Challenge</SelectItem>
                  <SelectItem value="ai">AI Revolution 2026</SelectItem>
                  <SelectItem value="web3">Web3 Future Summit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Project Name *</Label>
              <Input required value={formData.projectName} onChange={(e) => setFormData({ ...formData, projectName: e.target.value })} placeholder="Enter your project name" className="bg-white/5 border-white/10 mt-1" />
            </div>
            <div>
              <Label>Project Description *</Label>
              <Textarea required rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe your project..." className="bg-white/5 border-white/10 mt-1" />
            </div>
            <div>
              <Label className="flex items-center gap-2"><Link2 className="w-4 h-4" />Demo URL *</Label>
              <Input required type="url" value={formData.demoUrl} onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })} placeholder="https://your-demo.com" className="bg-white/5 border-white/10 mt-1" />
            </div>
            <div>
              <Label className="flex items-center gap-2"><Github className="w-4 h-4" />GitHub Repository *</Label>
              <Input required type="url" value={formData.githubUrl} onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })} placeholder="https://github.com/username/repo" className="bg-white/5 border-white/10 mt-1" />
            </div>
            <div>
              <Label>Demo Video URL (Optional)</Label>
              <Input type="url" value={formData.videoUrl} onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })} placeholder="https://youtube.com/watch?v=..." className="bg-white/5 border-white/10 mt-1" />
            </div>
            <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
              <h4 className="font-semibold text-cyan-400 mb-2">Submission Guidelines</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Ensure your demo is publicly accessible</li>
                <li>• Include a comprehensive README in your repository</li>
                <li>• Submissions cannot be edited after the deadline</li>
              </ul>
            </div>
            <div className="flex gap-4">
              <Button type="submit" className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white">Submit Project</Button>
              <Button type="button" variant="outline" className="border-white/10">Save as Draft</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

type View = null | 'hackathon' | 'jirathon';

export function Submissions() {
  const [view, setView] = useState<View>(null);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        {view && (
          <button onClick={() => setView(null)} className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        )}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            {view === null ? 'Submissions' : view === 'hackathon' ? 'Hackathon Submission' : 'Jirathon Challenge'}
          </h1>
          <p className="text-gray-400 mt-1">
            {view === null ? 'Choose a submission type to continue' : view === 'hackathon' ? 'Submit your project for judging' : 'Submit your stage override key'}
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === null && (
          <motion.div key="picker" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="grid md:grid-cols-2 gap-6 pt-2">
            {/* Hackathon Card */}
            <button onClick={() => setView('hackathon')} className="text-left group">
              <Card className="border-white/10 bg-black/40 backdrop-blur-sm hover:border-cyan-500/40 hover:bg-black/60 transition-all duration-200 h-full">
                <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center group-hover:bg-cyan-500/25 transition-colors">
                    <Upload className="w-8 h-8 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white mb-2">Hackathon Submission</h2>
                    <p className="text-gray-400 text-sm">Submit your project, demo link, and GitHub repo for judging in an active hackathon.</p>
                  </div>
                  <span className="text-cyan-400 text-sm font-medium group-hover:underline">Get Started →</span>
                </CardContent>
              </Card>
            </button>

            {/* Jirathon Card */}
            <button onClick={() => setView('jirathon')} className="text-left group">
              <Card className="border-white/10 bg-black/40 backdrop-blur-sm hover:border-purple-500/40 hover:bg-black/60 transition-all duration-200 h-full">
                <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center group-hover:bg-purple-500/25 transition-colors">
                    <Zap className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white mb-2">Jirathon Challenge</h2>
                    <p className="text-gray-400 text-sm">Authenticate a stage override key to track your team's progress through the treasure hunt.</p>
                  </div>
                  <span className="text-purple-400 text-sm font-medium group-hover:underline">Get Started →</span>
                </CardContent>
              </Card>
            </button>
          </motion.div>
        )}

        {view === 'hackathon' && (
          <motion.div key="hackathon" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
            <HackathonSubmissionView />
          </motion.div>
        )}

        {view === 'jirathon' && (
          <motion.div key="jirathon" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
            <JirathonPanel />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
