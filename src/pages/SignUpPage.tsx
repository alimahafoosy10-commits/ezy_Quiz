import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, ArrowLeft, Lock, Mail } from 'lucide-react';
import { Card, Button, Input } from '../components/ui';
import { supabase } from '../supabaseClient';

export default function SignUpPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else if (data.session) {
      navigate('/');
    } else {
      setSuccessMessage("Check your email and confirm your account before logging in.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-primary-bg relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)', backgroundSize: '100px 100px' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md z-10"
      >
        <button 
          onClick={() => navigate('/')}
          className="flex items-center text-text-secondary hover:text-text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to home
        </button>

        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-accent-blue/10 rounded-xl mb-4">
              <ShieldCheck className="w-8 h-8 text-accent-blue" />
            </div>
            <h2 className="text-2xl font-bold mb-1">Create Account</h2>
            <p className="text-text-secondary text-sm">Join ezyQuiz today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <Input 
                  required
                  type="email"
                  className="pl-10"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <Input 
                  required
                  type="password"
                  className="pl-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 bg-accent-red/10 border border-accent-red/20 rounded-lg text-accent-red text-sm text-center"
                >
                  {error}
                </motion.div>
              )}
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 bg-accent-emerald/10 border border-accent-emerald/20 rounded-lg text-accent-emerald text-sm text-center"
                >
                  {successMessage}
                </motion.div>
              )}
            </AnimatePresence>

            <Button 
              type="submit" 
              className="w-full" 
              isLoading={isLoading}
            >
              Sign Up
            </Button>

            <p className="text-center text-sm text-text-secondary">
              Already have an account?{' '}
              <Link to="/login" className="text-accent-blue hover:underline font-medium">
                Sign In
              </Link>
            </p>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
