import { motion } from 'motion/react';
import { BookOpen, Code, FileText, Video, Download, ExternalLink, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';

const tutorials = [
  {
    title: 'Building a FinTech App with React',
    duration: '45 min',
    level: 'Intermediate',
    category: 'FinTech',
    rating: 4.8,
  },
  {
    title: 'Introduction to Web3 Development',
    duration: '60 min',
    level: 'Beginner',
    category: 'Web3',
    rating: 4.9,
  },
  {
    title: 'Machine Learning for Beginners',
    duration: '90 min',
    level: 'Beginner',
    category: 'AI/ML',
    rating: 4.7,
  },
  {
    title: 'Smart Contract Security',
    duration: '50 min',
    level: 'Advanced',
    category: 'Web3',
    rating: 4.9,
  },
];

const templates = [
  {
    title: 'React + TypeScript Starter',
    description: 'Production-ready React template with TypeScript',
    downloads: '12.5K',
    category: 'Frontend',
  },
  {
    title: 'Node.js API Boilerplate',
    description: 'RESTful API with authentication and database',
    downloads: '8.3K',
    category: 'Backend',
  },
  {
    title: 'Web3 DApp Template',
    description: 'Complete Web3 application with wallet integration',
    downloads: '6.7K',
    category: 'Web3',
  },
  {
    title: 'ML Model Deployment',
    description: 'Deploy ML models with FastAPI and Docker',
    downloads: '5.2K',
    category: 'AI/ML',
  },
];

const documentation = [
  {
    title: 'Hackathon Rules & Guidelines',
    description: 'Everything you need to know about participating',
    category: 'General',
  },
  {
    title: 'Judging Criteria Explained',
    description: 'Understand how projects are evaluated',
    category: 'Judging',
  },
  {
    title: 'Team Formation Best Practices',
    description: 'Tips for building a winning team',
    category: 'Teams',
  },
  {
    title: 'Submission Requirements',
    description: 'Checklist for your project submission',
    category: 'Submission',
  },
];

const tools = [
  { name: 'Figma', description: 'Design and prototype', url: 'figma.com' },
  { name: 'Vercel', description: 'Deploy web apps', url: 'vercel.com' },
  { name: 'Supabase', description: 'Backend as a service', url: 'supabase.com' },
  { name: 'MongoDB Atlas', description: 'Cloud database', url: 'mongodb.com' },
];

export function Resources() {
  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      Beginner: 'bg-green-500/20 text-green-400',
      Intermediate: 'bg-yellow-500/20 text-yellow-400',
      Advanced: 'bg-red-500/20 text-red-400',
    };
    return colors[level] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Learning Resources
        </h1>
        <p className="text-gray-400 mt-2">Everything you need to build amazing projects</p>
      </div>

      <Tabs defaultValue="tutorials" className="space-y-6">
        <TabsList className="bg-white/5">
          <TabsTrigger value="tutorials">
            <Video className="w-4 h-4 mr-2" />
            Tutorials
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Code className="w-4 h-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="docs">
            <FileText className="w-4 h-4 mr-2" />
            Documentation
          </TabsTrigger>
          <TabsTrigger value="tools">
            <BookOpen className="w-4 h-4 mr-2" />
            Tools
          </TabsTrigger>
        </TabsList>

        {/* Tutorials */}
        <TabsContent value="tutorials">
          <div className="grid md:grid-cols-2 gap-6">
            {tutorials.map((tutorial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-white/10 bg-black/40 backdrop-blur-sm hover:border-cyan-500/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">{tutorial.title}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">
                            {tutorial.category}
                          </Badge>
                          <Badge className={`${getLevelColor(tutorial.level)} text-xs`}>
                            {tutorial.level}
                          </Badge>
                        </div>
                      </div>
                      <Video className="w-8 h-8 text-purple-400" />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3 text-gray-400">
                        <span>⏱️ {tutorial.duration}</span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          {tutorial.rating}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white"
                      >
                        Watch Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates">
          <div className="grid md:grid-cols-2 gap-6">
            {templates.map((template, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-white/10 bg-black/40 backdrop-blur-sm hover:border-cyan-500/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">{template.title}</h3>
                        <p className="text-sm text-gray-400 mb-2">{template.description}</p>
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                          {template.category}
                        </Badge>
                      </div>
                      <Code className="w-8 h-8 text-cyan-400" />
                    </div>

                    <div className="flex items-center justify-between text-sm pt-3 border-t border-white/10">
                      <span className="text-gray-400">
                        <Download className="w-3 h-3 inline mr-1" />
                        {template.downloads} downloads
                      </span>
                      <Button size="sm" variant="outline" className="border-white/10">
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Documentation */}
        <TabsContent value="docs">
          <div className="grid md:grid-cols-2 gap-6">
            {documentation.map((doc, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-white/10 bg-black/40 backdrop-blur-sm hover:border-cyan-500/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500/20 to-orange-500/20 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-pink-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">{doc.title}</h3>
                        <p className="text-sm text-gray-400 mb-3">{doc.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/30 text-xs">
                            {doc.category}
                          </Badge>
                          <Button size="sm" variant="ghost" className="text-cyan-400 p-0 h-auto">
                            Read More
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Tools */}
        <TabsContent value="tools">
          <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Recommended Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {tools.map((tool, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold mb-1">{tool.name}</h3>
                        <p className="text-sm text-gray-400">{tool.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/10 gap-1"
                      >
                        Visit
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Resources */}
          <Card className="border-white/10 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 mt-6">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                Additional Resources
              </h3>
              <div className="space-y-3 text-sm">
                <a
                  href="#"
                  className="flex items-center justify-between p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                >
                  <div>
                    <p className="font-medium text-white">Official Discord Community</p>
                    <p className="text-xs text-gray-400">Connect with 10K+ developers</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
                <a
                  href="#"
                  className="flex items-center justify-between p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                >
                  <div>
                    <p className="font-medium text-white">YouTube Channel</p>
                    <p className="text-xs text-gray-400">200+ tutorial videos</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
                <a
                  href="#"
                  className="flex items-center justify-between p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                >
                  <div>
                    <p className="font-medium text-white">GitHub Repository</p>
                    <p className="text-xs text-gray-400">Open source examples</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
