import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, GraduationCap, BookOpen, Lock, User as UserIcon, ArrowLeft, Copy, CheckCircle, Info } from 'lucide-react';
import { Card, Button, Input, Alert } from '../components/ui';
import { useStore } from '../store/useStore';
import { UserRole } from '../types';

export default function LoginPage() {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const login = useStore((state) => state.login);
  
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const savedLoginID = localStorage.getItem('generatedLoginID');
    if (savedLoginID) {
      setLoginId(savedLoginID);
      // Optional: Clear it after use so it doesn't persist forever
      localStorage.removeItem('generatedLoginID');
    }
  }, []);

  const handleCopy = () => {
    if (!loginId) return;
    navigator.clipboard.writeText(loginId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const roleConfig: Record<string, { title: string, icon: any, color: string, placeholder: string }> = {
    principal: {
      title: 'Principal Login',
      icon: ShieldCheck,
      color: 'text-accent-blue',
      placeholder: 'e.g. PRN-001'
    },
    teacher: {
      title: 'Teacher Login',
      icon: BookOpen,
      color: 'text-accent-emerald',
      placeholder: 'e.g. TCH-ENG-001'
    },
    student: {
      title: 'Student Login',
      icon: GraduationCap,
      color: 'text-accent-amber',
      placeholder: 'e.g. STU-2024-001'
    }
  };

  const config = roleConfig[role || 'student'];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(loginId, role as UserRole);
      if (success) {
        navigate(`/dashboard/${role}`);
      } else {
        setError('Invalid credentials or account disabled.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('An error occurred during login.');
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
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to portals
        </button>

        <Card className="p-6 md:p-8">
          <div className="text-center mb-6 md:mb-8">
            <div className={`inline-flex items-center justify-center p-3 bg-white/5 rounded-xl mb-4 ${config.color}`}>
              <config.icon className="w-8 h-8" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-1">{config.title}</h2>
            <p className="text-text-secondary text-xs md:text-sm">Enter your credentials to continue</p>
          </div>

          <div className="mb-6">
            <Alert variant="info" icon={Info}>
              Please copy and store your Login ID and Password for future use.
            </Alert>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary ml-1">Login ID</label>
              <div className="relative flex gap-2">
                <div className="relative flex-grow">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <Input 
                    required
                    className="pl-10"
                    placeholder={config.placeholder}
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                  />
                </div>
                <Button 
                  type="button" 
                  variant="secondary" 
                  className="px-3 shrink-0" 
                  onClick={handleCopy}
                  title="Copy Login ID"
                >
                  {copied ? <CheckCircle className="w-4 h-4 text-accent-emerald" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              {copied && <p className="text-[10px] text-accent-emerald ml-1">Login ID copied to clipboard.</p>}
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

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-text-secondary">
                <input type="checkbox" className="rounded border-white/10 bg-white/5 text-accent-blue focus:ring-0" />
                Remember Me
              </label>
              <a href="#" className="text-accent-blue hover:underline">Forgot Password?</a>
            </div>

            {error && (
              <div className="p-3 bg-accent-red/10 border border-accent-red/20 rounded-lg text-accent-red text-sm text-center">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Login to Dashboard
            </Button>
          </form>

          <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-white/5 text-center space-y-4">
            <p className="text-xs md:text-sm text-text-secondary">
              Don't have an account?{' '}
              <button 
                onClick={() => navigate(`/signup/${role}`)}
                className="text-accent-blue hover:underline font-medium"
              >
                Sign up here
              </button>
            </p>
            <p className="text-[10px] md:text-xs text-text-secondary opacity-50">
              Registration is usually managed by the administrator. Use this only if instructed.
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
