import { useState } from 'react';
import { motion } from 'motion/react';
import { MessageCircle, Calendar, Star, Clock, DollarSign, Video, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { toast } from 'sonner';

const mentors = [
  {
    id: 1,
    name: 'Dr. Sarah Mitchell',
    avatar: 'Sarah',
    title: 'Senior AI Engineer @ Google',
    expertise: ['Machine Learning', 'Deep Learning', 'Python'],
    rating: 4.9,
    sessions: 156,
    price: 50,
    availability: ['Mon 2-4pm', 'Wed 6-8pm'],
  },
  {
    id: 2,
    name: 'Alex Rodriguez',
    avatar: 'Alex',
    title: 'Blockchain Lead @ Coinbase',
    expertise: ['Web3', 'Solidity', 'Smart Contracts'],
    rating: 4.8,
    sessions: 132,
    price: 75,
    availability: ['Tue 3-5pm', 'Thu 7-9pm'],
  },
  {
    id: 3,
    name: 'Emily Chen',
    avatar: 'Emily',
    title: 'Product Designer @ Stripe',
    expertise: ['UI/UX', 'Figma', 'Design Systems'],
    rating: 4.9,
    sessions: 198,
    price: 40,
    availability: ['Mon 5-7pm', 'Fri 2-4pm'],
  },
  {
    id: 4,
    name: 'Michael Park',
    avatar: 'Michael',
    title: 'Full-Stack Dev @ Meta',
    expertise: ['React', 'Node.js', 'System Design'],
    rating: 4.7,
    sessions: 89,
    price: 60,
    availability: ['Wed 4-6pm', 'Sat 10am-12pm'],
  },
];

const mySessions = [
  {
    id: 1,
    mentor: 'Dr. Sarah Mitchell',
    topic: 'ML Model Optimization',
    date: 'Tomorrow, 2:00 PM',
    status: 'upcoming',
  },
];

export function Mentorship() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expertise, setExpertise] = useState('all');

  const filteredMentors = mentors.filter(
    (mentor) =>
      (expertise === 'all' || mentor.expertise.includes(expertise)) &&
      mentor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBookSession = (name: string) => {
    toast.success(`Session booked with ${name}!`, {
      description: 'Check your email for meeting details.',
    });
  };

  return (
    <motion.div
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

      {/* My Sessions */}
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
                  className="p-4 rounded-lg border border-white/10 bg-gradient-to-r from-green-500/10 to-teal-500/10"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold mb-1">{session.topic}</h3>
                      <p className="text-sm text-gray-400">with {session.mentor}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-300">
                        <Clock className="w-4 h-4 text-green-400" />
                        {session.date}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="border-white/10 gap-2"
                    >
                      <Video className="w-4 h-4" />
                      Join Meeting
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
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
            <Select value={expertise} onValueChange={setExpertise}>
              <SelectTrigger className="w-64 bg-white/5 border-white/10">
                <SelectValue placeholder="Filter by expertise" />
              </SelectTrigger>
              <SelectContent>
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

      {/* Mentors Grid */}
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
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.avatar}`}
                    />
                    <AvatarFallback>{mentor.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{mentor.name}</h3>
                    <p className="text-sm text-gray-400 mb-2">{mentor.title}</p>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-semibold">{mentor.rating}</span>
                      </div>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-400">{mentor.sessions} sessions</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">${mentor.price}</div>
                    <p className="text-xs text-gray-400">/hour</p>
                  </div>
                </div>

                {/* Expertise */}
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-2">Expertise:</p>
                  <div className="flex flex-wrap gap-1">
                    {mentor.expertise.map((skill, j) => (
                      <Badge
                        key={j}
                        className="text-xs bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-2">Available:</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {mentor.availability.map((slot, j) => (
                      <span
                        key={j}
                        className="px-2 py-1 rounded bg-white/5 text-gray-300 border border-white/10"
                      >
                        <Clock className="w-3 h-3 inline mr-1" />
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action */}
                <Button
                  onClick={() => handleBookSession(mentor.name)}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Book Session
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* How it Works */}
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
