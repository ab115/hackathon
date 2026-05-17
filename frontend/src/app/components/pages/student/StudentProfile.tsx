import { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Github, Linkedin, Twitter, Globe, Award, Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Badge } from '../../ui/badge';
import { toast } from 'sonner';
import { useAuth } from '../../../../context/AuthContext';
import { userAPI } from '../../../../services/api';

export function StudentProfile() {
  const { user } = useAuth();
  
  const [profile, setProfile] = useState({
    name: user?.full_name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    github: 'alexjohnson', // Still hardcoded for now as DB doesn't have social fields
    linkedin: 'alexjohnson',
    twitter: '@alexjohnson',
    website: 'alexjohnson.dev',
    skills: user?.skills ? user.skills.split(',').map((s: string) => s.trim()) : [],
    interests: user?.interests ? user.interests.split(',').map((s: string) => s.trim()) : [],
  });

  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await userAPI.updateProfile({
        full_name: profile.name,
        bio: profile.bio,
        skills: profile.skills.join(', '),
        interests: profile.interests.join(', ')
      });
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({ ...profile, skills: [...profile.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setProfile({ ...profile, skills: profile.skills.filter((s) => s !== skill) });
  };

  const addInterest = () => {
    if (newInterest.trim() && !profile.interests.includes(newInterest.trim())) {
      setProfile({ ...profile, interests: [...profile.interests, newInterest.trim()] });
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setProfile({ ...profile, interests: profile.interests.filter((i) => i !== interest) });
  };

  return (
    <motion.div
      id="student-profile-view"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl space-y-6"
    >
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          My Profile
        </h1>
        <p className="text-gray-400 mt-2">Manage your profile and preferences</p>
      </div>

      {/* Profile Picture & Basic Info */}
      <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-400" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24 border-2 border-cyan-500/30">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.full_name || 'User'}`} />
              <AvatarFallback>{user?.full_name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" className="border-white/10 mb-2">
                Change Avatar
              </Button>
              <p className="text-xs text-gray-400">JPG, PNG or GIF. Max 5MB</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="bg-white/5 border-white/10"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="bg-white/5 border-white/10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              rows={3}
              className="bg-white/5 border-white/10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-400" />
            Social Links
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="github" className="flex items-center gap-2">
              <Github className="w-4 h-4" />
              GitHub
            </Label>
            <Input
              id="github"
              value={profile.github}
              onChange={(e) => setProfile({ ...profile, github: e.target.value })}
              placeholder="username"
              className="bg-white/5 border-white/10"
            />
          </div>
          <div>
            <Label htmlFor="linkedin" className="flex items-center gap-2">
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </Label>
            <Input
              id="linkedin"
              value={profile.linkedin}
              onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
              placeholder="username"
              className="bg-white/5 border-white/10"
            />
          </div>
          <div>
            <Label htmlFor="twitter" className="flex items-center gap-2">
              <Twitter className="w-4 h-4" />
              Twitter
            </Label>
            <Input
              id="twitter"
              value={profile.twitter}
              onChange={(e) => setProfile({ ...profile, twitter: e.target.value })}
              placeholder="@username"
              className="bg-white/5 border-white/10"
            />
          </div>
          <div>
            <Label htmlFor="website" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Website
            </Label>
            <Input
              id="website"
              value={profile.website}
              onChange={(e) => setProfile({ ...profile, website: e.target.value })}
              placeholder="yoursite.com"
              className="bg-white/5 border-white/10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            Skills
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              placeholder="Add a skill..."
              className="bg-white/5 border-white/10"
            />
            <Button onClick={addSkill} variant="outline" className="border-white/10">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <Badge
                key={skill}
                className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 gap-1"
              >
                {skill}
                <button onClick={() => removeSkill(skill)} className="hover:text-cyan-300">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interests */}
      <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Interests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
              placeholder="Add an interest..."
              className="bg-white/5 border-white/10"
            />
            <Button onClick={addInterest} variant="outline" className="border-white/10">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest) => (
              <Badge
                key={interest}
                className="bg-purple-500/20 text-purple-400 border-purple-500/30 gap-1"
              >
                {interest}
                <button onClick={() => removeInterest(interest)} className="hover:text-purple-300">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex gap-4">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button variant="outline" className="border-white/10">
          Cancel
        </Button>
      </div>
    </motion.div>
  );
}
