import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Zap, Trophy, Users, Code2, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';

export function LandingPage() {
  const features = [
    { icon: Zap, title: 'Lightning Fast', desc: 'Instant registration and deployment' },
    { icon: Trophy, title: 'Live Leaderboards', desc: 'Real-time rankings and achievements' },
    { icon: Users, title: 'AI Team Matching', desc: 'Find your perfect team with AI' },
    { icon: Code2, title: 'Instant Judging', desc: 'Automated scoring and feedback' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#12121a] to-[#0a0a0f] text-white overflow-hidden">
      {/* Grid Background */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(#00d9ff20 1px, transparent 1px), linear-gradient(90deg, #00d9ff20 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="relative z-10 border-b border-white/10 backdrop-blur-xl bg-black/20"
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center shrink-0">
              <img src="/icon.svg" alt="Scalegrad Icon" className="w-8 h-8" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Scalegrad
            </span>
          </div>
          <div className="flex gap-3">
            <Link to="/student">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Student Portal
              </Button>
            </Link>
            <Link to="/admin">
              <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white">
                Admin Portal
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <div className="relative container mx-auto px-6 pt-20 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="inline-block px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm mb-6"
            style={{
              backgroundSize: '200% 100%',
            }}
          >
            <span className="text-sm text-purple-300">🚀 Next-Gen Hackathon Platform</span>
          </motion.div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            Where Innovation
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Meets Competition
            </span>
          </h1>

          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            The ultimate platform for deeptech and fintech hackathons. AI-powered team matching,
            real-time judging, and instant rewards.
          </p>

          <div className="flex gap-4 justify-center">
            <Link to="/student">
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white gap-2">
                Join as Participant <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/admin">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Host a Hackathon
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Floating Cards */}
        <div className="mt-20 grid md:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              whileHover={{ y: -5 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all" />
              <div className="relative p-6 rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm">
                <feature.icon className="w-8 h-8 text-cyan-400 mb-4" />
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="relative border-y border-white/10 bg-black/40 backdrop-blur-xl py-12"
      >
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Active Hackathons', value: '127' },
              { label: 'Registered Teams', value: '12.5K' },
              { label: 'Prize Pool', value: '₹200M' },
              { label: 'Success Rate', value: '94%' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Features Section */}
      <div className="relative container mx-auto px-6 py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Win
            </span>
          </h2>
          <p className="text-gray-400 text-lg">Powered by cutting-edge technology</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              title: 'AI-Powered Team Matching',
              desc: 'Our advanced algorithm matches you with teammates based on skills, interests, and availability.',
              features: ['Skill compatibility analysis', 'Real-time matching', 'Smart recommendations'],
            },
            {
              title: 'Live Judging & Scoring',
              desc: 'Transparent real-time judging with automated scoring and instant feedback from experts.',
              features: ['Multi-criteria evaluation', 'Instant results', 'Detailed feedback'],
            },
            {
              title: 'Mentorship Marketplace',
              desc: 'Connect with industry experts and mentors who can guide your project to success.',
              features: ['1-on-1 sessions', 'Expert guidance', 'Industry connections'],
            },
            {
              title: 'Achievement System',
              desc: 'Earn badges, NFT rewards, and build your developer portfolio with every hackathon.',
              features: ['Digital badges', 'NFT certificates', 'Portfolio building'],
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
              <div className="relative p-8 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm">
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-400 mb-6">{item.desc}</p>
                <div className="space-y-2">
                  {item.features.map((feature, j) => (
                    <div key={j} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="relative container mx-auto px-6 py-20 mb-20"
      >
        <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm p-12 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-3xl" />
          <div className="relative">
            <h2 className="text-4xl font-bold mb-4">Ready to Build the Future?</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Join thousands of innovators competing on Scalegrad - the most advanced hackathon platform
            </p>
            <div className="flex flex-col items-center gap-8">
              <Link to="/student">
                <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white gap-2">
                  Get Started Now <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <img src="/Powered by Scalegrad.svg" alt="Powered by Scalegrad" className="h-8 opacity-50" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="relative border-t border-white/10 bg-black/60 backdrop-blur-xl py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start gap-4">
              <img src="/Scalegrad Logo.svg" alt="Scalegrad Logo" className="h-10" />
              <p className="text-gray-500 text-sm">© 2026 Scalegrad. All rights reserved.</p>
            </div>
            <div className="flex gap-8">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="mailto:support@scalegrad.com" className="text-gray-400 hover:text-white transition-colors">Contact Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
