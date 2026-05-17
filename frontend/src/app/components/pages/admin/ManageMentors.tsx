import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit, Trash2, Loader2, Users, Calendar, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Badge } from '../../ui/badge';
import { toast } from 'sonner';
import { mentorsAPI } from '../../../../services/api';

export function ManageMentors() {
  const [mentors, setMentors] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [editingMentor, setEditingMentor] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const data = await mentorsAPI.list();
      setMentors(data);
    } catch (err: any) {
      toast.error('Failed to load mentors');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllBookings = async () => {
    try {
      setBookingsLoading(true);
      const data = await mentorsAPI.getMyBookings(); 
      setBookings(data);
    } catch (err: any) {
      console.error('Failed to load bookings');
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this mentor?')) return;
    try {
      await mentorsAPI.delete(id);
      toast.success('Mentor deleted successfully');
      fetchMentors();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete mentor');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Format dates for backend
    const payload = {
        ...editingMentor,
        available_from: editingMentor.available_from ? new Date(editingMentor.available_from).toISOString() : null,
        available_to: editingMentor.available_to ? new Date(editingMentor.available_to).toISOString() : null,
    };

    try {
      if (editingMentor?.id) {
        await mentorsAPI.update(editingMentor.id, payload);
        toast.success('Mentor updated successfully');
      } else {
        await mentorsAPI.create(payload);
        toast.success('Mentor created successfully');
      }
      setIsModalOpen(false);
      fetchMentors();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save mentor');
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = (mentor: any = null) => {
    // Convert ISO to local datetime-local format (YYYY-MM-DDThh:mm)
    const formatForInput = (iso: string) => {
        if (!iso) return '';
        const d = new Date(iso);
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setEditingMentor(mentor ? {
        ...mentor,
        available_from: formatForInput(mentor.available_from),
        available_to: formatForInput(mentor.available_to),
    } : { 
        name: '', title: '', expertise: '', price: 0, availability: '', avatar: '', meeting_link: '',
        available_from: '', available_to: ''
    });
    setIsModalOpen(true);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Mentorship Management
          </h2>
          <p className="text-gray-400 mt-1">Configure experts and monitor session bookings</p>
        </div>
      </div>

      <Tabs defaultValue="mentors" className="w-full" onValueChange={(v) => v === 'bookings' && fetchAllBookings()}>
        <TabsList className="bg-white/5 border-white/10">
          <TabsTrigger value="mentors">Experts List</TabsTrigger>
          <TabsTrigger value="bookings">Session Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="mentors" className="space-y-4 pt-4">
          <div className="flex justify-end">
            <Button onClick={() => openModal()} className="bg-purple-600 hover:bg-purple-700 text-white">
              <Plus className="w-4 h-4 mr-2" /> Add Mentor
            </Button>
          </div>
          <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="p-4 font-semibold text-gray-300">Name</th>
                      <th className="p-4 font-semibold text-gray-300">Title</th>
                      <th className="p-4 font-semibold text-gray-300">Availability</th>
                      <th className="p-4 font-semibold text-gray-300">Price/hr</th>
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
                    ) : mentors.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-400">
                          <Users className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                          No mentors found. Add one to get started.
                        </td>
                      </tr>
                    ) : (
                      mentors.map((mentor) => (
                        <tr key={mentor.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 font-medium text-white">{mentor.name}</td>
                          <td className="p-4 text-gray-400">{mentor.title || '-'}</td>
                          <td className="p-4 text-xs text-gray-400">
                            {mentor.available_from ? (
                                <div className="flex flex-col">
                                    <span>From: {new Date(mentor.available_from).toLocaleString()}</span>
                                    <span>To: {new Date(mentor.available_to).toLocaleString()}</span>
                                </div>
                            ) : (
                                <span>{mentor.availability || 'Not set'}</span>
                            )}
                          </td>
                          <td className="p-4 text-green-400 font-medium">₹{mentor.price}</td>
                          <td className="p-4 text-right">
                            <Button variant="ghost" size="sm" onClick={() => openModal(mentor)} className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 mr-2">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(mentor.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
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
        </TabsContent>

        <TabsContent value="bookings" className="pt-4">
           <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Calendar className="w-5 h-5 text-cyan-400" />
                 Recent Bookings
               </CardTitle>
             </CardHeader>
             <CardContent>
               {bookingsLoading ? (
                 <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                   <Loader2 className="w-8 h-8 animate-spin mb-3" />
                   Loading bookings...
                 </div>
               ) : bookings.length === 0 ? (
                 <div className="text-center py-12 text-gray-400">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    No session bookings found.
                 </div>
               ) : (
                 <div className="space-y-3">
                   {bookings.map((booking) => (
                     <div key={booking.id} className="p-4 rounded-lg border border-white/10 bg-white/5 flex items-center justify-between">
                       <div>
                         <h4 className="font-bold text-white">{booking.topic || 'Mentorship Session'}</h4>
                         <p className="text-sm text-gray-400">with {booking.mentor?.name} · User ID: {booking.user_id}</p>
                         <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                           <Clock className="w-3 h-3" /> {booking.scheduled_at}
                         </div>
                       </div>
                       <div className="text-right">
                         <Badge className={booking.payment_status === 'SUCCESS' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}>
                           {booking.payment_status === 'SUCCESS' ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                           {booking.payment_status}
                         </Badge>
                         <p className="text-lg font-bold text-white mt-1">₹{booking.fee}</p>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
             </CardContent>
           </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#12121a] border-white/10 max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingMentor?.id ? 'Edit Mentor' : 'Add Mentor'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input
                  required
                  value={editingMentor?.name || ''}
                  onChange={e => setEditingMentor({ ...editingMentor, name: e.target.value })}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  value={editingMentor?.title || ''}
                  onChange={e => setEditingMentor({ ...editingMentor, title: e.target.value })}
                  className="bg-white/5 border-white/10"
                  placeholder="e.g. Senior SWE"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Expertise (comma separated)</Label>
                <Input
                  value={editingMentor?.expertise || ''}
                  onChange={e => setEditingMentor({ ...editingMentor, expertise: e.target.value })}
                  className="bg-white/5 border-white/10"
                  placeholder="React, Node, Web3"
                />
              </div>
              <div>
                <Label>Price per Hour (₹)</Label>
                <Input
                  type="number"
                  min="0"
                  value={editingMentor?.price || ''}
                  onChange={e => setEditingMentor({ ...editingMentor, price: parseFloat(e.target.value) || 0 })}
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Available From</Label>
                <Input
                  type="datetime-local"
                  value={editingMentor?.available_from || ''}
                  onChange={e => setEditingMentor({ ...editingMentor, available_from: e.target.value })}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div>
                <Label>Available To</Label>
                <Input
                  type="datetime-local"
                  value={editingMentor?.available_to || ''}
                  onChange={e => setEditingMentor({ ...editingMentor, available_to: e.target.value })}
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Avatar URL (optional)</Label>
                <Input
                  value={editingMentor?.avatar || ''}
                  onChange={e => setEditingMentor({ ...editingMentor, avatar: e.target.value })}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div>
                <Label>Meeting Link (optional)</Label>
                <Input
                  value={editingMentor?.meeting_link || ''}
                  onChange={e => setEditingMentor({ ...editingMentor, meeting_link: e.target.value })}
                  className="bg-white/5 border-white/10"
                  placeholder="https://meet.google.com/..."
                />
              </div>
            </div>
            
            <div>
               <Label>Notes/Description (optional)</Label>
               <Input
                  value={editingMentor?.availability || ''}
                  onChange={e => setEditingMentor({ ...editingMentor, availability: e.target.value })}
                  className="bg-white/5 border-white/10"
                  placeholder="Additional info about availability..."
                />
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-gray-400">
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-purple-600 hover:bg-purple-700 text-white">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Mentor'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
