import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Gavel, Star, MessageSquare, CheckCircle, Clock, Loader2, RefreshCw, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Slider } from '../../ui/slider';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { toast } from 'sonner';
import { hackathonAPI, submissionAPI } from '../../../../services/api';

export function JudgingPortal() {
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [selectedHackathonId, setSelectedHackathonId] = useState<string>('');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [subsLoading, setSubsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [scores, setScores] = useState({
    innovation: 80,
    technical: 75,
    design: 85,
    impact: 70,
  });
  const [feedback, setFeedback] = useState('');

  // Load hackathons
  useEffect(() => {
    const load = async () => {
      try {
        const data = await hackathonAPI.list({ limit: 100 });
        const list = data.items || data;
        setHackathons(list);
        if (list.length > 0) setSelectedHackathonId(String(list[0].id));
      } catch {
        toast.error('Failed to load hackathons');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Load submissions when hackathon changes
  useEffect(() => {
    if (!selectedHackathonId) return;
    const load = async () => {
      setSubsLoading(true);
      try {
        const data = await submissionAPI.getHackathonSubmissions(parseInt(selectedHackathonId));
        setSubmissions(data);
        if (data.length > 0) {
          setSelectedSubmission(data[0]);
          // If already judged, populate scores/feedback
          if (data[0].score) {
            setScores({ innovation: data[0].score, technical: data[0].score, design: data[0].score, impact: data[0].score });
            setFeedback(data[0].judge_feedback || '');
          }
        } else {
          setSelectedSubmission(null);
        }
      } catch {
        setSubmissions([]);
        setSelectedSubmission(null);
      } finally {
        setSubsLoading(false);
      }
    };
    load();
  }, [selectedHackathonId]);

  const handleSubmitJudgment = async () => {
    if (!selectedSubmission) return;
    
    const totalScore = Math.round(
      (scores.innovation + scores.technical + scores.design + scores.impact) / 4
    );
    
    setSubmitting(true);
    try {
      await submissionAPI.scoreSubmission(selectedSubmission.id, totalScore, feedback);
      
      toast.success('Judgment submitted successfully!', {
        description: `Total score: ${totalScore}/100`,
      });

      // Update local state
      const updatedSubmissions = submissions.map((s) =>
        s.id === selectedSubmission.id
          ? { ...s, score: totalScore, judge_feedback: feedback }
          : s
      );
      setSubmissions(updatedSubmissions);
      setSelectedSubmission({ ...selectedSubmission, score: totalScore, judge_feedback: feedback });

    } catch (err: any) {
      toast.error(err.message || 'Failed to submit judgment');
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = submissions.filter((s) => !s.score).length;
  const judgedCount = submissions.filter((s) => s.score).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
        <p className="text-gray-400">Loading portal...</p>
      </div>
    );
  }

  return (
    <motion.div
      id="admin-judging-portal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Judging Portal
          </h1>
          <p className="text-gray-400 mt-2">Review and score hackathon submissions</p>
        </div>
        <div className="w-64">
          <Label>Select Hackathon</Label>
          <Select value={selectedHackathonId} onValueChange={setSelectedHackathonId}>
            <SelectTrigger className="bg-white/5 border-white/10 mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0f0f1a] border-white/10">
              {hackathons.map((h) => (
                <SelectItem key={h.id} value={String(h.id)}>
                  {h.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-orange-400" />
              <div>
                <p className="text-3xl font-bold">{pendingCount}</p>
                <p className="text-sm text-gray-400">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-3xl font-bold">{judgedCount}</p>
                <p className="text-sm text-gray-400">Judged</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Gavel className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-3xl font-bold">{submissions.length}</p>
                <p className="text-sm text-gray-400">Total Submissions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Judging Interface */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Submission List */}
        <Card className="border-white/10 bg-black/40 backdrop-blur-sm md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Submissions
              {subsLoading && <RefreshCw className="w-4 h-4 animate-spin text-gray-500" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
            {subsLoading ? (
               <div className="flex flex-col items-center py-10 text-gray-500">
                  <Loader2 className="w-6 h-6 animate-spin mb-2" />
                  Fetching submissions...
               </div>
            ) : submissions.length === 0 ? (
               <p className="text-center text-gray-500 py-10">No submissions found.</p>
            ) : (
              submissions.map((submission) => (
                <motion.div
                  key={submission.id}
                  whileHover={{ x: 4 }}
                  onClick={() => {
                    setSelectedSubmission(submission);
                    if (submission.score) {
                      setFeedback(submission.judge_feedback || '');
                      // Reset scores to actual if available (simulated as backend only stores total for now)
                      setScores({ innovation: submission.score, technical: submission.score, design: submission.score, impact: submission.score });
                    } else {
                      setFeedback('');
                      setScores({ innovation: 80, technical: 75, design: 85, impact: 70 });
                    }
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedSubmission?.id === submission.id
                      ? 'border-cyan-500/50 bg-cyan-500/10'
                      : 'border-white/10 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm truncate pr-2">Team {submission.team_id}</h4>
                    {!submission.score ? (
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-[10px]">
                        Pending
                      </Badge>
                    ) : (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px]">
                        Judged
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-white mb-1 truncate">{submission.title}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[10px] text-gray-500">{new Date(submission.created_at).toLocaleDateString()}</p>
                    {submission.score && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-semibold text-yellow-400">{submission.score}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Judging Panel */}
        {selectedSubmission ? (
          <Card className="border-white/10 bg-black/40 backdrop-blur-sm md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-cyan-400">{selectedSubmission.title}</CardTitle>
                {selectedSubmission.score && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Score: {selectedSubmission.score}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="details" className="space-y-4">
                <TabsList className="bg-white/5 p-1">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="score">Score & Feedback</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6 pt-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-gray-400 text-xs uppercase tracking-wider">Team ID</Label>
                        <p className="text-xl font-bold text-white"># {selectedSubmission.team_id}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400 text-xs uppercase tracking-wider">Submission Date</Label>
                        <p className="text-white">{new Date(selectedSubmission.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-400 text-xs uppercase tracking-wider">Tech Stack</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedSubmission.tech_stack?.split(',').map((tech: string, i: number) => (
                          <Badge key={i} variant="outline" className="border-white/10 bg-white/5">
                            {tech.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-400 text-xs uppercase tracking-wider">Project Description</Label>
                    <p className="text-gray-200 mt-2 leading-relaxed bg-white/5 p-4 rounded-lg border border-white/5">
                      {selectedSubmission.description}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="bg-white/5 border-white/10 hover:border-cyan-500/30 transition-colors">
                       <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-400">Demo Link</p>
                            <p className="text-sm font-medium truncate max-w-[200px]">{selectedSubmission.demo_url || 'N/A'}</p>
                          </div>
                          {selectedSubmission.demo_url && (
                             <Button size="sm" variant="ghost" onClick={() => window.open(selectedSubmission.demo_url, '_blank')}>
                                <ChevronRight className="w-4 h-4" />
                             </Button>
                          )}
                       </CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/10 hover:border-purple-500/30 transition-colors">
                       <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-400">Source Code</p>
                            <p className="text-sm font-medium truncate max-w-[200px]">{selectedSubmission.repo_url || 'N/A'}</p>
                          </div>
                          {selectedSubmission.repo_url && (
                             <Button size="sm" variant="ghost" onClick={() => window.open(selectedSubmission.repo_url, '_blank')}>
                                <ChevronRight className="w-4 h-4" />
                             </Button>
                          )}
                       </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="score" className="space-y-6 pt-4">
                  {/* Scoring Criteria */}
                  <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Innovation</Label>
                        <span className="text-lg font-bold text-cyan-400">{scores.innovation}</span>
                      </div>
                      <Slider
                        value={[scores.innovation]}
                        onValueChange={(value) => setScores({ ...scores, innovation: value[0] })}
                        max={100}
                        step={5}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Technical</Label>
                        <span className="text-lg font-bold text-purple-400">{scores.technical}</span>
                      </div>
                      <Slider
                        value={[scores.technical]}
                        onValueChange={(value) => setScores({ ...scores, technical: value[0] })}
                        max={100}
                        step={5}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Design</Label>
                        <span className="text-lg font-bold text-pink-400">{scores.design}</span>
                      </div>
                      <Slider
                        value={[scores.design]}
                        onValueChange={(value) => setScores({ ...scores, design: value[0] })}
                        max={100}
                        step={5}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Impact</Label>
                        <span className="text-lg font-bold text-green-400">{scores.impact}</span>
                      </div>
                      <Slider
                        value={[scores.impact]}
                        onValueChange={(value) => setScores({ ...scores, impact: value[0] })}
                        max={100}
                        step={5}
                      />
                    </div>
                  </div>

                  {/* Total Score */}
                  <div className="bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 p-6 rounded-xl border border-white/10 text-center">
                    <p className="text-gray-400 text-sm mb-1 uppercase tracking-tighter">Final Calculated Score</p>
                    <p className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {Math.round((scores.innovation + scores.technical + scores.design + scores.impact) / 4)}
                    </p>
                  </div>

                  {/* Feedback */}
                  <div>
                    <Label htmlFor="feedback" className="flex items-center gap-2 mb-2 text-gray-300">
                      <MessageSquare className="w-4 h-4" />
                      Judge Feedback
                    </Label>
                    <Textarea
                      id="feedback"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Explain your score and provide guidance for the team..."
                      rows={4}
                      className="bg-white/5 border-white/10 focus:border-purple-500/50 transition-all"
                    />
                  </div>

                  {/* Submit */}
                  <Button
                    onClick={handleSubmitJudgment}
                    disabled={submitting}
                    className="w-full h-12 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 hover:from-cyan-600 hover:to-pink-700 text-white font-bold text-lg shadow-lg shadow-purple-500/20"
                  >
                    {submitting ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <Gavel className="w-5 h-5 mr-2" />
                    )}
                    {selectedSubmission.score ? 'Update Judgment' : 'Submit Final Judgment'}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-white/10 bg-black/40 backdrop-blur-sm md:col-span-2 flex items-center justify-center p-12">
            <div className="text-center">
               <Gavel className="w-16 h-16 text-gray-700 mx-auto mb-4" />
               <p className="text-gray-500 text-lg">Select a submission to begin judging</p>
            </div>
          </Card>
        )}
      </div>
    </motion.div>
  );
}
