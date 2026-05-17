import { useState } from 'react';
import { motion } from 'motion/react';
import {
  CreditCard, ShieldCheck, XCircle, CheckCircle2, ArrowRight,
  Lock, Smartphone, Building2, IndianRupee,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { paymentAPI } from '../../../services/api';

type ProcessingStep = 'connecting' | 'verifying' | 'processing' | 'done';

export function PayUSimulator() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<ProcessingStep | null>(null);

  const amount        = searchParams.get('amount') || '0.00';
  const productInfo   = searchParams.get('productinfo') || 'Platform Service';
  const email         = searchParams.get('email') || 'user@example.com';
  const registrationId = searchParams.get('registration_id') ? Number(searchParams.get('registration_id')) : null;
  const bookingId      = searchParams.get('booking_id') ? Number(searchParams.get('booking_id')) : null;
  const txnid         = searchParams.get('txnid') || '';
  const baseAmount    = searchParams.get('base_amount') || amount;
  const gstAmount     = searchParams.get('gst_amount') || '0';

  const STEPS: { key: ProcessingStep; label: string }[] = [
    { key: 'connecting', label: 'बैंक से कनेक्ट हो रहे हैं...' },
    { key: 'verifying',  label: 'खाता सत्यापन हो रहा है...' },
    { key: 'processing', label: 'लेन-देन प्रोसेस हो रहा है...' },
    { key: 'done',       label: 'पूर्ण!' },
  ];

  const handlePayment = async (status: 'success' | 'failure') => {
    if (!registrationId && !bookingId) {
      toast.error('Invalid payment session. Please start over.');
      navigate(-1);
      return;
    }

    setIsProcessing(true);

    // Simulate realistic step-by-step processing
    for (const s of STEPS) {
      setStep(s.key);
      await new Promise(r => setTimeout(r, s.key === 'done' ? 400 : 800));
    }

    try {
      const payload: any = { status };
      if (registrationId) payload.registration_id = registrationId;
      if (bookingId) payload.booking_id = bookingId;

      const result = await paymentAPI.simulatePayment(payload);

      setIsProcessing(false);
      if (status === 'success') {
        toast.success('भुगतान सफल! Payment Successful!', {
          description: `₹${amount} paid for ${productInfo}. Transaction: ${result.transaction_id}`,
        });
        navigate(`/payment/success?txnid=${result.transaction_id}&amount=${amount}&product=${encodeURIComponent(productInfo)}`);
      } else {
        toast.error('भुगतान विफल — Payment Failed', {
          description: 'The transaction was declined. Please try again.',
        });
        navigate(`/payment/failure?txnid=${txnid}`);
      }
    } catch (err: any) {
      setIsProcessing(false);
      toast.error('Payment processing error', { description: err.message });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        {/* PayU Branding */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#0c4f8a] rounded-lg flex items-center justify-center text-white font-bold text-sm">P</div>
            <span className="text-2xl font-bold tracking-tight text-slate-800">
              PayU <span className="font-light text-slate-500">India Simulator</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Lock className="w-3 h-3 text-green-600" /> SSL ENCRYPTED
          </div>
        </div>

        <Card className="border-slate-200 shadow-xl overflow-hidden bg-white">
          {/* Order Summary Header */}
          <div className="bg-[#0c4f8a] p-6 text-white">
            <div className="flex justify-between items-center mb-3">
              <span className="text-blue-200 text-sm">Order Summary</span>
              <span className="bg-yellow-400/20 text-yellow-300 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Test Mode
              </span>
            </div>

            {/* GST Breakdown */}
            <div className="space-y-1 mb-4 text-sm text-blue-200">
              <div className="flex justify-between">
                <span>Base Amount</span>
                <span>₹{parseFloat(baseAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18%)</span>
                <span>₹{parseFloat(gstAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="border-t border-white/20 pt-1 flex justify-between text-white font-bold text-lg">
                <span>Total</span>
                <span className="flex items-center gap-1">
                  <IndianRupee className="w-4 h-4" />
                  {parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-end text-sm">
              <p className="text-blue-200 truncate max-w-[200px]">{productInfo}</p>
              <div className="text-right">
                <p className="text-xs text-blue-300 uppercase tracking-widest mb-0.5">Paying As</p>
                <p className="text-sm font-medium truncate max-w-[180px]">{email}</p>
              </div>
            </div>
          </div>

          <CardContent className="p-8">
            {isProcessing ? (
              <div className="py-10 flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-slate-100 border-t-[#0c4f8a] rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <IndianRupee className="w-6 h-6 text-[#0c4f8a]" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-700">
                    {STEPS.find(s => s.key === step)?.label}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">Please do not close this window</p>
                </div>
                {/* Step indicators */}
                <div className="flex gap-2">
                  {STEPS.map(s => (
                    <div key={s.key} className={`w-2 h-2 rounded-full transition-colors ${
                      step === s.key ? 'bg-[#0c4f8a]' : 'bg-slate-200'
                    }`} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" /> Select Simulation Outcome
                </h3>

                {/* Payment method icons */}
                <div className="flex gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  {['UPI', 'SBI', 'HDFC', 'Paytm'].map(m => (
                    <span key={m} className="text-xs px-2 py-1 bg-white border border-slate-200 rounded text-slate-500 font-medium">{m}</span>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => handlePayment('success')}
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-green-500 hover:bg-green-50/50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-slate-800">Simulate Success</p>
                        <p className="text-xs text-slate-500">Transaction → SUCCESS · {bookingId ? 'Booking confirmed' : 'Registration confirmed'}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-green-500 transition-colors" />
                  </button>

                  <button
                    onClick={() => handlePayment('failure')}
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-red-500 hover:bg-red-50/50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                        <XCircle className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-slate-800">Simulate Failure</p>
                        <p className="text-xs text-slate-500">Transaction → FAILED · Bank declined</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-red-500 transition-colors" />
                  </button>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    100% Secure · PCI-DSS Compliant · PayU India
                  </div>
                  <Button variant="ghost" className="text-slate-400 hover:text-slate-600 text-xs" onClick={() => navigate(-1)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center mt-6 text-slate-400 text-xs font-medium uppercase tracking-[0.2em]">
          कृपया इस पृष्ठ को बंद न करें · Do not refresh this page
        </p>
      </motion.div>
    </div>
  );
}
