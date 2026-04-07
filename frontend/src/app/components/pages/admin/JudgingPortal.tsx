import { useState } from 'react';
import { motion } from 'motion/react';
import { Gavel, Star, MessageSquare, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Slider } from '../../ui/slider';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { toast } from 'sonner';

const mockSubmissions = [
  {
    id: 1,
    team: 'Team Quantum',
    project: 'AI Trading Bot',
    hackathon: 'FinTech Innovation',
    status: 'pending',
    submitted: '2 hours ago',
    description: 'An AI-powered algorithmic trading bot that uses machine learning to predict market trends',
    demo: 'https://demo.example.com',
    github: 'https://github.com/example',
    members: ['Alice Johnson', 'Bob Smith', 'Charlie Davis'],
  },
  {
    id: 2,
    team: 'Code Warriors',
    project: 'Blockchain Payment System',
    hackathon: 'FinTech Innovation',
    status: 'pending',
    submitted: '4 hours ago',
    description: 'Decentralized payment system built on blockchain for instant cross-border transactions',
    demo: 'https://demo.example.com',
    github: 'https://github.com/example',
    members: ['Dave Wilson', 'Eve Martinez', 'Frank Lee'],
  },
  {
    id: 3,
    team: 'Innovators',
    project: 'Smart Banking Dashboard',
    hackathon: 'FinTech Innovation',
    status: 'judged',
    submitted: '1 day ago',
    description: 'Next-gen banking dashboard with AI insights and predictive analytics',
    demo: 'https://demo.example.com',
    github: 'https://github.com/example',
    members: ['Grace Chen', 'Henry Park', 'Ivy Rodriguez'],
    score: 92,
  },
];

export function JudgingPortal() {
  const [submissions, setSubmissions] = useState(mockSubmissions);
  const [selectedSubmission, setSelectedSubmission] = useState(mockSubmissions[0]);
  const [scores, setScores] = useState({
    innovation: 80,
    technical: 75,
    design: 85,
    impact: 70,
  });
  const [feedback, setFeedback] = useState('');

  const handleSubmitJudgment = () => {
    const totalScore = Math.round(
      (scores.innovation + scores.technical + scores.design + scores.impact) / 4
    );
    
    setSubmissions(
      submissions.map((s) =>
        s.id === selectedSubmission.id
          ? { ...s, status: 'judged', score: totalScore }
          : s
      )
    );

    toast.success('Judgment submitted successfully!', {
      description: `Total score: ${totalScore}/100`,
    });

    // Move to next submission
    const nextSubmission = submissions.find((s) => s.status === 'pending');
    if (nextSubmission) {
      setSelectedSubmission(nextSubmission);
    }

    // Reset scores and feedback
    setScores({
      innovation: 80,
      technical: 75,
      design: 85,
      impact: 70,
    });
    setFeedback('');
  };

  const pendingCount = submissions.filter((s) => s.status === 'pending').length;
  const judgedCount = submissions.filter((s) => s.status === 'judged').length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Judging Portal
        </h1>
        <p className="text-gray-400 mt-2">Review and score hackathon submissions</p>
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
            <CardTitle>Submissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {submissions.map((submission) => (
              <motion.div
                key={submission.id}
                whileHover={{ x: 4 }}
                onClick={() => setSelectedSubmission(submission)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedSubmission.id === submission.id
                    ? 'border-cyan-500/50 bg-cyan-500/10'
                    : 'border-white/10 hover:bg-white/5'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-sm">{submission.team}</h4>
                  {submission.status === 'pending' ? (
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                      Pending
                    </Badge>
                  ) : (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Judged
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-400 mb-1">{submission.project}</p>
                <p className="text-xs text-gray-500">{submission.submitted}</p>
                {submission.status === 'judged' && (
                  <div className="mt-2 flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-semibold">{submission.score}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Judging Panel */}
        <Card className="border-white/10 bg-black/40 backdrop-blur-sm md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{selectedSubmission.project}</CardTitle>
              {selectedSubmission.status === 'judged' && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  Already Judged - Score: {selectedSubmission.score}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="details" className="space-y-4">
              <TabsList className="bg-white/5">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="score">Score</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div>
                  <Label className="text-gray-400">Team</Label>
                  <p className="font-semibold">{selectedSubmission.team}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedSubmission.members.map((member, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 rounded bg-white/5 text-gray-300"
                      >
                        {member}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-400">Description</Label>
                  <p className="text-sm mt-1">{selectedSubmission.description}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Demo Link</Label>
                    <a
                      href={selectedSubmission.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-cyan-400 hover:text-cyan-300 block mt-1"
                    >
                      {selectedSubmission.demo}
                    </a>
                  </div>
                  <div>
                    <Label className="text-gray-400">GitHub Repository</Label>
                    <a
                      href={selectedSubmission.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-cyan-400 hover:text-cyan-300 block mt-1"
                    >
                      {selectedSubmission.github}
                    </a>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-400">Hackathon</Label>
                  <p className="text-sm mt-1">{selectedSubmission.hackathon}</p>
                </div>

                <div>
                  <Label className="text-gray-400">Submitted</Label>
                  <p className="text-sm mt-1">{selectedSubmission.submitted}</p>
                </div>
              </TabsContent>

              <TabsContent value="score" className="space-y-6">
                {/* Scoring Criteria */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Innovation & Creativity</Label>
                      <span className="text-2xl font-bold text-cyan-400">{scores.innovation}</span>
                    </div>
                    <Slider
                      value={[scores.innovation]}
                      onValueChange={(value) => setScores({ ...scores, innovation: value[0] })}
                      max={100}
                      step={5}
                      className="mb-1"
                    />
                    <p className="text-xs text-gray-400">
                      How innovative and creative is the solution?
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Technical Implementation</Label>
                      <span className="text-2xl font-bold text-purple-400">{scores.technical}</span>
                    </div>
                    <Slider
                      value={[scores.technical]}
                      onValueChange={(value) => setScores({ ...scores, technical: value[0] })}
                      max={100}
                      step={5}
                      className="mb-1"
                    />
                    <p className="text-xs text-gray-400">
                      Quality of code and technical execution
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Design & UX</Label>
                      <span className="text-2xl font-bold text-pink-400">{scores.design}</span>
                    </div>
                    <Slider
                      value={[scores.design]}
                      onValueChange={(value) => setScores({ ...scores, design: value[0] })}
                      max={100}
                      step={5}
                      className="mb-1"
                    />
                    <p className="text-xs text-gray-400">
                      User interface and experience quality
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Impact & Feasibility</Label>
                      <span className="text-2xl font-bold text-green-400">{scores.impact}</span>
                    </div>
                    <Slider
                      value={[scores.impact]}
                      onValueChange={(value) => setScores({ ...scores, impact: value[0] })}
                      max={100}
                      step={5}
                      className="mb-1"
                    />
                    <p className="text-xs text-gray-400">
                      Real-world impact and feasibility
                    </p>
                  </div>
                </div>

                {/* Total Score */}
                <Card className="border-white/10 bg-gradient-to-r from-cyan-500/10 to-purple-500/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">Total Score</span>
                      <span className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                        {Math.round(
                          (scores.innovation + scores.technical + scores.design + scores.impact) / 4
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Feedback */}
                <div>
                  <Label htmlFor="feedback" className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Judge Feedback
                  </Label>
                  <Textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide constructive feedback for the team..."
                    rows={4}
                    className="bg-white/5 border-white/10 mt-2"
                  />
                </div>

                {/* Submit */}
                <Button
                  onClick={handleSubmitJudgment}
                  disabled={selectedSubmission.status === 'judged'}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white"
                >
                  {selectedSubmission.status === 'judged' ? 'Already Judged' : 'Submit Judgment'}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
