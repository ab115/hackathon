import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MessageCircle, Calendar, Star, Clock, IndianRupee, Video, Search, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { toast } from 'sonner';
import { mentorsAPI, paymentAPI } from '../../../../services/api';
import { useAuth } from '../../../../context/AuthContext';
import { useNavigate } from 'react-router';

export function Mentorship() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mentors, setMentors] = useState<any[]>([]);
  const [mySessions, setMySessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expertiseFilter, setExpertiseFilter] = useState('all');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mentorData, bookingData] = await Promise.all([
        mentorsAPI.list(),
        user ? mentorsAPI.getMyBookings() : Promise.resolve([])
      ]);

      const formattedMentors = mentorData.map((m: any) => ({
        ...m,
        expertise: m.expertise ? m.expertise.split(',').map((s: string) => s.trim()) : [],
      }));
      setMentors(formattedMentors);
      setMySessions(bookingData || []);
    } catch (err) {
      console.error('Failed to load mentorship data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const filteredMentors = mentors.filter(
    (mentor) =>
      (expertiseFilter === 'all' || mentor.expertise.includes(expertiseFilter)) &&
      mentor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBookSession = async (mentor: any) => {
    if (!user) {
      toast.error('Please login to book a session');
      return;
    }

    try {
      toast.loading('Initialising payment...', { id: 'pay-mentor' });
      const result = await paymentAPI.initiatePayment({
        mentor_id: mentor.id,
        amount: mentor.price,
        email: user.email,
        phone: user.phone || '9999999999',
      });
      toast.dismiss('pay-mentor');

      const params = new URLSearchParams({
        txnid:           result.transaction_id,
        booking_id:      String(result.booking_id),
        amount:          result.amount_details.total_formatted.replace(/[^\d.]/g, ''),
        base_amount:     String(result.amount_details.base_amount),
        gst_amount:      String(result.amount_details.gst_amount),
        productinfo:     `Mentorship with ${mentor.name}`,
        email:           user.email,
      });
      navigate(`/payu-simulator?${params.toString()}`);
      
    } catch (err: any) {
      toast.dismiss('pay-mentor');
      toast.error(err.message || 'Booking failed. Please try again.');
    }
  };

  const formatDateTime = (iso: string) => {
    if (!iso) return '';
    return new Date(iso).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
        <p className="text-gray-400">Loading mentors...</p>
      </div>
    );
  }

  return (
    <motion.div
      id="student-mentorship-view"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Mentorship Marketplace
        </h1>
        <p className="text-gray-400 mt-2">Connect with industry experts for guidance</p>
      </div>

      {mySessions.length > 0 && (
        <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              My Upcoming Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mySessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-4 rounded-lg border ${
                    session.payment_status === 'SUCCESS' 
                      ? 'border-green-500/20 bg-green-500/5' 
                      : 'border-orange-500/20 bg-orange-500/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                         <h3 className="font-semibold">{session.topic || 'Mentorship Session'}</h3>
                         <Badge variant="outline" className={session.payment_status === 'SUCCESS' ? 'text-green-400 border-green-500/30' : 'text-orange-400 border-orange-500/30'}>
                           {session.payment_status}
                         </Badge>
                      </div>
                      <p className="text-sm text-gray-400">with {session.mentor?.name || 'Mentor'}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-300">
                        <Clock className="w-4 h-4 text-green-400" />
                        {session.scheduled_at}
                      </div>
                    </div>
                    {session.payment_status === 'SUCCESS' && (
                      <Button
                        variant="outline"
                        className="border-white/10 gap-2"
                        onClick={() => {
                          if (session.mentor?.meeting_link) {
                            window.open(session.mentor.meeting_link, '_blank');
                          } else {
                            toast.info('Meeting link not yet available. Please check back later.');
                          }
                        }}
                      >
                        <Video className="w-4 h-4" />
                        Join Meeting
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search mentors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/10"
              />
            </div>
            <Select value={expertiseFilter} onValueChange={setExpertiseFilter}>
              <SelectTrigger className="w-64 bg-white/5 border-white/10">
                <SelectValue placeholder="Filter by expertise" />
              </SelectTrigger>
              <SelectContent className="bg-[#0f0f1a] border-white/10">
                <SelectItem value="all">All Expertise</SelectItem>
                <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                <SelectItem value="Web3">Web3</SelectItem>
                <SelectItem value="UI/UX">UI/UX</SelectItem>
                <SelectItem value="React">React</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {filteredMentors.map((mentor, i) => (
          <motion.div
            key={mentor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-white/10 bg-black/40 backdrop-blur-sm hover:border-cyan-500/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="w-16 h-16 border-2 border-cyan-500/30">
                    <AvatarImage
                      src={mentor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.name}`}
                    />
                    <AvatarFallback>{mentor.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{mentor.name}</h3>
                    <p className="text-sm text-gray-400 mb-2">{mentor.title}</p>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-semibold">{mentor.rating || 0}</span>
                      </div>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-400">{mentor.sessions || 0} sessions</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">₹{mentor.price}</div>
                    <p className="text-xs text-gray-400">/hour</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-2">Expertise:</p>
                  <div className="flex flex-wrap gap-1">
                    {mentor.expertise.map((skill: string, j: number) => (
                      <Badge
                        key={j}
                        className="text-xs bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-2">Available Slot:</p>
                  <div className="p-3 rounded bg-white/5 border border-white/10 flex items-center justify-between text-sm">
                    <div className="flex flex-col">
                        <span className="text-gray-400 text-[10px] uppercase">From</span>
                        <span className="text-cyan-400 font-medium">{formatDateTime(mentor.available_from) || 'N/A'}</span>
                    </div>
                    <div className="h-6 w-px bg-white/10" />
                    <div className="flex flex-col text-right">
                        <span className="text-gray-400 text-[10px] uppercase">To</span>
                        <span className="text-purple-400 font-medium">{formatDateTime(mentor.available_to) || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {(() => {
                  const isBooked = mySessions.some(s => s.mentor_id === mentor.id && s.payment_status === 'SUCCESS');
                  return (
                    <Button
                      onClick={() => !isBooked && handleBookSession(mentor)}
                      disabled={isBooked}
                      className={`w-full gap-2 ${
                        isBooked 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-default' 
                          : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white'
                      }`}
                    >
                      {isBooked ? (
                        <>
                          <Video className="w-4 h-4" />
                          Already Booked
                        </>
                      ) : (
                        <>
                          <MessageCircle className="w-4 h-4" />
                          Book Session
                        </>
                      )}
                    </Button>
                  );
                })()}
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {filteredMentors.length === 0 && (
          <p className="col-span-2 text-center text-gray-400">No mentors found.</p>
        )}
      </div>

      <Card className="border-white/10 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-purple-400" />
            How Mentorship Works
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-300">
            <div>
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold mb-2">
                1
              </div>
              <p>
                <strong className="text-white">Browse & Select</strong>
                <br />
                Find mentors based on expertise and availability
              </p>
            </div>
            <div>
              <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold mb-2">
                2
              </div>
              <p>
                <strong className="text-white">Book Session</strong>
                <br />
                Choose a time slot and complete secure payment
              </p>
            </div>
            <div>
              <div className="w-8 h-8 rounded-full bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 font-bold mb-2">
                3
              </div>
              <p>
                <strong className="text-white">Get Guidance</strong>
                <br />
                Join the video call and get expert advice
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
