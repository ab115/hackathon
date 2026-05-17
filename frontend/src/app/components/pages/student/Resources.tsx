import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Code, FileText, Video, Download, ExternalLink, Star, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { resourcesAPI } from '../../../../services/api';

export function Resources() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const data = await resourcesAPI.list();
        setResources(data);
      } catch (err) {
        console.error('Failed to load resources', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  const tutorials = resources.filter(r => r.type === 'tutorials');
  const templates = resources.filter(r => r.type === 'templates');
  const docs = resources.filter(r => r.type === 'docs');
  const tools = resources.filter(r => r.type === 'tools');

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      Beginner: 'bg-green-500/20 text-green-400',
      Intermediate: 'bg-yellow-500/20 text-yellow-400',
      Advanced: 'bg-red-500/20 text-red-400',
    };
    return colors[level] || 'bg-gray-500/20 text-gray-400';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
        <p className="text-gray-400">Loading resources...</p>
      </div>
    );
  }

  return (
    <motion.div
      id="student-resources-view"
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
                key={tutorial.id}
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
                            {tutorial.category || 'General'}
                          </Badge>
                          <Badge className={`${getLevelColor(tutorial.level)} text-xs`}>
                            {tutorial.level || 'Beginner'}
                          </Badge>
                        </div>
                      </div>
                      <Video className="w-8 h-8 text-purple-400" />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3 text-gray-400">
                        <span>⏱️ {tutorial.duration || 'N/A'}</span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          {tutorial.rating || 0}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white"
                        onClick={() => tutorial.url ? window.open(tutorial.url, '_blank') : null}
                      >
                        Watch Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {tutorials.length === 0 && <p className="text-gray-400">No tutorials available.</p>}
          </div>
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates">
          <div className="grid md:grid-cols-2 gap-6">
            {templates.map((template, i) => (
              <motion.div
                key={template.id}
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
                          {template.category || 'General'}
                        </Badge>
                      </div>
                      <Code className="w-8 h-8 text-cyan-400" />
                    </div>

                    <div className="flex items-center justify-between text-sm pt-3 border-t border-white/10">
                      <span className="text-gray-400">
                        <Download className="w-3 h-3 inline mr-1" />
                        {template.downloads || 0} downloads
                      </span>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-white/10"
                        onClick={() => template.url ? window.open(template.url, '_blank') : null}
                      >
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {templates.length === 0 && <p className="text-gray-400">No templates available.</p>}
          </div>
        </TabsContent>

        {/* Documentation */}
        <TabsContent value="docs">
          <div className="grid md:grid-cols-2 gap-6">
            {docs.map((doc, i) => (
              <motion.div
                key={doc.id}
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
                            {doc.category || 'General'}
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-cyan-400 p-0 h-auto"
                            onClick={() => doc.url ? window.open(doc.url, '_blank') : null}
                          >
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
            {docs.length === 0 && <p className="text-gray-400">No documentation available.</p>}
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
                    key={tool.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold mb-1">{tool.title}</h3>
                        <p className="text-sm text-gray-400">{tool.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/10 gap-1"
                        onClick={() => tool.url ? window.open(tool.url, '_blank') : null}
                      >
                        Visit
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
                {tools.length === 0 && <p className="text-gray-400">No tools available.</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
