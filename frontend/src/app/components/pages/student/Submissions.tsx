import { useState } from 'react';
import { motion } from 'motion/react';
import { FileCode, Upload, Link2, Github, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Badge } from '../../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { toast } from 'sonner';

const mySubmissions = [
  {
    id: 1,
    hackathon: 'FinTech Innovation Challenge',
    project: 'AI Trading Bot',
    submittedAt: '2 hours ago',
    status: 'pending',
    score: null,
  },
];

export function Submissions() {
  const [formData, setFormData] = useState({
    hackathon: '',
    projectName: '',
    description: '',
    demoUrl: '',
    githubUrl: '',
    videoUrl: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Project submitted successfully!', {
      description: 'Your submission is under review by judges.',
    });
    setFormData({
      hackathon: '',
      projectName: '',
      description: '',
      demoUrl: '',
      githubUrl: '',
      videoUrl: '',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl space-y-6"
    >
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Project Submissions
        </h1>
        <p className="text-gray-400 mt-2">Submit your hackathon projects for judging</p>
      </div>

      {/* My Submissions */}
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
              {mySubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="p-4 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold mb-1">{submission.project}</h3>
                      <p className="text-sm text-gray-400">{submission.hackathon}</p>
                      <p className="text-xs text-gray-500 mt-1">Submitted {submission.submittedAt}</p>
                    </div>
                    <div className="text-right">
                      {submission.status === 'pending' ? (
                        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                          <Clock className="w-3 h-3 mr-1" />
                          Under Review
                        </Badge>
                      ) : (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Reviewed
                        </Badge>
                      )}
                      {submission.score && (
                        <p className="text-2xl font-bold text-cyan-400 mt-2">{submission.score}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">
              No submissions yet. Submit your first project below!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Submit New Project */}
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
              <Label htmlFor="hackathon">Select Hackathon *</Label>
              <Select
                value={formData.hackathon}
                onValueChange={(value) => setFormData({ ...formData, hackathon: value })}
              >
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Choose a hackathon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fintech">FinTech Innovation Challenge</SelectItem>
                  <SelectItem value="ai">AI Revolution 2026</SelectItem>
                  <SelectItem value="web3">Web3 Future Summit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="projectName">Project Name *</Label>
              <Input
                id="projectName"
                required
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                placeholder="Enter your project name"
                className="bg-white/5 border-white/10"
              />
            </div>

            <div>
              <Label htmlFor="description">Project Description *</Label>
              <Textarea
                id="description"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your project, its features, and impact..."
                rows={4}
                className="bg-white/5 border-white/10"
              />
            </div>

            <div>
              <Label htmlFor="demoUrl" className="flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Demo URL *
              </Label>
              <Input
                id="demoUrl"
                required
                type="url"
                value={formData.demoUrl}
                onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                placeholder="https://your-demo.com"
                className="bg-white/5 border-white/10"
              />
            </div>

            <div>
              <Label htmlFor="githubUrl" className="flex items-center gap-2">
                <Github className="w-4 h-4" />
                GitHub Repository *
              </Label>
              <Input
                id="githubUrl"
                required
                type="url"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                placeholder="https://github.com/username/repo"
                className="bg-white/5 border-white/10"
              />
            </div>

            <div>
              <Label htmlFor="videoUrl">Demo Video URL (Optional)</Label>
              <Input
                id="videoUrl"
                type="url"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
                className="bg-white/5 border-white/10"
              />
            </div>

            <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
              <h4 className="font-semibold text-cyan-400 mb-2">Submission Guidelines</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Ensure your demo is publicly accessible</li>
                <li>• Include a comprehensive README in your repository</li>
                <li>• Test all links before submitting</li>
                <li>• Submissions cannot be edited after the deadline</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white"
              >
                Submit Project
              </Button>
              <Button type="button" variant="outline" className="border-white/10">
                Save as Draft
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
