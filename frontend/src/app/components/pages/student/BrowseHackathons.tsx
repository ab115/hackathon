import { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Users, DollarSign, Trophy, Search, Filter, ExternalLink, Clock } from 'lucide-react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../ui/dialog';
import { Label } from '../../ui/label';
import { toast } from 'sonner';

const mockHackathons = [
  {
    id: 1,
    name: 'FinTech Innovation Challenge 2026',
    category: 'FinTech',
    description: 'Build the next generation of financial technology solutions',
    date: 'May 1-3, 2026',
    registrationFee: 75,
    prizePool: 50000,
    teams: 342,
    maxTeams: 500,
    skills: ['React', 'Blockchain', 'Python'],
    organizer: 'TechCorp',
    difficulty: 'Advanced',
    status: 'open',
  },
  {
    id: 2,
    name: 'AI Revolution 2026',
    category: 'AI/ML',
    description: 'Create AI-powered solutions that change the world',
    date: 'May 15-17, 2026',
    registrationFee: 50,
    prizePool: 40000,
    teams: 289,
    maxTeams: 400,
    skills: ['Python', 'TensorFlow', 'ML'],
    organizer: 'AI Labs',
    difficulty: 'Intermediate',
    status: 'open',
  },
  {
    id: 3,
    name: 'Web3 Future Summit',
    category: 'Web3',
    description: 'Decentralize the future with blockchain technology',
    date: 'June 10-12, 2026',
    registrationFee: 100,
    prizePool: 60000,
    teams: 156,
    maxTeams: 300,
    skills: ['Solidity', 'Web3.js', 'Smart Contracts'],
    organizer: 'CryptoVentures',
    difficulty: 'Advanced',
    status: 'open',
  },
  {
    id: 4,
    name: 'IoT Innovation Week',
    category: 'IoT',
    description: 'Connect the physical and digital worlds',
    date: 'June 20-22, 2026',
    registrationFee: 60,
    prizePool: 35000,
    teams: 98,
    maxTeams: 200,
    skills: ['Arduino', 'Python', 'Hardware'],
    organizer: 'IoT Hub',
    difficulty: 'Beginner',
    status: 'open',
  },
  {
    id: 5,
    name: 'HealthTech Hackathon',
    category: 'HealthTech',
    description: 'Innovate healthcare solutions with technology',
    date: 'July 5-7, 2026',
    registrationFee: 0,
    prizePool: 25000,
    teams: 234,
    maxTeams: 350,
    skills: ['React', 'Node.js', 'Healthcare APIs'],
    organizer: 'MedTech Foundation',
    difficulty: 'Intermediate',
    status: 'open',
  },
];

export function BrowseHackathons() {
  const [hackathons] = useState(mockHackathons);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHackathon, setSelectedHackathon] = useState<typeof mockHackathons[0] | null>(null);

  const filteredHackathons = hackathons.filter((h) =>
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRegister = async () => {
    if (!selectedHackathon) return;
    
    // If free, just register
    if (selectedHackathon.registrationFee === 0) {
      toast.success('Registration Successful!', {
        description: `You're registered for ${selectedHackathon.name}.`,
      });
      setSelectedHackathon(null);
      return;
    }

    try {
      toast.loading('Initializing PayU checkout...');
      
      const payload = {
        amount: selectedHackathon.registrationFee,
        productinfo: selectedHackathon.name,
        firstname: 'Student', // Ideally fetched from context
        email: 'student@example.com',
        phone: '+919999999999'
      };

      // 1. Post to Redpanda Producer endpoint first
      await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: payload.firstname,
          email: payload.email,
          phone: payload.phone,
          college: 'Scaler School of Technology',
          hackathon_id: selectedHackathon.id.toString(),
          team_size: 1
        })
      });

      // 2. Fetch PayU Hash
      const response = await fetch('http://localhost:5000/api/payment/hash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://test.payu.in/_payment';
      
      const params = {
        key: data.key,
        txnid: data.txnid,
        amount: data.amount,
        productinfo: data.productinfo,
        firstname: data.firstname,
        email: data.email,
        phone: data.phone,
        surl: window.location.origin + '/student',
        furl: window.location.origin + '/student',
        hash: data.hash
      };
      
      for (const key in params) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        // @ts-ignore
        input.value = params[key];
        form.appendChild(input);
      }
      
      document.body.appendChild(form);
      form.submit();
      
    } catch (err) {
      toast.error('Payment initialization failed');
      setSelectedHackathon(null);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      FinTech: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      'AI/ML': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      Web3: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      IoT: 'bg-green-500/20 text-green-400 border-green-500/30',
      HealthTech: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    };
    return colors[category] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      Beginner: 'bg-green-500/20 text-green-400',
      Intermediate: 'bg-yellow-500/20 text-yellow-400',
      Advanced: 'bg-red-500/20 text-red-400',
    };
    return colors[difficulty] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Browse Hackathons
        </h1>
        <p className="text-gray-400 mt-2">Find and register for upcoming hackathons</p>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search hackathons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/5 border-white/10"
          />
        </div>
        <Button variant="outline" className="border-white/10">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Hackathons Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredHackathons.map((hackathon, i) => (
          <motion.div
            key={hackathon.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="relative overflow-hidden border-white/10 bg-black/40 backdrop-blur-sm h-full hover:border-cyan-500/30 transition-colors">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5 opacity-50" />

              <CardContent className="relative p-6 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getCategoryColor(hackathon.category)}>
                        {hackathon.category}
                      </Badge>
                      <Badge className={getDifficultyColor(hackathon.difficulty)}>
                        {hackathon.difficulty}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{hackathon.name}</h3>
                    <p className="text-sm text-gray-400">{hackathon.description}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    {hackathon.date}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      ₹{hackathon.prizePool.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      ₹{hackathon.registrationFee}
                      {hackathon.registrationFee === 0 && ' (Free)'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Users className="w-4 h-4 text-purple-400" />
                    {hackathon.teams}/{hackathon.maxTeams} teams registered
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-2">Required Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {hackathon.skills.map((skill, j) => (
                      <span
                        key={j}
                        className="text-xs px-2 py-1 rounded bg-white/5 text-gray-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-auto pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">by {hackathon.organizer}</span>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => setSelectedHackathon(hackathon)}
                          className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white"
                        >
                          Register Now
                        </Button>
                      </DialogTrigger>
                      {selectedHackathon?.id === hackathon.id && (
                        <DialogContent className="bg-[#12121a] border-white/10 max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-2xl">{selectedHackathon.name}</DialogTitle>
                            <DialogDescription>{selectedHackathon.description}</DialogDescription>
                          </DialogHeader>

                          <div className="space-y-4 py-4">
                            {/* Event Details */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-gray-400">Date</Label>
                                <p className="font-medium">{selectedHackathon.date}</p>
                              </div>
                              <div>
                                <Label className="text-gray-400">Category</Label>
                                <Badge className={getCategoryColor(selectedHackathon.category)}>
                                  {selectedHackathon.category}
                                </Badge>
                              </div>
                              <div>
                                <Label className="text-gray-400">Registration Fee</Label>
                                <p className="font-medium text-green-400">
                                  {selectedHackathon.registrationFee === 0
                                    ? 'Free'
                                    : `₹${selectedHackathon.registrationFee}`}
                                </p>
                              </div>
                              <div>
                                <Label className="text-gray-400">Prize Pool</Label>
                                <p className="font-medium text-yellow-400">
                                  ₹{selectedHackathon.prizePool.toLocaleString()}
                                </p>
                              </div>
                            </div>

                            {/* Skills */}
                            <div>
                              <Label className="text-gray-400 mb-2">Required Skills</Label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {selectedHackathon.skills.map((skill, j) => (
                                  <Badge key={j} variant="outline" className="border-white/10">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {/* Team Status */}
                            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                              <div className="flex items-center gap-2 text-yellow-400 mb-2">
                                <Clock className="w-4 h-4" />
                                <span className="font-semibold">Note</span>
                              </div>
                              <p className="text-sm text-gray-300">
                                You can form or join a team after registration. Our AI-powered team
                                matching will help you find the perfect teammates!
                              </p>
                            </div>

                            {/* Payment Info */}
                            {selectedHackathon.registrationFee > 0 && (
                              <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                                <div className="flex items-center gap-2 text-cyan-400 mb-2">
                                  <DollarSign className="w-4 h-4" />
                                  <span className="font-semibold">Payment</span>
                                </div>
                                <p className="text-sm text-gray-300">
                                  Payment will be processed securely via PayU Sandbox.
                                </p>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                              <Button
                                onClick={handleRegister}
                                className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white"
                              >
                                Confirm Registration
                              </Button>
                              <Button variant="outline" className="border-white/10">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Details
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      )}
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
