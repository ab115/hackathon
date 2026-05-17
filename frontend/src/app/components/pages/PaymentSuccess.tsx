import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, IndianRupee, Home, FileCode, Download, Share2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

export function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const txnid   = searchParams.get('txnid') || 'N/A';
  const amount  = searchParams.get('amount') || '0.00';
  const product = searchParams.get('product') || 'Hackathon Registration';
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] to-[#12121a] text-white flex items-center justify-center p-6">
      {/* Confetti dots */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -20, x: Math.random() * window.innerWidth, opacity: 1 }}
              animate={{ y: window.innerHeight + 20, opacity: 0 }}
              transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5 }}
              className="absolute w-2 h-2 rounded-full"
              style={{ backgroundColor: ['#00d9ff', '#a855f7', '#ec4899', '#10b981'][i % 4] }}
            />
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-green-400 via-cyan-400 to-emerald-400" />
          <CardContent className="p-8 text-center">
            {/* Success icon */}
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h1 className="text-2xl font-bold mb-1 text-green-400">Payment Successful!</h1>
              <p className="text-gray-400 text-sm mb-6">Payment Successful — You're registered!</p>
            </motion.div>

            {/* Transaction details */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 text-left space-y-3"
            >
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Hackathon</span>
                <span className="font-medium truncate max-w-[200px]">{decodeURIComponent(product)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Amount Paid</span>
                <span className="font-bold text-green-400 flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5" />
                  {parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Transaction ID</span>
                <span className="font-mono text-xs text-cyan-400">{txnid}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Status</span>
                <span className="text-green-400 font-semibold">✓ SUCCESS</span>
              </div>
            </motion.div>

            <p className="text-xs text-gray-500 mb-6">
              A confirmation email has been sent to your registered email address.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="flex flex-col gap-3"
            >
              <Link to="/student/hackathons">
                <Button className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white">
                  <FileCode className="w-4 h-4 mr-2" /> View My Registrations
                </Button>
              </Link>
              <Link to="/student">
                <Button variant="outline" className="w-full border-white/10">
                  <Home className="w-4 h-4 mr-2" /> Go to Dashboard
                </Button>
              </Link>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
