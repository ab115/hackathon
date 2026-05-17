import { motion } from 'motion/react';
import { XCircle, RefreshCw, Home, Phone } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

export function PaymentFailure() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const txnid = searchParams.get('txnid') || 'N/A';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] to-[#12121a] text-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />
          <CardContent className="p-8 text-center">
            {/* Failure icon */}
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center mx-auto mb-6"
            >
              <XCircle className="w-10 h-10 text-red-400" />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h1 className="text-2xl font-bold mb-1 text-red-400">भुगतान विफल</h1>
              <p className="text-gray-400 text-sm mb-6">Payment Failed — Your transaction was not completed</p>
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 text-left space-y-3"
            >
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Transaction ID</span>
                <span className="font-mono text-xs text-red-400">{txnid}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Status</span>
                <span className="text-red-400 font-semibold">✗ FAILED</span>
              </div>
            </motion.div>

            {/* Common reasons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-6 text-left"
            >
              <p className="text-xs text-orange-400 font-semibold mb-2 uppercase tracking-wide">Common Reasons</p>
              <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
                <li>Insufficient account balance</li>
                <li>Bank server timeout — please retry</li>
                <li>Card declined by issuing bank</li>
                <li>Incorrect OTP or authentication failed</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              className="flex flex-col gap-3"
            >
              <Button
                onClick={() => navigate(-2)}
                className="w-full bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Try Again
              </Button>
              <Link to="/student">
                <Button variant="outline" className="w-full border-white/10">
                  <Home className="w-4 h-4 mr-2" /> Go to Dashboard
                </Button>
              </Link>
              <a href="mailto:support@scalegrad.com">
                <Button variant="ghost" className="w-full text-gray-400 hover:text-white">
                  <Phone className="w-4 h-4 mr-2" /> Contact Support
                </Button>
              </a>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
