import { useState } from 'react';
import { motion } from 'motion/react';
import { Edit, Trash2, Eye, EyeOff, Users, DollarSign, Calendar, MoreVertical } from 'lucide-react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { toast } from 'sonner';

const mockHackathons = [
  {
    id: 1,
    name: 'FinTech Innovation Challenge',
    category: 'FinTech',
    status: 'active',
    startDate: '2026-05-01',
    endDate: '2026-05-03',
    registrations: 342,
    submissions: 87,
    revenue: 25600,
    isPublic: true,
  },
  {
    id: 2,
    name: 'AI Revolution 2026',
    category: 'AI/ML',
    status: 'active',
    startDate: '2026-04-15',
    endDate: '2026-04-17',
    registrations: 289,
    submissions: 72,
    revenue: 21800,
    isPublic: true,
  },
  {
    id: 3,
    name: 'Web3 Future Summit',
    category: 'Web3',
    status: 'upcoming',
    startDate: '2026-06-10',
    endDate: '2026-06-12',
    registrations: 156,
    submissions: 0,
    revenue: 11700,
    isPublic: false,
  },
  {
    id: 4,
    name: 'DeepTech Challenge',
    category: 'DeepTech',
    status: 'completed',
    startDate: '2026-03-01',
    endDate: '2026-03-03',
    registrations: 198,
    submissions: 51,
    revenue: 14900,
    isPublic: true,
  },
];

export function ManageHackathons() {
  const [hackathons, setHackathons] = useState(mockHackathons);

  const togglePublic = (id: number) => {
    setHackathons(
      hackathons.map((h) =>
        h.id === id ? { ...h, isPublic: !h.isPublic } : h
      )
    );
    toast.success('Visibility updated');
  };

  const deleteHackathon = (id: number) => {
    setHackathons(hackathons.filter((h) => h.id !== id));
    toast.success('Hackathon deleted');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'upcoming':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'completed':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'FinTech':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'AI/ML':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Web3':
        return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Manage Hackathons
          </h1>
          <p className="text-gray-400 mt-2">View and manage all your hackathon events</p>
        </div>
        <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white">
          Create New
        </Button>
      </div>

      <div className="space-y-4">
        {hackathons.map((hackathon, i) => (
          <motion.div
            key={hackathon.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold">{hackathon.name}</h3>
                      <Badge className={getStatusColor(hackathon.status)}>
                        {hackathon.status}
                      </Badge>
                      <Badge className={getCategoryColor(hackathon.category)}>
                        {hackathon.category}
                      </Badge>
                      {hackathon.isPublic ? (
                        <Eye className="w-4 h-4 text-green-400" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-400">Duration</p>
                          <p className="text-sm font-medium">
                            {new Date(hackathon.startDate).toLocaleDateString()} -{' '}
                            {new Date(hackathon.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-cyan-400" />
                        <div>
                          <p className="text-xs text-gray-400">Registrations</p>
                          <p className="text-sm font-medium">{hackathon.registrations}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-purple-400/20 flex items-center justify-center">
                          <span className="text-[10px] text-purple-400">📁</span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Submissions</p>
                          <p className="text-sm font-medium">{hackathon.submissions}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <div>
                          <p className="text-xs text-gray-400">Revenue</p>
                          <p className="text-sm font-medium">${hackathon.revenue.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#1a1a2e] border-white/10">
                      <DropdownMenuItem className="cursor-pointer">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => togglePublic(hackathon.id)}
                      >
                        {hackathon.isPublic ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-2" />
                            Make Private
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            Make Public
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer text-red-400"
                        onClick={() => deleteHackathon(hackathon.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
