import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, User as UserIcon, Mail, Lock, ArrowLeft, RefreshCw, Copy, CheckCircle, Info } from 'lucide-react';
import { Card, Button, Input, Alert, Modal } from '../components/ui';
import { supabase } from '../lib/supabase';
import { generateUniqueId } from '../lib/idUtils';

export default function PrincipalSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    loginId: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateId = async () => {
    setIsGenerating(true);
    try {
      const newId = await generateUniqueId('PRN-');
      setFormData(prev => ({ ...prev, loginId: newId }));
      setError('');
    } catch (err) {
      setError('Failed to generate ID. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!formData.loginId) return;
    navigator.clipboard.writeText(formData.loginId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.loginId) {
      setError('Please generate a Login ID first.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      // Check if a principal already exists
      const { data: existingPrincipal, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'principal')
        .maybeSingle();

      if (checkError && checkError.message.includes('schema cache')) {
        throw new Error('Database schema missing: The "users" table was not found. Please run the SQL setup script in your Supabase dashboard.');
      }

      if (existingPrincipal) {
        setError('A Principal account already exists. Only one is allowed.');
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase
        .from('users')
        .insert([
          {
            id: formData.loginId,
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: 'principal'
          }
        ]);

      if (insertError) throw insertError;
      
      // Store generated Login ID for pre-filling the login form
      localStorage.setItem('generatedLoginID', formData.loginId);

      setShowModal(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-primary-bg relative overflow-hidden">
      <Modal 
        isOpen={showModal} 
        onClose={() => navigate('/login/principal')}
        title="Account Created Successfully"
      >
        <div className="space-y-6">
          <Alert variant="success" icon={CheckCircle}>
            Account created successfully. Please copy and store your Login ID and Password for future use.
          </Alert>
          
          <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-2">
            <p className="text-[10px] text-text-secondary uppercase font-bold">Your Login ID</p>
            <p className="text-xl font-mono font-bold text-accent-blue">{formData.loginId}</p>
          </div>

          <div className="flex flex-col gap-3">
            <Button variant="secondary" onClick={handleCopy} className="w-full">
              {copied ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? 'Copied to Clipboard' : 'Copy Login ID'}
            </Button>
            <Button onClick={() => navigate('/login/principal')} className="w-full">
              Continue to Login
            </Button>
          </div>
        </div>
      </Modal>

      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)', backgroundSize: '100px 100px' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <button 
          onClick={() => navigate('/login/principal')}
          className="flex items-center text-text-secondary hover:text-text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to login
        </button>

        <Card className="p-6 md:p-8">
          <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-xl mb-4 text-accent-blue">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-1">Principal Signup</h2>
            <p className="text-text-secondary text-xs md:text-sm">Create the ezyQuiz administrative account</p>
          </div>

          <div className="mb-6">
            <Alert variant="info" icon={Info}>
              Please copy and store your Login ID and Password for future use.
            </Alert>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <Input 
              label="Principal Name" 
              placeholder="Dr. Sarah Jenkins" 
              required
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
            
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="sarah@example.com" 
              required
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input 
                label="Password" 
                type="password" 
                placeholder="••••••••" 
                required
                value={formData.password}
                onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
              />
              <Input 
                label="Confirm Password" 
                type="password" 
                placeholder="••••••••" 
                required
                value={formData.confirmPassword}
                onChange={e => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary ml-1">Login ID</label>
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <Input 
                    readOnly
                    className="pl-10 bg-white/5"
                    placeholder="PRN-001"
                    value={formData.loginId}
                  />
                </div>
                <Button type="button" variant="secondary" onClick={handleCopy} className="px-3" title="Copy Login ID">
                  {copied ? <CheckCircle className="w-4 h-4 text-accent-emerald" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button type="button" variant="secondary" onClick={generateId} className="px-3" title="Generate ID" isLoading={isGenerating}>
                  {!isGenerating && <RefreshCw className="w-4 h-4" />}
                </Button>
              </div>
              {copied && <p className="text-[10px] text-accent-emerald ml-1">Login ID copied to clipboard.</p>}
              <p className="text-[10px] text-text-secondary ml-1">Click to generate the unique admin ID</p>
            </div>

            {error && (
              <div className="p-3 bg-accent-red/10 border border-accent-red/20 rounded-lg text-accent-red text-sm text-center">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-accent-emerald/10 border border-accent-emerald/20 rounded-lg text-accent-emerald text-sm text-center">
                {success}
              </div>
            )}

            <Button type="submit" className="w-full" isLoading={loading}>
              Create Account
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
