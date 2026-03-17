import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, GraduationCap, BookOpen, ArrowRight } from 'lucide-react';
import { Card, Button } from '../components/ui';

const portals = [
  {
    id: 'principal',
    title: 'Principal Portal',
    description: 'School-wide monitoring, analytics, and administrative control.',
    icon: ShieldCheck,
    color: 'text-accent-blue',
    bg: 'hover:border-accent-blue/50'
  },
  {
    id: 'teacher',
    title: 'Teacher Portal',
    description: 'Create exams, manage question banks, and monitor live tests.',
    icon: BookOpen,
    color: 'text-accent-emerald',
    bg: 'hover:border-accent-emerald/50'
  },
  {
    id: 'student',
    title: 'Student Portal',
    description: 'Take exams, view results, and track academic progress.',
    icon: GraduationCap,
    color: 'text-accent-amber',
    bg: 'hover:border-accent-amber/50'
  }
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Grid Motif */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#3B82F6 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 z-10"
      >
        <h1 className="text-6xl font-bold tracking-tighter mb-4">
          ezy<span className="text-accent-blue">Quiz</span>
        </h1>
        <p className="text-text-secondary text-lg max-w-md mx-auto">
          The professional academic online quiz and examination system for modern education.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl z-10">
        {portals.map((role, index) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate(`/login/${role.id}`)}
            className="cursor-pointer"
          >
            <Card className={`h-full transition-all border-2 border-transparent ${role.bg}`}>
              <div className="p-8 flex flex-col h-full">
                <div className={`p-4 rounded-2xl bg-white/5 w-fit mb-6 ${role.color}`}>
                  <role.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{role.title}</h3>
                <p className="text-text-secondary mb-8 flex-grow">
                  {role.description}
                </p>
                <Button variant="secondary" className="w-full group">
                  Access Portal
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <footer className="mt-20 text-text-secondary text-sm opacity-50">
        © 2024 ezyQuiz Academic Systems. All rights reserved.
      </footer>
    </div>
  );
}
