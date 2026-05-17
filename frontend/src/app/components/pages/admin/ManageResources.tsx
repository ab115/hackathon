import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit, Trash2, Loader2, FileText, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { toast } from 'sonner';
import { resourcesAPI } from '../../../../services/api';

export function ManageResources() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingResource, setEditingResource] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const data = await resourcesAPI.list();
      setResources(data);
    } catch (err: any) {
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      await resourcesAPI.delete(id);
      toast.success('Resource deleted successfully');
      fetchResources();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete resource');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingResource?.id) {
        await resourcesAPI.update(editingResource.id, editingResource);
        toast.success('Resource updated successfully');
      } else {
        await resourcesAPI.create(editingResource);
        toast.success('Resource created successfully');
      }
      setIsModalOpen(false);
      fetchResources();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save resource');
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = (resource: any = null) => {
    setEditingResource(resource || { title: '', type: 'tutorials', description: '', url: '', duration: '', level: 'Beginner', category: '' });
    setIsModalOpen(true);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Manage Resources
          </h2>
          <p className="text-gray-400 mt-1">Add, edit, or remove learning resources for students</p>
        </div>
        <Button onClick={() => openModal()} className="bg-cyan-600 hover:bg-cyan-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Resource
        </Button>
      </div>

      <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left" id="admin-resources-list">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="p-4 font-semibold text-gray-300">Title</th>
                  <th className="p-4 font-semibold text-gray-300">Type</th>
                  <th className="p-4 font-semibold text-gray-300">Category</th>
                  <th className="p-4 font-semibold text-gray-300">Level</th>
                  <th className="p-4 font-semibold text-gray-300 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading...
                    </td>
                  </tr>
                ) : resources.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400">
                      <BookOpen className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                      No resources found. Add one to get started.
                    </td>
                  </tr>
                ) : (
                  resources.map((res) => (
                    <tr key={res.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-medium text-white">{res.title}</td>
                      <td className="p-4 text-gray-400 capitalize">{res.type}</td>
                      <td className="p-4 text-gray-400">{res.category || '-'}</td>
                      <td className="p-4 text-gray-400">{res.level || '-'}</td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => openModal(res)} className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 mr-2">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(res.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#12121a] border-white/10">
          <DialogHeader>
            <DialogTitle>{editingResource?.id ? 'Edit Resource' : 'Add Resource'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-4">
            <div>
              <Label>Title</Label>
              <Input
                required
                value={editingResource?.title || ''}
                onChange={e => setEditingResource({ ...editingResource, title: e.target.value })}
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select
                  value={editingResource?.type || 'tutorials'}
                  onValueChange={val => setEditingResource({ ...editingResource, type: val })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tutorials">Tutorials</SelectItem>
                    <SelectItem value="templates">Templates</SelectItem>
                    <SelectItem value="docs">Documentation</SelectItem>
                    <SelectItem value="tools">Tools</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Level</Label>
                <Select
                  value={editingResource?.level || 'Beginner'}
                  onValueChange={val => setEditingResource({ ...editingResource, level: val })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Input
                  value={editingResource?.category || ''}
                  onChange={e => setEditingResource({ ...editingResource, category: e.target.value })}
                  className="bg-white/5 border-white/10"
                  placeholder="e.g. Frontend, Web3"
                />
              </div>
              <div>
                <Label>Duration (Tutorials)</Label>
                <Input
                  value={editingResource?.duration || ''}
                  onChange={e => setEditingResource({ ...editingResource, duration: e.target.value })}
                  className="bg-white/5 border-white/10"
                  placeholder="e.g. 45 min"
                />
              </div>
            </div>
            <div>
              <Label>URL / Link</Label>
              <Input
                value={editingResource?.url || ''}
                onChange={e => setEditingResource({ ...editingResource, url: e.target.value })}
                className="bg-white/5 border-white/10"
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={editingResource?.description || ''}
                onChange={e => setEditingResource({ ...editingResource, description: e.target.value })}
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-gray-400">
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-cyan-600 hover:bg-cyan-700 text-white">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Resource'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
